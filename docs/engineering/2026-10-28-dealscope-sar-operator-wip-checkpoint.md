# DealScope Operator Attribution and Deferred Incorporation — 28 October 2026
**Checkpoint:** SAR-DSC-BRAND-20261028-002-ENGINEERING
**Authority:** Latest Founder direction SAR-ADR-020; replaces old SAR-ADR-019 branding terms.
**Branch:** migration/2026-10-22-dealscope-resourceos
**Release:** Draft only; no mainline/production promotion, Auth, verified evidence, online payments, or live customer transactions.

## Founder rule
DealScope's public customer identity/brand is approved only **as a work in progress**. Do not create or require a separate DealScope company until independently evidenced product merit warrants that decision. Keep SAR the truthful actual legal operator, with small, legible footer attribution 'Operated by Shobane African Resources (Pty) Ltd' and a working /legal company-information link. DealScope product marketing, hero, navigation and experience remain DealScope-only. Footer/legal presence is not a disclaimer to hide necessary statutory company, address, price, contact and contractual particulars for future commerce.

## Committed current changes
1. apps/dealscope/app/page.tsx — revised legal/footer line and /legal link.
2. apps/dealscope/app/start/page.tsx — identical legal/footer principle and /legal link.
3. apps/dealscope/app/landing.css — .ds-legal low-emphasis readable font, contrast, accessible legal anchor/focus.
4. apps/dealscope/app/legal/page.tsx — new route for current legal operator, disclosure-prepared without inventing company registration, address, phone, tax or bank data, clear development preview.
5. apps/dealscope/test/public-website.test.mjs — brand remains DealScope in main marketing; SAR allowed only in footers/legal page; metadata other public routes no parent mention; linked /legal styling.
6. docs/architecture/14-DEALSCOPE-PUBLIC-BRAND-AND-ENTITY-SEPARATION.md completely rewritten to current requirement with previous decision provenance.
7. docs/architecture/06-DECISION-REGISTER.md SAR-ADR-020 active, 019 recorded as superseded; docs/architecture/00-START-HERE.md, 03, 04, 05, 12 and apps/dealscope/README.md reconciled.
8. shobanesiyanda/sar-website, redesign/full-corporate-website-oct-2026, docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md section 11 replaced with current rule and earlier trial/brand chronology.

## Evidence
Exact GitHub-fetched files used in static source harness: 8/8 public-site tests passed; homepage's nonfooter marketing has zero Shobane mentions; footer contains exact lawful operator; /legal route exists and discloses exact operator. **Not** a native Next.js clean build, browser audit, current domain inspection or legal compliance certification.

## Unresolved independent acceptance
- Verified SAR legal registration number, corporate physical and service addresses, phone/email, officer/registration data to extent required by law; trading/business name treatment for DealScope branding.
- Statutory website legal pages, Terms, POPIA Privacy, security, professional/verifier limitations, no fraud-guarantee wording, disclosures, cancellation and refunds, VAT/prices, governing agreements.
- Actual SAR merchant/provider acceptance, bank settlement, company financial segmentation/DealScope cost centre and statutory invoices; existing pure module legal name is correct but no live payment contract confirmed.
- Actual standalone DealScope website/domain release, real client Auth/database/RLS, tenant isolation, first free complete assisted deal cycle, real evidence verification, production QA.
- Product merit/market evidence to assess only LATER whether incorporation helps: verified conversions, paid repeat users, contribution margins, liability exposure, separate finance/investment and commercial contracts. No automatic registration.
- PR #1 stays open draft. No authorised release.
