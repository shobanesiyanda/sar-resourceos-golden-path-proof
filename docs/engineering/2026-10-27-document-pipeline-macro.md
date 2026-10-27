# SAR ResourceOS — Simulation-to-Document Studio Macro Integration

Control: SAR-ROS-DOC-MACRO-20261027-01
Date: 27 October 2026 (SAST)
Owner: Shobane African Resources (Pty) Ltd
Status: UNRELEASED INTEGRATION CANDIDATE (source commits verified; exact final checkout build and E2E unverified)

## Scope delivered in isolated development branch

- `packages/project-core/src/document-pack.mjs`: pure draft-only adapter taking a structured, hashed project source manifest, version-matched multiple simulation cases, cost-basis classifications and optional prepared RFQ. Output is native Document Studio v1 drafts for a feasibility brief, internal options memo, and optional UNSENT RFQ.
- `packages/project-core/test/document-pack.test.mjs`: source-level regression tests for source agreement, multiple scenario requirement, cost provenance, invalid numeric/date rejection, and RFQ draft boundaries.
- `app/documents/studio/page.tsx`: bounded `.sarproject.json` session import, draft-only validation and direct loading into existing editable Document Studio. No persistence or automatic approvals.
- **These changes are not merged into main**, not connected to live SAR records, not certified by a technical professional, not an issuance capability and not a market quote/price data source.

Change commits:
- `7d56d5c19cad2e713f011c170f7b6343be415e18` adapter
- `7b028cdf5d070bf63e4d7d083f528e60ce1008fd` tests
- `a870ec78b95d584f9c53532618ffcfb60acf25cf` Document Studio integration

## Exact validation boundary

GitHub verifies the three committed source revisions. The two earlier adapter/test commits have Vercel READY preview records. **Vercel READY is a successful preview build indicator, not an executed test or a certified functional production acceptance**. UI commit a870ec... remains pending build/preview inspection as of checkpoint preparation. The five committed tests have not been executed on a verified byte-for-byte checkout. Local analogous experimental tests are not accepted as exact source test evidence. No DB/RLS/integration/supplier inbox tests passed.

### Executable check plan — only in a trusted checkout

1. `node --test packages/project-core/test/document-pack.test.mjs` using Node 22+.
2. `node --experimental-strip-types --test lib/document-studio.test.mjs`, where applicable.
3. `npm ci` only after lockfile and version-pinned dependencies have been reconciled, then `npx tsc --noEmit` and `npm run build`.
4. Browser smoke test `/documents/studio`: prepare from valid structured scenarios, open feasibility/memo/RFQ, edit/preview/export locally, reject mismatched hashes, missing case, missing cost classification, invalid dates and unverified RFQ. Confirm no authenticated send, save, issue or approval paths.
5. Security/acceptance: verify no cross-tenant access; immutable document lineage; DOCX/PDF real rendering, approval and supplier response E2E only when correct SAR-controlled backend exists.

## Decision: documentary output from system truth, not manual duplication

Project source collection -> human-reviewed extraction -> WBS/resources -> 2+ evidence-versioned scenarios -> cost proof and sourcing -> RFQs prepared -> human-reviewed vendor dispatch (future) -> inbound verified quote matching (future) -> candidate re-simulation -> working proposal and decision documents -> Document Studio edit/review/version/issue (future regulated gates).

The adapter accepts explicit input **but does not itself execute simulations or fetch costs**. Supplier quotes, emails, rates, hashes, source statements, finance and licence claims from uploaded local data are not cryptographically authenticated or independent evidence. All draft exports must say UNAPPROVED; never call an assumption a verified market quote.

## Next dependency-correct batches

1. **D-PIPE-02: Calculation and source contracts** — test-only fixtures, engine I/O schema, exact requirement-to-cost and scenario set reconciliations, cash-flow and peak working capital as separate audited calculations, real quote validity/taxes/mobilisation/lead times.
2. **D-PIPE-03: Document Intelligence** — actual authorised file uploads and scanners, versioned extraction, BOQ/drawing/contract parsers, structured source citations, human technical adjudication, deterministic project/WBS package generation; benchmark source truth before claiming AI autonomy.
3. **D-PIPE-04: RFQ two-way lifecycle** — sealed versions, delegated signatures, authorised dispatch via SAR-linked provider, inbound security, vendor identity, attachments and commercial line normalization, candidate reforecast. No silent awards.
4. **D-STUDIO-02...08** — SAR-hosted authenticated document registry/ACL/RLS, revision locking, real persistent saves, editor enhancements, DOCX/PDF/print fidelity, redlines, providers, record retention, event audit.
5. **MACRO SAR-01..05** — website asset/repository reconciliation, ResourceOS original physical commodity route, DealScope tenant-isolated greenfield backend, negative-path E2E, mainline merge and authorised production release only when accepted.

## Confirmed external blockers

- No independently located SAR-controlled Supabase/ResourceOS project on connected Supabase account; only TenderDesk/BidOS objects are visible. No cross-company fallback.
- New DealScope database, separate tenant/Auth/payment setup and SAR ownership of org/project must be evidenced and authorised.
- Vercel website redesign preview deployment BLOCKED under collaboration controls; asset byte parity and source build remain unaccepted.
- No reviewed provider credentials or authoritative SAR legal/financial delegation register, verified bank/merchant/settlement, live pricing/quotes, professional project certifications or actual contracts are available in this source checkout.
- Application PR #1 is open/draft/diverged from Founder-ratified docs on main; reconcile without unreviewed automatic merge.

**Release disposition:** maintain release hold. Founder-ratified architecture requirements on `main` remain controlling; this is an application candidate and engineering handover, not a new authority instrument.
