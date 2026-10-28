import test from 'node:test';import assert from 'node:assert/strict';
import {prepareResourceOSWebsiteIntake as make} from '../src/supplier-intake-receiver.mjs';
const H='a'.repeat(64),C='Shobane African Resources (Pty) Ltd';
const event={eventType:'sar.website.supplier_submitted.v1',eventId:'REV1',idempotencyKey:'sar-web-intake:REV1',sourceSystem:'sar-website',
 targetState:'unverified_intake',sourceId:'SUP1',sourceHash:H,consentVersion:'v1',reviewedBy:'STAFF1',category:'Chrome ROM Supply',
 riskState:'standard_review',receivedAt:'2026-10-28T09:00:00Z',reviewedAt:'2026-10-28T09:15:00Z'};
const sourceAttestation={verifiedTransport:true,issuer:'sar-website',company:C,verifiedConsent:true,verifiedOriginalSource:true,
 sourceId:'SUP1',originalSourceHash:H,reviewEventId:'REV1',consentVersion:'v1'};
const principal={verified:true,company:C,activeMembership:true,userId:'STAFF1',roles:['supplier_intake_reviewer']};
const run=(other={})=>make({event,sourceAttestation,principal,...other});
test('source-reviewed supplier lead stays unverified and has no financial authority',()=>{const r=run();assert.equal(r.state,'candidate_for_atomic_recording');assert.equal(r.intent.resourceState,'unverified_intake');for(const k of ['approvedCampaign','stockOwnershipVerified','purchaseApproved','financialReleaseApproved'])assert.equal(r.intent[k],false);});
test('unverified website signature and consent cannot enter company system',()=>{assert.equal(run({sourceAttestation:{...sourceAttestation,verifiedTransport:false}}).state,'blocked');assert.equal(run({sourceAttestation:{...sourceAttestation,verifiedConsent:false}}).state,'blocked');});
test('reviewer identity and role must match independent SAR record',()=>{assert.equal(run({principal:{...principal,userId:'OTHER'}}).state,'blocked');assert.equal(run({principal:{...principal,roles:[]}}).state,'blocked');});
test('wrong company or source hash cannot import a supplier',()=>{assert.equal(run({sourceAttestation:{...sourceAttestation,company:'OTHER'}}).state,'blocked');assert.equal(run({event:{...event,sourceHash:'b'.repeat(64)}}).state,'blocked');});
test('replays are idempotent candidates and never repeat source writes',()=>{const x=run({alreadySeen:['sar-web-intake:REV1']});assert.equal(x.state,'duplicate');assert.equal(x.intent,null);});
test('website handoff must preserve unverified target state',()=>{assert.equal(run({event:{...event,targetState:'approved_campaign'}}).state,'blocked');});
test('tampered review key or consent version is not accepted',()=>{assert.equal(run({event:{...event,eventId:'OTHER'}}).state,'blocked');assert.equal(run({event:{...event,consentVersion:'older'}}).state,'blocked');});
test('future or inverted review chronology is blocked',()=>{assert.equal(run({event:{...event,reviewedAt:'2026-10-28T08:00:00Z'}}).state,'blocked');});
