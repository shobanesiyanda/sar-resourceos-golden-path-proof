/** Advisory, evidence-gated supplier comparison. Not a tender award or purchase authority. */
const good = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const text = v => typeof v === 'string' && v.trim().length > 0;
const today = () => new Date().toISOString().slice(0,10);
const realDate = v => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const time = Date.parse(v+'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,10) === v;
};

export function compareSupplierOffers({rfq, offers, asOf = today()}) {
  const excluded = [], ranked = [];
  const block = reason => ({status:'blocked', reasons:[reason], ranked:[], excluded:[], awardAuthorised:false});
  if (!rfq || rfq.status !== 'approved_for_dispatch' || !text(rfq.id) ||
    !Number.isSafeInteger(rfq.version) || rfq.version < 1 ||
    !['ZAR','USD'].includes(rfq.currency) || !Array.isArray(rfq.lines) || !rfq.lines.length ||
    !Array.isArray(rfq.recipients) || !rfq.recipients.length || !Array.isArray(offers) ||
    !realDate(asOf)) return block('Valid RFQ, recipients, offers and evaluation date required');
  const expected = new Map(rfq.lines.map(x=>[x.requirementId,x]));
  if (expected.size !== rfq.lines.length) return block('RFQ contains duplicated lines');
  const unique = new Set();
  for (const item of offers) {
    const q = item?.quote, conditions = item?.conditions;
    const reasons = [];
    if (!q || q.rfqId !== rfq.id || q.status !== 'under_review' ||
      !text(q.vendorId) || !rfq.recipients.includes(q.vendorId) || !text(q.messageId))
      reasons.push('Unmatched or quarantined vendor response');
    const vendorId = q?.vendorId ?? '(unmatched)';
    if (unique.has(vendorId)) reasons.push('Multiple versions from same vendor require explicit selection');
    unique.add(vendorId);
    if (!conditions || !realDate(conditions.validUntil) || conditions.validUntil < asOf)
      reasons.push('Expired or invalid quotation validity');
    if (!conditions || !Number.isSafeInteger(conditions.leadDays) || conditions.leadDays < 0 ||
      !good(conditions.depositPct) || conditions.depositPct > 100)
      reasons.push('Lead time and deposit terms must be evidenced');
    if (!conditions?.technicalComplianceReviewed) reasons.push('Technical compliance review outstanding');
    if (!text(item?.sourceSha256) || !/^[a-f0-9]{64}$/i.test(item.sourceSha256))
      reasons.push('Original quotation provenance incomplete');
    if (!Array.isArray(q?.items) || q.items.length !== expected.size)
      reasons.push('Offer does not match RFQ line count');
    let subtotal = 0; const ids = new Set();
    for (const line of q?.items ?? []) {
      const req = expected.get(line.requirementId);
      if (ids.has(line.requirementId) || !req || req.quantity !== line.quantity ||
        req.unit !== line.unit || !good(line.price)) {
        reasons.push('Invalid technical quantities or line prices');continue;
      }
      ids.add(line.requirementId); subtotal += line.quantity * line.price;
    }
    if (ids.size !== expected.size || !good(subtotal)) reasons.push('Missing scope or unsafe quote arithmetic');
    if (!good(q?.delivery) || !good(q?.vat)) reasons.push('Delivery and VAT basis must be captured');
    const landedExVat = subtotal + q?.delivery;
    const cashIncludingVat = landedExVat + q?.vat;
    const depositExposure = landedExVat * (conditions?.depositPct ?? NaN) / 100;
    if (![landedExVat,cashIncludingVat,depositExposure].every(good))
      reasons.push('Nonfinite landed cost or deposit exposure');
    if (reasons.length) excluded.push({vendorId,reasons:[...new Set(reasons)]});
    else ranked.push({vendorId,messageId:q.messageId,sourceSha256:item.sourceSha256,
      validUntil:conditions.validUntil,leadDays:conditions.leadDays,
      depositPct:conditions.depositPct,depositExposure,
      costExVat:landedExVat,vat:q.vat,cashIncludingVat});
  }
  ranked.sort((a,b)=>a.costExVat-b.costExVat || a.leadDays-b.leadDays ||
      a.depositExposure-b.depositExposure || a.vendorId.localeCompare(b.vendorId));
  return {status:ranked.length?'provisional_comparison':'no_qualifying_offers',
    reasons:ranked.length?['Comparison only; procurement award, funding and legal commitment require independent approval']:
      ['No complete reviewed and valid supplier offers qualify for comparison'],
    ranked,excluded,awardAuthorised:false};
}
