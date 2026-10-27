# SAR Enterprise Systems — Boundaries, Data Authority and Integration Contracts

**ID:** SAR-XSYS-001 • **Owner:** Shobane African Resources (Pty) Ltd • **Revision:** 2026-10-27 / v0.1  
**Status:** Founder-ratified cross-system boundary specification; backend integration and security acceptance still OPEN. Defines the intended boundaries; does not claim working connectors or databases.

## 1. Product boundary register

| Product | Purpose | Authoritative business data | Legal / operator rule | Source of truth |
|---|---|---|---|---|
| SAR Corporate Website | Public identity, B2B marketing and preliminary supplier/buyer/partner enquiries | Approved page content, current general and Chrome contact submissions | SAR corporate identity; not public proprietary software marketing | `shobanesiyanda/sar-website` approved master build map |
| SAR ResourceOS | Internal commercial, project-intelligence, procurement, physical operations, approval and finance management | SAR controlled project/parcel, counterparty, contract, plant/fleet, documents, approvals, costs and reconciliation | SAR-only internal identities, project permissions and financial authority | `shobanesiyanda/sar-resourceos-golden-path-proof` approved architecture documents (draft stage until signed) |
| DealScope | SAR-owned external multi-tenant commercial intelligence and commercial exchange | External customer identity/roles, private Deal Runs, verified seller/buyer opportunities, disclosures, entitlements, payments | SAR legal ownership; tenant privacy/consent and merchant/legal separation from unrelated third parties | `apps/dealscope` with separately provisioned SAR-owned database (currently missing) |
| Shared domain packages | Source-neutral calculation and evidence validation | Versioned catalogue schemas, route maths, price/evidence types, scenario engines | Libraries do not authenticate users or open database access | `packages/*`, with tagged versions, tests and provenance |

**Possent Systems is unaffiliated.** TenderDesk/BidOS infrastructure, accounts, merchant processing and private source are not substitute SAR resources.

## 2. High-level flow

```text
PUBLIC                 SAR INTERNAL                   EXTERNAL DEALSCOPE
Corporate Website -> SAR Intake Gateway -> ResourceOS        DealScope Customer
 supplier/buyer        identity, consent      |          -> Auth + Tenant Gate
 service/contact       dedup + provenance     |          -> Evidence + Deal Run
                                          Trading + Mining  -> Qualified Register
                                          Project Modelling -> Offer/Disclosure
                                          RFQ/Execution      -> Payment Provider
                                          Finance/Audit      -> Customer Ledger
                                                ^                |
                                                |-- permitted, consented, source-
                                                    labelled commercial handoff only
```

**The website does not become an independent stock exchange or provider of live commodity prices.** DealScope is an external product, not a website subsection; ResourceOS is private and must not be directly queried from the public browser.

## 3. SAR supplier/customer intake contract

**Required envelope:** `submission_id`, `idempotency_key`, `source_system`, `source_route`, `received_at`, `consent_version`, `contact/organisation`, `material/requirements`, `evidence_references`, `document_hashes`, `risk_flags`, `processing_state`, `route_to_owner`, `audit_events`.

Flow: supplier submits on `/sell-to-sar` (non-Chrome) or specialist `/sell-to-sar/chrome`; website API validates fields/risk, stores only in the correctly provisioned SAR website/intake storage; a separately authorised SAR integration consumes a **deduplicated, source-labelled event** into ResourceOS review, with no automatic order or buyer allocation. Buyer and services/contractor enquiries have own categories. Chrome feedstock/concentrate thresholds must never be forced on manganese, coal or other commodities.

**Data boundary:** Explicit, logged data minimisation. A non-Chrome enquiry is not a confirmed sale; lack of stock evidence or selling mandate is a hold, not success.

## 4. DealScope ↔ SAR handoff contract

- DealScope customer input is owned by the appropriate DealScope customer tenant in **its dedicated database**.
- An external supplier can authorise specified information to be disclosed to a named prospective counterparty (which may be SAR). Disclosure needs specific recipient, offer version, permitted fields, expiry, tenant authorisation and audit.
- SAR's internal team may open an explicitly disclosed offer using a controlled SAR client identity. It cannot query all DealScope buyer histories through organisational ownership.
- Any SAR purchase/transaction that results must enter ResourceOS as a **new independently reviewed commercial opportunity**, with own price, sample, custody, contract and finance controls.
- A permitted shared market/reference signal may be reused without leaking another tenant's private quotes, lead sources, customer lists or financial data.
- Never join the SAR internal database directly to DealScope's database with unrestricted service roles.

## 5. Source and calculation authority — no hidden truth substitution

| Data class | Record of authority | Reject / revalidation rule |
|---|---|---|
| Corporate identity, public pages, photos/logos | Approved SAR website master content/assets | No unapproved logo, public fictitious contract or internal product claim |
| Project original SOW, BOQ, drawings | Immutable original artifact + professional-reviewed extraction | Never use hallucinated units or undocumented scopes as facts |
| Market indicative price | Dated, sourced signal and valid unit/incoterm | Cannot supersede executed buyer PO price silently |
| Buyer confirmed price/terms | Actual buyer-signed PO / agreement revision | Month/order-specific; no invented counterparty or price |
| Processing yield / assays | Source documents, third-party lab reports and recorded production | Distinguish mass yield, grade, metallurgical recovery |
| Machinery/contractor quotations | Original returned message/attachment, project/RFQ/vendor correlation | Provisional until independent technical and commercial review |
| Trucks, crews, plant and warehouse | Actual asset/availability/compliance and capacity record | No seeded demo values used as real active capacity |
| Project financial approvals | Signed delegation/authorised accounting evidence | No auto-authorised commitments from AI or simulations |
| DealScope customer entitlements | Verified licensed-provider events + correct tenant subscription ledger | Never grant from browser callback or unverified webhook |
| Customer offer disclosures | Seller consent, buyer role/tenant, audit | No SAR administrative blanket override |

## 6. Cross-system event control standard

A legitimate external integration must include a **contract version**, source and target ownership, original object/version IDs, event and idempotency keys, timestamp, input/schema validation, immutable source hash, authenticated producer, recipient authorisation, replay/tamper handling and audit trail. Use durable outbox/inbox and retry rules; don't equate a generated email draft with a dispatched message.

**Mandatory split:** `PREPARED`, `REVIEWED`, `APPROVED`, `SENT/PROVIDER_CONFIRMED`, `RESPONSE_VALIDATED`, `POSTED/RECONCILED` are different evidence states.

For external provider effects (emails, payment webhooks, e-signature, freight bookings), use explicit adapters and verified callbacks, not direct model-generated “success” flags.

## 7. Security and privacy

- **Physical separation:** DealScope separate SAR-controlled Supabase project from ResourceOS; organisation ownership confirmed SAR; technical Supabase organisation/ref not connected yet.
- RLS + server authorization; membership checks independent of caller supplied tenant ID; storage policies; no secret keys in browser or docs.
- PII/financial data minimised, protected and retained under an approved POPIA/legal basis.
- Project-level permissions for sensitive mining tenders, proposals, acquisition prices and quote comparisons.
- Do not use an unrelated Possent/TenderDesk backend, payment account, repo or deployment to fulfil an SAR workstream.
- Negative security acceptance must include wrong tenant, revoked user, forged approval, replayed event, expired quote, unscanned attachment and missing contract entitlement.

## 8. Required architecture and release proof

Reproducible build of website, ResourceOS and standalone DealScope separately; database and storage recovery; test-account/RLS denial; provider sandbox cryptography and idempotency; document -> reviewed model -> scenario -> RFQ -> quote -> revised scenario -> human award -> operational actuals -> finance reconciliation; SAR public enquiry -> protected internal intake; DealScope external customer -> verified qualified deal -> consented disclosure -> paid entitlement where required.

No source package, architectural drawing or READY preview satisfies all of these tests on its own. Approval and deployment remain separate Founder-controlled gates.

## 8A. Public DealScope customer funnel and trial identity are a SEPARATE trust zone
The public acquisition domain is intended as **dealscope.co.za**, independently owned/managed under SAR's product, not the corporate **www.shobane.co.za** website and not SAR ResourceOS. On the same DealScope application, signed-out marketing (/, /integrity, /runs) must not read private buyer/seller records. Authenticated post-registration customers enter their own DealScope tenant-bound workspace, receive an independently eligibility-verified 30-day full-feature trial and may make an explicit paid conversion. The current /start route is a preview of onboarding and does not collect personal details or activate accounts.

Required customer-side commands and legal source:
- Referral landing -> public navigation -> customer consent + independent DealScope registration (private tenant) -> identity/organization verification -> atomic trial eligibility and grant -> full suite feature and role security -> Deal Run / Integrity Case / Watch / Exchange specific consent -> explicit PAYG or subscription purchase -> DealScope merchant/cash/ledger verification -> retention and audit.
- No customer UTM, trial identity proof, personalised price, mandate, stock/document evidence, account access token, provider webhook, invoice, or private DealScope source record is permitted to flow into SAR internal ResourceOS or SAR public website merely because SAR owns DealScope.
- A specifically disclosed deal can become a NEW independently reviewed SAR ResourceOS intake only through the previously approved tenant+seller-authorised handoff, never direct database joins.
- Provider-neutral pure code can be reused between SAR and DealScope with separate tenant/company Auth/merchant, lawful storage and audit. Any cross-company Possent/TenderDesk access is forbidden.

Link control documents: SAR-DSC-ACQ-20261027-001 (public website/business model); SAR-DSC-TRIAL-20261027-001 (full-trial entitlements); SAR-DSC-INTEGRITY-001 (claim-by-claim risk guidance); SAR-DSC-ARCH-001 (full product). Individual status: public frontend candidate implemented; Auth/database/payment/source/Exchange live acceptance OPEN.


## 9. Missing definitive engineering artifacts

Final physical ERDs, data dictionaries and migration history for existing ResourceOS/website; a **new** DealScope database reference and applied migrations; API/OpenAPI schemas for all providers; defined events with transactional outbox implementation; complete service owner and failure/recovery map; privacy impact analysis; permissions/approval matrix; operational runbooks; signed test evidence and architecture decision records.
