# DealScope Deal Integrity & Counterparty Intelligence OS
**Control:** SAR-DSC-INTEGRITY-001
**Date:** 27 October 2026 (SAST)
**Owner:** Shobane African Resources (Pty) Ltd
**Authority status:** New Founder-directed full-suite core capability; source-only foundation NOT an independently verified service or a fraud determination.
**Relationship:** Mandatory integrated DealScope domain under existing SAR-DSC-ARCH-001; PAYG/subscription models and Commercial Exchange remain fully in scope, not replaced.

## Product promise
"Know what you're dealing with before you commit." DealScope must help a user evaluate whether alleged stock, ownership, mandate, buyer, assay, documents and payment processes are **supported, inconsistent or insufficiently evidenced**, explaining what is missing, why it matters and HOW to independently investigate. Commercial profitability and legitimacy/readiness must be separate. Buyer/stock existence, legal title, document authenticity, financing, price and legal authority require independently bounded evidence; a company-registration match or mining right alone never certifies specific stock disposal authority. A sample assay alone never proves chain of custody, total tonnage, title or buyer availability.

### Mandatory three independent assessments
1. **Integrity:** what evidence and specific claims are independently corroborated, contradictory, stale, unverified or missing; what investigative actions are required, and what activity must be paused.
2. **Viability:** independent gross/net margin, mass yield, processing, transport, financing, working capital, down-side scenarios and acquisition ceiling, with assumptions and source confidence displayed.
3. **Readiness:** source/rights/contract/permit/technical/finance/approval gates, investigation priority, remaining actions, counterparty consent and unresolved discrepancies.

No single numerically confident "legitimacy score" should conceal missing decisive evidence. Indicate **Investigate further**, **Stop and resolve a material inconsistency**, or **Corroborated checks, residual risk remains**. These are private decision-support statuses, NOT findings of criminality, a licence to pay, legal advice, guaranteed trade or definitive assurance that a person/entity is honest. Preserve an explicit appeal/correction channel, human escalation and historical versioning.

## Twelve due-diligence categories
1. Entity identity — legal registered status, effective controller and independent official contact; use authorised CIPC records.
2. Representative authority — signed current power, signatory mandate, verification with actual company.
3. Selling mandate chain — full, current and parcel-specific documented authorisation from the actual owner/controller, not mere WhatsApp representation.
4. Lawful title/rights to stock — acquisition/provenance, ownership, control, liens/pledges, ability to dispose of THIS lot. Mining rights are not the same as stock title.
5. Mining source — claims checked against the DMPR's authorised mining-right/permit records, mineral/location/holder/period, and separate title chain.
6. Physical existence/volume — site verification permission, survey/weighbridge, stockpile and transaction-specific volume proof.
7. Sample, assay and lab provenance — source sample ID, witnessing/custody chain, lab official verification of issued report/grade, validity, scope of SANAS accreditation if claimed; lab scope check is distinct from sample/stock identity.
8. Buyer identity/authority — legal counterparty, independently known channels, signer/buyer role, actual buying organisation.
9. Buyer demand and commercial capacity — dated PO/letter source, grade/tonnage/price, delivery basis, funds/credit policy and actual validity; avoid unjustified guarantee claims.
10. Payment integrity — independently obtained trusted callback, bank account verification when available, unsolicited bank change detection, no release on screenshot proof of payment.
11. Document consistency — issuer, SHA/version, parcel, grade, weights, dates, location, terms, mandates, invoices and transported quantities.
12. Communication integrity — official domain and contacts, spoofing, urgency, impersonation and inconsistent personnel claims.

New evidence should update a specific claim, not erase prior decisions. Inconsistent authority/rights, buyer impersonation or suspicious payment detail changes are stop-and-review triggers until cleared; absence of a document is not alone proof of a crime.

## Guided evidence collection, not arbitrary AI statements
- Dossier -> claimed entities and parcel -> verified source manifest -> independent issuer lookups/callback tasks -> reviewer adjudication -> immutable reasoned findings -> user-specific actionable investigations -> monitored re-evaluation.
- Every finding cites an exact underlying claim, source document/date, who verified it, verification method, status and coverage limitations; distinguish submitted scans from original issuer confirmation.
- Official checks: CIPC BizPortal and authorized disclosure for companies; DMPR licensing systems for mineral rights/permits; SANAS accredited-facility directory for lab and specific test scope; buyer/seller official channels; secure bank AVS where a licensed provider permits. None of these is presently integrated. Do NOT scrape gated services or present an unsupported live-verification tick.
- Samples require site/collector, seal, laboratory accession number, chain of custody, lot identity, estimated total stock and independently validated report metadata. A confirmed lab report never certifies the entire offer by itself.
- Model/LLM can extract claims, compare documents, spot anomalies and draft investigation instructions; cannot independently attest criminality or legal rights. Use deterministic critical gate checks and human escalation. Revalidate if new document version, corrected mandate, changed recipient, bank instruction or supplier/buyer evidence appears.
- For source documents received via WhatsApp, only authorised user-submitted records may enter tenant storage; no unconsented harvesting of unrelated group/member chats, private contact lists, banking information or documents.
- Financial/procurement/contracting workflows must remain distinct; a risk screen alone grants no stock release, funds or counterparty disclosure.
- Any live reputation network, shared negative list, public "scam alert" naming a party, criminal conduct screening, credit reporting or profiling requires a separate legal, privacy and evidentiary determination; NOT approved or implemented. POPIA conditions, correction/dispute rights and potential prior authorisation must be independently reviewed.

## Platform architecture and service lifecycle
DiscoveryOS / MarketOS -> Opportunity/DossierOS -> **IntegrityOS (claim/evidence/case/investigations)** -> ScenarioOS/ViabilityOS -> ReadinessOS -> CounterpartyOS / consent-governed ExchangeOS -> (separate) contractual commitments, fulfilment, payments, invoice reconciliation and monitoring.
All systems share versioned tenant-authorised dossier references, NOT service-role databases. Versioned identity, optional verified supplier referral and private evidence disclosures are consent-bound. CommercialOS and SAR ResourceOS may consume only independently authorised minimum necessary SAR-originating business handoffs; there is NO blanket cross-tenant intelligence feed to SAR or a public trust badge.

## Release and evidence gates
Source now: \`apps/dealscope/lib/deal-integrity.mjs\` plus \`apps/dealscope/test/deal-integrity.test.mjs\` (six source-level exercised tests, not production acceptance), \`app/integrity/page.tsx\` public unverified self-check. \`exchange-consent.mjs\` and test preserve recipient-specific Exchange gating. No live issuer adapters or authenticated case backend exists. Review-only \`deal-integrity-extension.REVIEW-ONLY.sql\` defines proposed isolated custody.

Before live claiming verification: verified SAR-controlled DealScope DB, Auth/RLS/storage; independent provider permissions or authorised manual callback with evidence; fraud/impersonation handling SOP; case reviewer segregation; POPIA/ECTA/CPA review, and if appropriate additional privacy prior authorisation; malicious or disputed content workflows; sample and lab provider integration; source-to-citation tests; negative-path cross-tenant, forged issuer, issuer unavailability, revoked permissions and contradictory claim tests; human redress; encrypted logging, redaction, retention, backup/restore, model calibration and false-positive testing. Do not imply the preview is a vetted company or sale.


## Public-facing demonstration and onboarding
Deal Integrity is the primary reason a prospective commodity intermediary should understand DealScope's value from the signed-out site. Provide clear, non-alarmist illustrative stories such as "claimed stock, mandate and lab result — which independent checks remain?". The public self-check is not an independent case determination; customers may enter no private issuer/SA-ID/bank data there. The signed-out CTA leads to a verified 30-day full-feature trial once AccountOS and secure evidence storage exist. Preserve scenario modelling, Discovery/MarketOS, Watch and full Exchange as equally mandatory commercial capabilities. Public story and SEO/campaign attribution are specified in acquisition blueprint 12; 30-day Auth/entitlement and paid choice in contract 13. Do not publish claims of actual verified counterparties, unique stock, lab accreditations or fraud findings without documented case-specific issuer evidence.
