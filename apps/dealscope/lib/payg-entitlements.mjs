/**
 * DealScope PAYG pure-domain contract. Paying buys a specified Deal Run analysis
 * service, NEVER a guaranteed buyer, mine stock, deal profit or signed transaction.
 * No payments are processed here. Auth, provider verification, atomic wallet
 * transactions, report delivery, invoice and tax posting are external hard gates.
 */
const present=(s,n=200)=>typeof s==="string"&&!!s.trim()&&s.length<=n;
const integer=(v)=>Number.isSafeInteger(v)&&v>=0;
const fail=(reason)=>({state:"blocked",reason,result:null});
const clone=(x)=>JSON.parse(JSON.stringify(x));
const SAR="Shobane African Resources (Pty) Ltd";
const service="DEALSCOPE_DECISION_REPORT";
export function createPaygOrder({orderId,organizationId,customerId,offer,at}){
 if(!present(orderId)||!present(organizationId)||!present(customerId)||!offer||
   offer.serviceCode!==service||offer.status!=="published"||
   !integer(offer.priceMinor)||offer.priceMinor===0||
   !integer(offer.reportCredits)||offer.reportCredits<1||offer.reportCredits>100||
   offer.currency!=="ZAR"||!present(offer.version)||!present(offer.description,1000)||
   !present(at)||Number.isNaN(Date.parse(at)))return fail("Trusted published price and service definition required");
 const order={orderId,organizationId,customerId,serviceCode:service,legalMerchant:SAR,
 currency:"ZAR",priceMinor:offer.priceMinor,credits:offer.reportCredits,
 priceVersion:offer.version,description:offer.description,createdAt:at,status:"awaiting_payment"};
 return {state:"awaiting_payment",reason:null,result:order};
}
/** Credentialed backend supplies these independently validated provider/ledger facts. */
export function assessPaidGrant({order,providerReceipt,verification,processedEventKeys=[]}){
 if(order?.status!=="awaiting_payment"||order.legalMerchant!==SAR||
  !Array.isArray(processedEventKeys)||!providerReceipt||!verification)
  return fail("Valid pending SAR purchase required");
 const {provider,providerEventId,providerTransactionId,orderId,organizationId,currency,amountMinor,merchantId,kind}=providerReceipt;
 if(!present(provider)||!present(providerEventId)||!present(providerTransactionId)||
    !present(merchantId)||orderId!==order.orderId||
    organizationId!==order.organizationId||currency!==order.currency||
    amountMinor!==order.priceMinor||kind!=="payment_captured"||
    verification.signatureValid!==true||verification.providerConfirmed!==true||
    verification.merchantMatched!==true||verification.amountMatched!==true||
    verification.orderedServiceMatched!==true)
  return fail("Payment capture, merchant, amount, provider authenticity and original order must match");
 const eventKey=provider+":"+providerEventId;
 if(processedEventKeys.includes(eventKey))return {state:"duplicate",reason:"Previously processed payment",result:null};
 return {state:"grant_candidate",reason:"Only atomic backend may persist paid credits after durable provider/event audit",
  result:{organizationId:order.organizationId,customerId:order.customerId,
    orderId:order.orderId,provider,providerTransactionId,eventKey,
    amountMinor,credits:order.credits,priceVersion:order.priceVersion,
    merchant:SAR,currency:order.currency,dealOutcomeDependent:false}};
}
export function createWallet({organizationId,customerId}){
 if(!present(organizationId)||!present(customerId))return fail("Verified customer identity required");
 return {state:"wallet_candidate",reason:"Store only with verified ownership and RLS",
  result:{organizationId,customerId,creditsAvailable:0,creditsReserved:0,creditsConsumed:0,
    appliedEventKeys:[],runs:[],purchases:[]}};
}
/** Command must be inside one serializable transaction with unique provider keys. */
export function applyGrant(wallet,grant){
 if(!wallet||!grant||wallet.organizationId!==grant.organizationId||wallet.customerId!==grant.customerId||
   grant.merchant!==SAR||grant.dealOutcomeDependent!==false||
   !integer(grant.credits)||grant.credits<1||!present(grant.eventKey)||!present(grant.orderId)||
   !Array.isArray(wallet.appliedEventKeys)||!Array.isArray(wallet.purchases)||!integer(wallet.creditsAvailable)||
   wallet.appliedEventKeys.includes(grant.eventKey)||
   wallet.purchases.some(x=>x.orderId===grant.orderId))return fail("Duplicate, mismatched or unverified grant");
 const w=clone(wallet);w.creditsAvailable+=grant.credits;
 if(!Number.isSafeInteger(w.creditsAvailable))return fail("Credit overflow");
 w.appliedEventKeys.push(grant.eventKey);
 w.purchases.push({orderId:grant.orderId,eventKey:grant.eventKey,credits:grant.credits});
 return {state:"grant_applied_candidate",reason:"Requires authenticated atomic storage, ledger and invoice linkage",result:w};
}
export function reserveReport(wallet,{organizationId,customerId,runId,analysisScope}){
 if(!wallet||wallet.organizationId!==organizationId||wallet.customerId!==customerId||
    !present(runId)||!present(analysisScope,300)||!integer(wallet.creditsAvailable)||
    wallet.creditsAvailable<1||wallet.runs?.some(r=>r.runId===runId))return fail("Paid credit, unique run and same tenant required");
 const w=clone(wallet);w.creditsAvailable--;w.creditsReserved++;
 w.runs.push({runId,analysisScope,state:"reserved",reportRef:null});
 return {state:"report_reserved_candidate",reason:"Atomic reserve only; no Deal Run has been delivered",result:w};
}
export function closeReport(wallet,{organizationId,customerId,runId,deliveryState,reportRef}){
 if(!wallet||wallet.organizationId!==organizationId||wallet.customerId!==customerId||
    !["delivered","failed"].includes(deliveryState)||!present(runId)||
    (deliveryState==="delivered"&&!present(reportRef))||
    !integer(wallet.creditsReserved)||wallet.creditsReserved<1)return fail("Validated report fulfilment transition required");
 const w=clone(wallet),run=w.runs?.find(x=>x.runId===runId);
 if(!run||run.state!=="reserved")return fail("Cannot fulfil absent, repeated or already closed run");
 w.creditsReserved--;
 if(deliveryState==="delivered"){w.creditsConsumed++;run.state="delivered";run.reportRef=reportRef;}
 else {w.creditsAvailable++;run.state="failed_recredited";}
 return {state:run.state,reason:deliveryState==="delivered"?
  "Report delivered: commercial deal closing is irrelevant to service fulfilment":
  "Service failed: restore the unused run credit",result:w};
}
