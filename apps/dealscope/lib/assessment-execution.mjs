/** Dependency-ordered DealScope orchestration CANDIDATE. No persistence. */
import {authorizeCustomerAction} from "./customer-access.mjs";
import {prepareDossier} from "./assessment-dossier.mjs";
import {reserveDealCycle,deliverCycle} from "./deal-cycle-trial.mjs";
export const LEGAL_OPERATOR="Shobane African Resources (Pty) Ltd";
const text=s=>typeof s==="string"&&s.trim().length>0&&s.length<=160;
const digest=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const fail=reason=>({state:"blocked",reason,mutations:null});
/**
 * Requires an actual persisted/counsel-approved legal acceptance event.
 * A merely proposed acceptance_candidate never grants use; verified identity,
 * verified eligibility, and atomic unique database writes still required.
 */
export function prepareAssistedStart({principal,membership,organisation,
 contractAcceptance,entitlement,caseInput,serverTime,transactionId}){
 if(!text(transactionId)||!contractAcceptance||
 contractAcceptance.source!=="accepted-policy-ledger"||
 contractAcceptance.persistedAndCurrent!==true||
 contractAcceptance.tenantId!==organisation?.id||
 contractAcceptance.userId!==principal?.userId||
 contractAcceptance.legalSupplier!==LEGAL_OPERATOR||
 contractAcceptance.serviceCode!=="COMPLETE_DEAL_ASSESSMENT"||
 contractAcceptance.automaticCharge!==false||
 contractAcceptance.acceptedAmountMinor!==0||
 contractAcceptance.offerVersion!==entitlement?.offerVersion||
 !text(contractAcceptance.acceptanceEventId)||
 !["terms","privacy","payments"].every(k=>text(contractAcceptance.policyVersions?.[k]?.version)&&
  digest(contractAcceptance.policyVersions?.[k]?.sha256)))
 return fail("Previously persisted current SAR customer agreement required");
 const base={principal,membership,organisation};
 const canCreate=authorizeCustomerAction({...base,action:"create_dossier"});
 const canTrial=authorizeCustomerAction({...base,action:"request_free_cycle"});
 if(canCreate.state!=="authorised_candidate"||canTrial.state!=="authorised_candidate")
  return fail("Customer must be verified and able to create, reserve own free assessment");
 if(!entitlement||entitlement.tenantId!==organisation.id||
 entitlement.personId!==principal.userId||entitlement.status!=="active"||
 entitlement.automaticCharge!==false||entitlement.autoConverts!==false)
  return fail("Full introductory entitlement must be independently activated and belong to claimant");
 const result=prepareDossier({grant:canCreate.grant,...caseInput,serverTime});
 if(result.state!=="dossier_candidate"||result.record.tenantId!==organisation.id)
  return fail("Authorised customer-owned source dossier required");
 const principalForCycle={authenticated:true,membershipActive:true,
  userId:principal.userId,tenantId:organisation.id};
 const reserved=reserveDealCycle({record:entitlement,principal:principalForCycle,
  caseFile:{id:result.record.id,tenantId:result.record.tenantId,
   ownerId:result.record.customerOwnerId,sourceSetHash:result.record.sourceSetHash},serverTime});
 if(reserved.state!=="reserved_candidate")return fail("Single available full deal-cycle credit required");
 return {state:"start_candidate",reason:"Both records must commit atomically with unique case/ledger event and owner membership recheck",
  mutations:{transactionId,caseFile:result.record,trialEntitlement:reserved.record,
   acceptanceEventId:contractAcceptance.acceptanceEventId,
   ownerUserId:principal.userId,tenantId:organisation.id,automaticCharge:false,
   committed:false}};
}
/** No final fulfilment from a draft report, unaudited file or customer checkbox. */
export function prepareAssistedCompletion({grant,caseFile,entitlement,delivery,serverTime,transactionId}){
 if(!text(transactionId)||!grant||grant.serverVerified!==true||
 grant.action!=="request_assessment"||!caseFile||!entitlement||
 grant.tenantId!==caseFile.tenantId||grant.tenantId!==entitlement.tenantId||
 grant.userId!==caseFile.customerOwnerId||grant.userId!==entitlement.personId||
 caseFile.state!=="report_ready_candidate"||!caseFile.report||
 caseFile.report.status!=="draft_candidate"||
 caseFile.report.transactionCertified!==false||
 !digest(caseFile.report.reportSnapshotHash)||!delivery||
 delivery.caseId!==caseFile.id||delivery.reportHash!==caseFile.report.reportSnapshotHash||
 delivery.backendConfirmed!==true||delivery.protectedReportStored!==true||
 delivery.actualRecipientConfirmed!==true||!text(delivery.issuerAuditEventId))
 return fail("Matching final issued document, delivery audit and same-tenant report required");
 const principal={authenticated:true,membershipActive:true,
  tenantId:grant.tenantId,userId:grant.userId};
 const complete=deliverCycle({record:entitlement,principal,caseId:caseFile.id,delivery,serverTime});
 if(complete.state!=="delivered_candidate")return fail("All evidence-attested cycle stages must complete before credit consumption");
 const issued={...caseFile,state:"delivered_candidate",
  report:{...caseFile.report,status:"issued_candidate",reportId:delivery.reportId,
   issuedAt:serverTime,issuerAuditEventId:delivery.issuerAuditEventId}};
 return {state:"completion_candidate",reason:"Atomic report issuance and entitlement update only after durable recipient-confirmed delivery",
  mutations:{transactionId,tenantId:grant.tenantId,caseFile:issued,
   trialEntitlement:complete.record,automaticCharge:false,committed:false}};
}
