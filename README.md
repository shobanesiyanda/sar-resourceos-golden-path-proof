# Shobane African Resources — ResourceOS + DealScope Engineering Repository

**Legal owner:** Shobane African Resources (Pty) Ltd (**SAR**). Possent Systems is not associated with SAR.

> **READ THIS FIRST BEFORE ANY SYSTEM CHANGE:** [SAR Enterprise Architecture Source-of-Truth Index](docs/architecture/00-START-HERE.md).  
> The index links the SAR organisational model, divisional responsibilities, ResourceOS intelligent document-to-project simulation and RFQ architecture, DealScope product architecture, cross-system data boundaries, website master map, and governance/completeness registers. The project-intelligence and human-controlled supplier RFQ loop is **foundational**, not optional.

## Definitive architecture entry points (draft consolidation, pending Founder ratification)

1. [00 — Architecture Index](docs/architecture/00-START-HERE.md): current controlled documentation navigation and authoritative source hierarchy.
2. [01 — Corporate Structure / Divisional Mandates](docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md): SAR ownership, business functions, interfaces, edge, decision rights and outstanding organisation approvals.
3. [02 — ResourceOS Blueprint](docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md): full unstarted-project intake -> document intelligence -> constrained simulation -> approved RFQ -> direct supplier response -> reforecast -> approved execution and finance workflow.
4. [03 — DealScope Blueprint](docs/architecture/03-DEALSCOPE-PLATFORM-ARCHITECTURE.md): SAR-owned external commercial intelligence, multi-tenant customer exchange, qualification and finance boundaries.
5. [04 — Cross-System Data / API Boundaries](docs/architecture/04-CROSS-SYSTEM-BOUNDARIES.md): website, ResourceOS, DealScope and shared logic interactions.
6. [05 — Governance and Missing Blueprint Register](docs/architecture/05-GOVERNANCE-COMPLETENESS-AND-DECISIONS.md): source/approval/test/release traceability and material documentation still outstanding.
7. [Engineering evidence / latest carry-forward](docs/2026-10-27-sar-consolidated-carryforward.md): historical commits, open dependencies, verified and unverified tests.
8. [Corporate Website Master Build Map](https://github.com/shobanesiyanda/sar-website/blob/redesign/full-corporate-website-oct-2026/docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md): **separate corporate website source of truth**, not replaced by this repo.
9. [DealScope Database Blueprint](apps/dealscope/database/README.md): **SAR-controlled greenfield project not provisioned**, schema proposal and acceptance gates.

**Mandatory discipline:** The documents describe what must exist and what remains incomplete; source code and accepted test evidence determine what actually works. A drafted blueprint is not a signed company policy. No merge to `main`, production deploy, binding RFQ, payment or purchase is authorised by this index.

## Product structure

- Root Next.js application: SAR **internal ResourceOS** migration proof and operating modules.
- `apps/dealscope`: separately built **external SAR-owned DealScope product**, currently a preview; no customer database or payment collection.
- `packages/commodity-core`, `packages/commercial-core`, `packages/project-core`: shared **calculation and model packages**, not shared access to customer/private enterprise records.
- `infra`: portable deployment reference, not approved production cutover.

## Earlier golden-path proof (historical baseline)

The initial project was a small Next.js proof of one parcel: document -> dispatch -> movement -> delivery -> reconciliation -> finance. It included seeded demo parcel data, a golden-path proof page and demo JSON API. **That scope was never the complete ResourceOS blueprint.** Retain its source provenance; extend in dependency order rather than replace the company-wide architecture with a demo.

## Reproducible engineering / acceptance

Inspect the actual target branch and dependency versions before running installation/builds. Use a trusted environment, pinned dependencies and applicable package tests; treat READY previews as build evidence only, not business acceptance. Evaluate SAR ResourceOS, standalone DealScope and the separately maintained website independently. The actual SAR Supabase technical environment is still unverified on the available account; DealScope needs a new SAR-controlled project. Never substitute BidOS/TenderDesk environments.

**No GitHub Actions, forced merges or production promotion without specific approval.** Read `AGENTS.md` for engineering-agent rules.
