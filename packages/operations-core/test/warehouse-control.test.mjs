import test from 'node:test';import assert from 'node:assert/strict';
import {prepareWarehouseIntake as intake,prepareWarehouseDispatchReservation as reserve} from '../src/warehouse-control.mjs';
const C='Shobane African Resources (Pty) Ltd',T='SAR-ORG',H='a'.repeat(64);
const warehouse={id:'BRITS-1',tenantId:T,company:C,status:'approved_operating_site',weighbridgeCalibrated:true,capacityWetT:1000,currentWetT:100};
const parcel={id:'P1',tenantId:T,company:C,titleVerified:true,sourceAuthorityVerified:true};
const stockProof={hash:H,independentVerification:true,parcelId:'P1'};
const weighbridge={ticketId:'WB1',sourceVerified:true,parcelId:'P1',grossT:39,tareT:5,moisturePct:10};
const lab={assayApproved:true,parcelId:'P1',sourceHash:H,assayId:'ASSAY1'};
const actor={userId:'STAFF1',verified:true,tenantId:T,roles:['warehouse_intake_controller']};
const call=o=>intake({tenantId:T,warehouse,parcel,stockProof,weighbridge,lab,actor,...o});
const lot={...call().batch,status:'available_committed',custodyVerified:true,version:3};
const dispatch={reservationId:'RS1',calloffId:'PO1',truckId:'TIP1',expectedLotVersion:3,releaseGateState:'approved',titleAndCustodyRechecked:true,dryQuantityT:20,truckWetPayloadT:34,moisturePct:10};
const ctrl={userId:'CTRL',verified:true,tenantId:T,roles:['warehouse_dispatch_controller']};
const hold=o=>reserve({tenantId:T,lot,dispatch,actor:ctrl,...o});
const c=[
['source verified and weighed intake is only candidate',()=>{let x=call();assert.equal(x.state,'warehouse_intake_candidate');assert.equal(x.batch.wetReceivedT,34);assert.equal(x.batch.dryAvailableT,30.6);assert.equal(x.batch.stockSaleable,false)}],
['wrong tenant blocked',()=>assert.equal(call({parcel:{...parcel,tenantId:'OTH'}}).state,'blocked')],
['unverified ownership blocked',()=>assert.equal(call({parcel:{...parcel,titleVerified:false}}).state,'blocked')],
['unsigned stock provenance blocked',()=>assert.equal(call({stockProof:{...stockProof,independentVerification:false}}).state,'blocked')],
['invalid weighbridge net mass blocked',()=>assert.equal(call({weighbridge:{...weighbridge,tareT:40}}).state,'blocked')],
['unknown moisture blocked',()=>assert.equal(call({weighbridge:{...weighbridge,moisturePct:100}}).state,'blocked')],
['missing lab verification blocked',()=>assert.equal(call({lab:{...lab,assayApproved:false}}).state,'blocked')],
['warehouse capacity enforced',()=>assert.equal(call({warehouse:{...warehouse,currentWetT:990}}).state,'blocked')],
['duplicate weighbridge ticket denied',()=>assert.equal(call({existingBatchIds:['WB1']}).state,'blocked')],
['candidate intake cannot be reserved before custody commit',()=>assert.equal(hold({lot:call().batch}).state,'blocked')],
['committed and version-checked lot can produce stock reservation only',()=>{let x=hold();assert.equal(x.state,'warehouse_dispatch_reservation_candidate');assert.equal(x.reservation.status,'uncommitted');assert.equal(x.reservation.paymentReleased,false)}],
['stale lot version blocks double allocation',()=>assert.equal(hold({dispatch:{...dispatch,expectedLotVersion:2}}).state,'blocked')],
['insufficient unreserved dry stock blocked',()=>assert.equal(hold({lot:{...lot,reservedDryT:15}}).state,'blocked')],
['truck wet payload blocks overloaded loads',()=>assert.equal(hold({dispatch:{...dispatch,dryQuantityT:31}}).state,'blocked')],
['warehouse dispatch controller access must be verified',()=>assert.equal(hold({actor:{...ctrl,roles:[]}}).state,'blocked')],
['reservation replay denied',()=>assert.equal(hold({existingReservationIds:['RS1']}).state,'blocked')]
];for(const [name,fn] of c)test(name,fn);
