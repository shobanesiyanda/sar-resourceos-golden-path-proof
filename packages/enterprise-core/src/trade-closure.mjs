/** SAR ResourceOS → AccountingOS closed-loop gate. May only emit a closure
 * command intent after independent ledger posting and bank recon proof.
 * Reconciliation does not itself change physical title, GL or bank state. */
const id=s=>typeof s==='string'&&/^[A-Za-z0-9:_-]{1,100}$/.test(s);
const hash=s=>typeof s==='string'&&/^[a-f0-9]{64}$/i.test(s);
const reject=reason=>({state:'blocked',reason,intent:null});
export function prepareTradeClosure({tenantId,calloffId,receipt,invoice,journalPosting,bankConfirmation,actor,exceptions=[]}){
 if(!id(tenantId)||!id(calloffId)||!receipt||receipt.tenantId!==tenantId||
  receipt.calloffId!==calloffId||receipt.eventType!=='sar.resourceos.receipt_candidate.v1'||
  receipt.buyerAccepted!==true||receipt.custodyProofReviewRequired!==true||
  !id(invoice?.invoiceId)||invoice.tenantId!==tenantId||invoice.calloffId!==calloffId||
  invoice.receiptId!==receipt.receiptId||!id(journalPosting?.id)||
  journalPosting.status!=='posted'||journalPosting.immutableVerified!==true||
  journalPosting.invoiceId!==invoice.invoiceId||journalPosting.tenantId!==tenantId||
  !id(bankConfirmation?.id)||bankConfirmation.invoiceId!==invoice.invoiceId||
  bankConfirmation.tenantId!==tenantId||bankConfirmation.bankVerified!==true||
  bankConfirmation.reconciledLedgerPostingId!==journalPosting.id||
  bankConfirmation.amountCents!==invoice.grossCents||!hash(bankConfirmation.sourceSha256)||
  !id(actor?.userId)||actor.verified!==true||actor.tenantId!==tenantId||
  !actor.roles?.includes('trade_closure_reviewer')||!Array.isArray(exceptions)||exceptions.length)
  return reject('source_assay_ledger_bank_and_separate_closure_authority_required');
 return {state:'closure_intent',reason:'requires_atomic_source_to_ledger_reconciliation_commit',intent:{
  eventType:'sar.company.trade_closure_candidate.v1',tenantId,calloffId,invoiceId:invoice.invoiceId,
  receiptId:receipt.receiptId,ledgerPostingId:journalPosting.id,
  bankConfirmationId:bankConfirmation.id,sourceSha256:bankConfirmation.sourceSha256,
  approvedBy:actor.userId,status:'awaiting_atomic_closure_commit',
  noAutomaticPurchase:true,noPaymentRelease:true,noLedgerMutation:true,requiresAtomicAudit:true}};
}
