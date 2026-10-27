# SAR Macro Continuation — Governed Documents, PAYG, Variance, Intake & Mainline Reconciliation
**ID:** SAR-MACRO-CHECKPOINT-20261027-02
**Owner:** Shobane African Resources (Pty) Ltd
**Status:** **UNRELEASED ENGINEERING INTEGRATION CANDIDATE**, no production promotion, no external billing, no supplier communication.
**Date:** 27 October 2026 SAST
**Authority:** SAR mainline architecture and the explicit latest Founder requirements for document amendment control and DealScope outcome-independent PAYG. Exact role/DoA appointments, financial policies, pricing and operational release need acceptance.

## 1. Controlled Git reconciliation
- SAR-controlled repo: \`shobanesiyanda/sar-resourceos-golden-path-proof\`.
- Correct SAR original \`main\` architecture head before batch: \`6e18d39037373528634a69a132f66fe35577c3f1\`.
- Controlled main->draft two-parent merge commit \`cad25f887f6fb2992084c5e5e633b2fd999b3a16\`, with nine critical approved README/AGENTS/architecture blobs overlaid from \`main\`; app code preserved on draft.
- Subsequent compare against \`main\`: **ahead by 128, behind by 0**, with current draft source changes; this is NOT a main merge or production release. PR #1 remains draft.
- Mainline documents, company ownership and no-cross-contamination rules govern this integration. New 09/10 annexes are on the draft, not approved mainline issuance.

## 2. Newly delivered source contracts
| Domain | Exact file | Status |
| --- | --- | --- |
| ResourceOS document preparation | \`packages/project-core/src/document-pack.mjs\`, related test, Studio import | Source committed, final UI browser acceptance OPEN |
| Document amendments | \`packages/document-governance/src/amendment-workflow.mjs\` and test | New independent pre-/post-approval state machine, source only |
| Studio document protection | \`app/documents/studio/page.tsx\` | System-generated session drafts read-only pending controlled server grant, not real backend DoA |
| DealScope PAYG | \`apps/dealscope/lib/payg-entitlements.mjs\` and test | Source-only evidence-gated paid report credit candidates; zero live payments |
| DealScope database | \`apps/dealscope/database/payg-extension.REVIEW-ONLY.sql\` | Draft greenfield schema; NO migration executed |
| Physical actuals | \`packages/project-core/src/actual-plan.mjs\` and test | Evidence-gated operational cost/progress variance, not GL or cash |
| Website supplier intake | Separate SAR \`shobanesiyanda/sar-website\` redesign branch: \`lib/supplier-handoff.mjs\` + test | Pure consent- and reviewer-bound internal intake envelope, no live handoff |
| Architectural authority | \`docs/architecture/09-DOCUMENT-AMENDMENT-AUTHORITY.md\` & \`10-DEALSCOPE-PAYG-PRODUCT.md\` | Founder directions recorded, engineering and statutory terms pending |

## 3. Test execution evidence — narrow and truthful
- Source blobs were fetched back from the SAR GitHub connector after commits.
- An independent JavaScript evaluation harness executed the EXACT fetched source code and the test cases from four newly committed test suites:
  - amendment workflow: **7 pass / 0 fail**;
  - DealScope PAYG: **4 pass / 0 fail**;
  - ResourceOS actual-versus-plan: **4 pass / 0 fail**;
  - website intake handoff: **3 pass / 0 fail**.
- **18 source-level cases pass / 0 fail**. The harness is not Node's own \`node --test\`, a full \`npm ci\`, Next production build, browser test, provider sandbox, Supabase/RLS/migration, SAST, concurrency test or restoration proof.
- Two early document adapter commits have previously shown Vercel READY build previews. READY is build evidence only and does not establish operational acceptance. Latest commits have no fresh independently accepted build/browser records.
- No signed technical, finance, statutory or external communications were created or dispatched.

## 4. Commercial product policy — PAYG does not require transaction success
- DealScope's PAYG SKU can be a clearly defined paid **decision-support Deal Run report** for a user's own mineral/commodity opportunity.
- A report that identifies a poor deal is a valid delivered service when the report meets the agreed scope and evidence-quality commitment.
- **Do not relax the public qualified opportunity shortlist:** display only evidence-qualified profitable opportunities as qualified. Reports about unqualified user candidates are distinct from advertised live deals.
- Report pricing/credits/merchant/tax, checkout consent, dispute/cancellation/consumer rights and signed customer terms are not approved. The customer's eventual trade outcome never controls consumption of the delivered analysis credit.
- A self-entered arithmetic quick screen is NOT independent market verification. Never mislabel an unverified report as confirmed assay, off-take or market pricing.

## 5. Enterprise backbone and product completion gates
1. Correct SAR-owned Supabase organisation and ResourceOS schema/Auth/RLS/project refs must be discovered. No connected SAR Supabase project is currently visible; only TenderDesk/BidOS projects are.
2. Create a **new** SAR-owned isolated DealScope project, identity, organisation membership, active-role policy, paid order / immutable credit ledger, provider authentication, full checkout, tax invoice and reconciled GL under SAR. **No live charging until implemented/accepted.**
3. Document Studio authenticated amendments: versioned section-scoped grants, immutable source/issued binaries, server-stamped events, isolated review queue, evidence/cost impact re-simulation and atomic current-revision compare-and-swap.
4. ResourceOS: original commodity physical execution, full route+assay+transport/custody/accounting-outbox integration and negative-path tests, not only pure variance and simulator modules.
5. SAR BusinessOS/CommercialOS/AccountingOS/PayrollOS: company-bound authority, canonical HR and payroll, ledgers, cashbook, reconciliation, domain events, no duplicate books, approvals, restored role ownership and legal signatures. No production source/DB accepted yet.
6. Corporate website: supplier staging DB, actual review RLS, authenticated internal handoff, full images and Vercel collaboration blocker clearance; latest redesign preview remains BLOCKED at last checked state.
7. DealScope Commercial Exchange remains disabled 503 pending tenant and disclosure/financial gates; payments and account registration not yet connected.
8. Pin and verify Node dependency lockfiles, run actual Node test suites, strict TS, source/asset hashes, production build, independent preview acceptance, RLS denial tests, concurrent double-spend, provider forged ITN/payment tests, tax/ledger reconciliation and database rollback/restore.
9. Reconcile and close obsolete PR/branches only after checking retained history and release protection. Do not merge source PR #1 while full system remains incomplete.

## 6. Release conclusion
**Release: HOLD.** Architecture reconciliation is complete *into development branch*, four narrow contract test suites pass, and foundational source is committed. The full enterprise operational backbone, website integrations and commercially charging DealScope are **not yet complete**, and do **not** reduce solely to access blockers. Real engineering, legal/financial setup, provider tests and operational UAT remain. Do not claim a production release, live PAYG product, working payment link, successful source-to-settlement, or human approvals that have not occurred.

## 7. Incremental security hardening
The amendment-engine submission gate now requires the authenticated requester's effective editor/requester role and trusted, source-bound diff-verification proof of the exact changed base before it will create a review candidate. A dedicated negative-path test rejects edited content without that proof. This remains a source-contract guard; only authenticated SAR backend evidence can make it enforceable.

## 8. Scope correction / no PAYG-only cutdown
Founder clarified that the mining-intermediary commercial example did **not** approve trimming DealScope. ALL of the original discovery, verified market/price intelligence, opportunity qualification, saved Deal Runs, watchlists, scenario history, subscriptions, customer organisations and entitlements, offer/disclosure/exchange, dispute/support, payments and verified fulfilment boundaries remain in scope. The PAYG contract is a workstream, not the entire roadmap. No change to original exchange launch requirements or customer-data segregation is authorised by this checkpoint.

## 9. Founder scope correction and Deal IntegrityOS (27 Oct)
Founder confirmed PAYG is only one monetisation method, NOT a reduction of full DealScope. The full sourcing, verified opportunity discovery, MarketOS, Opportunity/Scenario history, EvidenceOS, buyer/seller validation, Commercial Exchange, PAYG/subscriptions, notifications and monitoring remain in scope.
Founder defined Deal Integrity as the most important user value: evaluate whether claimed parties, title/stock, mandate, sample/lab assay, buyer, commercial terms and banking instructions are credible based on independent corroboration, explain weaknesses and provide explicit investigation steps. Distinguish Integrity vs Viability vs Readiness.

### Newly committed source
- apps/dealscope/lib/opportunity-lifecycle.mjs and test: 5 source-level passes, versioned comparisons and evidence change notices; never auto-bill.
- apps/dealscope/lib/exchange-consent.mjs and test: 4 source-level passes, exact seller-consented buyer/fields/hash/time, non-binding enquiries; actual exchange disabled.
- apps/dealscope/lib/deal-integrity.mjs and test: 6 source-level passes, twelve defensible evidence categories, missing/contradictory/stale sources and actionable issuer verification; no criminal or legitimacy certification.
- apps/dealscope/app/integrity/page.tsx: public nonpersistent locally selected self-check, explicitly NOT actual independent verification; homepage now links to it.
- apps/dealscope/database/deal-integrity-extension.REVIEW-ONLY.sql: proposed tenant-private case/evidence/finding/event custody, not a live migration.
- docs/architecture/11-DEALSCOPE-DEAL-INTEGRITY-OS.md and revised 03/06/10: authoritative new requirement, original suite preserved.

### Verification and release boundary
- Exact connector-fetched six Deal Integrity tests ran against exact fetched source: 6 pass, 0 fail. Prior exercised source suites: amendment 7, PAYG 4, ResourceOS variance 4, SAR website intake 3, DealScope history/watch 5, Exchange consent 4. Overall source-level set 33 passing cases; NOT independent production acceptance or node --test / CI evidence.
- Both SAR ResourceOS and SAR website development branches were checked against main: ahead with zero behind. Their protected main branches were not modified.
- No issuer/provider system was queried for an actual DealScope customer's deal. Independent CIPC, DMPR, SANAS, laboratory, buyer and banking verification, legal privacy review, verified SAR-controlled Supabase, secured case records, authenticated human review, browser tests and payments remain OPEN.
- No public risk blacklist, allegations of criminal conduct, legally definitive legitimacy verdict, suspicious-person profiling or cross-tenant data aggregation is authorised. Report only private case-specific evidence, uncertainties, corrections and human-reviewed decision guidance.
- Entire system remains UNRELEASED. Do not merge incomplete app to main until proper end-to-end security, role RLS, financial and operational acceptance.


## 10. Public acquisition website and full 30-day trial — handoff
The next controlled macro checkpoint is [SAR-DSC-ACQ-MACRO-20261027-01](2026-10-27-dealscope-public-acquisition-trial-macro.md). It records the new source-built signed-out site, preservation of the calculator at /runs, preliminary /start workflow, a full 30-day trial grant candidate and REVIEW-ONLY schema. Seven canonical cross-domain architecture sections and the website master map were amended. Original 3 October Founder decision 30-day FULL FEATURES has been recovered, not inferred. Subsequent 27 October direction adds one eligible individual/company/originator introduction. Trial is not active.
Trial contract source and public website source checks now add 10 independently exercised narrow source cases to previous 33, for 43 source-level passing cases across all new modules. No Node clean checkout, live verified DealScope customer platform, trial activation, billing/market verification, child-app production build or browser acceptance has been established. **Do not represent any preview CTA as account signup.** Checkpoint/requirements index points to 12 and 13. Release remains HOLD.
