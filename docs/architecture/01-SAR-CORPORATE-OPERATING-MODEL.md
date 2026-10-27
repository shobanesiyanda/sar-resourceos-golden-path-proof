# SAR Corporate Operating Model, Structure and Divisional Mandates

**ID:** SAR-ORG-001 • **Owner:** Shobane African Resources (Pty) Ltd • **Revision:** 2026-10-27 / v0.1  
**Status:** Foundational architecture consolidation **pending Founder review**. Confirmed ownership and business functions are distinguished from proposed internal role assignments. This is not an approved legal organogram or delegation-of-authority instrument.

## 1. Legal identity and organisation boundary

**Legal company:** Shobane African Resources (Pty) Ltd (**SAR**).  
**Public brand:** Shobane African Resources.  
**Corporate mandate:** A principal commercial resources business that evaluates, procures, trades, develops and coordinates execution opportunities in physical commodity value chains, including mine and contracted services, using disciplined sourcing, economics, evidence, risk and technology.

- **SAR owns and controls** the corporate website, internal **ResourceOS** and external **DealScope** platform.
- **Possent Systems has no corporate, ownership, technology administration, merchant or operational relationship with SAR.**
- DealScope is a **SAR-owned product/business capability** with separately controlled external customer information. A standalone database and customer environment do **not** imply a separate legal subsidiary.
- SAR does not publicly represent that its mines, mineral rights, owned processing plants, fleet assets, permits, operating contracts or proprietary modelling services are established unless evidence supports those claims.
- Public branding is governed by the separate SAR Website Master Build Map; internal proprietary capabilities are not listed as public SaaS offerings on the SAR corporate site.

## 2. Functional operating topology

```text
Shobane African Resources (Pty) Ltd — corporate governance / Founder–Managing Director
  |-- Principal Commercial Business
  |    |-- Commodity Trading
  |    +-- Mining & Contract Services
  |-- Integrated Project Development & Feasibility (cross-business capability)
  |-- Technology & Innovation / Enterprise Systems (cross-business capability)
  |    +-- SAR ResourceOS — INTERNAL system across commercial and execution operations
  |-- DealScope — SAR-OWNED EXTERNAL commercial intelligence/platform business
  +-- Shared corporate governance: finance, treasury, risk, compliance, legal,
       procurement, counterparty verification, technology controls and oversight
```

The drawing is a **functional architecture**, not evidence of appointed departments, executives or permanent employees. Confirmed legal reporting lines, board structure, finance signatories, site organisational charts and individual role occupancy must be added with actual authority records.

## 3. Business mandates, responsibilities, operating mechanics and competitive edge

### SAR-COM — Commodity Trading (principal buyer/seller)

**Mandate:** Assess, source, buy and sell commercially viable physical commodities as SAR principal, under valid counterparties, custody, commercial mandates and payment controls. Initial active commodity page coverage: Chrome, Manganese, Coal and Lithium. Wider commodities may be assessed under verified classification.

**Accountable workflow:** opportunity discovery -> mandate/stock/counterparty evidence -> sampling/assay and grade -> price and yield model -> buyer/offtake/PO confirmation -> negotiated supplier procurement -> transport/plant/warehouse capacity -> credit/working-capital authority -> approved PO/contract -> custody/dispatch/assay -> invoice/settlement -> margin and variance review.

**Risk and control:** no invented prices, stock, buyer commitments or trade dates. Weekly export-parity pricing from CIF China less ocean/insurance to FOB SA less inland/port/handling/assay/financing to **FOT/ex-warehouse Brits**, where the delivery route calls for it. Actual HMS monthly PO governs that buyer's price, not an indicative feed. Treat source→plant and plant→warehouse transport separately. Distinguish raw feedstock mass yield from product grade; split feedstock and product assay; enforce margin and cash exposure approvals. SAR can use owned, leased, hired and outsourced fleets based on recorded availability—not a fixed truck count.

**Competitive mechanism to validate:** superior route-level intelligence, documented material and buyer rights, backward pricing discipline, end-to-end control of physical movement and working-capital exposure. These are intended operating advantages, not claims of verified live performance.

**Interfaces:** Project Development/ResourceOS scenario engine; procurement and RFQs; transport/warehouse/plant; DealScope only via specifically authorised sourcing and disclosure interfaces; Finance/Treasury for settlement authority.

### SAR-MCS — Mining & Contract Services

**Mandate:** Assess, tender, quote, coordinate and execute legitimate mining, material movement, earthworks, processing/plant and specialist industrial contract scopes through SAR and authorised subcontractors, suppliers, manufacturers or equipment hire.

**Accountable workflow:** receive SOW/RFP/BOQ/site evidence -> AI-assisted document interpretation -> source-verified work breakdown and technical dependencies -> capacity/plant/fleet/labour modelling -> baseline/downside scenarios -> procurement gap -> machine/OEM/contractor RFQs -> human reviewed dispatch -> quotation ingestion -> technical/commercial comparison -> re-simulation -> project proposal and separately authorised contract -> mobilisation and work control -> actual progress/finance/quality variance and corrective reforecast.

**Risk and control:** qualified technical/professional sign-off, safety, permit and environmental requirements, equipment suitability, availability, third-party certificates and contract authority are external human gates. The system cannot certify engineering or approve the company's contractual liability by itself.

**Competitive mechanism to validate:** model unstarted projects *before mobilisation*, test resource and cost feasibility, procure real commercial quotes and progressively refine the model, reducing unpriced scope and execution surprises.

**Interfaces:** ResourceOS simulation/Document Intelligence, Procurement/RFQ, Project Development, site delivery and Finance; commodity supply logistics where appropriate.

### SAR-PDV — Project Development (integrated cross-business capability)

**Mandate:** Convert an opportunity or unstarted project into a reproducible investment and execution decision basis. This does not imply that SAR is licensed to perform statutory professional engineering outside its actual credentials.

**Responsibilities:** assess scope/technical needs, cost and resource model, constraints, phased WBS and critical path, operating cases, working capital, sensitivity, permit dependencies, professional reviews and documented recommendation; capture explicit uncertainty and evidence sources.

**Interface:** supplies decision-ready scenarios to trading, mining contracting and authorised deal/investment reviews; no automatic project execution.

### SAR-TIN — Technology & Innovation (integrated enterprise capability)

**Mandate:** Architect, protect, develop and govern internal intelligence and connected physical/commercial workflows, with ResourceOS as the internal source of operational state.

**Responsibilities:** AI-assisted structured extraction, simulation calculation, evidence lineage, integration adapters, approval state machine, cybersecurity, mobile/desktop workflow, observability, signed release controls, reproducible tests and safe model evaluation.

**Competitive mechanism to validate:** practical, data-grounded decision systems and provenance linking proposed projects, procurement, physical actuals and financial outcomes. The technology is an operational enabler, not a separate public SAR software division.

### SAR-DSC — DealScope (external SAR-owned platform)

**Mandate:** Offer external customers tenant-isolated commercial intelligence, evidence-qualified profitable Deal Runs, and a gated multi-buyer/seller Commercial Exchange.

**Responsibilities:** customer onboarding, commercial sourcing, qualified-profit screening, dated price evidence, cost and route modelling, source/buyer verification, explicit opportunity disclosures, PAYG/subscriptions (when configured), dispute/customer support and reconciliation.

**Boundary:** SAR holds ownership of DealScope but SAR operational teams have **no automatic access to unrelated DealScope tenant data**. No DealScope database or payment onboarding is live yet. Do not list nonprofitable, break-even, unsupported or below-threshold candidates in the visible qualified shortlist.

**Commercial edge to validate:** evidenced opportunity screening and acquisition ceilings tied to *actual verified buyers and costs*, not speculative listings or fabricated profits.

### SAR-SHR — Shared governance and support functions

Cross-functional responsibilities include treasury/cash authority; accounting and financial statements; contracts and mandates; counterparty due diligence; tax/VAT and regulatory controls; information security, HR/role provisioning, marketing, supplier intake, records retention, risk register and audit. These are **necessary functions**, not assertions that staffed departments already exist.

## 4. Decision rights and segregation of duties

| Decision / event | System may prepare | Minimum required human authority (title/holder unassigned) |
|---|---|---|
| Source and interpret a technical document | Extract + cite + flag uncertainty | Qualified scope/technical reviewer |
| Price scenario and project simulation | Run deterministic/stochastic model | Commercial/technical reviewer approves assumptions |
| Prepare RFQ and select intended vendors | Draft/specification/version/recipients | Designated authorised procurement approver |
| Send RFQ externally | Prepare sealed dispatch intent | Explicit dispatch authoriser; authenticated provider |
| Ingest response | Match/scan/structure and compare | Independent validity/technical-commercial reviewer |
| Supplier award, purchase order or hire | Prepare recommendation | Separate procurement/finance/contract authority |
| Execute trading or mining contract | Prepare recommendation and package | Company signatory, funding/permit/insurance gate |
| Dispatch, custody transfer or processing | Propose resource/route assignment | Operational controller with actual assets/compliance |
| Invoice, release funds or settle | Reconcile and present exceptions | Finance/Treasury authorised signatories |
| Client disclosure in DealScope | Present permissioned approval request | Authorised tenant, explicit disclosure consent |
| Database migration, live deploy or changes of custody | Prepare controlled plan/rollback | Named technical owner plus Founder-approved release where required |

**Never infer authorised signatures, delegation limits, registered officers, payroll figures or professional credentials from a software role.** Governance matrix requires Founder-ratified named role assignments and financial thresholds.

## 5. Operating performance measures (proposed, not yet adopted targets)

Commercial: evidence-qualified opportunities, contracted tonnage, realised margin, cash conversion, exceptions, supplier/buyer quality.  
Mining/project: accuracy of simulated costs vs actuals, programme delay, machine availability, reforecast quality, RFQ response quality, HSE/quality incidents.  
Technology: source-to-model traceability, test coverage, uptime, human approval violations (=zero tolerance), risk findings and restoration performance.  
DealScope: verified profitable opportunities, qualified/declined ratios, tenant denial tests, paid entitlement reconciliation, conversion and support resolution.

Numeric targets, staffing, approved capex and client service-level commitments require separate evidence and sign-off.

## 6. Open organisation documents — do not claim complete

1. Approved corporate group/board/shareholder and statutory entity registers.
2. Formal organogram by division and site, named roles and reporting relationships.
3. Job descriptions/competency matrices, appointed technical reviewers and operator limits.
4. Delegation of authority, bank signatory matrix and company contracting thresholds.
5. Procurement, supplier onboarding and tender governance manuals.
6. Safety/environmental/land-use/professional-service and insurance compliance matrix.
7. Finance, tax, treasury, payment, counterparty verification and audit SOPs.
8. DealScope pricing/licensing/customer terms, privacy notices and provider merchant agreements.
9. Versioned KPI catalogue and management reporting framework.

Until these are recovered/approved, this file is a comprehensive **functional business operating model**, **not** a fully signed organisational constitution.  
