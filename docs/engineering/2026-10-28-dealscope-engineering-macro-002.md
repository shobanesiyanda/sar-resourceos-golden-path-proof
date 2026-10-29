# DealScope Engineering Macro 002 — Identity, Legal Consent, Dossier and Free-Cycle Integration
**Checkpoint:** SAR-DSC-ENGINEERING-MACRO-20261028-002
**Date:** 28 October 2026
**Repository:** `shobanesiyanda/sar-resourceos-golden-path-proof` (PUBLIC development source, no production release implied)
**Branch:** `migration/2026-10-22-dealscope-resourceos`
**Pre-checkpoint HEAD verified:** `7268b85b2b9779d33615e6e80b3313c28598b65f`
**PR:** #1 DRAFT/open (no main merge)
**Legal operator:** Shobane African Resources (Pty) Ltd (DealScope customer-facing brand only)
**Company registration/VAT:** previously supplied 2019/626848/07, 4040314793; current official CIPC/SARS verification still pending.
**Controlling Founder business decisions:** SAR-ADR-018, SAR-ADR-020, SAR-ADR-021. Old 30-day trial and zero-SAR-public-mention/mandatory independent incorporation decisions superseded.

## Actual sequenced work
### Macro 002-A — Repository/authority and Supabase boundary
Verified current controlled GitHub PR head and tree. Supabase connected organisations/projects checked: only **TenderDesk**, with BidOS-related projects; NO verified SAR-owned DealScope project is connected. No SQL or migration applied; do not execute against another group's database. Reviewed Supabase current RLS guidance and Oct 2026 platform TLS/DB change notices.

### Macro 002-B — Database referential integrity repairs
Corrected `trial-entitlements.REVIEW-ONLY.sql`: missing `unique(organisation_id,id)` entitlement composite FK target for campaign and dossier; composite owner `(organisation_id,claim_id,owner_user_id)` now bound to verified claim owner; campaign expiry must succeed its review. All RLS and no browser writes preserved. Added 6 source-schema contract cases.

### Macro 002-C — Customer AccountOS and contracts
New `apps/dealscope/lib/customer-access.mjs`: verified named session, authoritative tenant membership, active role, verified company status, resource-specific access, revoked session/tenant rejection, privileged action allowlist; user-editable metadata cannot confer authority. 6 tests.
New `customer-consent.mjs`: independent published terms/privacy/payments versions, matching immutable SHA-256 hashes, reviewed and affirmatively accepted order, first full free deal without card, no automatic conversion or unapproved recurring charge. 5 tests.
New `customer-identity-legal-consent.REVIEW-ONLY.sql`: 3 typed legal/identity ledger tables, every table RLS on, no browser writes or public reviewer/approver UUID exposure, current active customer can read only its own acceptance receipt. 6 tests. No real legal terms effective; drafts require counsel acceptance.

### Macro 002-D — Customer-owned full Deal Assistance and Assessment
New `assessment-dossier.mjs`: source-bounded independent opportunity, self-asserted claim states, independently attested review decisions, explicitly source-labelled and potentially negative economics, action plan, versioned draft report. No false independently verified stock, mandate, buyer, issuer or profitability badge. 6 tests.
New `assessment-execution.mjs`: dependency bridge from approved/persisted customer legal acceptance and verified Auth/membership into one dossier plus ONE complete reserved free-cycle credit. Final report must match source hash, valid issuer/recipient receipt and four ordered stage attestations; case/report + credit ledger updates remain an **atomic uncommitted transaction proposal**, never a live write/charge. Agreement bound to exact offer version and policy document hashes. 4 tests.

### Macro 002-E — Fail-closed app readiness / runnable test entry
Added `/api/customer`, `/api/assessments`, `/api/orders`, `/api/checkout`: GET and POST return 503/no-store until real company-auth/legal/DB/merchant acceptance. Existing Exchange API remains 503. `/api/health` truthfully returns preview_only/not_ready. 3 tests.
Added `npm test` in apps/dealscope/package.json: `node --test test/*.test.mjs database/*.test.mjs`. Native Node install/tests/build were NOT run: remote GitHub repo cannot be cloned into this local tool runtime and dependencies are not present/available. Do not confuse deterministic source-adapted V8 harness with a real Node/Next or PostgreSQL test.

### Macro 002-F — Regression/evidence and repository docs
Updated app README, database README, DealScope architecture, root start-here and decision register; latest Founder SAR-brand/one-free-report/actual-legal-operator rules preserved. Ran JS source-adapted tests against exact retrieved GitHub source:
| Group | Cases passing |
|---|---:|
| Existing signed-out homepage and legal pages | 15 |
| Existing full free-cycle and VAT invoice | 12 |
| Customer access, policy consent, dossier, execution | 21 |
| New free-cycle and legal/identity review-only SQL contracts | 12 |
| API safety/health | 3 |
| Existing Deal Integrity, Exchange, Opportunity History, PAYG, payment events | 27 |
| Existing original DB foundation SQL | 10 |
| **TOTAL (source-level only)** | **100/100** |
None of these 100 are proof of actual SQL execution, native pinned Node24 build, full Next.js/TypeScript compile, browser E2E, real external supplier verification, customer registration, receipt delivery, merchant integration or legitimate user data security.

## Source blob evidence from verified GitHub tree
- `apps/dealscope/lib/customer-access.mjs` — `838db8bbf830c01c4febca8279d9e32e0b4c6f79`
- `apps/dealscope/lib/customer-consent.mjs` — `f7edcf251998684339b2d7a52bc6d094db87f4e8`
- `apps/dealscope/lib/assessment-dossier.mjs` — `23def44b328e2be293a2ccdd67a12f95bba1c10f`
- `apps/dealscope/lib/assessment-execution.mjs` — `4c78a663c03fcb453a7d8c2b8e655d04cfcd0687`
- `apps/dealscope/lib/deal-cycle-trial.mjs` — `9252b8db4b68080fbc34c1d947d05866692eb49d`
- `apps/dealscope/database/trial-entitlements.REVIEW-ONLY.sql` — `f2564f72de5073f2f4f9ab0fb216950f4b5a660b`
- `apps/dealscope/database/customer-identity-legal-consent.REVIEW-ONLY.sql` — `a7bc8e0f73715b2fd35d4c4cb4195b524fc16e86`
- `apps/dealscope/test/customer-access.test.mjs` — `581efe9235bd768d3da8c6c8302b6fe8f6b849cb`
- `apps/dealscope/test/customer-consent.test.mjs` — `3569e383e2e5d1f986a552f8593b40265b56a447`
- `apps/dealscope/test/assessment-dossier.test.mjs` — `cc5bebd7551a183f7fcff61053f67c15791d19ec`
- `apps/dealscope/test/assessment-execution.test.mjs` — `77f95bcaf78bf4bd370257d91db97aa96c5a6bcb`
- `apps/dealscope/database/intro-cycle-schema-contract.test.mjs` — `26e686526332902f641712e70af60786a54ccb30`
- `apps/dealscope/database/customer-identity-schema-contract.test.mjs` — `dd4b88b77142480b92774b3133e25e3d42d8b86b`
- `apps/dealscope/test/api-release-gates.test.mjs` — `5bdc3f63fe191509e691824cc5732e210862dfe9`
- `apps/dealscope/package.json` — `5655c5b228e32b50bc19eb77ab9f68d2da246645`
- `apps/dealscope/app/api/health/route.ts` — `6d16b936bb4e9f911434af304ff917f32ce12c2b`

## Unresolved and protected
1. **Hard external infrastructure blocker:** no SAR-owned Supabase organization/project connected. Must establish/verify SAR administrative ownership and isolate DealScope from BidOS/TenderDesk/ResourceOS. No DB project, table migration, real server Auth/RLS, secure storage or atomic transaction was attempted.
2. **Hard legal/tax/merchant blocker:** current official CIPC/VAT status/registered service and support contacts/Information Officer/PAIA, counsel approved effective Terms/POPIA/refund and SAR merchant PSP settlement, invoice GL not evidenced. No customer agreement, legal issuance or live payment.
3. **Engineering runtime blocker:** source exists in remote repository; clean pinned Node24 native test, strict TS compile, Next production build, staging preview, browser, RLS adversarial tests, Vercel build/error logs and security audit still OPEN.
4. **External evidence blocker:** independent issuer/provider API, specimen/source rights, real evidence audit, final delivered report/consent handling not commissioned or verified.
5. All PR, production merge, migrations, payment, customer enrolment, customer disclosures or live Exchange remain Founder acceptance gated. Source-only changes do not meet them.
6. No separate DealScope incorporation is required: SAR remains lawful operator; distinct public brand and discreet SAR legal footer mandated by ADR-020. Customer organisation access and trading confidentiality remain isolated.

## Next exact continuation command
Continue DealScope from `SAR-DSC-ENGINEERING-MACRO-20261028-002` on branch `migration/2026-10-22-dealscope-resourceos` at most recent verified HEAD. Verify the commit and listed blob SHAs first, then run `npm test`, `npm run typecheck`, and `npm run build` in a clean isolated Node 24 checkout, repairing proven defects only. Do not replay any SQL, import customer/private data, or touch TenderDesk projects. Only after the Founder validates SAR-controlled Supabase project/admin authority, reconcile full review-only schema against actual schema with locally generated migration, perform isolated SQL/RLS/tenant/adversarial acceptance and stage the legal acceptance and full-cycle atomic ledger. Obtain effective legal, PSP, tax and CIPC/POPIA signoffs before customer activity; no mainline merge, production deploy, payment or trade execution without explicit Founder approval. Record errors, evidence, source hashes and the next guarded checkpoint rather than claiming runtime success.
