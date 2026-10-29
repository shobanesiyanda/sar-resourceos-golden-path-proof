# Deployment and business boundary migration checklist

## Current applications
- SAR corporate site: corporate information only; optional Sell to SAR routing.
- DealScope: external subscription/PAYG commodity intelligence, Deal Runs, governed Commercial Exchange, independently metered tenants.
- SAR ResourceOS: internal enterprise platform for Commodity Trading, DealScope division oversight, Mining Services, controlled approvals, physical custody, accounting and treasury.

## Portable technical architecture
1. Monorepo apps/website (separate repository), apps/dealscope and apps/sar-resourceos in Resource Platform; packages/commodity-model, packages/price-engine, packages/deal-economics, packages/evidence, packages/contracts.
2. No single database shared between DealScope customers and SAR operational transactions. Shared TypeScript packages do not confer shared database privileges.
3. Use PostgreSQL schema migrations, object-storage adapters, job queue abstraction, auth provider boundary, payment gateway interfaces, portable OpenTelemetry instrumentation, backup and restore.
4. The original ResourceOS Golden Path proof is a source baseline, not proof of completed business functionality. Preserve demo fixtures and static widgets as nonproduction until replaced and tested.
5. Deploy containers to self-managed Linux Kubernetes/Compose or a hosted PaaS without changing domain code; Vercel/Supabase remain current managed infrastructure until acceptance.
6. Separate environments: local, staging, production. Avoid credentials inside code and logs. Provide a path to per-tenant audit and disclosure controls.
7. No GitHub Actions. Controlled Vercel preview builds and independent approval gates only.

## Non-destructive programme
- Preserve original repo, branch, commit history and Vercel deployment references.
- Map existing UI/routes/components/functions/data to shared code, internal SAR scope and external DealScope scope with tests.
- Add portable interfaces; do not rewrite verified application modules without regression evidence.
- Build DealScope app when identity, subscription and buyer disclosures are ready.
- Website Sell to SAR must route into one governed intake workflow; do not keep an independent corporate marketplace.
- No production cutover until source, database and dependencies are verified.
- Run auth/RLS, tenant isolation, finance, dispatch, assay, cash ledger, approval and disaster recovery tests.
