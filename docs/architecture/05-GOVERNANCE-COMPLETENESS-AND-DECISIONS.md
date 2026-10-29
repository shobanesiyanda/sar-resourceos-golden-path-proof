# SAR Architecture Governance, Traceability and Completeness Gates

**ID:** SAR-ARCH-GOV-001 • **Prepared:** 27 October 2026 • **State:** Founder-ratified governance principles; named role/delegation appointments and technical evidence remain OPEN.

## 1. Documentation objects and exact states

- `CONFIRMED`: explicit Founder decision recorded in a controlled version; no assumption that source code conforms.
- `APPROVED_REQUIREMENT`: approved blueprint clause with testable acceptance criteria.
- `PROPOSED`: engineering design that still needs approval; must not override confirmed requirements.
- `IMPLEMENTED`: source commit or schema change exists; no quality inference.
- `TESTED`: named exact-source test executed with environment/fixture/report.
- `ACCEPTED`: reviewer verified the required end-to-end evidence against an approved gate.
- `RELEASED`: explicitly approved production promotion with rollback plan and release evidence.
- `BLOCKED`: exact unavailable external dependency, access or authority recorded.

A feature is not 'done' because a document exists, a test fixture passes, Vercel says READY, or a dashboard has a working button.

## 2. Required change controls

Every architecture or engineering change must carry a compact but traceable entry:

| Field | Purpose |
|---|---|
| Decision ID / scope | e.g. `SAR-ORG-001`, `SAR-ROS-INTEL-001`, `SAR-DSC-TEN-001`, `SAR-WEB-PUBLIC-001` |
| Confirmed authority and date | Actual explicit Founder/client/technical sign-off, not a fabricated approval |
| Previous requirement | Exact clause, source and revision |
| New requirement | Testable behaviour, data ownership and human authorisation |
| Affected files | Documentation links, source modules, DB migrations and public copy boundaries |
| Security/business effect | Money, legal commitment, tenant, permissions, audit and physical risk |
| Acceptance | Exact named tests, fixture, result and evidence SHA; known omissions |
| Release | Explicit merge/deploy sign-off, rollback, support and recovery |

Never create fake sign-off, compliance approval, deployed state or model performance. A change note may document an unresolved question, but may not auto-decide it.

## 3. Architecture and implementation source order

1. **Legally/explicitly authorised decisions** from SAR leadership, committed with source date.
2. **Relevant approved architecture blueprint**: `00-START-HERE.md` resolves the current document.
3. **Approved corporate website master build map** for *public-facing website* matters.
4. **Real source code/schema** shows current implementation, including bugs and omissions.
5. **Evidence/acceptance register** shows what tests and releases actually happened.
6. **Historical notes, chats and snapshots** are source material for reconciliation only.

A more recent expressly approved decision supersedes an earlier conflict; update the affected documents *and* append a dated supersession record.

## 4. Mandatory “no missing foundations” dependency review

Before each engineering macro batch:

- Verify company ownership and public/internal/external product boundary.
- Read the **full** ResourceOS defining document-to-project/simulation/RFQ loop before changing Document, Project, Opportunities, Routes, Finance or Approvals.
- Check division rules for both Commodity Trading and Mining & Contract Services. Do not scope ResourceOS to only one.
- Read DealScope as a separate SAR-owned external customer product, with its **nonexistent greenfield database** accounted for.
- Read the corporate website master map without putting proprietary architecture into public marketing.
- Reconcile physical custody, sampling/assay, capacity, working capital, legal/professional and regulatory gates.
- Run tests on the actual target branch and document errors. Independently packaged passing tests are not automatically same-source proofs.
- Update source documentation before claiming implementation complete.

## 5. Completeness register — not all historical materials recovered

| ID | Missing or not authoritatively accepted | Required completion proof |
|---|---|---|
| GOV-01 | Approved SAR board/shareholder/statutory records and full organogram | Founder-ratified corporate register; no invented roles |
| GOV-02 | Division charters, workflows, role assignments, KPIs and authority thresholds | Signed operating model, named current role holders |
| GOV-03 | Banking, procurement, contract, financial and technical delegation | Reviewed signatory/authorisation matrix and financial limits |
| ROS-01 | Comprehensive application/database/service catalogue | Repo inventory, ERD, API/event contract matrix with SHAs |
| ROS-02 | Full intelligent extraction methodology/AI eval | Document classes, gold fixtures, source/provenance and human review acceptance |
| ROS-03 | Complete constrained/stochastic scenario architecture | Calibrated fixtures, schedule/route/cash optimisation and statistical validation |
| ROS-04 | Vendor/plant/equipment/transport and OEM service directory | Verified suppliers, equipment specs, licensing, contracts and status |
| ROS-05 | Procurement approval, external RFQ sending and inbound response SOP | E2E validated workflow, authentic message evidence, staged human approval |
| ROS-06 | Mine, warehouse, transport, assay, plant, custody and finance SOPs | Evidence-backed operational procedures and control owners |
| ROS-07 | Full business ledger/treasury/payment/document retention models | Authorised schema and reconciled financial fixtures |
| DSC-01 | SAR-controlled DealScope Supabase project and migration | Real project ref, tested RLS and recovered backup |
| DSC-02 | Customer Auth, subscriptions/PAYG, real sourcing and disclosures | Real browser/API/database/customer/merchant sandbox tests |
| WEB-01 | Website exact source-media image parity and legal content approval | Verified assets/hashes, visual and claim review |
| WEB-02 | Website build and supplier intake acceptance | Pinned npm install, all pages/devices, approved staging backend |
| SEC-01 | Unified threat model, POPIA/retention, DR and incident process | Reviewed security tests and real backup/restore |
| INT-01 | Production-safe cross-product system-of-record handoff | Contract version, signed event test, idempotent failures and audit |
| REL-01 | Whole-system full build, regression, UAT and approved release | Evidence package, explicit Founder release decision |

**Do not mark this library or the projects COMPLETE while any material item remains OPEN.** “Documented,” “architected,” “implemented,” “tested,” “accepted,” and “deployed” are not synonyms.

## 6. Historic documentation cleanup / reconciliation

The existing `docs/2026-10-27-sar-consolidated-carryforward.md` is a detailed engineering history and backlog. It contains some superseded timestamps and duplicate section numbers and must remain preserved as evidence, not quietly rewritten into a fictional clean history. Future work should cite the fresh architecture library and update a single modern implementation register with live code and acceptance data; cross-link rather than duplicate the business blueprint in the engineering ledger.

The original root repository README described only a 'golden-path' parcel proof and did not direct engineers to SAR's foundational project-intelligence architecture. The SAR Website README links to a correct approved master map for the corporate site but previously did not reference the SAR-wide organisational boundaries. Both entry points must now link to the appropriate authoritative sources.

## 7. Review and approval requirements

These documents make previously fragmented requirements discoverable, but are still **drafts** until the Founder approves the consolidated architecture. Any specific commercial term, legal obligation, new permanent department, signatory, revenue projection, headcount or target not grounded in confirmed evidence must be flagged for review.

Minimum acceptance for an **authoritative repository library**:
1. Founder reviews and approves `SAR-ORG-001`, `SAR-ROS-ARCH-001`, `SAR-DSC-ARCH-001`, `SAR-XSYS-001` and this governance policy.
2. Both repository root READMEs link to their own authoritative master documents and to the cross-product index.
3. Each major requirement is traceable to a source and acceptance test; conflicts are explicitly reconciled.
4. Dedicated detailed policies/ERDs/SOPs and actual implementations are incrementally admitted only after evidence-based review.
5. Controlled merge and release approval; the draft branch remains nonproduction until separately accepted.

**This is a governance foundation, not a statement that the full organisational, system and engineering blueprint has been recovered or ratified.**


## Customer acquisition and trial — new mandatory acceptance gates (27 October)
DealScope's full external product now includes its **own** public signed-out website (target domain dealscope.co.za) with audited SAR product ownership, integrity-led consumer proposition and company/person onboarding. The 3 October 30-day time-limited trial was expressly superseded 28 October by ONE FREE complete full deal assistance and assessment cycle (optional separately approved second); 27 October clarified the marketing/entitlement requirement to at least one introductory free full trial per eligible person/company/originator. PAYG-only scope reduction remains rejected. Reconcile website/identity architecture to full existing DealScope, not a restricted calculator product. Governing additions: SAR-ADR-016/017; docs/architecture/12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md and 13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md.
RELEASE GATES OPEN: authentic dealscope.co.za domain/SSL/mail ownership, production page content/claims, separately owned Auth/DB/RLS, unique identity/org trial history, actual one-cycle entitlement and delivery verification, full suite entitlement, completed-cycle usage and no automatic charge, consent/privacy/terms, approved rates, provider keys, end-to-end app and public site acceptance, legitimate user support and recovery. **Signed-out source and an illustrative self-check do not satisfy independent credibility verification.**


## Current DealScope legal operator and brand gate — 28 October ADR-020
DealScope's public brand is approved as WORK IN PROGRESS under Shobane African Resources (Pty) Ltd as the existing operator. A separate company is NOT required prior to product-market proof; early 28 October zero SAR mentions/compulsory new entity rule SAR-ADR-019 is superseded. Public homepage and onboarding must show a legible discreet legal-operator line linking to /legal, and keep all DealScope marketing independently branded. Live-commerce gates still require SAR exact business/trading name compliance, legally complete contact/registration particulars and required ECTA/CPA disclosures, accurate merchant/settlement, invoices, tax/ledger, POPIA/consent and production browser acceptance. No separate company or new merchant account has been created.


## Latest 28 October DealScope legal-compliance preparation — SAR-ADR-021
Legal drafting is integrated in the DealScope repository under docs/legal/README.md with company legal identity, customer Terms, POPIA and Information Officer/PAIA, customer-correct payments/refunds, invoice/finance, evidence/Exchange privacy, processor obligations and a statutory acceptance checklist. The previously supplied SAR CIPC registration (2019/626848/07) and VAT number (4040314793) are recorded but not independently reverified; current CIPC/SARS documents, statutory service address, business contact, officer data and SAR merchant remain OPEN. The customer legal routes are development previews, not issued final terms. Verified full statutory disclosure, receipt/tax invoice, contracts, actual consumer remedies, data safeguards, legal review and Founder release authorization remain mandatory; distinct DealScope incorporation is NOT mandatory per ADR-020.
