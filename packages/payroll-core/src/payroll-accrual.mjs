/** SAR PayrollOS private-to-AccountingOS aggregate candidate.
 * No statutory rates or sensitive employee data ever inferred or exported.
 * Effective-dated reviewed statutory calculator supplies trusted integer cents;
 * employer and treasury authentication/ledger posting remain external gates. */
const C='Shobane African Resources (Pty) Ltd';
const H=/^[0-9a-f]{64}$/i;
const ID=/^[A-Za-z0-9_:-]{1,100}$/;
const id=v=>typeof v==='string'&&ID.test(v);
const money=v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const fail=code=>({state:'blocked',code,aggregate:null});
export function preparePayrollAccrual({tenantId,employer,period,policy,payRun,records,approvals}){
 if(!id(tenantId)||employer?.company!==C||employer.tenantId!==tenantId||
  !id(employer.id)||!id(period?.id)||period.status!=='open'||
  !id(policy?.id)||!H.test(policy.sha256||'')||
  !/^\d{4}-\d{2}-\d{2}$/.test(policy.validFrom||'')||
  !/^\d{4}-\d{2}-\d{2}$/.test(policy.validUntil||'')||
  period.startDate<policy.validFrom||period.endDate>policy.validUntil||
  policy.independentlyReviewed!==true||policy.effectiveDatedPayrollRules!==true||
  !/^\d{4}-\d{2}-\d{2}$/.test(period.startDate||'')||
  !/^\d{4}-\d{2}-\d{2}$/.test(period.endDate||'')||
  period.startDate>period.endDate||
  !id(payRun?.id)||!id(payRun.preparedBy)||payRun.employerId!==employer.id||payRun.periodId!==period.id||
  payRun.state!=='approved_for_accrual'||!H.test(payRun.sourceSha256||'')||
  !Array.isArray(records)||records.length===0||records.length>5000||
  !Array.isArray(approvals)||approvals.length!==2)return fail('verified_private_payrun_and_policy_required');
 const roles=new Map();const actors=new Set();
 for(const a of approvals){
  if(!a||!['payroll','finance'].includes(a.domain)||roles.has(a.domain)||
   !id(a.actorId)||a.actorId===payRun.preparedBy||actors.has(a.actorId)||a.verifiedByIAM!==true||
   a.state!=='approved'||a.payRunId!==payRun.id||a.sourceSha256!==payRun.sourceSha256)
   return fail('distinct_payroll_and_finance_approvals_required');
  roles.set(a.domain,a);actors.add(a.actorId);
 }
 if(roles.size!==2)return fail('both_independent_approvals_required');
 const seen=new Set(),total={gross:0,paye:0,employeeUIF:0,other:0,net:0,employerUIF:0,sdl:0};
 for(const r of records){
  if(!r||!id(r.employeeToken)||seen.has(r.employeeToken)||r.employerId!==employer.id||
    r.calculationSourceVerified!==true||!H.test(r.calculationHash||'')||
    !money(r.grossCents)||!money(r.payeCents)||!money(r.employeeUIFCents)||
    !money(r.otherDeductionsCents)||!money(r.netCents)||!money(r.employerUIFCents)||!money(r.sdlCents)||
    r.grossCents!==r.netCents+r.payeCents+r.employeeUIFCents+r.otherDeductionsCents)
    return fail('employee_statutory_deductions_incomplete_or_duplicate');
  seen.add(r.employeeToken);
  for(const [field,name] of [['grossCents','gross'],['payeCents','paye'],['employeeUIFCents','employeeUIF'],
   ['otherDeductionsCents','other'],['netCents','net'],['employerUIFCents','employerUIF'],['sdlCents','sdl']])
   total[name]+=r[field];
 }
 if(!Object.values(total).every(money))return fail('payroll_integer_overflow');
 const lines=[
  {account:'wages_salaries_expense',debitCents:total.gross,creditCents:0},
  {account:'employer_uif_expense',debitCents:total.employerUIF,creditCents:0},
  {account:'employer_sdl_expense',debitCents:total.sdl,creditCents:0},
  {account:'net_payroll_payable',debitCents:0,creditCents:total.net},
  {account:'paye_payable',debitCents:0,creditCents:total.paye},
  {account:'employee_uif_payable',debitCents:0,creditCents:total.employeeUIF},
  {account:'employee_deductions_payable',debitCents:0,creditCents:total.other},
  {account:'employer_uif_payable',debitCents:0,creditCents:total.employerUIF},
  {account:'sdl_payable',debitCents:0,creditCents:total.sdl}];
 const debit=lines.reduce((s,x)=>s+x.debitCents,0),credit=lines.reduce((s,x)=>s+x.creditCents,0);
 if(!money(debit)||!money(credit)||debit!==credit)return fail('unbalanced_private_payroll_accrual');
 return {state:'aggregate_payroll_journal_candidate',code:'private_unposted_only',aggregate:{
  eventType:'sar.payroll.aggregate_accrual_candidate.v1',tenantId,employerId:employer.id,
  periodId:period.id,payRunId:payRun.id,policyHash:policy.sha256,
  payRunSourceHash:payRun.sourceSha256,employeeCount:seen.size,currency:'ZAR',
  totalDebitCents:debit,totalCreditCents:credit,lines,
  status:'not_posted',employeeRecordsExposed:false,bankDetailsExposed:false,
  noPaymentAuthorization:true,requiresIndependentLedgerPosting:true,requiresAtomicAudit:true}};
}
