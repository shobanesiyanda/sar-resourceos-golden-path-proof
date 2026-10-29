# SAR DealScope — Legal, Privacy, Commerce & VAT Engineering Macro Checkpoint
**Checkpoint:** SAR-DSC-LEGAL-MACRO-20261028-001
**Date:** 28 October 2026 (SAST)
**Status:** Source+documentation committed to controlled draft branch. **NO production, lawfully effective customer contract, customer signup, payment, tax invoice or separate company registration activated.**
**Authoritative decisions:** SAR-ADR-018 (first complete free assessed deal, second only separately approved), SAR-ADR-020 (SAR-owned brand, discreet footer + /legal, separate incorporation deferred pending merit), SAR-ADR-021 (legal terms, POPIA/PAIA, payments/refunds, invoice finance and documentary gates).
**Public supplier:** Shobane African Resources (Pty) Ltd, trading DealScope product brand.
**Recorded but not officially reverified:** CIPC 2019/626848/07; VAT 4040314793.

## Delivered source: canonical legal documentation
- docs/legal/README.md — authoritative order of source and approval status.
- docs/legal/DEALSCOPE-LEGAL-REGISTER-20261028.md — supplier records, sources and evidence hierarchy.
- docs/legal/DEALSCOPE-CUSTOMER-TERMS-DRAFT.md — full services, case rights, evidence limits, customer/Exchange duties, complaint, remedies.
- docs/legal/DEALSCOPE-PRIVACY-POPIA-DRAFT.md — responsible party, s18 notification, processing, lawful bases, tenant, marketing, transfers, retention, breach/rights.
- docs/legal/DEALSCOPE-PAYMENTS-REFUNDS-DRAFT.md — order review, one complete free cycle, no autocapture, PSP, cooling-off, refunds/credits, subscription rules.
- docs/legal/DEALSCOPE-INVOICING-FINANCE-DRAFT.md — actual SAR supplier, VAT invoice/credit note, order/provider/bank GL and DealScope cost centre.
- docs/legal/DEALSCOPE-PAIA-INFORMATION-OFFICER-DRAFT.md — private-body manual, officer registration and records rights.
- docs/legal/DEALSCOPE-DATA-PROCESSING-AND-DISCLOSURE-DRAFT.md — processor agreements and per-recipient Exchange consent.
- docs/legal/DEALSCOPE-COMMERCIAL-METHODOLOGY-AND-RISK-DRAFT.md — integrity, viability, readiness, source confidence and lawfulness.
- docs/legal/DEALSCOPE-RELEASE-GATES.md — open statutory/customer/security/provider/financial evidence checklist.

## Delivered public preview routes (Next app)
- /legal — legal SAR operator, historically supplied full CIPC/VAT numbers marked pending current registry confirmation, no invented contacts; original route updated.
- /terms — clear service/customer legal terms summary.
- /privacy — POPIA privacy notice with processor and tenant boundaries.
- /payments — refunds, lawful consumer cancellation and no automatic charge.
- /invoicing — SAR-only tax invoice / 15% standard VAT as applicable, source validation status.
- apps/dealscope/app/legal/_components.tsx shared draft notice + legal nav + correct SAR footer; apps/dealscope/app/landing.css accessible legal styling.
- Home /start, /runs, /integrity and /exchange now link to relevant legal pages without implying legal approval or activation.

## Delivered pure finance candidate source
- apps/dealscope/lib/invoice-contract.mjs: supplier is exactly SAR; complete historic CIPC/VAT records checked against **externally attested CURRENT official status**; approved Finance role, independent review and actual merchant evidence required. Uses BigInt exact cents VAT, blocks zero-value free invoices/tenant mismatch/duplicated orders/wrong captured amount and provider refund mismatches. Produces only uncommitted invoice/credit-note CANDIDATES; no payment, invoice numbering authority, tax point, settled bank credit or posted tax/GL.
- apps/dealscope/test/invoice-contract.test.mjs: 5 cases (positive plus negative) exercised.

## Exact-source verification
Fetched current GitHub files from development branch and executed source-adapted JavaScript test harness on fetched content:
- public-website.test.mjs 8 PASS / 0 FAIL
- legal-documents.test.mjs 7 PASS / 0 FAIL
- invoice-contract.test.mjs 5 PASS / 0 FAIL
- deal-cycle-trial.test.mjs 7 PASS / 0 FAIL
**TOTAL 27 narrow source-level cases pass**, no failures. They do not substitute for native pinned Node test runner, Next build, TypeScript, RLS, provider or real browser acceptance.

## Verified law references (28 October 2026)
- ECTA 25/2002 s43: https://www.saflii.org/za/legis/consol_act/ecata2002427/
- POPIA 4/2013 s18: https://www.justice.gov.za/legislation/acts/2013-004.pdf
- CPA 68/2008: https://www.thedtic.gov.za/wp-content/uploads/consumer_protection.pdf
- SARS tax invoices: https://www.sars.gov.za/businesses-and-employers/government/tax-invoices/
- 2026 standard VAT rate 15%: https://www.sars.gov.za/tax-rates/other-taxes/
- Information Officer/PAIA: https://inforegulator.org.za/

## Actual open blockers — no false legal "complete"
- Current CIPC company disclosure confirming status/office/officers; SARS VAT proof/active tax vendor; correct/approved business/service-process address and customer telephone/email; no approved new DealScope support contact.
- Verified registered Information Officer and PAIA manual, retention, consent, actual third-party processor schedules, counsel review of CPA/ECTA jurisdiction/fair consumer terms.
- SAR licensed PSP merchant and settlement/bank, approved tariffs and service levels, automated invoice numbering/issue and tax/GL posting, refund actual settlement.
- Dedicated DealScope customer Auth + DB/RLS, real paid/free service fulfilment, source/issuer verification, browser UAT, Next production build, backup and role governance.
- Final Terms/Privacy must be signed and versioned for customer acceptance, not left marked development preview.
- A new separately incorporated DealScope is NOT a launch prerequisite per latest ADR-020. All other release holds remain; no mainline merge or live deployment without express Founder approval.

## Next engineering continuation
Recover current dev branch; check exact head and file hashes before modification. Validate real legal entity particulars against CIPC and SARS documents; verify approved statutory address and contact; commission company Info Officer/PAIA, counsel-approve final terms/refunds and POPIA purpose/retention; obtain SAR merchant provider and tax signoff; implement immutable order review/acceptance, Invoice/GL/PSP settlement and secure customer entitlement in SAR-controlled isolated DealScope project, run clean Node/Next build and real RLS/browser/payment negative tests. Keep separate incorporation deferred and protect confidential customer data from internal SAR trading system. Prepare a controlled integrated candidate only. Do NOT promote production.
