/**
 * DealScope candidate tax invoice/credit-note engine, SAR is ONLY legal supplier.
 * Pure validation: this DOES NOT issue invoice numbers, verify SARS/CIPC, move
 * money, determine tax point, commit GL journals or prove merchant settlement.
 * All "verified" flags must come from authenticated records + approved Finance.
 */
export const LEGAL_SUPPLIER="Shobane African Resources (Pty) Ltd";
export const RECORDED_CIPC="2019/626848/07";
export const RECORDED_VAT="4040314793";
const str=(v,max=250)=>typeof v==="string"&&v.trim()!==""&&v.length<=max;
const money=v=>Number.isSafeInteger(v)&&v>=0;
const block=reason=>({state:"blocked",reason,document:null});
const date=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 !Number.isNaN(Date.parse(s+"T00:00:00Z"));
const genuineFinance=(approval,issuedBy)=>approval?.companyLegalName===LEGAL_SUPPLIER&&
 approval?.companyRegistrationNumber===RECORDED_CIPC&&
 approval?.vatRegistrationNumber===RECORDED_VAT&&
 approval?.currentCipcVerified===true&&approval?.currentVatVerified===true&&
 approval?.companyAddressVerified===true&&approval?.authorizedFinanceRole===true&&
 approval?.taxClassificationReviewed===true&&approval?.merchantApproved===true&&
 str(issuedBy)&&approval?.reviewedBy!==issuedBy&&str(approval?.reviewedBy)&&
 str(approval?.reviewEventId);
export function prepareInvoiceCandidate({order,customer,approval,issuedBy,invoiceNumber,invoiceDate,
  taxRateBasisPoints,processedOrderIds=[]}){
 if(!genuineFinance(approval,issuedBy)||!order||!customer||
 !str(order.id)||!str(order.tenantId)||!str(order.serviceCode)||
 !str(order.version)||!str(order.providerCaptureEventId)||
 order.state!=="captured_verified"||!str(customer.name)||!str(customer.address)||
 customer.tenantId!==order.tenantId||!str(approval.companyAddress)||
 !str(invoiceNumber,90)||!date(invoiceDate)||
 !money(order.netMinor)||order.netMinor===0||!money(order.quantity)||order.quantity<1||
 order.currency!=="ZAR"||!Array.isArray(processedOrderIds)||
 processedOrderIds.includes(order.id)||!Number.isSafeInteger(taxRateBasisPoints)||
 ![0,1500].includes(taxRateBasisPoints)||taxRateBasisPoints!==approval.approvedRateBasisPoints||
 !str(customer.taxIdOrExemption,80))
 return block("Verified company, VAT, approved Finance, real capture, customer and unique invoice record required");
 const vatExact=(BigInt(order.netMinor)*BigInt(taxRateBasisPoints)+5000n)/10000n;
 if(vatExact>BigInt(Number.MAX_SAFE_INTEGER))return block('VAT calculation overflow');
 const vatMinor=Number(vatExact);
 if(!money(vatMinor)||!money(order.grossMinor)||order.grossMinor!==order.netMinor+vatMinor)
  return block("VAT, total and capture amount must reconcile in ZAR cents");
 if(!money(order.capturedMinor)||order.capturedMinor!==order.grossMinor)
  return block("Verified provider capture does not match the invoiced amount");
 return {state:"invoice_candidate",reason:"Requires atomic unique serial number, signed Finance issue and durable GL/tax ledger",
  document:{type:"Tax Invoice",supplier:LEGAL_SUPPLIER,cipc:RECORDED_CIPC,
   vatRegistrationNumber:RECORDED_VAT,supplierAddress:approval.companyAddress,
   invoiceNumber,invoiceDate,orderId:order.id,tenantId:order.tenantId,
   recipientName:customer.name,recipientAddress:customer.address,
   recipientVatNumber:customer.vatNumber??null,serviceCode:order.serviceCode,
   serviceVersion:order.version,quantity:order.quantity,currency:"ZAR",
   netMinor:order.netMinor,rateBasisPoints:taxRateBasisPoints,vatMinor,
   totalMinor:order.grossMinor,paymentCaptureEventId:order.providerCaptureEventId,
   financeReviewEventId:approval.reviewEventId,status:"candidate_unissued"}};
}
export function prepareCreditNoteCandidate({invoice,refund,approval,issuedBy,creditNoteNumber,
  creditDate,processedRefundEventIds=[]}){
 if(!invoice||!refund||!genuineFinance(approval,issuedBy)||!str(creditNoteNumber)||
 !date(creditDate)||invoice.supplier!==LEGAL_SUPPLIER||
 invoice.vatRegistrationNumber!==RECORDED_VAT||!str(invoice.invoiceNumber)||
 !str(invoice.orderId)||!str(invoice.tenantId)||
 !str(refund.providerRefundEventId)||!str(refund.originalCaptureEventId)||
 refund.originalCaptureEventId!==invoice.paymentCaptureEventId||
 refund.tenantId!==invoice.tenantId||refund.orderId!==invoice.orderId||
 refund.verifiedByProvider!==true||refund.financeApproved!==true||
 !money(refund.netMinor)||!money(refund.vatMinor)||!money(refund.totalMinor)||
 refund.totalMinor<=0||refund.totalMinor!==refund.netMinor+refund.vatMinor||
 refund.netMinor>invoice.netMinor||refund.vatMinor>invoice.vatMinor||
 !Array.isArray(processedRefundEventIds)||processedRefundEventIds.includes(refund.providerRefundEventId))
 return block("Original invoice, signed provider-linked refundable amount and independent approval required");
 return {state:"credit_note_candidate",reason:"Only atomic Finance approval and ledger reversal may issue",
 document:{type:"Credit Note",number:creditNoteNumber,date:creditDate,
  supplier:LEGAL_SUPPLIER,originalInvoice:invoice.invoiceNumber,
  originalOrder:invoice.orderId,tenantId:invoice.tenantId,
  providerRefundEventId:refund.providerRefundEventId,
  netMinor:refund.netMinor,vatMinor:refund.vatMinor,totalMinor:refund.totalMinor,
  status:"candidate_unissued"}};
}
