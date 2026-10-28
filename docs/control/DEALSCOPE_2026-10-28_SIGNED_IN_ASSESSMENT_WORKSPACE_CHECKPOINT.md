# DealScope — Controlled Signed-In Assessment Integration Checkpoint
Document: SAR-DSC-ENG-20261028-MACRO-004
Date: 28 October 2026 | Owner: Shobane African Resources (Pty) Ltd
State: SOURCE IMPLEMENTED ON UNRELEASED DRAFT BRANCH — NOT ACCEPTED / NOT DEPLOYED

## Verified repository authority
- Repository: shobanesiyanda/sar-resourceos-golden-path-proof
- Main verified at recovery: 6e18d39037373528634a69a132f66fe35577c3f1.
- DealScope migration integration base: f497b6e721ffa6a4a9ab08eed1f99de8a88b6c8c.
- Engineering branch: engineering/dealscope-contract-intelligence-v6-20261028.
- Draft PR #4 against the existing migration branch. This is a subordinate integration candidate, not approved for main promotion.
- Sources preserve the legal owner SAR; never attach DealScope to TenderDesk/Possent Supabase, merchant, credentials or unrelated tenants.

## Founder requirements applied
- Two independent customer services: Market Intelligence and customer-submitted Deal Intelligence.
- Customer route: commodity -> contractual delivery basis -> value-chain role -> material form/entry position -> document/paste/manual source intake -> confirmed facts -> assessment -> customer-safe decision report.
- Documents are not proof of legal authenticity. Contradictions and unsupported inputs must be visible.
- Customer sees material requirements, rate negotiation guidance, acquisition ceilings where adequately evidenced, next actions and limitations. No frontend calculation formulas or internal pricing/optimisation disclosure.
- No customer-facing deal finding, commercial exchange or buyer/seller matching has been activated.
- No uncontrolled trial, client payments or contract obligations.

## Source changes in this integration
1. apps/dealscope/lib/server/deal-facts.mjs — bounded source sets, known/unknown, source-linked contradictions.
2. apps/dealscope/lib/server/chrome-route-engine.mjs — private grade scenarios, distance-and-truck freight, guarded acquisition ceiling.
3. apps/dealscope/lib/server/assessment-workflow.mjs — approved customer-facing projection only; requires complete trusted route-cost set before a purchase ceiling.
4. apps/dealscope/lib/server/intake-service.mjs — authenticated, verified-tenancy intake adapter contract (up to five files, bounded text, file type/size prechecks); actual malware scanning/encrypted storage adapters remain unconfigured.
5. apps/dealscope/lib/server/assessment-confirmation.mjs — revision-aware persisted fact confirmation. Browser checkbox alone never authorises assessment.
6. apps/dealscope/lib/server/assessment-service.mjs — authenticated, tenant-owned, entitlement-and-legal-accepted persisted case -> internal reference -> candidate decision -> durable record contract; client sends case ID only.
7. apps/dealscope/lib/server/assessment-runtime.mjs — explicitly null, fail-closed binding until SAR-controlled customer infrastructure is established.
8. apps/dealscope/app/api/assessments/route.ts, /intake/route.ts, /confirm/route.ts — now connect to their respective protected services, returning 503 when runtime unavailable.
9. apps/dealscope/app/workspace/deals/new/AssessmentJourney.tsx, page.tsx, journey.css — real source-level four-stage UI gated behind verified session and entitlement; not externally accessible at present.
10. apps/dealscope/app/runs/page.tsx — legacy browser-side calculation page replaced with compatibility redirect to the secure workspace; historical source retained in Git history.
11. apps/dealscope/app/start/page.tsx — onboarding points to the protected workspace, not legacy calculator.
12. apps/dealscope/test/contract-first-assessment-journey.test.mjs, apps/dealscope/test/public-website.test.mjs — regression and disclosure gate updates.

## Evidence that HAS been executed
- Exact committed server modules re-fetched from GitHub and executed in a JS isolate via native evaluation (imports injected from their corresponding committed modules), with 13 previously focused tests and 14 new committed-test assertions passing.
- The 14 new tests exercised unconfigured service failure, authentication denial before file reading, accepted input, unsupported uploads, wrong tenant, confirmation revision mismatch, unresolved contradiction, saved-case assessment, missing route-cost evidence and no formulas in customer components.
- Individual blobs and new branch files re-fetchable from SAR-controlled GitHub. Source, not production acceptance.

## Tests NOT yet executed — release blockers
- Pinned npm install, Next.js typecheck, Next production build, complete existing project test suite and lint on the exact integrated checkout: OPEN.
- Real SAR-controlled DealScope Supabase project: NOT CREATED. No working Auth, membership/consent/entitlement persistence, encrypted customer file storage, malware scanning, trusted OCR/text extraction or tenant RLS database acceptance.
- Licensed dated market sources, freight-rate provider, processing-testwork evidence and full commodity specialist registry: OPEN.
- Browser -> authenticated intake -> source hash/provenance -> stored fact confirmation -> assessment -> report -> reload and revision: NOT EXECUTED.
- Full independent red-team/IDOR/RLS, expiry, backup and restore: OPEN.
- Public homepage still includes historical discovery/exchange wording requiring separate controlled reconciliation before launch.
- No production deployment, paid assessment, legal certification, trade acceptance, merger or customer transaction is authorised.

## Next strict build sequence
A. Re-run exact checkout npm test, typecheck and production build; repair actual failures before any release change.
B. Bind SAR-controlled Auth/RLS/secure source storage after approved project provisioning, no non-SAR fallback.
C. Add non-LLM deterministic extraction plus contract parsing with user-confirmed field provenance; OCR/AI only through controlled eval, no assumed contract authenticity.
D. Implement dated market/transport/processing evidence adapters and specialist registry, with fees and market provenance.
E. Execute authenticated full journey including session expiry, role denial, wrong tenant, contradictory sources, incomplete costs, immutable revision and report issuance.
F. Reconcile old public marketing claims; independently accept signed-out UX and product with founder release authority.
