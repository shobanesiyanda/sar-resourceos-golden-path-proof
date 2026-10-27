# DealScope — SAR-Owned External Commercial Intelligence and Exchange Architecture

**ID:** SAR-DSC-ARCH-001 • **Legal owner:** Shobane African Resources (Pty) Ltd • **Revision:** 2026-10-27 / v0.1  
**Status:** Founder-ratified intended product architecture; detailed legal/customer/technical release sign-off remains OPEN. The DealScope web preview exists; **no DealScope Supabase project, customer database, live paid subscriptions or transactional Exchange exist yet**.

## 0. Current public independence directive — 28 October 2026
Public-facing DealScope branding, signed-out app, accounts, copy, SEO, screenshots, shared link previews, emails and external documents must have NO Shobane/SAR name, ownership attribution or corporate product link. This does not change the currently evidenced internal SAR legal ownership; the operation cannot truthfully offer customer purchases under a fictitious entity. Require an independently registered/verified DealScope legal supplier and separate compliant merchant, invoicing, terms, contacts and consumer disclosures before live sales under a zero-Shobane public identity. Until resolved, marketing is informational, signup/paid features and legally binding services are HOLD. See [DealScope public brand/entity separation rule](14-DEALSCOPE-PUBLIC-BRAND-AND-ENTITY-SEPARATION.md).

## 1. Product identity, mandate and legal boundary

DealScope is SAR's independent **external customer-facing** commercial intelligence and opportunity/transaction platform, implemented under `apps/dealscope` in the current controlled draft. It is not a corporate website page, not simply an SAR staff dashboard and **not owned or operated by Possent Systems**.

Its competitive proposition: help customers identify **verified, actionable and profitable** physical product opportunities through source evidence, buyer and seller verification, precise route economics and disciplined acquisition price ceilings. An arithmetic pass on self-entered assumptions must not be published as a verified live deal.

**Ownership vs access:** SAR is the product's legal owner and commercial operator; this does not confer default permission on SAR commodity traders to read confidential unrelated buyer/seller tenant records. The DealScope customer database must be separately secured from SAR ResourceOS and the website.

## 2. Intended product architecture

```text
[Customer Web & future Mobile/Responsive Experience]
          |
[Account identity, verified organisation, member roles]
          |
[Subscription/PAYG Entitlement -> Request Scope -> Usage Ledger]
          |
+---------- DealScope Application Services ------------+
| Opportunity Discovery / Evidence / Commercial Signals |
| Commodity Classification and Reference Prices         |
| Deal Runs / Route Comparison / Viability & Acquisition |
| Qualified Opportunity Register + Rejection Audit       |
| Seller Offer + Buyer Workspace / Disclosure Approvals  |
| RFQ/Negotiation Requests (human-controlled where used) |
| Notifications / Entitlements / Invoices / Disputes     |
+--------------------------------------------------------+
          |
[Server Auth + Tenant RLS + Provider Adapters + Audit]
          |
[New Dedicated SAR-Controlled DealScope Supabase Project]
          |
[Licensed Merchant Processing under SAR Legal Identity]
```

Shared calculation code may be imported from versioned `packages/commodity-core` and `packages/commercial-core`. **Shared code never implies shared tenant data, admin role, database, service key or merchant.**

## 2A. Explicit full-suite preservation and repeat-value lifecycle

**Founder correction (27 October 2026):** DealScope must NOT be reduced to PAYG-only analysis. The full original deal-intelligence and exchange suite is mandatory, and a commercially viable platform should create recurring real value for users rather than repeatedly charge for unchanged arithmetic. Build all original domain capabilities in their authentic dependency order; permit independent monetisation/release of components only after full scope preservation and applicable acceptance.

The customer Opportunity Intelligence Workspace shall support a private evolving dossier, source/sample/lab evidence and chain-of-custody references, buyer and seller indications, provenance and validity, cost and route modelling, multiple immutable Deal Runs, reasoned delta comparisons, acquisition-ceiling movement, risk and profit/capital monitoring, manual refresh and alerts when genuinely new evidence changes viability. Important: an economic pass on client-supplied assumptions remains *user-input indicative*; only independently verified and permitted evidence may qualify a third-party-facing opportunity. Alerts suggest a reassessment; they do not charge credits, share data or execute trades automatically.

The complete Commercial Exchange retains verified buyers/sellers, listings, seller rights and mandates, price/stock validity, recipient-scoped disclosure consent, enquiries, counteroffers/negotiation, contract/deal states, finance reconciliation, disputes and revocation. DealScope may charge for analysis without tying its fee to a successful trade, but must meet defined service-delivery, privacy, refund, contractual and regulatory obligations. No automatic Exchange entitlement arises solely from buying analysis.

**Full suite:** DiscoveryOS / Market Intelligence, EvidenceOS, Opportunity/DossierOS, Scenario/Viability Engine, MonitoringOS, CounterpartyOS, ExchangeOS, Commercial Workflow, PAYG & Subscription Billing, Customer/Identity Admin, Reporting/Analytics/Support, Audit/Security. These are logical capabilities, not automatically separate applications or databases.

## 2B. Deal IntegrityOS is central, not an optional bolt-on

A commercially viable arithmetic calculation is insufficient. Every opportunity should have an independent **integrity and credibility investigation**, explaining claims about parties, lawful material title, selling mandates, sample and laboratory evidence, buyer authority, source documents, stock and banking instructions with each separate evidence state and documented how-to-verify next step. More guidance and the twelve-check architecture are in [SAR-DSC-INTEGRITY-001](11-DEALSCOPE-DEAL-INTEGRITY-OS.md). Integrity, Viability and Readiness are three separately explainable decision layers. Public criminality/blacklist scores and promises that a transaction is legitimate are explicitly prohibited. The platform should not infer crime from missing evidence; provide correction and human-review paths. The complete Discovery/MarketOS, Deal Runs, saved dossiers, Commercial Exchange, subscriptions/PAYG, reporting and operations remain in scope.

## 2C. Public dealscope.co.za acquisition and one free complete Deal Assistance & Assessment cycle
DealScope requires an independent **signed-out conversion experience**, distinct from the authenticated intelligence workspace and SAR corporate supplier acquisition. The public promise remains **Know what you're dealing with before you commit.** The Founder replaced the historical 30-day unlimited trial on 28 October 2026: eligible first-time customers receive **ONE complete deal assistance/preparation/integrity/viability/readiness/report cycle** for one defined opportunity, not thirty days of unlimited Deal Runs. An independently authorised campaign may grant a second complete cycle, but it is not a default. This is a service-usage entitlement, not a separate inferior software edition. Public architecture: [acquisition 12](12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md), [active trial offer 13](13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md).

Public routes in the current development branch: / marketing homepage; /integrity unverified guided self-check; /runs retained self-entered calculation; /exchange unavailable transaction gateway; /start preview-only trial onboarding. No actual signup, trial, verified case, payment or live Exchange is created. Do not put a false "Create Account" success action on /start before dedicated Auth/tenant RLS and durable entitlement issuance. Authentication and commercial monitoring remain company-local DealScope systems, not shared with SAR ResourceOS. All core suite modules are available to an eligible activated trial under the same legal and evidence controls used by paid accounts; no trial-only feature withholding.

Introductory cycle states: eligible -> independently verified identity/entity -> atomic grant of ONE full cycle -> reserve one dossier -> source-bound integrity, viability and readiness stages -> complete delivered report -> free cycle consumed; service failure recredits exactly once. No time-based unlimited activation. Person/organisation uniqueness, case identity, additional approved campaign and mandatory permissions must be backend-enforced. No automatic charge.

## 3. Identity, customer and trust model

- Authenticated person belongs to one or more **verified organisations** and holds an explicit role and membership state. Never trust browser-supplied organisation IDs alone.
- Roles planned for buyer, seller, analyst, admin/owner and viewer require separate permission contracts; role names alone do not grant unreviewed disclosure or financial rights.
- Verification: legal counterparty, company authority, beneficiary/mandate and material/buyer capacity as relevant. Corporate identifiers, banking and individual data require secure storage, lawful processing and retention rules.
- Tenant isolation: per-record organisation IDs and explicit disclosure grants. Policies must check **active membership**; no unrestricted authenticated read.
- Customer onboarding, session management, invitation controls and revocation must pass cross-tenant and denial tests.

**Current state:** Dedicated database schema in `apps/dealscope/database/initial-schema.REVIEW-ONLY.sql` and its README is only a design. The only currently connected Supabase organisation was TenderDesk, which SAR must **not** use. The correct next infrastructure step is SAR-owned Supabase organisation access/provisioning.

## 4. Core DealScope services and canonical record classes

### DSC-01 Opportunity acquisition and market intelligence

Inputs: grounded buyer demand, supplier stock/mandate, public/contract price sources, port/road/plant/lab rates, locations, time, availability, quality and currency. Preserve issuer, observed and valid dates, confirmation level, technical specification and permissible disclosure. Automated sourcing and alerts may propose candidates; they never invent counterparties or claim live buyability without evidence.

### DSC-02 Commodity/route model and Deal Run

For each hard/soft commodity, classify stage and unit, saleable vs raw/feedstock, grade/assay, amount, yield, price basis, acquisition, process, transport, finance and other costs; calculate gross surplus, financing, pre-tax net profit, margin, acquisition ceiling, break-even sensitivity, lead time and required capital.

**Validity:** reject invalid/missing dates, NaN/overflow, negative or unsupported prices, broken conversions and hidden processing yields. A consumer scenario result is a **calculation** until independently verified evidence and buyer status justify a commercial qualification.

### DSC-03 Evidence-qualified deal register

**Visible shortlist rule:** publish only items that pass all grounded economic, availability, mandate, buyer and margin/capital filters with sufficient route to execution. Suppress break-even, loss-making, below-target and uncertain deals from the customer-facing final shortlist. Retain rejection reasons in appropriately permissioned audit. Conditional leads may be shown **separately** only where a negotiable acquisition ceiling and credible path to qualification are explicitly evidenced.

### DSC-04 Controlled Commercial Exchange

Seller creates offer with verification/ownership; privacy and legitimate selling authority checked. Buyer or off-taker accesses **only explicitly disclosed offers** based on seller consent and recipient tenant. Identity and subscription alone do not permit bulk disclosure. Interest, offer, negotiation, commercial acceptance, contract and settlement are distinct states.

Current `apps/dealscope/app/api/exchange/route.ts` fails closed (503); **do not enable it** until real tenant, payment, disclosure and audit gates pass.

### DSC-05 Entitlements, subscriptions, PAYG and financial workflow

Entitlements control usage and product capability, but payment initiation, provider confirmation, SAR merchant reconciliation, invoicing, settlement, disputes and refunds are separate authoritative states. Licensed external providers execute payment processing, and DealScope must not represent itself as a licensed payment institution.

Provider-neutral payment event contract `apps/dealscope/lib/payment-event-contract.mjs` currently validates prospective intents but **does not verify actual webhook cryptography, debit accounts, activate subscriptions or write to a database**. Implement proper signature verification, replay-safe idempotency, ledger reconciliation and legal-entity-specific receipts before any production billing.

### DSC-06 Notifications and audited customer communications

Subscription state, candidate expiry, buyer consent and enquiry status notifications require authenticated provider adapters with opt-in, communication logs and rejection paths. Do not send binding client purchase commitments automatically.

## 5. Cross-system contractual relationship with SAR

The corporate website is SAR's public identity and preliminary supplier funnel. An independently permitted supplier submission may be routed to authorised SAR ResourceOS intake with source/consent and ID integrity.

DealScope may host an external verified supplier/buyer exchange and commercial discovery. Where SAR itself elects to be a counterparty, it must use **explicit, auditable SAR-tenant/counterparty permissions**, not internal administrator bypass privileges. DealScope cannot expose private third-party prices, financial positions, client quote data or commercial strategies to the SAR ResourceOS database by default.

## 6. Data and transaction records (planned, not live)

Core target records are: `ds_organizations`, `ds_memberships`, `ds_market_evidence`, `ds_deal_runs`, `ds_offers`, `ds_offer_disclosures`, `ds_subscriptions`, `ds_payment_events`, `ds_audit_events`. Additional versioned market signals, entitlements, document consent, payout/invoice linkage, notifications and rejection logs may require further schemas once the flows are designed.

**Important:** these nine tables are a **minimum proposal**, not a complete ERD for a customer-ready marketplace. No migration has been applied, no RLS denied-user tests run, and no SAR technical Supabase organisation connected.

## 7. User journeys and proof of acceptance

| Journey | Required gates |
|---|---|
| New customer | Sign-up, verified email/identity, organisation, role, consent, entitlement |
| Self-directed Deal Run | Product/route inputs, price evidence, cost/yield tests, indication vs verified distinction |
| Deal scout/qualified register | Dated real source and buyer, availability, risk/profit/capital threshold, private rejection log |
| Seller listing | Ownership/authority, source documents, quality, validity, disclosure consent |
| Buyer visibility | Verified buyer; active tenant membership; explicit seller-approved disclosure |
| Paid access | Genuine SAR merchant provider event, paid entitlement, tax invoice and ledger match |
| Purchase/fulfilment | Independent verified contract, inventory, custody and payments; no auto binding execution |
| Refund/dispute | Provider reference, authorisation, reversal/reconciliation and immutable events |
| Recovery | Restore of customer/member/payment/disclosure records, log and RLS retest |

**Current overall result:** source-only demo/calculation and independent pure-module tests exist; **customer registration, transactional Exchange, payment acceptance, DB/RLS and independent full-system build remain unaccepted**.

## 8. Open product specifications

Founder-approved pricing/licensing and packaging; actual provider selection, settlement route and country/payment regulatory treatment; offer and listing terms; verified source/provider agreements; legal privacy/POPIA retention framework; role-level permission matrix; abuse and dispute rules; app-scale cost/observability targets; full database schema and backup/restore; production sign-off.
