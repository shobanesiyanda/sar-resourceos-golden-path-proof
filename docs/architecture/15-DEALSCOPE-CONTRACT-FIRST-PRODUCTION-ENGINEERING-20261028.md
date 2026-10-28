# DealScope Deal Intelligence — source engineering reconciliation (2026-10-28)

Document ID: SAR-DSC-ENGINEERING-20261028-01
Status: UNRELEASED ENGINEERING CANDIDATE — source-only; no production permission
Legal operator: Shobane African Resources (Pty) Ltd
Branch ancestry: migration/2026-10-22-dealscope-resourceos @ f497b6e721ffa6a4a9ab08eed1f99de8a88b6c8c

## 1. Supersession / product boundary

Express Founder decisions of 28 October 2026 supersede conflicting earlier customer-facing design:
- Two core services are Market Intelligence (weekly commodity/grade/price evidence) and Deal Intelligence (customer-submitted assessment and commercial decision support).
- Customer-facing discovery of third-party deals and commercial exchange/matching are not approved as active DealScope functions. Preserve historical provenance and fail-closed Exchange endpoint; do not market them as available.
- Customer may upload a contract or source document, paste details or enter facts manually, or combine all three; extracted assertions must be reviewed for conflicts and confirmed.
- Commodity -> contractual delivery terms -> originator's value-chain role -> material form/stage -> known facts -> assessment -> decision report -> revise. The contract may supply delivery terms, but extraction cannot silently override conflicting user facts.
- Customer-facing product sells actionable outcomes (feedstock tonnes, suitable grades, maximum acquisition price, transporter negotiation allowance, financing, commercial viability and evidence gaps), not equations or proprietary adjustment rules.
- Proprietary calculations must execute in protected server-only modules. No secret or customer data in static frontend/source; no execution of commercial commitments.
- Prior market-scout and Exchange claims in architecture 03, public / and /runs remain superseded and require controlled reconciliation before release, not silent deletion of old source records.
- DealScope remains a distinct tenant-isolated SAR-owned product. No cross-company credentials or customer-data access.

## 2. Verified source entry point

SAR-owned canonical repository: shobanesiyanda/sar-resourceos-golden-path-proof
Main at audit: 6e18d39037373528634a69a132f66fe35577c3f1
Migration branch at audit: f497b6e721ffa6a4a9ab08eed1f99de8a88b6c8c
Current implementation: apps/dealscope on draft migration branch; no dedicated customer Supabase/Auth, live market ingestion, licence-bound verifier, protected assessment API or payment activation accepted.
- /runs remains generic frontend calculator importing the shared economics kernel; explicitly **not** the approved Deal Intelligence journey.
- /api/assessments remains HTTP 503 to protect unprovisioned customer data.
- /exchange remains HTTP 503; not to activate.
- Do not merge v6 signed-out homepage prototype into /runs or replace a functioning customer flow with a static marketing page.

## 3. This source-only batch

Added apps/dealscope/lib/server/deal-facts.mjs:
- Strict source channels; bounded, approved fact fields; unique source IDs; missing required context; cross-source contradictions; all results remain customer assertions.
- Source documents must be parsed by a future safe upload/OCR/structured extraction adapter; this module deliberately accepts structured extracted claims rather than claiming to verify contracts.

Added apps/dealscope/lib/server/chrome-route-engine.mjs:
- Chrome dry-tonne grade comparison and explicit chromium recovery scenarios (not equivalent to mass yield).
- Moisture-corrected load planning and rate-based truck haulage allowance (no invented market prices).
- Backend acquisition ceiling only when all required cost inputs are supplied; no zero substitution for unknown costs.
- Outputs remain hypothetical/non-binding; never turn a customer-supplied recovery or price into an independently confirmed fact.

Added test/deal-intake-and-chrome-engine.test.mjs:
- 10 source-specific Node tests, run locally in isolated workspace, all passed. Run again against an exact checkout at the candidate commit before acceptance.

## 4. Dependency sequence for genuine production continuation

0. Freeze and verify main/draft source refs, architecture authority and diff; branch remains unreleased.
1. Adopt versioned Commodity Specialist Registry (product, physical form including sweepings/tailings/high-grade ROM, role, stage, quality and regulatory model).
2. Authenticated tenancy and encrypted storage backed by a NEW SAR-controlled DealScope database, review-only migrations and negative RLS tests (never TenderDesk/BidOS projects).
3. Secure source upload + paste + manual input adapters; per-fact provenance, OCR/extraction with customer confirmation, contradiction resolution, amendments and append-only evidence chain.
4. Weekly dated commodity/grade/market feed provider adapters with licences/price basis, place, unit, validity, FX, and trust status.
5. Server-only technical models for chrome/coal/etc; licensed shipping/road rates, quality conversion, valid equipment/payload/load basis, Incoterms obligations and backsolved economics.
6. Authenticated assessment invocation, case persistence, versioned finance/evidence state, protected result projection and PDF report delivery.
7. Signed-out outcome-led marketing, onboarding and Facebook conversion; separate Market Intelligence and Deal Intelligence entitlements.
8. Full source tests, npm install/build/typecheck, RLS/negative and end-to-end acceptance, source integrity and explicit Founder release gate.

## 5. Current blockers and nonclaims

- No direct trustworthy DealScope database project, live RLS or persisted dossier.
- No live contract OCR/extraction, commodity rates, price feed or independently verified buyer contract in this code tranche.
- Exact source branch full build, deployed browser/API/DB and security verification still OPEN.
- Customer-assessment and customer/payment endpoints remain disabled; no claim of live platform or paid service.
- The new engine is not imported into a client bundle. Future implementation must add lint/CI checks against client imports, server API exposure and response leakage.
- Functional expansion is permitted on controlled branches only; no merge/deploy/payment/contract authority supplied by this engineering record.
