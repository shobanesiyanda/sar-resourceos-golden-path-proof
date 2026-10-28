import test from 'node:test';import assert from 'node:assert/strict';
import {preparePayrollAccrual as accrue} from '../src/payroll-accrual.mjs';
const C='Shobane African Resources (Pty) Ltd',T='SAR-ORG',H='a'.repeat(64);
const employer={id:'SAR-EMPLOYER',company:C,tenantId:T};
const period={id:'2026-10',startDate:'2026-10-01',endDate:'2026-10-31',status:'open'};
const policy={id:'SA-2026-APPROVED',sha256:H,validFrom:'2026-03-01',validUntil:'2027-02-28',independentlyReviewed:true,effectiveDatedPayrollRules:true};
const payRun={id:'RUN1',employerId:employer.id,periodId:period.id,preparedBy:'HR0',state:'approved_for_accrual',sourceSha256:H};
const records=[{employeeToken:'token-1',employerId:employer.id,calculationSourceVerified:true,calculationHash:H,
 grossCents:200000,payeCents:30000,employeeUIFCents:1000,otherDeductionsCents:2000,netCents:167000,employerUIFCents:1000,sdlCents:2000}];
const approvals=[{domain:'payroll',actorId:'HR1',verifiedByIAM:true,state:'approved',payRunId:'RUN1',sourceSha256:H},
 {domain:'finance',actorId:'ACC1',verifiedByIAM:true,state:'approved',payRunId:'RUN1',sourceSha256:H}];
const run=o=>accrue({tenantId:T,employer,period,policy,payRun,records,approvals,...o});
const c=[
['aggregate is balanced, unposted and private',()=>{const x=run();assert.equal(x.state,'aggregate_payroll_journal_candidate');assert.equal(x.aggregate.employeeCount,1);assert.equal(x.aggregate.totalDebitCents,203000);assert.equal(x.aggregate.totalCreditCents,203000);assert.equal(x.aggregate.status,'not_posted');assert.equal(x.aggregate.employeeRecordsExposed,false);assert.equal(JSON.stringify(x).includes('token-1'),false)}],
['employer legal entity mismatch blocked',()=>assert.equal(run({employer:{...employer,company:'OtherCo'}}).state,'blocked')],
['cross-tenant payroll blocked',()=>assert.equal(run({employer:{...employer,tenantId:'Other'}}).state,'blocked')],
['closed payroll period blocked',()=>assert.equal(run({period:{...period,status:'closed'}}).state,'blocked')],
['outdated effective rule policy blocked',()=>assert.equal(run({policy:{...policy,validUntil:'2026-09-30'}}).state,'blocked')],
['unreviewed statutory calculator blocked',()=>assert.equal(run({policy:{...policy,independentlyReviewed:false}}).state,'blocked')],
['missing effective dated rule flag blocked',()=>assert.equal(run({policy:{...policy,effectiveDatedPayrollRules:undefined}}).state,'blocked')],
['duplicate employee token blocked',()=>assert.equal(run({records:[records[0],records[0]]}).state,'blocked')],
['deduction arithmetic mismatch blocked',()=>assert.equal(run({records:[{...records[0],netCents:167001}]}).state,'blocked')],
['unverified calculated payslip blocked',()=>assert.equal(run({records:[{...records[0],calculationSourceVerified:false}]}).state,'blocked')],
['payroll preparer cannot sign own independent approval',()=>assert.equal(run({approvals:[{...approvals[0],actorId:'HR0'},approvals[1]]}).state,'blocked')],
['payroll and finance checker cannot be same actor',()=>assert.equal(run({approvals:[approvals[0],{...approvals[1],actorId:'HR1'}]}).state,'blocked')],
['only one domain approval blocked',()=>assert.equal(run({approvals:approvals.slice(0,1)}).state,'blocked')],
['finance or salary input may not emit private employee records',()=>{const x=run();assert.equal('records' in x.aggregate,false);assert.equal('employeeToken' in x.aggregate,false);assert.equal('bankAccount' in x.aggregate,false)}],
['invalid cents float blocked',()=>assert.equal(run({records:[{...records[0],payeCents:0.1}]}).state,'blocked')],
['negative employer levy blocked',()=>assert.equal(run({records:[{...records[0],sdlCents:-1}]}).state,'blocked')]
];for(const [name,fn] of c)test(name,fn);
