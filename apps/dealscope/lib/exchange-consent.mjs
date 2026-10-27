/**
 * DealScope Commercial Exchange: exact-recipient, exact-offer consent contract.
 * Pure command model. No actual IAM/RLS, publication, payment, disclosure, award,
 * regulatory verification, escrow or delivery. Server MUST recheck all evidence.
 */
const present=(s,n=250)=>typeof s==="string"&&!!s.trim()&&s.length<=n;
const hash=s=>typeof s==="string"&&/^[0-9a-f]{64}$/i.test(s);
const date=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 Number.isFinite(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
const deny=reason=>({state:"blocked",reason,intent:null});
function member(actor,tenant,permission){
 return actor?.authenticated===true&&actor.activeMembership===true&&actor.tenantId===tenant&&
  present(actor.userId)&&Array.isArray(actor.permissions)&&actor.permissions.includes(permission);
}
export function prepareDisclosure({offer,principal,buyer,consent,asOf,seenConsentIds=[]}){
 if(!offer||!principal||!buyer||!consent||!date(asOf)||!Array.isArray(seenConsentIds))
  return deny("Evidence-bound offer, recipient and actor required");
 if(!present(offer.id)||!present(offer.sellerTenantId)||!hash(offer.contentHash)||
    offer.state!=="authorised_for_disclosure"||offer.integrityReviewStatus!=="sufficient_for_restricted_disclosure"||
    !present(offer.mandateEvidenceId)||!present(offer.stockRightsEvidenceId)||
    !date(offer.validUntil)||offer.validUntil<asOf)
  return deny("Offer validity, authority and restricted disclosure review required");
 if(!member(principal,offer.sellerTenantId,"exchange_disclose")||
    !present(buyer.tenantId)||buyer.tenantId===offer.sellerTenantId||
    buyer.verified!==true||buyer.suspended===true)
  return deny("Independent verified buyer organisation and active seller authority required");
 const allowed=["material_spec","grade","volume","price_terms","region","verified_contact"];
 if(!present(consent.id)||seenConsentIds.includes(consent.id)||consent.sellerUserId!==principal.userId||
    consent.offerId!==offer.id||consent.offerHash!==offer.contentHash||
    consent.recipientTenantId!==buyer.tenantId||!date(consent.validUntil)||consent.validUntil<asOf||
    consent.explicitPermission!==true||!present(consent.approvalEventId)||
    !Array.isArray(consent.fields)||!consent.fields.length||consent.fields.length>allowed.length||
    new Set(consent.fields).size!==consent.fields.length||
    consent.fields.some(f=>!allowed.includes(f)))
  return deny("Exact recipient, consent fields, content hash and validity do not match");
 return {state:"disclosure_candidate",reason:"This is a server-authorised sharing intent only; enforce tenant RLS before any content leaves storage",
  intent:{kind:"restricted_offer_disclosure",consentId:consent.id,approvalEventId:consent.approvalEventId,
   offerId:offer.id,offerHash:offer.contentHash,sellerTenantId:offer.sellerTenantId,
   buyerTenantId:buyer.tenantId,fields:[...consent.fields],validUntil:consent.validUntil,
   sellerActorId:principal.userId,idempotencyKey:"disclosure:"+consent.id,
   buyerCanViewWithoutFurtherServerChecks:false,authorisesContract:false,authorisesFunds:false}};
}
export function prepareBuyerInterest({offer,buyer,disclosure,interest,asOf}){
 if(!offer||!buyer||!disclosure||!interest||!date(asOf)||!member(buyer,buyer.tenantId,"exchange_express_interest")||
  offer.id!==disclosure.offerId||offer.contentHash!==disclosure.offerHash||
  disclosure.buyerTenantId!==buyer.tenantId||disclosure.sellerTenantId!==offer.sellerTenantId||
  !date(disclosure.validUntil)||disclosure.validUntil<asOf||
  !present(interest.id)||!present(interest.reason,2000)||interest.offerId!==offer.id)
  return deny("Buyer may only express interest in an active expressly disclosed offer");
 return {state:"interest_candidate",reason:"Non-binding enquiry requiring real authenticated storage and recipient consent",
  intent:{kind:"buyer_interest",buyerTenantId:buyer.tenantId,sellerTenantId:offer.sellerTenantId,
   offerId:offer.id,offerHash:offer.contentHash,disclosureConsentId:disclosure.consentId,
   interestedBuyerUserId:buyer.userId,interestId:interest.id,reason:interest.reason,
   contractAccepted:false,stockReserved:false,purchaseOrderIssued:false,paymentAuthorised:false}};
}
