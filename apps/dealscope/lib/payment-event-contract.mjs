/**
 * DealScope merchant-owned payment event contract, purely deterministic.
 * Does NOT verify provider cryptography, settle funds, mutate ledgers or entitle users.
 * A trusted provider-specific server adapter MUST complete verification first.
 */
export const SAR_LEGAL_ENTITY = 'Shobane African Resources (Pty) Ltd';
const present = s => typeof s === 'string' && s.trim().length > 0;
export function preparePaymentEvent({ownerLegalEntity,merchantId,verification,event,seenEventKeys=[]}) {
  const block = reason => ({state:'blocked',reason,postingIntent:null});
  if (ownerLegalEntity !== SAR_LEGAL_ENTITY) return block('DealScope merchant must be SAR-owned');
  if (!present(merchantId) || !verification || verification.signatureVerified !== true ||
      verification.merchantId !== merchantId || verification.provider !== event?.provider)
    return block('Provider signature and SAR merchant verification required');
  if (!event || !present(event.organizationId) || !present(event.provider) ||
      !present(event.providerEventId) || !present(event.providerTransactionId) ||
      !['payment_captured','payment_failed','refund_confirmed'].includes(event.kind) ||
      !['ZAR','USD'].includes(event.currency) ||
      !Number.isSafeInteger(event.amountMinor) || event.amountMinor < 0 ||
      !present(event.originalPurchaseId)) return block('Invalid payment event evidence');
  if (event.kind === 'refund_confirmed' && !present(event.originalCapturedEventId))
    return block('Refund requires original captured payment reference');
  const key = event.provider + ':' + event.providerEventId;
  if (!Array.isArray(seenEventKeys)) return block('Event replay ledger must be provided');
  if (seenEventKeys.includes(key)) return {state:'duplicate',reason:'Previously processed provider event',postingIntent:null};
  return {state:'pending_reconciliation',reason:'Awaiting independent ledger and settlement verification',
    postingIntent:{organizationId:event.organizationId,ownerLegalEntity:SAR_LEGAL_ENTITY,
      merchantId,provider:event.provider,eventId:event.providerEventId,
      transactionId:event.providerTransactionId,originalPurchaseId:event.originalPurchaseId,
      originalCapturedEventId:event.originalCapturedEventId ?? null,
      kind:event.kind,currency:event.currency,amountMinor:event.amountMinor,
      idempotencyKey:key,entitlementActivationAuthorised:false,settlementConfirmed:false}};
}
