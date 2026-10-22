# SAR Resource Platform migration boundary — 22 October 2026

## Business authority
This is a staging branch, not a production release.

- **SAR Corporate Website:** public corporate identity and information; an optional Sell to SAR path directs to the governed submission journey, not its own buyer/supplier marketplace.
- **DealScope:** externally commercialised multi-commodity intelligence, subscription and PAYG Deal Runs, and the controlled multi-buyer Commercial Exchange. Separate customer identities, tenant access controls, entitlements and commercial records. SAR receives no privileged access to other buyer tenants' data.
- **SAR ResourceOS:** SAR's internal end-to-end enterprise operating system for Commodity Trading, DealScope division oversight and Mining Services. Internal purchasing, approvals, fleet, custody, warehouse, assay, settlements, treasury and operational controls remain exclusive to authorised SAR users.
- **Shared domain logic:** product registry, classification, commodity profiles, signals, provenance, price calculations, scenario/economics and evidence schemas. Shared code does not mean shared access to databases.

## Source-of-truth rule
This repository preserves the original ResourceOS golden-path history. The current proof repository contains seeded demo data and static dashboard counts; production readiness is not established by its successful Vercel build. Preserve current source and commit coordinates before extraction or restructuring.

## Migration design
1. Inventory the complete existing application, schema, API, environments, Vercel links and legacy files.
2. Classify each feature as RETAIN / ADAPT / MOVE TO DEALSCOPE / SHARED PACKAGE / DEPRECATE, with evidence and acceptance tests.
3. Develop separate apps for DealScope and SAR ResourceOS against versioned reusable domain packages.
4. Keep separate databases, authentication / tenant authority, storage, event streams and auditable payment workflows.
5. Deliver one controlled Sell to SAR submission API reachable from corporate website and DealScope; verify source identity and consent.
6. Keep dependency adapters for commodity intelligence, provider APIs, email, payments, object storage, jobs and authentication. Support managed Vercel/Supabase now and portable container hosting and Postgres-compatible data storage later.
7. Use external execution and manual controlled Vercel deployment gates — **no GitHub Actions**. Do not create, enable or run GitHub Actions.
8. Require tested source backups, database recovery, deterministic migrations, counts, RLS/auth checks, route-economic regression, source-to-settlement regression and explicit approval before production cutover.
9. Do not alter old Vercel environments, Supabase project credentials, source repository ownership, or deploy production as a side effect of this documentation.

## Account coordinates recorded on 2026-10-22
Original repo: shobanesiyanda/sar-resourceos-golden-path-proof
Original main: f784c998745526d54b13a3f93f77b512ebe5e7e3
Vercel application: sar-resourceos-golden-path-proof-live
Vercel last READY deployment: dpl_5JmqfwfajTCpLdrsNCJPSn9EyR1P
Destination GitHub owner: Possent-Systems
Current SAR Supabase database reference: **unverified** on the connected Supabase account; do not invent or substitute a TenderDesk project.

## Gates
- G0 source preservation, inventory and successful reproducible local build
- G1 approved module extraction plan and verified database mapping
- G2 working DealScope/SAR isolation and shared package contracts
- G3 restored or new staging deployment plus protected acceptance tests
- G4 signed production cutover, rollback evidence and monitoring

Status: migration branch opened, no production changes authorised.
