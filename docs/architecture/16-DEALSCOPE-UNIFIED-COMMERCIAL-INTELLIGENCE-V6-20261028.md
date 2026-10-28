# DealScope™ — Unified Commercial Intelligence Architecture and Engineering Contract
**Revision:** 6.0-design | **Date:** 2026-10-28 | **Status:** Proposed consolidated implementation baseline, not a production release
**Public site:** dealscope.co.za (registration and trademark clearance require confirmation)
**Controlling user decisions:** Two services (Market Intelligence + Deal Intelligence); customers supply their OWN deals; commodity-adaptive specialist registry; any value-chain entry point; uploads/paste/manual intake; outcomes rather than formulas; protected backend; signed-out website must sell concrete customer benefits. This document consolidates rather than silently replaces v1–v5.1.

## Executive decision
DealScope is **not a deal finder or buyer–seller marketplace**. It is a commodity market intelligence and customer-supplied transaction assessment system. Its two offers are:
- **Market Intelligence:** dated weekly market price feeds, quality/form/basis-aware benchmarks, historical series, source-confidence indicators and commercial market intelligence.
- **Deal Intelligence:** take a customer's deal from incomplete evidence to a versioned, decision-ready commercial assessment: technical specifications, market comparables, value-chain mass/quantity balances, economics, logistics, capital/timing, evidence risk, role authority, negotiation guidance and required actions.

### Product operating contract
**Customer supplies known facts; engine fills defensible gaps from verified sources, applies bounded scenarios and asks only for genuinely indispensable missing facts.** It must never invent a market price, yield, licence, route tariff, buyer obligation or authenticated contract. Its outputs must distinguish: contractual facts; documented claims; independently checked facts; scenarios; unknowns; and contradictions. The user sees **actionable outcomes, material basis and limitations**, not proprietary derivation or sensitive internal reference data.

## 1. User-visible information architecture
### Public (signed-out)
`/` two equal services; `/market-intelligence` weekly prices/coverage/sample reports; `/deal-intelligence` outcome-led assessment; `/how-it-works`; `/for/commodity-traders`, `/for/miners-and-suppliers`, `/for/mandate-holders`, `/for/processors`, `/for/first-time-traders`; `/pricing` (do not invent prices); `/sample-assessment` watermarked hypothetical examples; `/resources` educational articles; `/about`, `/contact`, `/terms`, `/privacy`, `/disclaimers`; `/start?service=deal&source=facebook...` campaign entry.
### Authenticated
`/app/dashboard`; `/app/deals`; `/app/deals/new`; `/app/deals/[id]/sources`; `/app/deals/[id]/facts`; `/app/deals/[id]/route`; `/app/deals/[id]/assessment`; `/app/deals/[id]/actions`; `/app/deals/[id]/reports`; `/app/market`; `/app/watchlists` **watchlists are market-pricing only, not deals**; `/app/billing`; `/app/settings`.
### Admin/analyst
`/admin/registry`; `/admin/data-sources`; `/admin/market-publications`; `/admin/verification-queue`; `/admin/model-versions`; `/admin/assessment-audit`; `/admin/compliance`; `/admin/security` behind least privilege and action approval.

## 2. Customer flow: one-minute orientation, only then analysis
The first screen contains **two** actions: `Explore Weekly Market Intelligence` / `Assess My Deal`. No assumption that market intelligence implies a submitted deal.
1. **Commodity** selector: commodity class → named commodity, e.g. chrome, coal, manganese, gold, diesel; contextual helper, searchable not giant unstructured list.
2. **Delivery/pricing basis** prominent second selection: EXW, FCA, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP (ICC rules where applicable); FOT, ex-mine, ex-warehouse, delivered mine gate, custom contract wording; **"Not sure — read my document"**. Contract term takes priority; named place required. **FOT is not an ICC Incoterms rule**. Extract responsibilities for loading, unloading, title, freight, risk and costs from actual contract clauses. May be prefilled from a contract later without asking the customer twice.
3. **What are you doing?** first-person commercial intent, *filtered by commodity/material*: `I am a seller supplying my own mine/stockpile`; `I hold a seller's mandate`; `I hold a buyer's mandate`; `I am buying raw material to resell unprocessed`; `I am buying feedstock to process then sell`; `I am purchasing a saleable product for resale`; `I have an offtake contract and need to build its fulfilment route`; `I own a processing operation`; `I only want to assess this offer`. Users can select **multiple roles per commercial leg** (e.g., authorized mandate holder for seller and trader only if genuinely permitted), and role authority is independently checked. Avoid describing everyone as buyer or seller.
4. **Starting position:** `I have a buyer contract/PO`; `I have stock or a source offer`; `I have both`; `I have a processing/transport quote`; `I only know the proposed terms`; `I want to test a commercial scenario`. Prevent invalid stage combinations with specialist process graphs.
5. **Share known facts:** equal primary options `Upload document` (PDF/DOCX/TXT, secure scanning); `Paste text` (WhatsApp/email/excerpt); `Enter manually` (few guided fact questions). After initial save, append unlimited permitted supporting sources—contract, mandate, assay, stock proof, plant quote, haulage quote. No overwriting evidence. Privacy and consent notice before upload. Sign-up before confidential uploading for secure workspace.
6. **Known vs unknown review:** extracted values highlighted with passage/page and provenance. Auto-handle contradictions, multiple units, dry vs wet, price basis, grade and currency. Ask no more than 1–3 high-impact clarification questions per screen. `I don't know` allowed. If critical facts absent, offer **conditional screening**, not fictional final feasibility.
7. **Generate my assessment** primary button. Show calculation progress; never make the user hunt for output. Version immutable report. On output, show status and actionable outcomes first; details and checklists below.
8. **Improve this deal:** `Try another grade`, `Change sourcing price`, `Compare truck sizes`, `Add a supplier quote`, `Upload assay`, `Ask for a wash test`, `Revise Incoterm`; new report revision preserving prior assessment.
9. **Execute:** downloadable decision brief, supplier questions, RFQ comparison, transporter negotiation sheet, checklist for proofs and milestones, buyer clarification request, finance requirement summary. No automatic binding actions, bids or contact with third parties without authorization.

### What a novice sees
Plain-English descriptions of ROM, concentrate, sweepings, tailings, Cr₂O₃, NAR/GAR, wet/dry, assay, recovery vs yield, Incoterms and stock title. Ask `Why does this matter?` only on demand. The system does not present a chemist's data capture page to a first-time mandate holder.

## 3. Domain: commodity → material → role → process route
Every registry item is versioned and has: `commodity_id`, `family`, `material_form`, `unit`, `quality_schema`, `spec_validation`, `allowed_roles`, `physical_processes`, `logistics_constraints`, `regional_pricing_sources`, `settlement_terms`, `tax_compliance`, `required_evidence`, `calculator_adapter`, `release_status`, `review_owner`.

### Representative material forms and routes
- **Chrome:** high/low ROM by actual assay, lumpy/chips/fines, sweepings, historical/plant tailings, concentrates, blended stockpiles. Direct ROM trading never invokes recovery; upgrading requires qualified plant + mineralogical data; sweepings and tailings cannot inherit ROM recovery estimates. Chrome assay: Cr₂O₃, Cr:Fe, SiO₂, Al₂O₃, sizing, moisture, impurities as relevant.
- **Coal:** ROM raw sale, washed thermal grades, metallurgical/coking coal where appropriate, fines, middlings, discard/recovered coal, blends. Calorific value, ash, sulphur, volatile matter, total moisture, sizing and sulphur/spec basis. Coal washability **float–sink** evidence needed for defensible washed yield; CV cannot deterministically supply it.
- **Manganese/iron ore:** ROM, high-grade ore, fines, lumps, concentrates, beneficiated and blends; Mn/Fe, P, SiO₂, moisture, sizing, product specifications and applicable assay/punishment terms.
- **Gold/PGMs/silver/diamonds:** ore, concentrate, doré, bullion or other legally defined forms; grams/tonne vs payable metal units, refining/assay charges, losses, regulatory permissions and chain of custody. High-risk legal/compliance gating; never produce unqualified execution approval.
- **Diesel/petrol/crude oil/LPG:** 10ppm/50ppm/500ppm and grades as applicable, litres/bbl/tonnes converted using evidenced density/temperature, terminal or depot vs destination, transport mode, statutory pricing zones, licences and tax. No mining assay/recovery fields.
- **Agriculture and industrial products:** warehouse/packing/drying/waste, moisture and grading, seasonality, shrinkage/expiry, packaging, transport; independently validated specialist adapters.
- **Unknown/unsupported models:** catalogue/discovery of product knowledge is allowed; **financial validation disabled** until specialized model and source-data acceptance tests pass. No generalized fake number.

## 4. System components and ownership
```
Signed-out website + campaign pages
  -> Identity / Entitlements (user + organisation + assigned authorised roles)
  -> Deal Workspace + Private Document Vault + Consent
  -> Document Understanding (sandboxed ingest -> parsing -> clauses/entities -> human confirmation)
  -> Evidence & Provenance Graph -> Known-Facts Canonical Model
  -> Commodity Specialist Registry (quality, units, stage graph, roles, compliance)
  -> Private Market Reference Layer (weekly data, FX, licensed market indices, rates)
  -> Route & Obligations Engine (Incoterms/custom terms, actor responsibility)
  -> Private Technical Engine (mass balance, quality / recovery / unit converters)
  -> Private Commercial Engine (reverse and forward pricing, transport, finance, taxes)
  -> Scenario Optimizer (sensitivity, feasibility constraints, negotiation ranges)
  -> Risk / Evidence / Readiness Engine (separate dimensions + execution blockers)
  -> Customer-Safe Result Presenter (allowlisted only) -> PDF/HTML Decision Brief
  -> Action Planner + Quote/Document Request Checklists
```
Services communicate via typed internal interfaces. Independent price data and private customer deals are separate storage domains. Neither market publications nor cross-tenant inference may leak private offers, counterparties or confidential prices.

### Engine contract
- Inputs: canonical `DealFacts`, `CommodityConfig@version`, `ExternalReferences@effective_at`, `Assumptions@scenario`, `SourceEvidenceRefs`, `ObligationMatrix`.
- Output: versioned `AssessmentResult` with `economic`, `evidence_integrity`, `execution_readiness`, `market_fit`, `recommended_actions`, `basis_and_limitations`, `provenance_summary`, `valid_until` and `model_version`.
- Failure: `INSUFFICIENT_INFORMATION`, `STALE_REFERENCE`, `INVALID_QUALITY`, `UNSUPPORTED_PROCESS`, `COMPLIANCE_BLOCK`, `CONFLICTING_CONTRACT_TERMS`, `NO_EXECUTABLE_ROUTE`. Every failure yields a next-action question, not a blank report.
- Retained internally only: price adjustment/risk model algorithms, route solver, formula code, percentile calibrations, weights, supplier-indicative database, sensitive licensing and provider contracts. Customer result should disclose material bases/assumptions and input data, not IP.

## 5. Economic model library — developer-only; NEVER render formulas to customer
All financial examples *below are sample mechanics, not current quotes*. Base economic price **ex VAT** unless explicitly scoped; VAT cash timing modeled separately. Distinguish net revenue/gross margin/markup/cash cycle. Every stage uses explicit currency, unit, geography, effective date, dry/wet, title owner and delivery obligations.

### 5.1 Material and process balances
`dry_feed_t = wet_feed_t × (1 - feed_moisture_fraction)`.
`contained_target_metal_or_oxide = dry_feed_t × feed_grade_fraction`.
For a mass-conserving single-product upgrading scenario, when *measured or transparently assumed* metallurgical recovery `r` and target product grade `g_out` are known:
`dry_product_t = dry_feed_t × feed_grade_fraction × r / g_out`.
`dry_feed_required = target_dry_product_t × g_out / (feed_grade_fraction × r)`.
`dry_tailings_t ≈ dry_feed_t − dry_product_t` only where no separate additional products/consumptions; for by-products and reagents use full mass balance. Adjust for losses, resampling, moisture, split, minimum lot and quality penalties.
**Important:** `metallurgical recovery` (fraction of Cr₂O₃ captured) ≠ `mass yield` (tonnes product / tonnes feed). Feed grade alone cannot determine recovery. Tailings/sweepings must use own mineralogical & particle-size testwork or scenario bounds. Theoretical mass balance may be physically feasible but plant-infeasible; optimizer must validate constraints.
Coal: use measured float–sink partition curves / specific washability evidence to estimate saleable yield and finished coal specification, with blending constraints. No CV-to-yield deterministic shortcut.

### 5.2 Quality, market and saleable value
Net sale basis begins with actual offtake/PO when valid, else dated market indication aligned to product grade/form/size/moisture/location/Incoterm/parcel/currency and availability. Quality premium/penalty, grade rejection thresholds, tolerances, moisture deduction, treatment/refining charges, payable percentage, financing/price-fixing dates and FX exposures are each modules. An unusable `CIF China` quote **must never** be displayed as `FOT City Deep` by relabelling; instead use a properly sourced export-parity conversion with all mandatory route data, else mark incomplete.
Two-way solver:
- **Offtake-first:** given sale obligation, derive required inputs and highest affordable acquisition cost by material grade/route.
- **Source-first:** given feedstock quality/quantity/source price, derive saleable possibilities, break-even buyer price and realistic sale netback.
- **Both sides:** derive spread, total contribution, collateral/settlement/capacity constraints, and comparison against counterparty claims.
- **Mandate-only:** determine agency fee/commission entitlement, authority and transaction economics *without asserting the mandate holder buys, owns or finances stock*.

### 5.3 Freight route and negotiating allowance
`road_leg` = origin, destination, validated heavy-vehicle routing distance, truck class (34t, 36t, other), permitted *wet* payload, actual expected loaded payload, backhaul/return-charge fraction, trips, tolls, loading/waiting charges, fuel escalation, access restrictions and rate source.
`loaded_wet_t = min(vehicle_legal_payload_t, actual_requested_wet_load_t)`.
`dry_load_t = loaded_wet_t × (1 - moisture_fraction)`.
`billable_vehicle_km = loaded_route_km + charged_empty_return_km + chargeable_detours`.
`trip_cost = billable_vehicle_km × validated_R_per_vehicle_km + tolls + handling + waiting + other billable charges`.
`freight_R_per_wet_t = trip_cost / loaded_wet_t`; `freight_R_per_dry_t = trip_cost / dry_load_t`; multi-trip schedules must round trips **up**, not use pure continuous division for dispatched loads. Two physical legs are separately priced (source→plant; plant→buyer), and sender/recipient pays only where contractual responsibility says so. R/km is truck/leg/region and date specific, NOT a universal DealScope number; quote or scenario data must be labelled.
Compare at least 34t and 36t classes **only where legally permissible** on route; permit GVM/GCM, bridge formula and weighbridge constraints trump nominal equipment label.

### 5.4 Route economics
`net_realization = net_sale_proceeds_ex_VAT − buyer_side_quality_penalties − seller_borne_delivery_stage_costs`.
`landed_feed_cost = acquisition + supplier_borne? (allocate by obligation) + transport + handling + feed_assay + insurance + transaction_costs`.
`total_cash_cost = procurement + tolling + feed/product assays + logistics + storage + quality adjustments + finance + regulatory/royalty + taxes_duties_where_economic + commissions + losses + overhead_allocated_if_relevant`.
`contribution = net_receipts_ex_VAT − economic_costs`; `gross_margin = gross_profit / net_revenue`; `markup = profit / cost` and **not** interchangeable.
`working_capital_need = maximum cumulative cash shortfall across acquisition, freight, processing, storage, buyer deposit/advance, assay/payment lag and any payable tax timing`.
`cash_conversion_days` from money-out to money-in; financing via daily interest rate × principal outstanding × actual days (calendar/contract basis); distinguish margin from liquidity and limit exposure. Buyer payment timing and assay finalisation must be included.

### 5.5 Maximum feedstock procurement ceiling (private)
For simple one-product example, assuming feed dry tons `F`, saleable dry tons `P`, price `S`, explicit other costs `C`, chosen minimum target gross margin `m` on *net revenue*:
`max_feed_purchase_R_per_dry_t = ((P × S) × (1 − m) − C) / F`.
Ensure `C` includes processing, two freight legs as contractually borne, both assays, handling, commissions, finance, storage, losses and quality penalties; if excluded, **provisional**, not executable. If feedstock feed-price quoted wet tonne convert with measured moisture. If target contribution after risk reserve, apply an explicit private objective; never mix gross margin and net contribution without labelling.
If negative ceiling, reject as unviable under the chosen assumptions; if data stale/missing, return an information gap rather than fabricated price. Reverse solution from source is the minimum acceptable sale price/required buyer quote for chosen return objective; include feasible grade and processing constraints.

### 5.6 Sensitivity and optimum selection
Build matrix over eligible material form/assays (e.g. chrome 28–31%, 38–42% direct ROM), plant/process location, recovery scenarios verified for **each material**, 34t/36t/legal vehicle, source price, freight range, delivery terms, FX, quality price premiums/penalties, buyer payment days, plant queue. Report best **evidence-backed, legally executable** options; do not select maximum mathematically possible margin where stock/mandate/plant unavailable. Show `best qualified`, `best conditional`, `not currently executable` separately.

## 6. Worked chrome scenario — explicitly illustrative, not a current purchase order
Buyer claims 1,000 **dry** tonnes of 42% Cr₂O₃ concentrate to City Deep warehouse. Assume recovery=75% independently of grade **only for classroom comparison**; this is not scientifically credible as a universal plant profile:
| Feed Cr₂O₃ | Product mass yield | Dry feed needed |
|---:|---:|---:|
| 28% | 50.00% | 2,000 t |
| 29% | 51.79% | 1,931 t |
| 30% | 53.57% | 1,867 t |
| 31% | 55.36% | 1,806 t |
In reality recovery must vary by material and plant; the report requests washability/testwork, verified buyer grade, dry/wet settlement, contractual term interpretation and a quote for tolling. The system can say `If 30% feedstock qualifies for the assumed recovery: ~1,867 dry tonnes required` without promising the yield.

**Example only, not current transport market rate:** 100km loaded + 100km chargeable return, R25/vehicle-km, 34t actual wet payload => R5,000/trip /34 = R147.06/wet tonne before tolls, loading, diesel variations and moisture. At 10% moisture, ~30.6 dry tonnes /trip and R163.40 per dry tonne. For a 1,867 dry-tonne need, 62 trips would be needed if that moisture and payload applies. The rate is explicitly a model parameter; a real procurement guide requires evidence-based carrier quotes/zone tariff.

**R2,300/t FOT:** if a customer supplies this historic counterparty-indicated number, preserve its date and uncertain binding status; verify grade, basis, destination, wet/dry, VAT and settlement. Do NOT treat as current HMS executable PO or as an October 28 live market print. Do not calculate a binding purchase ceiling from it without cost stack and active obligation evidence.

## 7. Evidence, authenticity and decision confidence
**Source types:** buyer PO/contract, supplier contract, mandate, assay certificate, stock report, mining source permit, weighbridge tickets, plant performance reports, tolling offer, transport quote, location and bank verification, third-party market print.
**Per-assertion fields:** `source_id`, page/paragraph/range, effective_at, observed_at, unit/basis, claim_value, extraction_confidence, evidence_reliability, independent_verification_state, contradiction_ids, override_history, expiry_at, verifying_party`. **Extraction confidence** (did parser read text correctly) is distinct from **truth confidence** (whether the claim is authentic/correct).
Evidence status: `MISSING`, `CUSTOMER_DECLARED`, `DOCUMENT_PRESENT_UNAUTHENTICATED`, `CORROBORATED`, `VERIFIED_SCOPED`, `EXPIRED`, `DISPUTED`, `CONTRADICTED`. Authenticated documents can still describe an unviable deal. There is no public `100% legitimate` badge or `fraud guaranteed detected` claim.
Four independent assessment axes:
1. **Economic Viability**: profitable/conditional/unviable/insufficient data.
2. **Evidence Integrity**: verification coverage, ownership/authority, document and bank exceptions.
3. **Execution Readiness**: stock, plant, transport, cash, legal permissions and timing.
4. **Market Fit**: comparable grade/material/term/geography, data source licence/freshness.
Hard blocks: prohibited activity, missing required licence where applicable, contradictory delivery obligations, unverified title/custody in high-risk case, impossible mass or logistics, unverified beneficiary change. These must remain visible regardless of favourable economics.

## 8. Public outputs vs protected methods
### Customer may see
- Original facts and documentary passages the customer supplied; declared delivery basis and responsibility, with uncertainty if ambiguous.
- Grade-specific feed required / product possible; **qualification on recovery and evidence**.
- Acquisition ceiling or negotiating price **range**, when supported; resale floor, break-even, expected profit/margin and cash exposure *where model and facts sufficient*.
- Proposed vehicle type, load plan, per-trip/per-tonne transport budget/range with basis; route restrictions.
- Scenarios, report date, price-reference basis, supported data age, material assumptions, exclusions, confidence and practical next steps.
- Reasons a result is conditional (e.g., `plant recovery not proven`, `buyer PO expired`, `quoted freight unverified`).
### Customer must not see
- Source code, internal price formulas, optimization rules, scoring/weight weights, confidential benchmark calibration, full supplier rate database, protected rate normalization, model internals, prompts, private engine logs or tenant-external data.
Use a backend calculation service + strict typed response allowlist, generated audited snapshots. No economics or proprietary benchmarks embedded in client JavaScript, static files, PDFs, `source maps`, browser devtools payloads or query params. Staff have separate protected audit access. Customer need not see **how** DealScope weighted internal options, but cannot be misled about cost basis, exclusions or material uncertainty.

## 9. Concrete platform data schema (PostgreSQL/Supabase proposal)
- `organisations` and `organisation_users` (RLS; legal entity + authorised roles)
- `deals` (tenant, commodity, intent, stage, status, owner)
- `deal_roles` (party, claimed role, source, signed authority status, permission)
- `deal_sources` (private storage ID, hash, MIME, scan status, upload actor, provenance)
- `deal_fact_assertions` (many assertions for same fact, source span, normalization, confidence; append only)
- `deal_canonical_facts` (accepted facts, version, human approval, conflict state)
- `terms_obligations` (loading, haulage, unloading, title, insurance, sampling, risk and settlement by actor)
- `commodity_registry_versions`; `material_forms`; `quality_parameters`; `process_edges`; `calculator_adapter_versions`; `compliance_rules`
- `market_observations` (license, source, grade, material, currency, market, basis, effective time, redistribution rights)
- `route_legs` + `transport_reference_quotes`; `plants` + `plant_testwork`; `counterparty_checks`
- `assessment_runs`; `assessment_scenarios`; `assessment_public_results`; `assessment_private_snapshots` (strict separate access)
- `report_versions`; `risk_findings`; `action_items`; `customer_consents`; `audit_events`; `entitlements`, `billing_events`, `campaign_attribution`
Version all engine inputs & calculations immutably; never change historical report under new prices. RLS + private buckets + server-side checks are mandatory and tested.

### Minimal APIs, owned by protected service layer
`POST /api/deals` create draft
`POST /api/deals/:id/sources/upload` presigned/private scan-gated document
`POST /api/deals/:id/sources/paste` append text
`POST /api/deals/:id/facts/manual` append user-entered facts
`GET /api/deals/:id/facts/review` knowns, unknowns, contradictions (tenant-safe)
`POST /api/deals/:id/facts/confirm` customer correction/approval
`POST /api/deals/:id/assessments` asynchronous job/queued assessment
`GET /api/deals/:id/assessments/:run_id` state + allowlisted result
`POST /api/deals/:id/scenarios` revisions only; preserve immutable baseline
`GET /api/deals/:id/reports/:version` signed limited-time download
`GET /api/market/weekly` public summary only; granular data by subscription, enforce feed rights.
All endpoints: auth, tenant checks, idempotency, rate limits, input schema, privacy, evidence scopes. Use queues for extraction; do not run lengthy processing synchronously in Vercel serverless request timeouts. Backend secret keys cannot be shipped to browsers.

## 10. Data & reference sources required for actually useful economics
- Commodity market: trustworthy current dated grades/material forms, FCA/FOB/CIF/local terms, size/parcel/currency, licence/rights; published chrome quote and producer disclosures provide **context**, not a direct FOT instruction.
- Transport: road-distance provider supporting heavy vehicles and restrictions; spot freight quotes/signed rates by rig, lane and time; legally permissible payload. Official DMPR zone fuel prices may inform carrier cost movement but are **not** a market truck tariff.
- Chrome/metallurgy: assay, grade, moisture, mineralogical liberation, plant-specific testwork and actual performance by feed type, rejection/penalties.
- Coal: independent washability/float–sink, actual wash plant, quality assays; no generic yield.
- Precious metals: authorised pricing/FX, assay payable content/refinery terms and SADPMR permits.
- Petroleum: DMPR published monthly zonal prices, real supplier/depot contract quotes, density/temperature conversions, licences and relevant levies.
- Tax/FX: official SARS rules and authoritative FX source; keep VAT invoicing and timing separate from profit.
- Compliance: DMPR mining rights/permits and petroleum authorisations, SADPMR precious metals/diamonds, privacy (POPIA), customer contracts/mandates.
**Source registry enforcement:** `source`, `source_type`, `as_of`, `license_redistribution`, `grade_spec`, `delivery_basis`, `geography`, `moisture_basis`, `currency`, `quality`, `status`, `staleness_policy`. Never invent actual missing market data. If current rate unavailable return `Quote required` and a negotiation request guide.

### Research anchors (verified 2026-10-28; URLs not automatically available for reuse rights)
1. ICC Incoterms 2020: https://iccwbo.org/business-solutions/incoterms-rules/incoterms-2020/ ; delivery, unloading and transfer obligations.
2. Tharisa FY2026 chrome price disclosure (published 13 Oct 2026; metallurgical grade CIF China 42%-basis report; not local spot): https://www9.sharenet.co.za/v3/sens_display.php?scode=&seq=3&tdate=20261013070500
3. Mining Bulletin 7 Oct 2026 export chrome grade price ranges (CIF China; not an executable South African local quote): https://www.mining-bulletin.com/index.php/read_251622.html
4. Marico Chrome plant primary/secondary circuits (site-specific operations): https://maricochrome.co.za/Concentrator/
5. SGS South Africa coal float–sink testing: https://www.sgs.com/en-za/services/float-sink-and-washability-testing
6. Official DMPR fuel price adjustment effective 7 Oct 2026: https://www.gov.za/news/media-statements/minister-gwede-mantashe-announces-adjustment-fuel-prices-effective-7-0
7. SADPMR licence types: https://www.sadpmr.co.za/service/regulations-2/
8. Official petroleum wholesale licence: https://www.gov.za/node/727470
9. OWASP upload security: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
10. POPIA section 19 security: https://api.acts.co.za/protection-of-personal-information-act-2013/19__security_measures_on_integ.php

## 11. Execution support and repeat engagement
Customer report is NOT final product interaction; present:
- Negotiation brief: buy ceiling/target, transport R/vehicle-km comparison, route option, quality conditions.
- Counterparty verification request: source of authority, company registration, stock ownership, supporting independent assay and bank account controls.
- Plant/transport RFQs: materials, grade/sizing/moisture, parcel tonnes, target date, lane/trailer, target delivery term; customer chooses whom to approach.
- Delivery plan: lot sequencing, weighbridge, independent sampling, assay turnaround, cashflow milestones, constraints.
- Reassessment after quote/assay/document: preserve deltas, explain improved/deteriorated outcome, avoid silent overwrite.
- **Post-deal outcome capture** (optional): did user execute? achieved/revised margin vs estimate? costs/prices differed? timeline? failures? Use opt-in and anonymisation; never insert private deal data into market feed without rights. This creates a real evidence-based learning loop for model calibration.

## 12. Commercial packaging (proposal, pricing not yet authorised)
Market Intelligence: weekly price report / commodity coverage subscription; Deal Intelligence: preliminary screen, comprehensive deal feasibility assessment, additional scenarios and continuous monitoring/reassessment as separately metered tiers; corporate packages with multiple team users and governance. Public website should sell benefits before prices; don't imply a paid human audit is automatic.

## 13. Facebook acquisition and signed-out conversion
**Deal Intelligence campaign:** `That commodity deal looks profitable. But have you verified what you will actually earn—and what you are buying?` -> vertical-specific landing page -> role + commodity -> hypothetical sample decision brief -> register for private assessment -> three input methods -> report -> conversion/reassessment.
**Market campaign:** `Know the market before you negotiate` -> properly dated example price, meaning of CIF vs FOT, and product-grade differences -> market report/subscription.
Groups: join/participate legitimately, respect posting policies, avoid mass-pasted spam; document examples are educational and anonymised/fictitious; no claims of verified stock or buyers. Attribution `utm_source=facebook&utm_campaign=...`; events `landing_view`, `service_select`, `commodity_selected`, `intake_started`, `source_added`, `facts_reviewed`, `assessment_requested`, `assessment_viewed`, `paid`, `report_downloaded`, `return_to_assessment`. Collect only appropriate data; marketing contact requires lawful consent/other applicable basis.

## 14. Acceptance and release controls
G0 recover deployed code/schema/latest branch and reconcile v1–v5.1 vs this design. **This file is design authority, not evidence of deployment.**
G1 registry + roles/terms/quality schemas; migrated with RLS and tests.
G2 three-method evidence intake + conflict merge + contract clauses + safe confidential storage.
G3 weekly pricing source ingestion + provenance + rights, with dated public coverage. No price publication without permission.
G4 protected mass balance / reverse+forward solver, grade sensitivity and economics (chrome direct vs beneficiation first).
G5 distance/vehicle/quote freight solver; dry/wet and truck law; timeline finance.
G6 assurance/legitimacy, licence constraints and customer-safe report snapshots; fail-safe non-executable flags.
G7 signed-out website, guided intake, sample report, entitlements/payments/consent, Facebook attribution.
G8 limited preview pilot with actual anonymous fixtures and human QA; promotion only after real source data and engineering acceptance.

**Acceptance cases:**
A. Mandate holder + uploaded chrome concentrate PO with 1,000t City Deep -> extracted knowns, unknowns; no invented price; no stock automatically asserted.
B. 28/29/30/31% and proven recovery per source -> independent quantity scenarios; 30% at illustrative 75% recovery, 42% concentrate -> 1,866.67t dry feed per 1,000t product.
C. 40–42% high-grade ROM direct trade -> no processing inputs, direct-sale economics and logistics.
D. Sweepings and tailings -> different recovery evidence; no ROM default.
E. Coal wash without float–sink/plant evidence -> non-executable quantity outcome; can show explicitly hypothetical scenario.
F. 34t vs 36t route -> per trip and wet/dry t price, round trips up, no illegal payload assumption.
G. Source-first offer without buyer contract -> market price comparability and an appropriately conditional sale scenario / break-even.
H. Document conflict with manual edit or paste -> both assertions preserved; customer resolution and audit trail.
I. Mandate holder without purchase obligation -> no invented principal finance/ownership.
J. No verified price or mandatory stage cost -> no executable buy ceiling; instead targeted data request.
K. Server-delivered response + HTML/JS/source maps/pdf -> no proprietary formulas, internal logs, cross-tenant references.
L. Petrol/diesel / gold -> correct units and regulatory gates, no mining recovery fields.
M. Signed-out site has 2 distinct services, outcome-led CTAs, clear limits and truthful illustrative samples.

## 15. Release-critical unresolved dependencies
Exact platform repository/production schema access; benchmark licensing and price cadence; customer price/offer confidentiality rules; spot haulage benchmark partner/quote workflows; verified plant-performance datasets; document-identity verification services; country-specific lawyers/competent persons; model validation fixtures; billing/tier decisions; brand/trademark clearance; user testing; contact conversion policy. No commitment to numeric pricing or fraud-proof verdict until these are resolved.

**Design change control:** v6 extends approved v3 specialist registry, v4 material universe, v4.1 private methods, v5 contract-first flow and v5.1 three-method input. No generic blanket calculator and no customer deal discovery. Any future commodity specialist must ship with exact units, process constraints, validated economics, source confidence, and compliance before marked live.