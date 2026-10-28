/** SAR warehouse custody and stock reservation candidates.
 * Never accepts client-declared ownership/assay as independent proof.
 * No database writes, sale, dispatched truck or title transfer. */
const COMPANY='Shobane African Resources (Pty) Ltd';
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_:-]{1,100}$/.test(s);
const sha=s=>typeof s==='string'&&/^[0-9a-f]{64}$/i.test(s);
const pos=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
const nn=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const round=n=>Math.round(n*1000)/1000;
const blocked=reason=>({state:'blocked',reason,batch:null,reservation:null});
export function prepareWarehouseIntake({tenantId,warehouse,parcel,stockProof,weighbridge,lab,actor,existingBatchIds=[]}){
 if(!id(tenantId)||warehouse?.tenantId!==tenantId||parcel?.tenantId!==tenantId||
  warehouse?.company!==COMPANY||parcel?.company!==COMPANY||!id(warehouse.id)||!id(parcel.id)||
  !id(weighbridge?.ticketId)||!Array.isArray(existingBatchIds)||existingBatchIds.includes(weighbridge.ticketId)||
  warehouse.status!=='approved_operating_site'||warehouse.weighbridgeCalibrated!==true||
  parcel.titleVerified!==true||parcel.sourceAuthorityVerified!==true||
  !sha(stockProof?.hash)||stockProof.independentVerification!==true||stockProof.parcelId!==parcel.id||
  weighbridge.sourceVerified!==true||weighbridge.parcelId!==parcel.id||
  !pos(weighbridge.grossT)||!nn(weighbridge.tareT)||weighbridge.grossT<=weighbridge.tareT||
  !nn(weighbridge.moisturePct)||weighbridge.moisturePct>=100||
  lab?.assayApproved!==true||lab.parcelId!==parcel.id||!sha(lab.sourceHash)||!id(lab.assayId)||
  !id(actor?.userId)||actor.verified!==true||actor.tenantId!==tenantId||
  !actor.roles?.includes('warehouse_intake_controller'))return blocked('warehouse_title_weighbridge_assay_and_staff_required');
 const wet=round(weighbridge.grossT-weighbridge.tareT);
 const dry=round(wet*(1-weighbridge.moisturePct/100));
 if(!pos(wet)||!pos(dry)||!nn(warehouse.capacityWetT)||!nn(warehouse.currentWetT)||
  warehouse.currentWetT+wet>warehouse.capacityWetT)return blocked('warehouse_capacity_or_mass_incomplete');
 return {state:'warehouse_intake_candidate',reason:'requires_atomic_stock_lot_custody_and_audit',reservation:null,batch:{
  schemaVersion:1,eventType:'sar.resourceos.warehouse_intake_candidate.v1',tenantId,
  warehouseId:warehouse.id,parcelId:parcel.id,lotId:weighbridge.ticketId,assayId:lab.assayId,
  wetReceivedT:wet,moisturePct:weighbridge.moisturePct,dryAvailableT:dry,
  stockEvidenceHash:stockProof.hash,assaySourceHash:lab.sourceHash,
  status:'pending_verified_custody_commit',titleTransferred:false,stockSaleable:false,
  reservedDryT:0,requiresAtomicAudit:true}};
}
export function prepareWarehouseDispatchReservation({tenantId,lot,dispatch,actor,existingReservationIds=[]}){
 if(!id(tenantId)||!lot||lot.tenantId!==tenantId||
  lot.eventType!=='sar.resourceos.warehouse_intake_candidate.v1'||
  lot.status!=='available_committed'||lot.custodyVerified!==true||
  !Number.isSafeInteger(lot.version)||lot.version<1||
  !Number.isSafeInteger(dispatch?.expectedLotVersion)||dispatch.expectedLotVersion!==lot.version||
  !id(dispatch?.reservationId)||!id(dispatch.calloffId)||!id(dispatch.truckId)||
  !Array.isArray(existingReservationIds)||existingReservationIds.includes(dispatch.reservationId)||
  dispatch.releaseGateState!=='approved'||dispatch.titleAndCustodyRechecked!==true||
  !pos(dispatch.dryQuantityT)||!nn(lot.reservedDryT)||!pos(lot.dryAvailableT)||
  dispatch.dryQuantityT+lot.reservedDryT>lot.dryAvailableT+0.00001||
  !pos(dispatch.truckWetPayloadT)||!nn(dispatch.moisturePct)||dispatch.moisturePct>=100||
  !id(actor?.userId)||actor.verified!==true||actor.tenantId!==tenantId||
  !actor.roles?.includes('warehouse_dispatch_controller'))return blocked('verified_stock_release_and_reservation_required');
 const payload=round(dispatch.dryQuantityT/(1-dispatch.moisturePct/100));
 if(!pos(payload)||payload>dispatch.truckWetPayloadT)return blocked('truck_wet_payload_exceeded');
 return {state:'warehouse_dispatch_reservation_candidate',reason:'requires_atomic_inventory_reservation_and_audit',batch:null,reservation:{
  eventType:'sar.resourceos.warehouse_reservation_candidate.v1',tenantId,
  reservationId:dispatch.reservationId,warehouseId:lot.warehouseId,lotId:lot.lotId,
  calloffId:dispatch.calloffId,truckId:dispatch.truckId,plannedDryT:dispatch.dryQuantityT,
  calculatedWetPayloadT:payload,status:'uncommitted',requiresAtomicAudit:true,
  paymentReleased:false,titleTransferred:false}};
}
