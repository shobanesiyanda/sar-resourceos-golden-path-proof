/** DealScope protected-intake core. Untrusted customer documents remain assertions. */
const allowedFields = new Set([
  'commodity','material_form','commercial_role','delivery_term','delivery_location',
  'buyer_product_grade_pct','buyer_quantity_dry_t','buyer_price_zar_per_dry_t',
  'feedstock_grade_pct','feedstock_quantity_dry_t','source_location',
  'contract_reference','payment_terms','seller_name','buyer_name'
]);
const channels = new Set(['uploaded_document','pasted_text','manual']);
const finitePositive = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
function validValue(k, v) {
  if (k.endsWith('_pct')) return finitePositive(v) && v <= 100;
  if (k.endsWith('_dry_t') || k.endsWith('_dry_tonnes')) return finitePositive(v);
  if (k.endsWith('_zar_per_dry_t')) return finitePositive(v);
  return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 300;
}
const requiredByRole = {
  sale_contract: ['commodity','material_form','commercial_role','delivery_term','delivery_location','buyer_product_grade_pct','buyer_quantity_dry_t'],
  source_offer: ['commodity','material_form','commercial_role','source_location','feedstock_grade_pct','feedstock_quantity_dry_t'],
};
/**
 * Caller must authenticate tenant and persist source hashes separately.
 * Does not parse documents, authenticate issuers or attest that statements are true.
 */
export function reconcileDealFacts({entryPoint, sources}) {
  if (!Object.hasOwn(requiredByRole, entryPoint)) return {state:'blocked', reason:'Unsupported entry point'};
  if (!Array.isArray(sources) || sources.length === 0 || sources.length > 30) return {state:'blocked', reason:'At least one bounded source is required'};
  const byField = new Map(), seen = new Set();
  for (const source of sources) {
    if (!source || !channels.has(source.channel) || typeof source.sourceId !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,80}$/.test(source.sourceId) || seen.has(source.sourceId) ||
        !source.facts || Array.isArray(source.facts) || typeof source.facts !== 'object') {
      return {state:'blocked', reason:'Invalid or duplicate source'};
    }
    seen.add(source.sourceId);
    for (const [field, value] of Object.entries(source.facts)) {
      if (!allowedFields.has(field) || !validValue(field,value)) return {state:'blocked',reason:'Invalid or unsupported asserted fact'};
      if (!byField.has(field)) byField.set(field,[]);
      byField.get(field).push({value, sourceId:source.sourceId,channel:source.channel,evidence:'customer_asserted'});
    }
  }
  const known = {}, conflicts = [];
  for (const [field, entries] of byField) {
    const distinct = new Set(entries.map(({value})=>typeof value === 'number' ? String(value) : value.trim().toLowerCase()));
    if (distinct.size !== 1) conflicts.push({field,sourceIds:entries.map(x=>x.sourceId),status:'customer_confirmation_required'});
    else known[field]={value:entries[0].value,evidence:'customer_asserted',sourceIds:entries.map(x=>x.sourceId)};
  }
  const missing=requiredByRole[entryPoint].filter(field=>!Object.hasOwn(known,field));
  return {state:conflicts.length ? 'conflicted' : missing.length ? 'needs_facts' : 'facts_captured',
    known, conflicts, missing, independentlyVerified:false, executable:false};
}
