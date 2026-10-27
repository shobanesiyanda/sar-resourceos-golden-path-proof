# SAR Consolidated Macro-Batch Carry-Forward and Acceptance Register

Document ID: SAR-MACRO-CARRY-2026-10-27-001  
Date: 27 October 2026 (Africa/Johannesburg)  
Status: **UNRELEASED INTEGRATION CANDIDATE — NOT FULLY ACCEPTED**  
Scope: SAR Corporate Website + SAR ResourceOS + DealScope as three first-class workstreams.  
Authority: Latest expressly approved product boundaries and SAR website master build map; preserve original project and source history. This register does not authorise production changes.

## 0. Evidence and precedence

- Corporate website main: shobanesiyanda/sar-website, original main 4c0305480753a9ee97beffbf605183dd0133ed42.
- Older website draft PR #1: migration/2026-10-22-corporate-site at 70e0c1ef1ae6b74028163c59a2ad53cffe360768; OPEN, UNMERGED. It contains older public DealScope/ResourceOS language and must **not** be blindly merged over later requirements.
- Later authoritative website implementation: redesign/full-corporate-website-oct-2026, checked commit 0bb92e28a15b8cdf081dbd9ff28eceb2a4006d18; docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md and docs/IMPLEMENTATION_STATUS.md. This latest website direction deliberately omits internal application/product names from public corporate copy.
- ResourceOS/DealScope draft PR #1: shobanesiyanda/sar-resourceos-golden-path-proof, migration/2026-10-22-dealscope-resourceos at 1ee34fa2494906b60e818da822c5448733b10209; OPEN, UNMERGED. Original main f784c998745526d54b13a3f93f77b512ebe5e7e3.
- Possent Systems staging copies: sar-website-migration-staging-20261023 reports 78 of 80 source blobs, two original image assets outstanding; sar-resourceos-migration-staging-20261023 is a source snapshot, not native Git history transfer. Possent-Systems/sar-resourceos-golden-path-proof contains a 95-file original-source snapshot, not verified equivalent ancestry.
- Vercel: sar-resourceos-golden-path-proof-live and dealscope latest previews READY; sar-website-live recent redesign deploy BLOCKED under collaboration controls. A preview build is not full functional acceptance.
- Connected Supabase listing at audit time exposed BidOS-related projects only. Actual SAR ResourceOS/SAR website data projects and a separate DealScope data project are not identified on this connection. **Never connect SAR or DealScope to BidOS data as a fallback.**
- Current engineering executor was read-only when tested; isolated Git clone failed, and the escalated attempt failed at the execution wrapper. The later website branch also lacks package-lock.json. Tests must remain unverified until a writable trusted checkout and reproducible dependencies exist.

**Status legend:** SOURCE = inspected code/commits; HISTORICAL = earlier recorded user checkpoint only; SPECIFIED = requirements/test design complete; BLOCKED = access or external dependency; PASS = executed test evidence only. Do not convert SOURCE, HISTORICAL or SPECIFIED into PASS.

## 1. Large macro batches — one dependency-controlled programme

### MACRO SAR-01 — Source and infrastructure reconciliation (three products)
Deliverables: full byte/hash inventory; preserve native history; reconcile older website PR against newer approved redesign; move ownership via controlled native transfer rather than duplicate history; recover two missing exact original website binaries; pin dependency lockfiles; verify Vercel project IDs, branch root directories and team permissions; register environment ownership and database refs; record rollback.
- Independent work: branch mapping and precedence decisions **SPECIFIED**.
- Requires code/asset access: actual transfer, 80/80 image hash parity, working checkout, npm ci/build/test, branch convergence and deployment protection **BLOCKED**.
- Stop: no forced push, no replacement images, no silent repo or domain cutover.

### MACRO SAR-02 — Corporate Website: Industrial Intelligence and governed supplier acquisition
Authoritative website remains www.shobane.co.za for Shobane African Resources (Pty) Ltd. Public copy uses Shobane African Resources; registered legal name remains footer/structured data. Retain tagline: “Built on resources. Driven by innovation. Focused on value.” Preserve original circle-Africa emblem and approved image assets.
- Latest branch includes Project Development and Technology & Innovation routes, multi-commodity Sell to SAR selector, specialist Chrome intake and general non-Chrome preliminary form: **SOURCE, NOT ACCEPTED**.
- No public marketing of ResourceOS/DealScope architecture; no fictitious mineral rights, inventory, contracts, fleet, personnel, mine ownership or software capabilities.
- Acceptance: every route, real assets, desktop/mobile/keyboard/reduced-motion, copy/SEO/legal data, safe errors; all supplier, buyer, partner, equipment, finance and Chrome/non-Chrome categories through approved staging data; consent, spam/rate limiting, risk flags, storage and review queue; capture-to-ResourceOS handoff audited and idempotent.
- Database-specific E2E and production deployment **BLOCKED**. Build also blocked by missing lockfile/runner.

### MACRO SAR-03 — SAR ResourceOS: internal commodity execution lifecycle
Preserve dark executive shell, topbar/sidebar, central heat map, gold accents and status chips (NO DRIFT). Navigation: Dashboard, Opportunities, Counterparties, Route Builder, Operations, Tolling & Plants, Documents, Approvals, Finance, Analytics, Admin.
- Earlier historical checkpoint: auth/login, commodity taxonomy selector, stage-aware economics, route detail capture, finance cost read-through, fleet foundation, two seeded 34 t owned units, and a Transport Plan v1 schema were reported functioning. These are **HISTORICAL**, not re-accepted against current branch or correct SAR database.
- Finish transport-plan UI; source/cost/route reconciliation; heat map restoration; owned/leased/hired assignments from truck_assets; external capacity; dispatch/driver/vehicle checks; lab custody/assay; documents; approvals deep links; Treasury/Finance handoff; backward Chrome Pricing/Market Pricing OS; exceptions, rollback and management reporting.
- Full source-to-settlement, RLS, audit, migration, backup and restore acceptance **BLOCKED** until correct SAR project and executable repository are available.

### MACRO SAR-04 — DealScope: external commercial platform (equal priority)
DealScope is an **independent customer-facing product**, not a page inside ResourceOS or the SAR website. SAR must not receive privileged visibility of another buyer's tenant records.
- Current source: separate Next.js app apps/dealscope; shared calculation kernel; user-input Deal Runs; candidate state qualified/rejected/incomplete; product catalogue fallback; commercial Exchange GET/POST deliberately return HTTP 503; health route reports identity/subscriptions/trading disabled. **SOURCE ONLY**.
- Complete separate identity and tenant memberships; verified buyer/seller organisation registry; roles and per-tenant RLS; subscription/PAYG entitlements and billing; evidence/price provenance; saved Deal Runs and immutable result versions; candidate qualification and rejection audit; verified sourcing signals; controlled offer/disclosure workflow; buyer authorisation and seller consent; audit events; notifications; dispute and refund states; integrated provider-based payments and finance reconciliation with separate merchant/legal records.
- Commercial filter: show only genuinely qualified, positive-profit actionable deals to users; rejected, break-even and below-threshold candidates remain in private screening audit. Conditional leads require a credible negotiable acquisition ceiling and evidence route to target margin. A calculator outcome alone must never be represented as a verified live buyer/market commitment.
- Shared code is permitted; shared privileged database access is not. Dedicated DealScope Supabase/Auth/tenant/finance stack and provider sandbox **BLOCKED**.
- Accept full customer registration -> identity -> entitlement -> documented Deal Run -> candidate -> explicit offer/disclosure -> licensed-provider payment or authorised manual route -> SAR/third-party fulfilment where applicable -> settlement/reconciliation -> refund/dispute with RLS and idempotency. Keep execution disabled until all relevant gates PASS.

### MACRO SAR-05 — Three-product cross-system integration and release acceptance
- Version shared taxonomy/economics/evidence contracts, not shared access credentials.
- One controlled Sell to SAR workflow: corporate form and optional DealScope supplier route produce source-labelled, consent-backed, deduplicated submissions for authorised SAR review; no confidential cross-tenant disclosure.
- Use append-only auditable event IDs from source to contract, custody, assay, reconciliation, invoice and payment. Replays must be idempotent; no duplicate submissions, cash movements, provider webhook settlement or migration application.
- Test negative paths before live operations: missing sample, missing seal, truck mismatch, variance dispute, short delivery, price expiry, rejected mandate, assay disagreement, failed payment, finance hold, cancelled order, rollback/recovery.
- Final cross-product acceptance, data restore, domain mapping and Founder sign-off are OPEN. No production promotion or merge to main based on this document.

## 2. Exact access-dependent backlog (do not claim done)

| ID | System | Required access/evidence | Gate / acceptance |
| --- | --- | --- | --- |
| A01 | All | Full writable source checkout, commit ancestry, dependency registry | All hashes, original files and current branches reconciled; deterministic npm ci/build/test |
| A02 | Website | Exact two missing original binary assets from source and destination repo | 80/80 source blobs byte-identical and signed provenance |
| A03 | Website | Vercel GitHub team collaboration/permission and preview deployment | Latest branch builds without BLOCKED status; all routes tested |
| A04 | Website | Correct SAR contact Supabase project, schema and non-production credentials | Enquiries inserted and read by authorised reviewer only |
| A05 | Website | Contact and Chrome form data, RLS, storage/review workflow | Server validation, material flags, spam, consent, error and mobile E2E |
| A06 | ResourceOS | Correct SAR project ref, migration history and backup/restore rights | Schema inventory, RLS and deterministic migrations, tested rollback |
| A07 | ResourceOS | SAR auth/user roles, counterparty and parcel records | Least privilege, denial tests and source-to-settlement acceptance |
| A08 | ResourceOS | truck_assets, transporters, transport_plan, transport_plan_lines | Dynamic fleet and dispatch match; no static two-truck business rule |
| A09 | ResourceOS | Approved market/PO/assay provider data, FX/port/transport source | Dated pricing/override snapshots and versioned weekly offer engine |
| A10 | ResourceOS | Operational document evidence and controlled storage | Sampling, seals, weighbridge, custody and permissions |
| A11 | ResourceOS | Finance, approvals, treasury and ledger tables | Assay split, stage-aware cost rollup, negative surplus block, settlement |
| A12 | DealScope | Separate DealScope Supabase Auth/project and tenant schema | RLS cross-tenant denial tests, public access fail closed |
| A13 | DealScope | Subscription/PAYG provider sandbox and merchant account decision | Webhook replay, entitlements, invoices, refunds, cancellations |
| A14 | DealScope | Verified buyer/supplier identity, disclosure and catalogue data | Per-offer consent, no privileged SAR access to unrelated tenants |
| A15 | DealScope | Credible live sourcing/buyer data and price provenance | No fabricated price, rejection filter, margin/ceiling proof |
| A16 | All | Approved preview access, device/browser QA, logs, security audit | Browser -> API -> database -> response end-to-end with evidence |
| A17 | All | GitHub ownership-transfer authority and Vercel target configuration | Full native history, repo settings and deployment target reconciled |
| A18 | All | Source/data backups, restored fixture, signed risk and legal review | Disaster recovery dry run and explicit Founder production approval |

## 3. Independent functional specifications ready for implementation

### 3.1 Weekly Chrome Pricing / Market Pricing OS
Run pricing as a sourced, dated weekly evaluation, preferably Monday/Tuesday. Buyer PO price is authoritative for a confirmed contract; market feeds and quotes are advisory. Historical indicative values are test assumptions, **not current offers**.
1. Capture commodity, Cr2O3 grade band, dry/wet basis, moisture, assays, price date and source, currency and expiry.
2. For export parity, start CIF China, deduct ocean freight and marine insurance to calculate FOB South Africa, then deduct port, inland freight, assays, handling, finance and the chosen route adjustments to derive FOT/ex-warehouse Brits. Preserve the literal Incoterm and exact named delivery point.
3. Separate supplier->plant transport, washing/tolling, plant->Brits warehouse transport and downstream buyer delivery. Do not count site overhead as variable route cost unless attributable and authorised.
4. Split feedstock assay and concentrate/product assay; raw ROM/feedstock applies actual mass yield, saleable concentrate does not. Never confuse mass yield with grade or metallurgical recovery.
5. Calculate revenue, source tonnes, saleable tonnes, direct costs, finance, acquisition ceiling, cash exposure and gross/net margin, with sensitivity to yield, grade, FX, buyer price and transport.
6. Reject stale, undated, unsupported, non-finite or future-dated price evidence. Human override requires approver, reason, source, timestamp and expiry. Public supplier offers require separate approval and quotation validity.
7. Chrome base-case 18%-25% gross margin is an internal target, not a guaranteed price. Never use stale historical R2,400/R2,800 per tonne as live data.

### 3.2 Transport Plan and fleet allocation
- Assets: query truck_assets for owned, leased, hired or inactive units, actual capacity, operator, availability, compliance/insurance and location. Historical seed SAR-TIP-001 and SAR-TIP-002 = 34 t each, combined 68 t/day where both authorised and available; **not** hard-coded as fleet limit.
- Plan lines: parcel/commodity/route, pickup/delivery, source/plant/warehouse/offtake, delivery terms, tonnes, allocation, dispatch owner, driver, truck/trailer, transporter, rate basis and proof IDs.
- Allocation: sum permitted usable tonnes across active assets; residual loads may route to vetted outsourced transporters if contract and compliance clear. Capacity shortages raise exception; do not invent availability.
- States: draft -> validated -> authorised -> assigned -> dispatched -> weighed -> delivered -> reconciled; cancelled/on-hold/exception branches must preserve history.
- Acceptance: assignment cannot exceed rated payload; missing insurance/permit/driver/documents blocks dispatch; interlink counts are not silently substituted for truck payload.

### 3.3 DealScope Deal Run contract
- Reuse the existing shared kernel; add strict commodity/stage/unit/currency validation and validate a parseable, not future, as-of date. Reject overflow/NaN at **every derived step**.
- Store price evidence class (indicative/quoted/confirmed), issuer/source, observed vs effective vs expiry dates, buyer identity verification and terms. Qualified math on self-entered inputs remains unverified until evidence checks pass.
- Separate gross surplus, finance cost, post-finance pre-tax net profit, target net margin, acquisition ceiling and working-capital days. Never present gross surplus as net profit.
- For raw feedstock, yield is required and applied once. For saleable material, no yield field; reject inconsistent material transformations.
- Screened shortlist may contain only evidence-qualified profitable candidates. Unqualified candidates belong only in private rejection logs.
- External buyer workspace access is based on explicit offer disclosure and recipient tenant, never inferred from SAR operator status.

## 4. Acceptance evidence matrix (to execute; NOT PASS)

| Group | Tests required |
| --- | --- |
| Source | Verified original 80 website assets and original ResourceOS history; clean changeset; lockfile; branch diff; reproducible build |
| Website | 22+ routes, new project/technology pages, redirects, legal footer, logo/image clarity, mobile 360/390/768/1024/1440, keyboard/reduced motion, SEO |
| Supplier intake | Chrome thresholds/assay and stock control; non-Chrome valid/fractional quantities; malformed email, honeypot/rate abuse, no raw error leakage, correct RLS |
| ResourceOS | Auth, taxonomy, raw vs saleable stages, route costs, fleet capacities, transport assignments, approval holds, chain of custody, assay variances, Finance |
| Pricing | CIF/FOB/FOT equation, freshness, grade/yield, split assays, FX, provenance, overrides, ceilings, stressed margins and expiry |
| DealScope | Tenant cross-read/write denial, new customer setup, entitlements, invoicing, idempotent payment webhook, 503 closed gate until release |
| Deal economics | Missing/stale price, negative/nonfinite/overflow costs, zero/yield edge cases, loss suppression, capital ceiling and buyer evidence |
| Cross-system | Source-labelled supplier handoff, dedupe/replay, consent, no cross-tenant disclosure, versioned event trail, refund/finance hold |
| Recovery | Schema replay once, restore fixtures, failover, audit exports, rollback, domain cutover rehearsal and independent Founder sign-off |

**Evidence format:** test ID, code SHA, environment/project ref (non-secret), fixture ID, exact expected and observed outcome, UTC timestamp, run command or browser log, operator and PASS/FAIL/BLOCKED. No inferred percentages.

## 5. Prioritised next executable macro sequence

1. **SAR-01** — restore writable trusted runner, obtain complete source and native histories, reconcile conflicting website branches and missing binary assets, pin dependencies, identify the exact SAR/DealScope database projects and Vercel team access. Do not bypass ownership protection.
2. **SAR-02 / SAR-03 / SAR-04** — run distinct product builds and security test suites; complete missing first-party feature implementations within their own boundaries; use non-production datasets.
3. **SAR-05** — run integrated authorised supplier -> intake -> SAR review -> route/dispatch -> custody/assay -> approval -> invoice/settlement, and DealScope customer -> entitlement -> screened opportunity -> consented disclosure -> authorised provider payment -> reconciliation paths.
4. Perform complete functional, financial, privacy, responsive, security and restore acceptance; repair failures; repeat only affected suites.
5. Prepare production candidate and explicit Founder cutover approval. Do not merge, promote, collect live payments or trade until signed.

## 6. Release governance

- Three equal product workstreams: website, ResourceOS, DealScope. No “website plus backend” shorthand that hides DealScope.
- Historical checkpoint statements are not verified current production functionality.
- No GitHub Actions, no production merge or live provider charging as a side effect of this documentation.
- No cross-legal-entity database substitution; SAR, DealScope and TenderDesk/BidOS retain separate merchant, settlement, invoice, permissions and customer obligations.
- Maintain one consolidated macro-batch change journal with precise SHAs, evidence, blockers and next action. A macro batch may contain many internal steps, but only verified PASS items can be closed.

## 7. Macro-batch executed 27 October: independent DealScope economics hardening

- Source commit: 1e6f4872486c6347eb35a0bf25927b2b02bc78f1 (packages/commodity-core/src/economics.ts).
- Regression-test commit: 332de892f1f0f4c7c042be8d78c2c7c6c5da7a27 (packages/commodity-core/test/economics.test.mjs).
- Implemented in the **draft branch only**: strict present-stage/currency/yield validation, calendar-valid non-future buyer-price reference date, and fail-closed checks for arithmetic overflow/NaN in all derived profitability/ceiling values.
- Four tests added for invalid/future dates, numeric overflow, unsupported stage/currency and hidden yield on saleable product; ten total logic tests passed in a controlled in-memory execution after type syntax was erased. This is **not** a repository TypeScript compiler pass, Node test runner pass, dependency check or live UI/backend acceptance.
- GitHub source and test file SHAs were re-fetched and confirmed after writes. Vercel preview of the resulting ResourceOS branch was QUEUED at inspection, not declared READY. Separate DealScope project was not deployed by this change; the existing DealScope preview predates these commits.
- Release gate remains OPEN until a clean checked-out repo executes package-managed typecheck, exact committed tests, production build, security and browser/data acceptance.
