# DealScope — Macro 006 Engineering Integration & Release Hold
Record: SAR-DSC-MACRO-006-2026-10-28
Authority: Shobane African Resources (Pty) Ltd / DealScope
Date: 28 October 2026
Status: **SOURCE INTEGRATED / DRAFT PR #4 / NO PRODUCTION ACCEPTANCE**

## 1. Controlled source authority and supersession

Repository: `shobanesiyanda/sar-resourceos-golden-path-proof`
Original migration branch: `migration/2026-10-22-dealscope-resourceos` at `f497b6e721ffa6a4a9ab08eed1f99de8a88b6c8c`.
Source integration: `engineering/dealscope-contract-intelligence-v6-20261028`, existing draft PR #4. Main remained at `6e18d39037373528634a69a132f66fe35577c3f1` at recovered authority check.

This is not a new interface prototype. The actual customer entry point is `apps/dealscope/app/workspace/deals/new/`, backed by protected `lib/server/` modules, with API intake -> persisted confirmation -> provisional assessment. Authentication and customer-data services remain 503 / not activated.

The *approved* product has two services: (A) weekly dated Market Intelligence about prices, grades, physical forms, delivery bases and market conditions; and (B) private customer-submitted Deal Intelligence from buyer contracts, supplier offers, stock or supporting sources. Neither is a customer-facing deal finder, brokerage, marketplace, source matching or commercial Exchange. The obsolete `/exchange` page redirects to `/start`; its API continues returning 503. `/runs` remains a compatibility redirect to the protected customer assessment route.

## 2. Macro 006 production-source changes

### Registry and role-appropriate intake
- New versioned public specialist metadata module: `apps/dealscope/lib/specialist-registry.mjs`, version `2026-10-28.1`, **16 commodity identifiers and 48 material forms**, including chrome sweepings, tailings, ROM grades, lump and concentrate, coal wash products, manganese, lithium, gold, PGM, other metals and oil/fuels.
- Chrome indicative technical/economic assessment remains the **only** model listed as candidate-capable; every other listed commodity is **intake_only** until its specialist model, legal controls and pricing sources pass independent acceptance.
- Source intake now validates commodity, material form, fulfilment route and scenario entry point against the registry; old material labels are normalised, with a compatibility audit path.
- Contract-defined output material may be processed from different feedstock. A supplier offer for saleable concentrate may not silently be treated as wash-plant input.
- Customer UI uses the same public registry metadata as the backend rather than a second shadow catalogue. Nonchrome manual intake does not label all commodity quantities “dry tonnes” or all quality measures “grade %”; such submissions collect customer narrative evidence without inventing technical conversions.

### Customer journey and public conversion
- Existing signed-in journey preserved: commodity, delivery terms, role, material and fulfilment path -> upload/paste/manual known facts -> customer confirmation -> conditional results.
- Existing signed-out homepage and search metadata revised to sell concrete Deal Intelligence outcomes and dated weekly Market Intelligence; no buyer/seller matching, opportunity discovery or misleading live quotes.
- Added `apps/dealscope/app/market-intelligence/page.tsx` within the actual Next application as the separate Market Intelligence information route. It is NOT a connected price-feed dashboard; no current quotes are published.
- Retired obsolete Exchange landing and removed remaining customer-facing Exchange claims from signed-out site, terms and integrity self-check.
- Updated onboarding and README authority to prevent historic marketing and browser-calculator claims from superseding founder-approved directions.

### Stronger case consistency
- Intake adapter contract carries `registryVersion` and canonical material form for persisted customer-source records.
- Customer confirmation and assessment **reject stale specialist registry versions**, in addition to stale source revisions, wrong tenants, unverified account sessions, missing evidence and incomplete route costs.
- Customer result projection excludes private valuation formulas and does not convert an indicative market assessment into a verified buyer commitment.

## 3. Tests and native-build attempts

Source-only verification:
- 54/54 focused unit and security-contract cases passed, executed from GitHub-fetched current source modules in an isolated JavaScript test harness.
- 10/10 public-site source acceptance checks passed on the current home, market, onboarding, legal, integrity and protected route source after updates.
- Source module tests cover material-route mismatch, buyer-output processing vs seller feedstock, direct resale, old registry case rejection, expired/grade/delivery-incompatible benchmarks, false financial verdict suppression and customer-safe projection.

**DO NOT MISREPRESENT THIS AS FULL NATIVE ACCEPTANCE.**
- Added `.github/workflows/dealscope-source-verification.yml`: read-only GitHub checkout, Node24 app install, all app tests, Next build, TS typecheck and explicit not-activated runtime check. No environment secrets, no SAR/TenderDesk Supabase, no deploy or promotion.
- GitHub Actions push workflows **started and completed with failure**, with jobs reporting `steps=null` / zero retrievable execution steps. Job logs returned GitHub blob 404. No reproducible native-build compiler errors can therefore be inferred from these runs; **GitHub runner/workflow execution diagnosis is OPEN**.
- Native Node24 `npm test`, `next build`, `tsc --noEmit` and authenticated browser-to-report E2E remain unverified. Pin and commit a dedicated DealScope lockfile only after a trusted dependency resolution, without touching SAR's root package or lockfiles.

## 4. Release blockers and nonclaims

- Dedicated SAR-owned DealScope Supabase organisation/project not visible on the connected account; existing connected projects are TenderDesk-related and MUST NOT be reused.
- No verified live Auth/RLS, private customer storage, malware scan/extraction, tenant-isolation tests or paid entitlements.
- No authorised live weekly market benchmarks, road-haulage rates or processing plant testwork connected; no genuinely qualified financial verdict may be issued from synthetic fixture prices.
- API customer intake / confirmation / assessment remain fail-closed while runtime provider is null.
- No legal/PSP/provider production approval, no live trial/paid account, no customer document acceptance, no deal sourcing/buyer matching, no merge or deployment.
- GitHub Actions execution failure must be diagnosed with GitHub account/workflow settings and visible failure annotations before treating the integrated source as build-verified.

## 5. Strict next dependency order (Macro 007)

1. Diagnose GitHub Actions failed jobs with actual platform-level error; obtain a real Node24 run or a verified isolated full checkout to execute `npm test`, `npm run build`, `npm run typecheck` (no fake green status).
2. Fix **proven** dependency/compiler/test issues, commit a reproducible app-level lockfile once resolved and rerun entire native tests.
3. Reconcile buyer-contract obligations/FOT interpretation, wet vs dry settlement, recovery confidence, route-cost coverage and source-price provenance across result engine and API.
4. SAR-controlled dedicated customer DB project and Auth/RLS/Storage only after owner and organisation authority are established. Review-only schema and negative tenant-security tests before any migration.
5. Secure source document upload, extraction, provenance/correction and issuer-validation adapters; versioned market reference ingestion; authenticated full deal-cycle acceptance.
6. Final security, legal, entitlement, PDF, browser and founder release gates before any public launch or merge into authoritative main.

**Release decision:** HOLD. Existing SAR production main and unrelated data infrastructure remain unchanged.
