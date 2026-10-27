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
  - amendment workflow: **6 pass / 0 fail**;
  - DealScope PAYG: **4 pass / 0 fail**;
  - ResourceOS actual-versus-plan: **4 pass / 0 fail**;
  - website intake handoff: **3 pass / 0 fail**.
- **17 source-level cases pass / 0 fail**. The harness is not Node's own \`node --test\`, a full \`npm ci\`, Next production build, browser test, provider sandbox, Supabase/RLS/migration, SAST, concurrency test or restoration proof.
- Two early document adapter commits have previously shown Vercel READY build previews. READY is build evidence only and does not establish operational acceptance. Latest commits have no fresh independently accepted build/browser records.
- No signed technical, finance, statutory or external communications were created or dispatched.

## 4. Commercial product policy — PAYG does not require transaction success
- DealScope's first monetisable SKU should be a clearly defined paid **decision-support Deal Run report** for a user's own mineral/commodity opportunity.
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
