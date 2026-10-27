# Shobane African Resources — Founder-Ratified Enterprise Architecture

**Legal owner:** Shobane African Resources (Pty) Ltd. **Possent Systems has no association with SAR.**

**Mandatory source of truth for SAR organisational/system requirements:** [Start Here — Enterprise Architecture Index](docs/architecture/00-START-HERE.md). This baseline includes [corporate operating model](docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md), [ResourceOS intelligence/simulation/RFQ architecture](docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md), [DealScope architecture](docs/architecture/03-DEALSCOPE-PLATFORM-ARCHITECTURE.md), [cross-system contracts](docs/architecture/04-CROSS-SYSTEM-BOUNDARIES.md), [governance and completion register](docs/architecture/05-GOVERNANCE-COMPLETENESS-AND-DECISIONS.md), [Founder decisions](docs/architecture/06-DECISION-REGISTER.md), [corporate document standards](docs/architecture/07-DOCUMENT-DESIGN-AND-TEMPLATES.md), and [native Document Studio specification](docs/architecture/08-RESOURCEOS-DOCUMENT-STUDIO.md).

The **corporate website's** approved source remains its [master build map in the separate SAR website repository](https://github.com/shobanesiyanda/sar-website/blob/main/docs/SAR_CORPORATE_WEBSITE_MASTER_BUILD_MAP.md).

**Scope vs implementation:** The Founder-approved requirements are authoritative. App code in this production-mainline baseline may still be the historical parcel demo. Intelligent project simulation, document studio, RFQ sending, DealScope Auth/database and payments have separate ongoing draft implementation and do **not** become operational merely because these blueprints are on main. Read the [engineering evidence and acceptance register](docs/2026-10-27-sar-consolidated-carryforward.md) and `AGENTS.md` before changes.

---

## Historical original application readme (retained for provenance)

<!-- trigger deploy -->
# SAR ResourceOS Golden Path Proof

This is a beginner-deployable Next.js baseline proving one full parcel lifecycle from:
document → dispatch → movement → delivery → reconciliation → finance

## Included
- seeded demo parcel
- golden-path proof page
- API route returning parcel JSON
- docs explaining the proof boundary

## Run locally
1. Install dependencies:
   npm install

2. Start dev server:
   npm run dev

3. Open:
   - http://localhost:3000/
   - http://localhost:3000/golden-path
   - http://localhost:3000/api/demo/parcel

## Deploy on Vercel
1. Push to GitHub
2. Import into Vercel
3. Deploy with default Next.js settings

## Next build step
After this golden path, implement exception-path controls:
- missing sample
- missing seal
- truck mismatch
- variance dispute
- short delivery
- finance hold


## DealScope signed-out acquisition and full-feature trial (development only)
SAR-owned DealScope is a separate full commercial-intelligence and Exchange business with a public customer acquisition target at **dealscope.co.za**. Its development code under apps/dealscope now includes a signed-out public / marketing site, /start preview of the Founder-approved 30-day FULL-FEATURE trial, /integrity guided self-check, /runs preserved calculator and locked /exchange. The product is NOT PAYG-only. For full requirements, business-model and site structure read docs/architecture/12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md; for trial identity and entitlement read docs/architecture/13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md; for source checkpoint read docs/engineering/2026-10-27-dealscope-public-acquisition-trial-macro.md. No live account activation, real issuer verification, independent child-app build or production domain is implied.
