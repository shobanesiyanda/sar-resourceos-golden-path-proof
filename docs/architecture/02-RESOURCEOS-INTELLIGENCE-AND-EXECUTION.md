# SAR ResourceOS — Intelligent Project, Commodity and Execution Architecture

**ID:** SAR-ROS-ARCH-001 • **Owner:** SAR • **Revision:** 2026-10-27 / v0.1  
**Status:** Requirements consolidated into one **architecture candidate**; only specifically tested source modules are implemented. This is not a claim of an operational AI project digital twin or a fully integrated enterprise system.

## 1. System mission — non-negotiable

**ResourceOS is SAR's internal enterprise intelligence and execution operating system.** It must accept a legitimate opportunity or a project **that has not started**, dissect its controlling documents, construct a detailed source-traceable model, virtually execute multiple scenarios, and generate a human-approvable procurement, operational, finance and execution baseline. Once approved, real events feed back into that baseline to support variance detection, reforecasting and controlled corrective action. This purpose applies to mining contracting and commodity trading, not merely warehouse forms, dashboards or parcel tracking.

**Foundational separation:** AI understands and extracts information; deterministic optimisation/simulation engines calculate feasibility; **humans authorise** technical assumptions, external communication, obligations, financial releases and actual execution. AI cannot self-certify, fabricate prices or create commitments.

## 2. Canonical workflow: document → simulated project → governed execution

| Stage | Inputs and processing | Required output / immutable linkage | Approval gate |
|---|---|---|---|
| P00 Opportunity creation | Project sponsor, classification, tenant/division and mandate | Project ID, owner, confidentiality, legal scope, stage | SAR intake/authority |
| P01 Controlled document intake | Tender/SOW/RFP, BOQ, drawings, geological/assay/plant data, contract, environmental/finance evidence | Original hash, storage key, issuer, version, permissions, page/section evidence | Permission + malware scan |
| P02 Document intelligence | Text/table/unit/technical extraction, clause/date/BOQ interpretation, ambiguous/contradictory data detection | Source-linked facts vs AI inferences vs unknowns and conflicts | Qualified document review |
| P03 Canonical model | WBS, dependencies, milestones, geography, fleet/labour/equipment/plant, raw materials, processing yield, costs, tax/finance, permits | Versioned work packages, assumptions, provenance, evidence state | Technical and commercial assumption approval |
| P04 Scenario engine | Critical path, capacity constraints, logistics, yield conversion, quote/pricing inputs, working capital, contingency, stress/stochastic simulations | Baseline/downside/upside, cost and cash profiles, bottlenecks, risk and sensitivities | Decision reviewer; zero unapproved facts promoted |
| P05 Procurement-intelligence planning | Detect missing machine, material, hire, fleet, plant, lab, transport and subcontractor capacity | Proposed sourcing schedule, technical vendor specifications, RFQ lot/line numbers | Procurement scope review |
| P06 Controlled RFQ lifecycle | Prepare branded RFQs and exact vendor lists; seal approved revision; dispatch through provider only after approval | RFQ ID/version, authorised recipient set, approval event and dispatch message ID | **Human review and dispatch authorisation** |
| P07 Inbound quotation intelligence | Automatically capture responses from approved mailbox/portal when connected; scan attachments, verify sender/context, source hash, match revision and supplier | Original stored response, extracted quote lines, exceptions, terms and validity | Human quote and technical acceptance |
| P08 Re-simulation | Update **candidate scenario only** with quoted equipment/transport/contractor costs and lead times | Comparison, versioned revised scenario, margin/cash/time impact | Human choose/approve award recommendation |
| P09 Baseline activation | Validated project contract, funding, workforce, asset and compliance availability | Frozen signed baseline, work orders, assignments, approved budget and stage gates | Separate management, financial and legal approvals |
| P10 Physical execution | Source/material custody, loading, dispatch, plant/warehouse, sample/assay, site tasks, subcontractors | Time-stamped source-to-delivery actuals and supporting evidence | Authorised operational controllers |
| P11 Finance and control | Invoice/payment terms, receipts, treasury cash release, project cost codes, account reconciliations | Commercial ledger linkage, variance, receivables/payables and funds release audit | Separate accounting/treasury authority |
| P12 Continuous intelligence | Compare estimates vs verified quotes, contracted prices, actual yields, dates and settlements | Reforecast versions, alerts, approved change orders, risk-adjusted lessons | Controlled model revision, no overwrite of original baseline |

Each stage must fail closed on absent authenticated ownership, invalid evidence, missing professional approvals, expired quotes, unverified counterparties or currency/unit/quantity inconsistencies.

## 3. Architecture services (intended target)

```text
[Internal SAR Desktop / Mobile Executive Shell]
        |
[Identity + Division/Project Roles + Approval Authority]
        |
+------- ResourceOS Application / Authorised Commands ------+
| Opportunities | Documents | Project Model | Simulations |
| Counterparties | Procurement/RFQs | Contract Management |
| Commodity & Route Builder | Plants/Tolling | Fleet/Dispatch |
| Storage & Custody | Lab/Assay | Operations/Exceptions |
| Finance/Treasury | Evidence/Audit | Analytics/Heat Map |
+-------------------------------------------------------------+
        |
[Versioned Business Services + Outbox / Idempotent Integration]
   |         |         |          |          |          |
Document   Calc/      Vendor      Physical    Finance   Pricing/
Parser     Solver     Mail/Portal Adapters    Adapters  Market Evidence
        |
[Authoritative SAR-owned Auth, Database, Files, Logs and Backups]
```

**Interfaces:** retain dark executive shell, header and single sidebar, central heat map and gold restrained accents. Navigation baseline: Dashboard; Opportunities; Counterparties; Route Builder; Operations; Tolling & Plants; Documents; Approvals; Finance; Analytics; Admin. Additional screens such as Project Intelligence, RFQs or Fleet may be subordinate views; redesign must not discard approved shell.

**Technology:** historically Next.js/React, TypeScript, Supabase client/server and GitHub/Vercel; portable server/container design. Current project database reference and migration history must be independently verified. Do not infer backend completeness from a READY frontend preview.

## 4. Intelligent document model and uncertainty

Minimum canonical fields: `project_id`, `document_id`, `revision`, `file_sha256`, `issuer`, `confidentiality`, `source_locator` (page/paragraph/cell/drawing number), `extraction_model_version`, `fact_value`, `unit`, `evidence_class`, `review_state`, `reviewer`, `review_event`, `effective_date`.

- Distinguish explicitly: original author-stated facts, inferred facts, operator assumptions, calculation-derived results, contradictory claims and still unknown quantities.
- Original binaries are immutable; extracted records carry source and model version. False certainty is a defect.
- Material site-specific engineering risks require qualified professionals. Missing permits/professional opinions block activation, even with mathematically profitable simulation.
- Route all unexplained BOQ sums, drawings and unit mismatches to a technical review queue.
- No public supplier source or DealScope tenant may access another confidential project without authorised contractual disclosure.

## 5. Simulation architecture and mathematical requirements

**Core model:** dependency-aware work-breakdown graph; task duration, lead time and calendars; resource demand vs proven available assets/crews; equipment utilisation and breakdown risk; mining/processing/yield; transport cycles/weight limits; warehouse buffers; sampling/assay; permit and weather constraints; material cost, service/subcontract price, fuel and FX; cash/invoice/retention/VAT timing; insurance/compliance; capacity/finance restrictions.

**Simulations:** (a) baseline, (b) upside/downside demand and yield, (c) transport or equipment bottleneck, (d) feedstock/grade/assay shift, (e) supplier delay or price validity expiry, (f) funding/working-capital shortfall, (g) alternate hired vs owned equipment, (h) Monte Carlo and stress scenarios **only where probability distributions are justified by evidence**.

**Engine outputs:** feasible/not feasible, qualified exceptions, project duration, critical path, resource loading, daily/weekly production, costs and separately presented gross/net margin, cash peaks, procurement lead time, equipment mobilisation, supplier options, sensitivity, risk register and recommended decision options.

**Version control:** `scenario_id`, `input_version`, `engine_version`, `source_set_hash`, `seed` if stochastic, `approved_at/by`, `supersedes`, `baseline_id`. A response from a supplier creates a **new provisional revision**, never a silent overwrite of an approved baseline.

**Current source:** `packages/project-core/src/simulation.ts`, `document-intelligence.ts`, `quote-feedback.mjs`, `constrained-scheduler.mjs` and tests implement **individual pure-domain foundations**. They are **not integrated AI document ingestion, optimised constrained digital-twin simulation or physical execution**. Treat future extensions as engineering, not done.

## 6. RFQ, quotation and contractor sourcing architecture

**RFQ categories:** feedstock/material; original equipment manufacturer (OEM); plant/equipment hire or lease; haulage/transport; civil/mining subcontractor; processing and tolling; laboratory/sample; warehousing; manpower and specialist services.

**RFQ creation must derive from modelled scope** with required quantity/UOM, work location, technical spec, mobilisation date/lead time, scope exclusions, document evidence, required certifications, delivery/Incoterm, tax/finance terms, bid validity and controlled deadline.

**Approval sequence (separate events):**
`RFQ_DRAFT` -> `TECHNICAL_REVIEW` -> `COMMERCIAL_REVIEW` -> `APPROVED_FOR_DISPATCH` -> `DISPATCH_INTENT` -> `PROVIDER_SENT` -> `RESPONSE_RECEIVED` -> `SCAN/INGEST` -> `VENDOR_REVIEW` -> `COMPARE` -> `SCENARIO_UPDATED` -> `AWARD_RECOMMENDED` -> `PO_APPROVAL`. Any rejection/withdrawal/expiry creates an explicit branch and audit trail.

**Two-way messaging:** an outbox/dispatch adapter must enforce signed, exact-recipient, immutable-version authorisation and dedupe keys before sending through the system. Inbound provider events must prove sender, provider message ID, project/RFQ/vendor and document hashes, scan attachments, parse differences and preserve original content. Provider identity checks are external adapters, not text fields supplied by a vendor.

**Supplier evaluation:** compare identical technical units and currency using landed cost, VAT separate, lead time, equipment condition/fit, payment/deposit, warranty/after-sales, compliance, delivery terms and validity. Outlier and alternative-bid exceptions require review. Never accept automatically.

**Prohibited shortcuts:** no direct send from an AI tool without an approval event, no automatically executed award/PO, no provider callbacks that bypass tenant/project authority, no quote replacement of approved unit costs before independent sign-off.

## 7. Commodity Trading as a first-class ResourceOS workflow

**Taxonomy:** Class → Category → Resource → Material Type; terminology and process stages change with material. Raw Chrome ROM requires yield and Wash Plant/Tolling; saleable maize has Storage/Handling/Packaging, no fabricated wash stage. Supporting sales products: Chrome, Manganese, Coal, Lithium, with expansion by evidence.

**Pricing and finance:** dated weekly export-parity engine `CIF China - ocean/insurance = FOB SA - port/inland/handling/assay/finance = FOT/ex-warehouse`; buyer PO/contract confirmation overrides advisory prices for actual trade. Separate feedstock vs concentrate assay costs; exact moisture/grade and payable assay; purchase ceiling, working-capital days, contingency and target margin; stop on negative surplus and missing values.

**Physical route:** supplier site → stockpile/proof → plant/tolling if raw → warehouse (Brits basis where approved) → buyer/offtake → weighbridge/sampling/assay → 90%/10% payments **only where the controlling agreed HMS route explicitly applies**. Do not make that route universal across all buyers or commodities.

**Fleet:** asset-backed owned/leased/hired/inactive `truck_assets`; historical SAR-TIP-001/002 are seeds, not total company capacity. Calculate available loads and assign drivers/trailers/transporters from verifiable records, enforce insurance/compliance and residual outsourcing, and reconcile loading/delivery evidence.

## 8. Mining & Contract Services as a first-class ResourceOS workflow

Start with unbegun project scope and verified commercial entitlement. Apply source-linked BOQ parsing, equipment/plant/crew capacity; simulate own vs hired/hired-in equipment and subcontractors; plan permits, mobilisation, fuel, site hours, productivity and critical-path contingency; RFQ OEMs, machinery and services with approval; ingest quotations and re-run cases; issue human-approved client proposal and execution plan; monitor actual works, variations and certified completion.

No assumption of existing mine ownership, legal mining rights or a statutory engineering practice.

## 8A. Native ResourceOS Document Studio — first-class system capability

ResourceOS must provide a **futuristic, accessible first-party document viewer/editor and corporate template library**. Operators must be able to prepare, revise, assemble, view and professionally brand internal, client-facing and third-party engagement documents **within ResourceOS**, without requiring Microsoft Word or other external editors. PDF/DOCX import/export and secure collaboration are supported by controlled adapters when approved; internal rich editing remains the default.

This includes supplier RFQs, client commercial proposals, tender packs, project feasibility documents, minutes, correspondence, counterparty letters and financial/operational supporting reports. Document identity must link to projects, route/parcel, counterparty, controlling source evidence, approval and exact issuing version. Documents may contain structured blocks, tables, metadata, images (official asset only), comments, citations/evidence references and generated source-authorised values.

**Design:** Dark executive command shell, high-precision gold accents and a clean, printable branded A4 paper canvas. Approved public website navy `#04111F`, `#07192F`, gold `#C2A14A`, original SAR emblem/wordmark only, no fake stamp/letterhead or invented corporate details. Printing/exports must separate draft from authorised issue.

**Authorisation:** Prepare/draft, technical and commercial review, revisions requested, approved, issue authorised, sent and acknowledged are independently recorded stages with RBAC/RLS, source hashes and immutable audit trails. Neither the AI, document editor nor a local export operation is permitted to issue an RFQ or a PO. A signed, reviewed RFQ is only released via provider after a separate dispatch authorisation.

**Current state:** `app/documents/studio/page.tsx` is a native **session-only structured editor**, supported by `lib/document-studio.ts`, while existing `/documents` parcel evidence readiness remains intact. Editing, preview, template switching, local JSON draft backup and safe draft HTML/A4 printing exist at source level. Secure persisted library, rich inline formatting, comments, tracked changes, multi-user collaboration, original PDF/DOCX editing, official logo binary packaging, controlled PDF/DOCX generation, signature/issue and live ingestion are not yet accepted. Full design and staged release requirements: [Document Studio engineering blueprint](08-RESOURCEOS-DOCUMENT-STUDIO.md), [brand/template standard](07-DOCUMENT-DESIGN-AND-TEMPLATES.md).

## 9. Security and acceptance

All persistence and commands require correct SAR backend identity, project-level permission, least privilege, evidence integrity and audit logging. Separate SAR internal operator roles from DealScope customer tenancy. Use signed event IDs and transactional outbox; treat external email and webhook content as untrusted. Secure stored source documents, provider attachments, bank information and personally identifiable information; enforce retention/withdrawal.

**Acceptance requirements:** source-linked real document tests, accurate BOQ extraction, multi-work-package simulation independently checked, bottleneck and stochastic evaluation with recorded assumptions, human review/approval denial tests, RFQ dispatch with fake provider plus real provider sandbox, supplier response correlation and malware scanning, reforecast preservation, source-to-assay-to-payment reconciliation, backups/restore, security and cross-project access rejection. See [macro tests SIM-01–SIM-12, RFQ-01–RFQ-12](../2026-10-27-sar-consolidated-carryforward.md). All true end-to-end gates are OPEN.

## 10. Work still missing to claim “entire ResourceOS architecture documented”

- Formal data dictionary and physical ERD, migrations, event schemas, state transition tables and access matrix approved against **actual** SAR database.
- Approved document-class extraction prompts, model evaluation dataset and human review processes; drawings/geology/hazards interpretation methodology.
- Detailed real mine/project resource constraints, crew shifts, maintenance, geospatial paths and cash/contract scheduling.
- Approved organisational delegation thresholds and separate procurement/contract/financial approval credentials.
- Source-based operational SOPs for assay, custody, weighbridge, plant, fleet, exceptions and settlement.
- Independent fully reproducible build/evaluation, security and disaster recovery runbooks.

**This blueprint is the complete intended system outline currently recoverable from committed SAR direction; it is not a declaration that all engineering, schema or SOP specifications have been finished or ratified.**
