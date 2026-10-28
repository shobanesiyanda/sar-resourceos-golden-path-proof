# DealScope — Standalone Brand, SAR Legal Operation and Statutory Disclosure
**Control:** SAR-DSC-BRAND-20261028-002
**Revised:** 28 October 2026 (SAST)
**Owner:** Shobane African Resources (Pty) Ltd
**State:** FOUNDER-APPROVED CUSTOMER IDENTITY AS WORK IN PROGRESS; code and documentation on draft development branch. Not an approved live service.
**Supersedes:** SAR-DSC-BRAND-20261028-001 and previous zero-mention/mandatory standalone-incorporation direction (ADR-019). Retain earlier versions in Git history for provenance, but do not apply their conflicting policy.

## 1. Current Founder decision
DealScope operates as a **distinct customer-facing product and service brand of Shobane African Resources (Pty) Ltd** while the commercial concept is proven. **DO NOT incorporate a separate DealScope company at this stage** merely to launch or continue engineering. Corporate restructuring or a distinct operating company is a future explicit business decision if proven revenue, repeat customers, costs, strategic investment, liability allocation or comparable evidence justifies it. No automatic incorporation threshold has been approved.

DealScope brand identity and value proposition are presented as DealScope alone. The headline, hero, logo, menu, product capability cards, marketing journeys, account experience, market reports and ordinary promotional content must not advertise SAR's resources company. The relationship is truthfully and **discreetly** disclosed in a small but legible site footer and accessible legal/company information page. The parent does not acquire access to other customers' protected opportunities simply because it owns the product; independent multitenant Auth, RLS, privacy and permissions remain mandatory.

## 2. Customer-visible source of truth
Suggested/implemented footer language:
**© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · Legal information**
The legal-information link leads to a clearly accessible dedicated page giving the truthful currently known operator, without inventing statutory registration numbers, service addresses, email, phone, VAT number, shareholders, bank or officer names. Page and footer must remain easily legible, keyboard accessible and available on mobile.

Public product identity is **DealScope**; there is no requirement for a linked parent corporate logo or a corporate website link. Maintain the distinction between marketing attribution (light) and legally required supplier details (complete). It is acceptable that the legal page identifies the operator prominently as a matter of accurate statutory transparency. Do not claim 'DealScope (Pty) Ltd' or describe a nonexistent independently registered legal person. Commercial offers, invoices, contracts, refunds, privacy notices, payments and service of documents must name the actual SAR contracting legal entity until an approved lawful entity change.

## 3. Business and finance architecture
- Legal operator and (subject to provider acceptance) prospective merchant: **Shobane African Resources (Pty) Ltd**. Keep truthful existing SAR legal-entity pinning in the current pure payment candidate contracts rather than substituting an invented DealScope merchant. Verify SAR's processor registration/contract, settlement bank account, tax treatment and suitable business activity before accepting any payments.
- **Brand autonomy is not a separate accounting entity.** Track DealScope as an attributable business/product segment with distinct revenue, costs, contribution margin, third-party-verification fees, customer acquisition cost, support costs, credits, refunds and liabilities in SAR books. Use separate financial segments/cost centres and reconcilable journals, not a fabricated separate statutory ledger/company.
- DealScope customer data, tenant permission model and hosted database remain ring-fenced from ResourceOS internal commercial data; existing privacy separation and no-access guarantees are not relaxed.
- Staff using SAR internal ResourceOS cannot simply view DealScope customer dossiers without a named authorised DealScope role, independent consent and an auditable business reason.
- Keep dedicated DealScope domain, sales acquisition, support communications, product presentation, external CRM and help identities as far as operationally possible, but the statutory supplier and merchant owner must be disclosed where required. Do not reuse TenderDesk, Possent or BidOS accounts or merchant keys.

## 4. Statutory and consumer disclosures — mandatory launch gate, not a separate-company gate
South Africa's Electronic Communications and Transactions Act 25 of 2002 section 43 requires (where it applies) information including the supplier's full legal name/status, physical and electronic contact particulars, registration/office-bearer details, pricing, terms, remedies, privacy and payment information to be available through the website for electronic transactions. Consumer Protection Act section 79 has business-name/supplier identification obligations, subject to applicability and legal review. Sources:
- https://lawlibrary.org.za/akn/za/act/2002/25/eng@2021-12-01
- https://lawlibrary.org.za/akn/za/act/2008/68/eng@2015-03-13
Verify applicable statutory scope, regulations and current legal counsel guidance before launch. A small footer alone is **not** sufficient to satisfy the complete electronic-commerce disclosure rule.

Before live paid signup, contracting, invoicing, payments or live Exchange: verify exact SAR registration number, registered and physical/service addresses, telephone and email, domain ownership, business/trading-name treatment, legal terms, privacy/POPIA notices, complaints/disputes, cancellations and refunds, service delivery timeframes, prices/VAT/tax representation, staff/officer/issuer disclosures where applicable, and provider merchant approval. Publish these verified particulars in an accessible legal/contact policy surface and provide accurate supplier identity on applicable agreements, receipts and financial documents. Do not invent data or falsely imply regulatory acceptance.

## 5. Public website scope/technical acceptance
- apps/dealscope/app/page.tsx: DealScope brand-led marketing with subtle footer legal operator identification, accessible /legal link and development preview notice.
- apps/dealscope/app/start/page.tsx: same minimal truthful footer and accessible legal link.
- apps/dealscope/app/legal/page.tsx: dedicated actual-operator identification; explicit current preview and outstanding verified statutory disclosure gate.
- apps/dealscope/app/landing.css: legible low-emphasis styling and keyboard focus outline.
- apps/dealscope/test/public-website.test.mjs: asserts SAR name only in the footer or legal page, not hero/menu/feature cards/app metadata; no reciprocal SAR-domain marketing link; no fabricated independent company.
- Do not imply customer registration/merchant verification/Exchange transactions work before true backend, independent evidence providers and tests.
- Responsive mobile/desktop, legal route, cross-navigation, contrast, noindex release controls, security/tenant tests and complete build/browser acceptance remain open.

## 6. Future possible standalone company review
Separate incorporation may be considered only on a subsequent Founder-controlled business case with defensible customer numbers, paid repeat usage, unit economics and cash flows, service liability, legal/risk exposure, buyer/seller independence, equity/investor funding or investment structure. The group may then evaluate IP licensing/assignment, tax/accounting, banking, contracts, payment tokens/settlement, employer responsibilities, customer migrations, company notices and data-protection impact. **No separate DealScope entity is authorised or implied now.**

## 7. Controlled change history
- **28 October 2026 early:** SAR-ADR-019 originally demanded zero SAR mentions in all public DealScope surfaces and treated independently incorporated DealScope merchant/entity as a launch prerequisite. This is **superseded**.
- **28 October 2026 latest instruction:** Founder approves the DealScope customer-facing identity as a work in progress, **defers separate legal incorporation pending merit**, and specifically authorises subtle visible Shobane African Resources attribution in site footer to accurately identify the legal operator. Recorded as **SAR-ADR-020**, which controls all conflicting references.
- Mainline and production promotion are still held pending complete customer-facing, legal, product, security, finance and acceptance approvals. There is no claim that live merchant or independent verification exists.
