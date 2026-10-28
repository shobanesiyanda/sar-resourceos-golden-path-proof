import test from "node:test";
import assert from "node:assert/strict";
import {prepareInvoiceCandidate,prepareCreditNoteCandidate,LEGAL_SUPPLIER,RECORDED_CIPC,RECORDED_VAT} from "../lib/invoice-contract.mjs";
const approval={companyLegalName:LEGAL_SUPPLIER,companyRegistrationNumber:RECORDED_CIPC,
 vatRegistrationNumber:RECORDED_VAT,currentCipcVerified:true,currentVatVerified:true,
 companyAddressVerified:true,authorizedFinanceRole:true,taxClassificationReviewed:true,
 merchantApproved:true,reviewedBy:"FINANCE2",reviewEventId:"REV",companyAddress:"Verified supplier business address",
 approvedRateBasisPoints:1500};
const order={id:"ORDER1",tenantId:"TENANT1",serviceCode:"DEAL_REPORT",version:"2026-01",
 providerCaptureEventId:"PAY1",state:"captured_verified",quantity:1,
 currency:"ZAR",netMinor:20000,grossMinor:23000,capturedMinor:23000};
const customer={tenantId:"TENANT1",name:"Buyer Company",address:"Verified buyer address",taxIdOrExemption:"no VAT supplied"};
const base={order,customer,approval,issuedBy:"ISSUER1",invoiceNumber:"SAR-DS-2026-00001",
 invoiceDate:"2026-10-28",taxRateBasisPoints:1500,processedOrderIds:[]};
test("company data requires official attestation not mere stored numbers",()=>{
 assert.equal(prepareInvoiceCandidate({...base,approval:{...approval,currentCipcVerified:false}}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,approval:{...approval,currentVatVerified:false}}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,approval:{...approval,reviewedBy:"ISSUER1"}}).state,"blocked");
});
test("correct ZAR minor units and standard VAT produce candidate only",()=>{
 const r=prepareInvoiceCandidate(base);
 assert.equal(r.state,"invoice_candidate");assert.equal(r.document.status,"candidate_unissued");
 assert.equal(r.document.totalMinor,23000);assert.equal(r.document.vatMinor,3000);
 assert.equal(r.document.supplier,LEGAL_SUPPLIER);
});
test("wrong tenant, duplicate order, false capture and mismatched totals block",()=>{
 assert.equal(prepareInvoiceCandidate({...base,customer:{...customer,tenantId:"OTHER"}}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,processedOrderIds:["ORDER1"]}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,order:{...order,capturedMinor:100}}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,order:{...order,grossMinor:1}}).state,"blocked");
 assert.equal(prepareInvoiceCandidate({...base,order:{...order,netMinor:0,grossMinor:0,capturedMinor:0}}).state,"blocked");
});
test("provider refund yields original invoice-linked candidate and no replay",()=>{
 const invoice=prepareInvoiceCandidate(base).document;
 const refund={providerRefundEventId:"R1",originalCaptureEventId:"PAY1",
 tenantId:"TENANT1",orderId:"ORDER1",verifiedByProvider:true,
 financeApproved:true,netMinor:10000,vatMinor:1500,totalMinor:11500};
 const p={invoice,refund,approval,issuedBy:"ISSUER1",creditNoteNumber:"CN1",creditDate:"2026-10-28"};
 assert.equal(prepareCreditNoteCandidate(p).state,"credit_note_candidate");
 assert.equal(prepareCreditNoteCandidate({...p,processedRefundEventIds:["R1"]}).state,"blocked");
 assert.equal(prepareCreditNoteCandidate({...p,refund:{...refund,originalCaptureEventId:"BAD"}}).state,"blocked");
});
test("tax class mismatch and fraudulent over-refund blocked",()=>{
 assert.equal(prepareInvoiceCandidate({...base,taxRateBasisPoints:0}).state,"blocked");
 const invoice=prepareInvoiceCandidate(base).document;
 const refund={providerRefundEventId:"R1",originalCaptureEventId:"PAY1",
 tenantId:"TENANT1",orderId:"ORDER1",verifiedByProvider:true,
 financeApproved:true,netMinor:30000,vatMinor:4500,totalMinor:34500};
 assert.equal(prepareCreditNoteCandidate({invoice,refund,approval,issuedBy:"ISSUER1",
  creditNoteNumber:"CN1",creditDate:"2026-10-28"}).state,"blocked");
});
