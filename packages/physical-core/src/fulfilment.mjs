/** Physical commodity route control. Strictly candidate-only; source proof is
 * independently verified by trusted SAR services before data reaches here.
 * Does not dispatch trucks, transfer title or invoice buyers. */
const H=/^[a-f0-9]{64}$/i;
const id=s=>typeof s==='string'&&/^[A-Za-z0-9:_-]{1,100}$/.test(s);
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
const nonnegative=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const blocked=reason=>({state:'blocked',reason,dispatch:null,receipt:null});
const round=n=>Math.round(n*1000)/1000;
export function prepareDispatchCandidate({company,tenantId,order,parcel,vehicle,driver,sourceEvidence,command,seenTripIds=[]}){
 if(company!=='Shobane African Resources (Pty) Ltd'||![tenantId,order?.tenantId,parcel?.tenantId,vehicle?.tenantId].every(x=>id(x))||
  [order.tenantId,parcel.tenantId,vehicle.tenantId].some(x=>x!==tenantId))return blocked('sar_tenant_boundary');
 if(!id(order?.id)||!id(parcel?.id)||!id(command?.tripId)||!id(vehicle?.id)||!id(driver?.id)||
  !Array.isArray(seenTripIds)||seenTripIds.includes(command.tripId)||
  order.state!=='approved_calloff'||order.signed!==true||order.currency!=='ZAR'||
  order.commodity!==parcel.commodity||order.materialForm!==parcel.materialForm||
  order.qualityBasis!==parcel.qualityBasis||!id(order.buyerId)||!id(parcel.sourceId)||
  parcel.sourceControlVerified!==true||parcel.titleEvidenceVerified!==true||
  sourceEvidence?.verified!==true||sourceEvidence?.parcelId!==parcel.id||!H.test(sourceEvidence.sha256||'')||
  command.releaseApproved!==true||command.sarControllerVerified!==true||!id(command.approvalEventId))
  return blocked('authorised_order_source_and_dispatch_evidence_required');
 if(vehicle.status!=='available'||vehicle.roadworthyVerified!==true||vehicle.insuranceCurrent!==true||
   driver.licensedForVehicle!==true||driver.active!==true||!positive(vehicle.payloadWetT)||
   !positive(command.wetLoadedT)||command.wetLoadedT>vehicle.payloadWetT||
   !nonnegative(command.moisturePct)||command.moisturePct>=100||
   !positive(order.totalDryT)||!nonnegative(parcel.availableDryT))
  return blocked('vehicle_payload_moisture_and_driver_gate');
 const dry=round(command.wetLoadedT*(1-command.moisturePct/100));
 if(!positive(dry)||dry>parcel.availableDryT||dry>order.totalDryT)return blocked('source_or_calloff_quantity_exceeded');
 return {state:'dispatch_candidate',reason:'await_trusted_atomic_dispatch_commit',receipt:null,dispatch:{
  eventType:'sar.resourceos.dispatch_candidate.v1',tenantId,company,tripId:command.tripId,
  calloffId:order.id,parcelId:parcel.id,buyerId:order.buyerId,vehicleId:vehicle.id,
  driverId:driver.id,sourceId:parcel.sourceId,sourceSha256:sourceEvidence.sha256,
  approvalEventId:command.approvalEventId,commodity:order.commodity,materialForm:order.materialForm,
  qualityBasis:order.qualityBasis,wetLoadedT:command.wetLoadedT,moisturePct:command.moisturePct,
  calculatedDryT:dry,maxVehiclePayloadWetT:vehicle.payloadWetT,status:'not_dispatched',
  titleTransferred:false,paymentAuthorized:false,requiresAtomicAudit:true}};
}
export function reconcileReceiptCandidate({dispatch,receipt,toleranceDryT=0.25,seenReceiptIds=[]}){
 if(dispatch?.eventType!=='sar.resourceos.dispatch_candidate.v1'||dispatch.status!=='not_dispatched'||
  !id(dispatch.tripId)||!H.test(dispatch.sourceSha256)||!receipt||!id(receipt.id)||
  !Array.isArray(seenReceiptIds)||seenReceiptIds.includes(receipt.id)||
  receipt.tenantId!==dispatch.tenantId||receipt.tripId!==dispatch.tripId||
  receipt.calloffId!==dispatch.calloffId||receipt.parcelId!==dispatch.parcelId||
  receipt.buyerId!==dispatch.buyerId)return blocked('receipt_identity_revision_or_replay');
 if(receipt.weighbridgeVerified!==true||receipt.independentAssayReviewed!==true||
  receipt.buyerAccepted!==true||!H.test(receipt.sourceSha256||'')||
  !positive(receipt.wetReceivedT)||!nonnegative(receipt.moisturePct)||receipt.moisturePct>=100||
  !nonnegative(toleranceDryT)||!id(receipt.assayRef))return blocked('verified_receipt_assay_and_acceptance_required');
 const dry=round(receipt.wetReceivedT*(1-receipt.moisturePct/100));
 if(Math.abs(dry-dispatch.calculatedDryT)>toleranceDryT || receipt.wetReceivedT>dispatch.wetLoadedT+0.001)
  return blocked('dispatch_receipt_dry_mass_discrepancy');
 return {state:'receipt_candidate',reason:'await_trusted_receipt_and_custody_commit',dispatch:null,receipt:{
  eventType:'sar.resourceos.receipt_candidate.v1',tenantId:dispatch.tenantId,
  company:dispatch.company,tripId:dispatch.tripId,receiptId:receipt.id,calloffId:dispatch.calloffId,
  parcelId:dispatch.parcelId,buyerId:dispatch.buyerId,commodity:dispatch.commodity,
  materialForm:dispatch.materialForm,qualityBasis:dispatch.qualityBasis,
  wetReceivedT:receipt.wetReceivedT,moisturePct:receipt.moisturePct,
  acceptedDryT:dry,assayRef:receipt.assayRef,assaySourceSha256:receipt.sourceSha256,
  dispatchSourceSha256:dispatch.sourceSha256,status:'provisional_receipt',
  buyerAccepted:true,invoiceIssued:false,ledgerPosted:false,paymentAuthorized:false,
  custodyProofReviewRequired:true,requiresAtomicAudit:true}};
}
