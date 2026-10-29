# SAR Enterprise Architecture — Authoritative Documentation Index

## CURRENT 28 OCTOBER 2026 — DealScope v6 supersession

The latest Founder-directed customer system contract is **[DealScope Unified Commercial Intelligence Architecture v6](16-DEALSCOPE-UNIFIED-COMMERCIAL-INTELLIGENCE-V6-20261028.md)**. It defines two customer services: dated weekly Market Intelligence and user-supplied Deal Intelligence, with a protected commodity-adaptive specialist engine. It **supersedes the older opportunity-discovery, exchange and buyer–seller-matching proposals** in earlier blueprints. Public customer transactions are private; formulas remain server-side. This document is a **design authority only**, NOT a completed application.

The current implemented candidate is SAR-owned `engineering/dealscope-contract-intelligence-v6-20261028` draft PR #4, dependent on SAR-owned migration PR #1. Its source tests were previously reported locally, but full Node24/Next native verification and live SAR-only tenant infrastructure are NOT ACCEPTED. The job `dealscope-verify` is failing with no retrievable steps/log; neither PR is accepted for promotion on this evidence. The SAR Corporate Website was separately fast-forward integrated into its `main` at source `654f0c0190611893cdf3fb7e2bc825562f5143a3`, with source-only security gates. No production release.



**Document ID:** SAR-ARCH-INDEX-001  
**Owner:** Shobane African Resources (Pty) Ltd  
**Prepared:** 27 October 2026  
**State:** Architecture consolidation **FOUNDER-RATIFIED REQUIREMENTS BASELINE — detailed organisational appointments, professional certification, implementation, testing and operational issuance are NOT implied**. Founder-approved architecture requirements are now in SAR's protected mainline; application implementation, legal appointments, technical validation and production service releases are independent OPEN gates.

## Mandatory rule: repository first, not chat first

Every engineer, software agent, business analyst and change reviewer **must** read this index and its directly relevant specifications **before** designing, coding, deleting, migrating, deploying or changing a SAR system. A chat summary, memory, prototype, design screenshot, prior handover or deployed preview is **not** the authoritative architecture.

**SAR owns SAR ResourceOS, DealScope, the corporate website, the data and the intellectual property.** Possent Systems is an unrelated organisation; no implicit cross-access, hosting, repo transfer or ownership.

## Canonical document map — where the actual authority sits

| Authority level | Document / repository | Scope | Maturity |
|---|---|---|---|
| 1 — Founder decisions | [SAR controlled decision and supersession register](06-DECISION-REGISTER.md) with originating dated instructions | Legal ownership, business mandate, architecture locks and release authorisation | Confirmed project directions; consolidated Founder review still pending |
| 2 — SAR enterprise operating model | [Corporate structure, divisions and responsibilities](01-SAR-CORPORATE-OPERATING-MODEL.md) | Mandates, divisional interfaces, decision rights, KPIs and differentiators | **Consolidated draft; role assignments and detailed charters need sign-off** |
| 2 — Internal operating intelligence | [ResourceOS system architecture](02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md) | Document-to-project modelling, simulation, RFQ, commodities, contracts, execution and finance | **Consolidated draft; implementation incomplete** |
| 2 — External platform | [DealScope product architecture](03-DEALSCOPE-PLATFORM-ARCHITECTURE.md) | SAR-owned external SaaS, Deal Runs, sourcing, buyer/seller exchange, tenants and payments | **Consolidated draft; no DealScope database yet** |
| 2 — Cross-system architecture | [System boundaries, integrations and data ownership](04-CROSS-SYSTEM-BOUNDARIES.md) | Website -> intake -> ResourceOS; external DealScope; shared calculation packages | **Consolidated draft; adapters not accepted** |
| 2 — Corporate website | [Website Master Build Map — other SAR repository](https://github.com/shobanesiyanda/sar-website/blob/main/docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md) | **Approved** public identity, page routes, media, copy, supplier journey, design and QA | Approved requirements, incomplete acceptance |
| 3 — Executed engineering | [Current macro implementation/evidence ledger](../2026-10-27-sar-consolidated-carryforward.md) | Source SHAs, test evidence, open gates, blockers and engineering batches | Living ledger, **not** substitute for a blueprint |
| 3 — DealScope schema proposal | [New DealScope database plan](../../apps/dealscope/database/README.md) and `initial-schema.REVIEW-ONLY.sql` | Customer organisations, roles, evidence, deals, disclosures, payments and RLS | **Review-only, not a live migration** |
| 3 — Deployment | [Portable infrastructure](../PORTABLE_INFRASTRUCTURE_AND_PRODUCT_BOUNDARIES.md) | Container portability and system deployment boundaries | Draft / staging, unverified |
| 4 — Historical | Prior migration snapshots, earlier redesign notes, superseded PRs, detached ZIPs, archived handovers | Provenance only | May not override an approved newer decision |

### Independent completeness audit
- [27 October source-of-truth repository audit](2026-10-27-BLUEPRINT-AUDIT.md) — exactly what documents were inspected, what had been fragmented or absent, the new canonical structure, and why **the complete corporate/technical blueprint cannot yet be certified as recovered or approved**.

### Native corporate documentation architecture
- [SAR Corporate Documentation and Templates Standard](07-DOCUMENT-DESIGN-AND-TEMPLATES.md) — **Founder-approved requirement** for all branded client, internal and counterparty documents, with ResourceOS-native creation, editing, preview, approvals and controlled issue.
- [ResourceOS Document Studio — product and engineering blueprint](08-RESOURCEOS-DOCUMENT-STUDIO.md) — first-party editor/viewer workflow, templates, editing experience, revision/approval model, backend dependencies and acceptance gates.
- [Controlled Document Amendment Authority](09-DOCUMENT-AMENDMENT-AUTHORITY.md) — new Founder-mandated request -> independent preapproval -> section-limited edit -> independent postreview -> exact revision governance; source implementation is NOT backend authority.
- [DealScope PAYG Report Product](10-DEALSCOPE-PAYG-PRODUCT.md) — per-analysis paid service independent of whether a prospect becomes a contracted trade; price, consumer terms, payment infrastructure and acceptance pending.
- [DealScope Deal Integrity & Counterparty Intelligence OS](11-DEALSCOPE-DEAL-INTEGRITY-OS.md) — explained claim-by-claim credibility assessment, evidence checks and investigation actions, separated from commercial profitability; live verification remains open.
- [DealScope Public Website & Commercial Acquisition Blueprint](12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md) — independent dealscope.co.za signed-out experience, value proposition, trial funnel, flexible PAYG/subscription packaging and complete client retention strategy.
- [DealScope Legal, Privacy, Customer Terms and Finance](../legal/README.md) — current 28 Oct controlled legal source: recorded CIPC/VAT, comprehensive draft terms, POPIA/PAIA, payments/refunds, invoicing/merchant, processor confidentiality, evidence-risk, public routes and mandatory legal release checklist. All drafts, not issued customer contracts.
- [DealScope Customer Brand & SAR Legal Operation](14-DEALSCOPE-PUBLIC-BRAND-AND-ENTITY-SEPARATION.md) — latest ADR-020: brand stands alone, small truthful SAR legal-operator footer and detailed /legal information, separate incorporation deferred pending merit; verified statutory and payment disclosures required before live commerce.
- [DealScope One Free Complete Deal Assessment](13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md) — current 28 Oct Founder decision supersedes 30-day unlimited trial; one full opportunity assistance-and-report cycle by default, optional independently approved promotional second, Auth/eligibility/consumption and opt-in paid conversion.

## Architecture domain coverage and unresolved gaps

| Domain | Where it is documented | Remaining gap |
|---|---|---|
| Legal ownership, organisation and division topology | 01 | Founder-ratified organogram, delegation thresholds, appointed role holders |
| Trading operating model | 01 + 02 + macro section 3.1 | Detailed approved commodity-by-commodity SOPs, contracting templates |
| Mining & Contract Services | 01 + 02 | Discipline-specific work-package library, professional sign-offs and staffing |
| Project Development | 01 + 02 | Approved feasibility methodology, scenario envelopes and risk tolerance |
| Technology & Innovation | 01 + 02 | Engineering team charter, technology roadmap and architecture decision records |
| Document intelligence + virtual project execution | 02 + macro section 8 | **Real extraction/AI pipeline and complete simulation acceptance missing** |
| RFQ approvals, inbound quotes and reforecasting | 02 + macro section 9 | Dispatch adapters, inbox ingestion, immutable ledger and end-to-end testing |
| Commodity routes, finance, fleet, warehouse and assay | 02 + macro sections 1, 3 | Verified SAR database and integration acceptance |
| DealScope commercial intelligence and exchange | 03 | New SAR-owned Supabase project, Auth/RLS, real sources, customer/financial acceptance |
| Public website, supplier and stakeholder journeys | SAR website master map | Reproducible build, staging database, images, complete QA and production approval |
| Privacy, audit, access and settlement | 03 + 04 | Formal security model, RACI/delegation, incident response, DR/restore testing |
| Operating policies, templates and process evidence | Not consolidated | Missing controlled policy/SOP/contract/register library |

**An entry in this index does not mean the underlying capability is deployed or approved.**

## Precedence and change control

1. An **express, later Founder-approved decision** takes precedence over any conflicting prior requirement. Record date, rationale, impacted documents and affected tests; do not quietly change the documents.
2. The relevant domain blueprint is the **requirements baseline** once the Founder approves that revision. Until then, identify it as a candidate and reference confirmed earlier decisions explicitly.
3. Source code and database schema show **what exists**; the requirements baseline shows **what must exist**; the evidence ledger shows **what has actually passed tests**. These must never be conflated.
4. The corporate website master map controls public content. Internal blueprint language **must not appear on the public website**, metadata or schema.org records.
5. No cross-SAR/Possent association. Never use TenderDesk/BidOS accounts, data, payment keys or merchants for SAR.
6. All work must map `decision -> document revision -> requirement ID -> code/migration -> test -> acceptance evidence -> release approval`.
7. A change is not complete if it is described only in chat. Update affected blueprint(s), decision record, tests and the engineering ledger on a controlled branch.
8. No automatic merge to `main`, deployment, external RFQ sending, purchase orders, payments or binding commitments based on these documents.

## Mandatory opening checklist for the next engineer or AI assistant

Read this index; check the **current branch and newest approved architecture revision**; read the full relevant blueprint (not just its heading); read the latest implementation/evidence ledger; inspect actual code and schema; list discrepancies; decide the smallest dependency-correct implementation batch; update tests, decision records and status. A capability cannot be called “forgotten” and re-created differently because a chat window lacks prior context.

## Explicit incompleteness

This initial index establishes navigation and traceability, **not proof that SAR's entire historical blueprint has been recovered**. Approval of the complete organizational hierarchy, division operations manuals, document-intelligence prompts and evals, equipment libraries, SOPs, approvals/delegation registers, finance/tax policies and procurement document templates is still OPEN. Recover and reconcile any historic material before marking the library COMPLETE.

### 28 October DealScope engineering continuation pointer
Engineering macro 002 checkpoint: [DealScope customer identity, legal consent, dossier and atomic free-cycle candidates](../engineering/2026-10-28-dealscope-engineering-macro-002.md). Start in `apps/dealscope/README.md`, `apps/dealscope/database/README.md`, `docs/legal/README.md`, ADR-018/020/021 and this checkpoint. None of the newly authored SQL is a migrated database. Preserve unmerged branch, no separate DealScope corporation, true SAR operator disclosure and customer tenant/data/PSP isolation.
