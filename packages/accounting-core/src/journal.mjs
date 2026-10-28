/** SAR-only double-entry journal / settlement CANDIDATE contracts.
 * No live GL, bank, tax determination, payroll run, treasury action or period close.
 * Trusted SAR writer must atomically validate source, idempotency and trial balance. */
const company='Shobane African Resources (Pty) Ltd';
const ID=/^[a-zA-Z0-9:_-]{1,100}$/; const HASH=/^[a-f0-9]{64}$/i;
const id=s=>typeof s==='string'&&ID.test(s);
const money=n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
const reject=code=>({state:'blocked',code,journal:null,settlement:null});
export function prepareSalesJournalCandidate({tenantId,invoice,receipt,period,actor,seenSourceIds=[]}){
 if(!id(tenantId)||!invoice||!receipt||receipt.tenantId!==tenantId||
   invoice.tenantId!==tenantId||invoice.company!==company||receipt.company!==company||
   receipt.eventType!=='sar.resourceos.receipt_candidate.v1'||receipt.buyerAccepted!==true||
   !id(receipt.receiptId)||invoice.receiptId!==receipt.receiptId||
   invoice.calloffId!==receipt.calloffId||invoice.buyerId!==receipt.buyerId||
   invoice.currency!=='ZAR'||invoice.invoiceState!=='approved_unposted'||
   invoice.customerAccepted!==true||!HASH.test(invoice.documentSha256||'')||
   !id(invoice.invoiceId)||!money(invoice.netCents)||!money(invoice.vatCents)||
   !money(invoice.grossCents)||invoice.grossCents!==invoice.netCents+invoice.vatCents||
   !id(period?.id)||period.status!=='open'||!id(actor?.userId)||
   actor.verified!==true||actor.tenantId!==tenantId||!actor.roles?.includes('accounting_preparer')||
   !Array.isArray(seenSourceIds)||seenSourceIds.includes(invoice.invoiceId))return reject('verified_invoice_receipt_period_and_actor_required');
 const lines=[{account:'trade_receivables',debitCents:invoice.grossCents,creditCents:0},
              {account:'sales_revenue',debitCents:0,creditCents:invoice.netCents}];
 if(invoice.vatCents>0)lines.push({account:'output_vat_control',debitCents:0,creditCents:invoice.vatCents});
 const debits=lines.reduce((n,x)=>n+x.debitCents,0),credits=lines.reduce((n,x)=>n+x.creditCents,0);
 if(!money(debits)||!money(credits)||debits!==credits)return reject('imbalanced_or_overflow_journal');
 return {state:'journal_candidate',code:'unposted',settlement:null,journal:{
  schemaVersion:1,eventType:'sar.accounting.sales_journal_candidate.v1',company,tenantId,
  sourceInvoiceId:invoice.invoiceId,sourceDocumentSha256:invoice.documentSha256,
  receiptId:receipt.receiptId,calloffId:receipt.calloffId,periodId:period.id,currency:'ZAR',
  preparedBy:actor.userId,lines,totalDebitCents:debits,totalCreditCents:credits,
  status:'unposted',entryType:'sales_revenue_accrual',requiresSourceHash:true,
  requiresAtomicAudit:true,noBankMovement:true}};
}
export function prepareSettlementCandidate({tenantId,invoice,journalPosting,bankInstruction,approver,seenBankInstructionIds=[]}){
 if(!id(tenantId)||!invoice||invoice.tenantId!==tenantId||invoice.company!==company||
   !id(invoice.invoiceId)||!money(invoice.grossCents)||!id(journalPosting?.id)||
   journalPosting.tenantId!==tenantId||journalPosting.invoiceId!==invoice.invoiceId||
   journalPosting.status!=='posted'||journalPosting.immutableVerified!==true||
   journalPosting.amountCents!==invoice.grossCents||!id(bankInstruction?.id)||
   bankInstruction.tenantId!==tenantId||bankInstruction.invoiceId!==invoice.invoiceId||
   bankInstruction.bankDetailsVerified!==true||bankInstruction.duplicatePaymentChecked!==true||
   !money(bankInstruction.amountCents)||bankInstruction.amountCents!==invoice.grossCents||
   !id(bankInstruction.preparedBy)||!id(approver?.userId)||
   approver.userId===bankInstruction.preparedBy||approver.verified!==true||
   approver.tenantId!==tenantId||!approver.roles?.includes('treasury_authoriser')||
   !Array.isArray(seenBankInstructionIds)||seenBankInstructionIds.includes(bankInstruction.id))return reject('posted_ledger_bank_verification_and_separation_required');
 return {state:'settlement_candidate',code:'await_bank_execution',journal:null,settlement:{
  schemaVersion:1,eventType:'sar.treasury.settlement_candidate.v1',tenantId,company,
  instructionId:bankInstruction.id,invoiceId:invoice.invoiceId,
  ledgerPostingId:journalPosting.id,amountCents:bankInstruction.amountCents,currency:'ZAR',
  preparedBy:bankInstruction.preparedBy,authorisedBy:approver.userId,
  status:'not_sent_to_bank',bankExecutionId:null,paymentConfirmed:false,
  requiresIndependentBankConfirmation:true,requiresAtomicAudit:true}};
}
