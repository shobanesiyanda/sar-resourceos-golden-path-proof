# DealScope — SAR-owned external commercial application

**Legal owner: Shobane African Resources (Pty) Ltd.** Possent Systems is not associated with SAR or DealScope. The dedicated DealScope Supabase project does not exist yet and must be established only under SAR-controlled infrastructure.

This is the isolated DealScope application added to the original SAR ResourceOS migration branch. Its source remains in `apps/dealscope`; SAR's existing internal ResourceOS app remains at the repository root.

## Run / deploy
```sh
cd apps/dealscope
npm install
npm run typecheck
npm run build
npm run dev
```
Vercel project root directory: `apps/dealscope`. Publish only to a **preview** deployment before production acceptance. Shared business logic is imported from `../../packages/commodity-core`.

## Safety
- All deal inputs are provided by the user; there is no market-feed claim and no trade execution.
- The Deal Run calculator is client-local only; it does not store private data or transact.
- Exchange and subscription activation are deliberately unavailable until a dedicated DealScope backend, verified tenant identity, billing and consent controls are live.
- No access to SAR ResourceOS data, finance or internal approvals.
- No GitHub Actions.
- Future hosting uses portable Next.js standalone output, separately provisioned PostgreSQL/auth/storage/queue adapters.

## Separation regression
The original root Vercel project must retain its root build settings and root `app/` directory. This child application is not to be treated as a ResourceOS page. Do not point either application at the other's database.


## Newly committed, isolated pre-integration controls

- `apps/dealscope/lib/payment-event-contract.mjs` is a SAR-only merchant validation and idempotent event **pre-reconciliation** contract, not a payment integration. It deliberately does not perform provider signature verification, write ledgers or activate subscriptions.
- `apps/dealscope/test/payment-event-contract.test.mjs` exercises owner mismatch, merchant mismatch, duplicate event, wrong currency/amount and refund linkage.
- `packages/commercial-core/src/pricing.ts` and `packages/commercial-core/src/screening.ts` provide isolated indicative parity and commercial screening calculations. They must not be presented as independently sourced live DealScope opportunities.
- `apps/dealscope/database/initial-schema.REVIEW-ONLY.sql` is a greenfield *design*, not an applied migration. Schema, tenant roles, RLS and storage must be created and tested inside **SAR-controlled** Supabase after verified organisation provisioning.

Do not interpret any published preview, source module or successful local tests as active customer registration, payment acceptance, market verification or a functioning Commercial Exchange. Independent DealScope build, security, tenant, provider and operational acceptance remain OPEN.


## Public acquisition website and single full free deal cycle — 28 October
The canonical child Next app now has separate signed-out / (trust/value-first marketing), /integrity (local guided unverified screening), /runs (the ORIGINAL self-entered calculator), /exchange (locked buyer/seller Exchange) and /start (full trial onboarding preview, NO personal-information capture). Public marketing styles are in app/landing.css; root app/layout.tsx retains noindex until release. Customer target domain: dealscope.co.za — domain/DNS/production not verified. No actual trial or signup has been activated.

CURRENT: Founder replaced the historical 30-day unlimited trial with ONE free complete end-to-end deal-assistance and assessment cycle (optional independently approved second). See docs/architecture/13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md and the business acquisition blueprint 12. Source implementation: apps/dealscope/lib/deal-cycle-trial.mjs and test/deal-cycle-trial.test.mjs. No signup/production entitlement or actual independent verification is live.


### 28 October current free introduction (no live signup)
The current onboarding/marketing pages offer ONE complete free Deal Assistance & Assessment cycle and not an unrestricted 30-day trial. The old full-trial.mjs module/test are removed from active source; deal-cycle-trial.mjs and deal-cycle-trial.test.mjs are the controlling pure source contracts. A separately approved campaign may add a second full assessment, never automatically. Actual verification, source-integrity review, Auth, billing and final report delivery remain unaccepted.


### Latest branding/legal-operation decision — 28 October 2026 (SAR-ADR-020)
DealScope is a standalone customer-facing **brand**, not a separately incorporated company at present. SAR (Shobane African Resources (Pty) Ltd) is the current legal owner/operator. The marketing homepage and onboarding page include small readable footer attribution and a link to a new /legal page; hero, primary navigation and product positioning remain DealScope only. Do NOT replace current SAR merchant records with an imaginary independent DealScope company. Legal incorporation is deferred pending commercial proof; lawful SAR business-name/supplier disclosures, registration/contact details, privacy, terms, verified merchant and tax/invoicing remain production launch gates. See architecture 14 and the latest brand checkpoint. No live checkout or customer creation.


### Legal documentation and signed-out legal routes — 28 October 2026
Canonical internal legal index: docs/legal/README.md. Source-level policy and customer previews cover /legal, /terms, /privacy, /payments and /invoicing, with SAR actual supplier, previously supplied reg 2019/626848/07 and VAT 4040314793 marked for current official verification. App/legal/_components.tsx provides small but readable SAR operator footer and draft status. New pure invoice-contract.mjs with invoice/credit-note tests refuses any candidate absent independent CIPC/VAT, SAR company address, actual merchant and separate Finance approval; it does NOT issue a live invoice. No separate company incorporation required, but full ECTA/CPA/POPIA/SARS/company-contact/provider/merchant and production approval gates remain open. Do not publish these as fully legally binding documents yet.

### 28 October engineering macro 002 — source only
New `lib/customer-access.mjs` (server-attested tenant RBAC), `lib/customer-consent.mjs` (counsel-approved terms/privacy/payment hash acceptance), `lib/assessment-dossier.mjs` (user claims versus separately corroborated evidence, scenarios and readiness/report candidate), `lib/assessment-execution.mjs` (one atomic intended start/finish spanning case and trial ledger). New protected Next API routes `/api/customer`, `/api/assessments`, `/api/orders`, `/api/checkout` all **503**, and health declares `preview_only`/`not_ready` instead of misleading online product availability. Existing Exchange API also stays 503. No real Auth, licensed issuer, payment capture, persistent report, supplier verification or customer activation is performed.
Database proposal now includes review-only customer identity/legal consent with corrected free-case entitlement FK and static isolation/approval tests. The package now exposes `npm test` invoking every app/test and database/test Node harness when a genuine checked-out working tree is available. See engineering checkpoint `docs/engineering/2026-10-28-dealscope-engineering-macro-002.md`. Customer data is never taken from SAR ResourceOS without separate lawful authority, and the standalone DealScope brand retains small truthful SAR legal-operator disclosure. No merges or production release.
