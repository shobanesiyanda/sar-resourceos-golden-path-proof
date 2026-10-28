/**
 * DealScope reviewable legal consent / order gate, pure candidate.
 * Server-issued contract versions and captured consent must be verified
 * independently: browser fields, checkboxes and caller-supplied policy objects
 * do NOT themselves demonstrate legal assent.
 */
export const CONTRACT_OPERATOR="Shobane African Resources (Pty) Ltd";
const text=s=>typeof s==="string"&&s.trim().length>0&&s.length<=250;
const hash=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const time=s=>typeof s==="string"&&Number.isFinite(Date.parse(s));
const fail=r=>({state:"blocked",reason:r,event:null});
const REQUIRED=["terms","privacy","payments"];
export function prepareContractAcceptance({grant,publications,choices,scope,serverTime,
 priorEventIds=[]}){
 if(!grant||grant.serverVerified!==true||!text(grant.tenantId)||!text(grant.userId)||
 !text(grant.sessionId)||!text(grant.authEventId)||
 !["read_own_workspace","request_free_cycle","request_assessment"].includes(grant.action)||
 !time(serverTime)||!Array.isArray(priorEventIds))
 return fail("Authenticated tenant grant and trustworthy server time required");
 if(!publications||!choices||!scope||!text(choices.eventId)||
 priorEventIds.includes(choices.eventId)||!text(choices.reviewSessionId)||
 !choices.explicitAgreement||choices.noPrecheckedConsent!==true||
 choices.customerCorrectedOrConfirmed!==true||
 choices.termsViewed!==true||choices.privacyViewed!==true||
 choices.paymentsViewed!==true)
 return fail("Voluntary versioned and reviewable customer agreement required");
 if(scope.legalSupplier!==CONTRACT_OPERATOR||scope.tenantId!==grant.tenantId||
 !["COMPLETE_DEAL_ASSESSMENT","DEALSCOPE_DECISION_REPORT"].includes(scope.serviceCode)||
 !text(scope.offerVersion)||scope.offerState!=="published"||
 !Number.isSafeInteger(scope.amountMinor)||scope.amountMinor<0||
 scope.currency!=="ZAR"||scope.automaticCharge!==false||
 scope.isRecurring===true)
 return fail("Exact approved service, SAR supplier and no automatic conversion required");
 if(scope.serviceCode==="COMPLETE_DEAL_ASSESSMENT"&&
 (scope.amountMinor!==0||scope.requiresPaymentMethod!==false||
 scope.includedCycles!==1))
 return fail("First full assessment must be one complete free no-card cycle");
 if(scope.serviceCode==="DEALSCOPE_DECISION_REPORT"&&
 (scope.amountMinor<=0||choices.orderReviewed!==true||
 choices.priceVatAndFeesViewed!==true))
 return fail("Paid assessment requires exact tax-inclusive price and pre-order review");
 const revisions={};
 for(const kind of REQUIRED){
  const p=publications[kind],a=choices.acceptedVersions?.[kind];
  if(!p||p.kind!==kind||p.state!=="effective"||
   p.legalApproved!==true||p.currentSupplier===CONTRACT_OPERATOR||
   !text(p.version)||!hash(p.sha256)||!time(p.effectiveAt)||
   Date.parse(p.effectiveAt)>Date.parse(serverTime)||
   !a||a.version!==p.version||a.sha256!==p.sha256)
  return fail("All current counsel-approved immutable legal documents must be individually agreed");
  revisions[kind]={version:p.version,sha256:p.sha256};
 }
 return {state:"acceptance_candidate",reason:"Only trusted backend may persist immutable agreement and issue order",
 event:{eventId:choices.eventId,reviewSessionId:choices.reviewSessionId,
  tenantId:grant.tenantId,userId:grant.userId,sessionId:grant.sessionId,
  legalSupplier:CONTRACT_OPERATOR,scopeCode:scope.serviceCode,
  offerVersion:scope.offerVersion,amountMinor:scope.amountMinor,currency:"ZAR",
  acceptanceTime:serverTime,policyVersions:revisions,
  marketingConsent:choices.marketingConsent===true,automaticCharge:false,
  sourceAuthEvent:grant.authEventId,contractStatus:"pending_atomic_persist"}};
}
