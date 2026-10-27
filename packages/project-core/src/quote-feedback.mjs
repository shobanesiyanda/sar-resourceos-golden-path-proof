/**
 * Pure quotation-to-scenario candidate adapter.
 * Input quote MUST previously pass sender, attachment and RFQ correlation screening.
 * Output is always provisional. Never mutates a baseline, sends an RFQ or authorises an award.
 */
const finite = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const present = (s) => typeof s === 'string' && s.trim().length > 0;

export function prepareQuoteScenario({projectId, scenario, rfq, quote, evidence}) {
  const issues = [];
  const reject = () => ({status:'blocked', issues:[...new Set(issues)], proposedScenario:null,
    comparison:null, quoteSource:null});
  if (!present(projectId) || !scenario || scenario.projectId !== projectId || !present(scenario.id) ||
      !Array.isArray(scenario.requirements) || scenario.requirements.length === 0) {
    issues.push('Valid project and simulation requirements required'); return reject();
  }
  if (!rfq || !quote || rfq.projectId !== projectId || !present(rfq.id) ||
      !Number.isSafeInteger(rfq.version) || rfq.version < 1 ||
      rfq.status !== 'approved_for_dispatch' ||
      !present(rfq.approverId) || !present(rfq.approvalEventId) ||
      quote.rfqId !== rfq.id || quote.status !== 'under_review' ||
      !Array.isArray(rfq.recipients) || !rfq.recipients.includes(quote.vendorId)) {
    issues.push('Approved RFQ and matched, cleared quotation required'); return reject();
  }
  if (!evidence || !present(evidence.ingestionEventId) ||
      !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(evidence.validUntil || '') ||
      Number.isNaN(Date.parse(evidence.validUntil + 'T00:00:00Z')) ||
      new Date(evidence.validUntil + 'T00:00:00Z').toISOString().slice(0,10) !== evidence.validUntil ||
      evidence.validUntil < new Date().toISOString().slice(0,10) ||
      !/^[a-f0-9]{64}$/i.test(evidence.sourceSha256 || '') ||
      !present(quote.messageId) || !present(quote.vendorId)) {
    issues.push('Immutable inbound source evidence required'); return reject();
  }
  if (!['ZAR','USD'].includes(scenario.currency) || scenario.currency !== rfq.currency ||
      (evidence.quotedCurrency && evidence.quotedCurrency !== rfq.currency)) {
    issues.push('Quote currency differs from project currency: FX review required'); return reject();
  }
  if (!finite(quote.vat) || !finite(quote.delivery)) {
    issues.push('VAT and delivery must be explicitly identified'); return reject();
  }
  if (!Array.isArray(quote.items) || !Array.isArray(rfq.lines) ||
      quote.items.length === 0 || quote.items.length !== rfq.lines.length) {
    issues.push('Quote must account for all RFQ lines'); return reject();
  }
  const requirements = new Map(scenario.requirements.map(r => [r.id,r]));
  if (requirements.size !== scenario.requirements.length) issues.push('Duplicate scenario work packages');
  const allowed = new Map(rfq.lines.map(l => [l.requirementId,l]));
  if (allowed.size !== rfq.lines.length) issues.push('Duplicate RFQ lines');
  const seen = new Set();
  const priced = [];
  for (const line of quote.items) {
    if (!line || seen.has(line.requirementId)) {issues.push('Duplicate/invalid response lines'); continue;}
    seen.add(line.requirementId);
    const source = requirements.get(line.requirementId), requested = allowed.get(line.requirementId);
    if (!source || !requested || source.quantity !== requested.quantity ||
        source.unit !== requested.unit || line.quantity !== requested.quantity ||
        line.unit !== requested.unit || !finite(line.price)) {
      issues.push('Unmatched quantity, unit or work package'); continue;
    }
    const extended = line.quantity * line.price;
    if (!Number.isFinite(extended)) {issues.push('Quote arithmetic overflow'); continue;}
    priced.push({id:line.requirementId,quantity:line.quantity,unitPrice:line.price,extended});
  }
  if (seen.size !== allowed.size) issues.push('Missing RFQ quote lines');
  const subtotal = priced.reduce((sum,row) => sum + row.extended,0);
  const delivered = subtotal + quote.delivery;
  const supplierCashExposure = delivered + quote.vat;
  if (![subtotal,delivered,supplierCashExposure].every(Number.isFinite))
    issues.push('Unsafe quote totals');
  if (issues.length) return reject();
  // Distribute delivery proportionally by line value; equal split if all material prices zero.
  const freightShare = priced.map((row,i) => {
    if (i === priced.length-1) return 0; // final share is computed by residual to preserve totals
    return subtotal > 0 ? quote.delivery * row.extended / subtotal : quote.delivery / priced.length;
  });
  freightShare[freightShare.length-1] = quote.delivery - freightShare.slice(0,-1).reduce((a,b)=>a+b,0);
  if (freightShare.some(x=>!finite(x))) {issues.push('Unsafe freight allocation'); return reject();}
  const updatedUnitPrices = new Map(priced.map((row,i)=>[
    row.id, (row.extended + freightShare[i]) / row.quantity
  ]));
  if ([...updatedUnitPrices.values()].some(x=>!finite(x))) {
    issues.push('Unsafe delivered unit prices'); return reject();
  }
  const replacements = scenario.requirements.map(r => ({...r,
    predecessors:[...(r.predecessors || [])],
    unitCost:updatedUnitPrices.has(r.id) ? updatedUnitPrices.get(r.id) : r.unitCost
  }));
  const proposedScenario = {...scenario, id:scenario.id + ':quote:' + evidence.ingestionEventId,
    requirements:replacements};
  // VAT is a separate provisional cash requirement, not silently treated as an expense.
  return {
    status:'provisional_quote', issues:['Supplier quote unapproved; no baseline or PO amendment permitted'],
    proposedScenario,
    comparison:{subtotalExVat:subtotal,deliveryExVat:quote.delivery,
      deliveredCostExVat:delivered,quotedVat:quote.vat,indicativeCashExposure:supplierCashExposure,
      quotedRequirements:priced.map(row=>row.id)},
    quoteSource:{rfqId:rfq.id,rfqVersion:rfq.version,vendorId:quote.vendorId,
      messageId:quote.messageId,ingestionEventId:evidence.ingestionEventId,
      sourceSha256:evidence.sourceSha256,validUntil:evidence.validUntil,authority:'not_approved'}
  };
}
