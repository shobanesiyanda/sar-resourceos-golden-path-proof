# DealScope Macro 003 — Guarded source corrections and runtime blockers
**ID:** SAR-DSC-ENGINEERING-MACRO-20261028-003
**Date:** 28 October 2026, Africa/Johannesburg
**Legal owner/operator:** Shobane African Resources (Pty) Ltd (no Possent affiliation).
**Repository:** `shobanesiyanda/sar-resourceos-golden-path-proof`
**Working draft branch/PR:** `migration/2026-10-22-dealscope-resourceos`, PR #1, open/draft/unmerged.
**Previously verified HEAD/parent:** `bf6211acd23aad3655a5169547982746744e586d`.
**Current checkpoint commit:** Git commit that includes this file; inspect the GitHub branch history for its exact SHA.
**Acceptance status:** SOURCE-ONLY CANDIDATE, UNRELEASED. DO NOT treat as executed native tests or deployed changes.

## Evidence and repairs
- At entry the PR head and branch head both matched `bf6211acd23aad3655a5169547982746744e586d`. Nine Macro 002 known blob SHAs matched; recursive GitHub tree contained 313 entries / 227 blobs and no npm dependency lockfile. Preserved historical scope and live main.
- Actual terminal contains Node 22.16.0/npm 10.9.2, NOT Node 24. `git ls-remote https://github.com/shobanesiyanda/sar-resourceos-golden-path-proof.git HEAD` failed with `Could not resolve host: github.com`. npm registry unavailable. Therefore no full trusted checkout, npm ci, native npm test, TS check, Next build, shared-package integration or browser testing was executed.
- Connected Supabase provider listing contained only the TenderDesk organisation and BidOS-related projects. No SAR-controlled DealScope technical project is connected, so NO database SQL was applied, queried, migrated or adversarially tested.
- Source defect 1: `recordCycleStage` permitted the same attestation event to complete multiple distinct stages. Candidate correction records all stage event IDs and rejects reuse for stages, final delivery and failure recredits.
- Source defect 2: `restoreFailedCycle` previously accepted a customer principal and arbitrary reason alone. Candidate correction additionally requires an independently trusted failure event, matching case, unique event ID and evidence hash; genuine server-side attestation must be sourced from a trusted backend, not browser-provided flags.
- Source defect 3: PAYG `ds_payg_report_runs` referenced `ds_deal_runs` by organisation and deal ID, without enforcing the same customer/creator. Candidate review-only SQL adds `unique(organization_id,id,creator_user_id)` and the corresponding three-part foreign key. No database execution is claimed.
- Negative Node test cases added for stage/delivery/failure replay, missing independent failure attestation, and customer-specific composite SQL FK. Existing positive tests preserved.
- Preserved one FULL free assessment, SAR truthful legal operator, no auto-charge, private rejected deals, fail-closed APIs and all production/merchant/Exchange controls.

## Changed file register
1. `apps/dealscope/lib/deal-cycle-trial.mjs`
2. `apps/dealscope/test/deal-cycle-trial.test.mjs`
3. `apps/dealscope/database/initial-schema.REVIEW-ONLY.sql`
4. `apps/dealscope/database/payg-extension.REVIEW-ONLY.sql`
5. `apps/dealscope/database/schema-contract.test.mjs`
6. `apps/dealscope/README.md`
7. `docs/2026-10-27-sar-consolidated-carryforward.md`
8. This checkpoint.

## Verification matrix
| Gate | Result | Evidence |
| --- | --- | --- |
| Source HEAD/PR 002 checkpoint | PASS | Same HEAD, 9/9 known blob hashes |
| Changed-source exact anchor matching | PASS — static only | Unique source anchor checks and generated test source |
| Native Node24 npm ci | BLOCKED | No Node24/registry/checkout; no lockfile |
| npm test, typecheck, build | NOT RUN | Blocked by checkout/dependency prerequisites |
| PostgreSQL 17 schema/RLS/evidence tests | NOT RUN | No verified SAR-owned database |
| Customer registration, legal issuance, payment | NO-GO | No live tenant/Auth, policies, PSP or merchant signoff |
| PR to main, production deploy | NO-GO | No Founder release approval or runtime acceptance |

## NEXT — guarded exact continuation
Recover THIS commit from the SAR-owned GitHub draft branch to a trusted isolated Node24 runner. Generate/review its package-lock.json, run `npm ci`, `npm test`, `npm run typecheck`, `npm run build` (child app and relevant shared packages), repair defects and record actual command logs. Use only a verified SAR-controlled DealScope test Supabase/Postgres project to validate schema compilation/migration order, composite FK cross-user denial, tenant RLS, GRANTs, append-only event uniqueness, concurrent reservation/recredit and recovery. Run negative tests for forged backend trust flags, stale sessions, duplicate attestations and actual immutable ledger. Keep all endpoint 503 holds until approved. Obtain current legal CIPC/VAT/counsel/POPIA/merchant evidence before customer-facing activation. No main merge, forced push, production SQL, money movement, actual RFQs or domain cutover.

**Rollback:** Inspect this checkpoint commit and its parent, then use an ordinary reviewed revert commit on the development branch if required. No production or database rollback applies because neither was changed.

## Post-commit verification evidence (same protected source branch)
- Initial source integrity commit: `40d7f4666d2b41cd761c2e3aca13c6044915ffe3` (parent: `bf6211acd23aad3655a5169547982746744e586d`). The GitHub PR #1 was re-read at the new HEAD: OPEN, DRAFT, UNMERGED.
- Actual exact committed `deal-cycle-trial.mjs` and `deal-cycle-trial.test.mjs` were fetched back from GitHub and executed in a source-adapted JavaScript V8 harness: **9 of 9 pass**, 0 fail. This is NOT native Node 24, npm, or production execution.
- All three actual committed SQL-source contract test files were fetched and evaluated against their respective SQL source files in the same source-adapted V8 environment: **23 of 23 pass**, 0 fail, 3 suites compiled. The combined source-adapted outcome for this continuation is **32/32**, not a replacement for the previously recorded 100 source-adapted cases from Macro 002.
- Fresh static inspection of all FIVE review-only SQL designs found **28 proposed public tables and 28 matching explicit RLS-enable statements**, zero references to missing `ds_*` tables in the five-file proposed set, and zero client-write `CREATE POLICY` clauses. These are static source invariants, NOT SQL compilation, actual RLS-denial tests, or database acceptance.
- Re-read protected Next API route source at `/api/customer`, `/api/assessments`, `/api/orders`, `/api/checkout` and `/api/exchange`: all FIVE still contain fail-closed/unavailable behaviour. This is source inspection, not a deployed HTTP response test.
- Source blob SHA evidence after commit: `deal-cycle-trial.mjs=7ae8d26961b38c647b06d0955131ebb50cafa2e5`; `deal-cycle-trial.test.mjs=182c06c8bbc099d31da668725f008c64d14e852d`; initial SQL `477d2035a1f0f5041d7b9a2c7ed1ca4c941acf60`; PAYG SQL `c8235d4e1aa4e4a4781bb6cfb80331f76623b9ca`.
- The native execution blockers remain unchanged: no Node 24, no GitHub/registry DNS from the shell, no npm lockfile, no verified SAR-owned DealScope test Supabase, and no current legal/merchant release approvals. No production SQL, external provider action, customer data, live payment, main merge or deployment occurred.
