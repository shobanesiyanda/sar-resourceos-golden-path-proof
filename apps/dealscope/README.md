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


## Public acquisition website and full 30-day trial — 27 October
The canonical child Next app now has separate signed-out / (trust/value-first marketing), /integrity (local guided unverified screening), /runs (the ORIGINAL self-entered calculator), /exchange (locked buyer/seller Exchange) and /start (full trial onboarding preview, NO personal-information capture). Public marketing styles are in app/landing.css; root app/layout.tsx retains noindex until release. Customer target domain: dealscope.co.za — domain/DNS/production not verified. No actual trial or signup has been activated.

Founder-directed 30-day complete-platform trial is detailed in docs/architecture/13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md; pricing, commercial funnel and signed-out value in docs/architecture/12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md. Source-only identity/one-time entitlement functions are in apps/dealscope/lib/full-trial.mjs, tests in apps/dealscope/test/full-trial.test.mjs and review-only database design in apps/dealscope/database/trial-entitlements.REVIEW-ONLY.sql. Never auto-charge, imply signup works, or reduce DealScope to PAYG. Deploy the child app only after its own isolated Auth/RLS/merchant/issuer and independent full-suite E2E evidence.
