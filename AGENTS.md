# Instructions for Engineering Agents and Human Contributors — SAR

This repository belongs to **Shobane African Resources (Pty) Ltd**. **Possent Systems is unrelated.**

## Mandatory first reads
1. `docs/architecture/00-START-HERE.md`
2. `docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md`
3. `docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md`
4. `docs/architecture/03-DEALSCOPE-PLATFORM-ARCHITECTURE.md`
5. `docs/architecture/04-CROSS-SYSTEM-BOUNDARIES.md`
6. `docs/architecture/05-GOVERNANCE-COMPLETENESS-AND-DECISIONS.md`
7. `docs/2026-10-27-sar-consolidated-carryforward.md`

For changes to the separate SAR corporate website, the **website's** `docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md` governs public copy, route design and visual brand.

## Never lose the core capabilities

**ResourceOS is more than a route calculator or dashboard.** Its foundational product requirement is: (1) read an **unstarted project** document/BOQ/specification set; (2) extract source-linked technical, contractual, cost and scheduling requirements; (3) build a canonical project/WBS and run resource-constrained, scenario and cash-flow simulation; (4) prepare supplier/OEM/machinery/third-party hire/transport/service RFQs; (5) have a **human review and approve** every outbound RFQ; (6) send through an authorised adapter; (7) capture incoming supplier responses directly into the system, matching RFQ/version/lines; (8) re-evaluate provisional costs and execution simulations; (9) separately authorise award, project activation and financial commitments; (10) use actuals to reforecast and audit changes. Apply the same model to **Mining & Contract Services** and **Commodity Trading**.

DealScope is a SAR-owned **external, tenant-isolated** commercial intelligence and exchange application with verified profitable opportunity filtering. It has **no Supabase database yet**. Never conflate its customer data with internal SAR operations or unrelated businesses.

## Change workflow
- Identify and cite the specific current blueprint requirement and source before modifying code.
- Review affected data ownership, tenant/project access, supplier approval, money and contract permissions.
- Implement with negative-path and evidence tests, preserve original source/document lineage and source hashes.
- Update the relevant architecture document, change decision and implementation/test evidence register in the **same controlled batch**.
- A document, prototype, local unit test, or READY preview does not prove end-to-end acceptance or legal/financial authority.
- Use SAR-approved infrastructure only. Do not create or point apps at TenderDesk/Possent databases, keys or merchants.
- Do not enable GitHub Actions, silently transfer repositories, merge to main, deploy production, issue RFQs, purchase equipment, bind a contract or process payments without required explicit approval.
- If a needed fact/organogram/contract/process is absent, classify it as OPEN and request authoritative evidence; do not invent or omit it.

**Status:** These architecture documents are consolidated candidates pending Founder approval; until approved, preserve explicit previously confirmed decisions and flag conflicts.
