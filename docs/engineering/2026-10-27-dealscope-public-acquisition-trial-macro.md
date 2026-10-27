# DealScope Public Acquisition Website and Full-Suite Trial — Engineering Macro Checkpoint
**Checkpoint:** SAR-DSC-ACQ-MACRO-20261027-01
**Date:** 27 October 2026 SAST
**Company / owner:** Shobane African Resources (Pty) Ltd
**Implementation status:** **UNRELEASED development branch source.** No actual customer accounts, trial activations, provider verifications, live data, live checkout or independently accepted deployed public site.

## Why this batch exists
Founder correctly noted that design focused on the authenticated engine but omitted the signed-out experience at intended dealscope.co.za. WhatsApp originators and other visitors need an understandable value proposition and reason to register. Founder also recalled the previously expressly corrected 3 October rule: minimum **30-day full-feature trial**, no artificial feature-gated imitation; 27 October confirms at least one introductory free trial per eligible person, business or deal originator. DealScope remains the complete Discovery, Market, Integrity, Evidence, Viability, Watch, Commercial Exchange, PAYG, subscription and business/admin suite—not a standalone calculator, not a PAYG-only product.

## Completed source (draft branch)
- apps/dealscope/app/page.tsx: public signed-out homepage with trust-first hero, fictional/illustrative evidence report, suite capability grid, prospect journey, 30-day CTA, PAYG/subscription category and FAQ. Previous homepage calculator source fully preserved under apps/dealscope/app/runs/page.tsx with package relative imports corrected.
- apps/dealscope/app/landing.css: new responsive dark executive public marketing system, mobile and reduced motion.
- apps/dealscope/app/start/page.tsx: role-focused preview of trial onboarding, intentionally does NOT collect customer PII or assert account creation.
- apps/dealscope/app/layout.tsx: integrity-led metadata and robots index=false, retained until legal/security/actual domain release.
- apps/dealscope/lib/full-trial.mjs: separate trusted-identity-bound 30-day complete suite candidate entitlement, prevents previously claimed same individual/company from repeating; no card, automatic charge or auto conversion.
- apps/dealscope/test/full-trial.test.mjs and public-website.test.mjs: trial, expiry and source-route regression contracts.
- apps/dealscope/database/trial-entitlements.REVIEW-ONLY.sql: *unapplied* tenant/private identity claim, trial offer, entitlement and event proposals. No live SAR-controlled DealScope Supabase project connected.
- docs/architecture/12-DEALSCOPE-CUSTOMER-ACQUISITION-AND-BUSINESS-MODEL.md: full customer persona, origin/funnel, site map, value copy, flexible model, repeat use and historical indicative prices.
- docs/architecture/13-DEALSCOPE-FULL-TRIAL-ONBOARDING-AND-ENTITLEMENTS.md: authoritative original trial duration/features, new eligibility direction, privacy and no-auto-charge proposals, detailed backend lifecycle and negative-path acceptance.
- Integrated crosslinks to SAR architecture INDEX 00; operating model 01; DealScope 03; cross-system 04; decision register 06 (ADR-016, ADR-017); PAYG 10; IntegrityOS 11; child-app and DB READMEs; consolidated carryforward; and **separate** shobanesiyanda/sar-website redesign branch approved master build map as an external product boundary note only.

## Commercial packaging and source-of-truth restrictions
No published plan price adopted in this batch. Recovered historical *proposed* baselines: PAYG R450/1, R1,500/5, R3,500/15; Essential R15,000 per annum (1 seat, 20 runs/mo); Professional R28,500 per annum (3 seats, 50 runs/mo). Not verified, adopted or tax-reviewed 2026 public rates. The landing source displays categories, not monetary offers.
"Trial is full-feature" requires equal access to actual approved product feature set; does NOT waive independently applicable money/contract/identity/rights/assay/buyer/provider safety gates. Never pretend unavailable live issuer checks operate. Retention and one-per-person/company uniqueness require legitimate eligibility appeals; zero implicit charges.
The public domain was named by Founder; ownership, DNS, mail, TLS, legal policies and actual serving source are NOT verified. A URL open of dealscope.co.za was unsuccessful, which is not evidence that the domain is unregistered.

## Verification evidence
1. New pure full-trial module's **five committed test cases exercised and passing** against connector-fetched exact source through isolated JavaScript harness (not Node full checkout).
2. New public-site source contract's **five committed cases exercised and passing** against connector-fetched marketing, calculator, trial, Integrity, Exchange and layout source by independent in-memory file harness.
3. Prior consolidated 33 narrowly tested source cases retain their recorded historical results; overall new module set now **43 source-level tests passed / 0 recorded failures** under those narrow harnesses. This is not E2E, payment or clean Node acceptance.
4. SAR ResourceOS root project showed prior READY Vercel previews for the **root** Next.js app, NOT a successful compilation or visual acceptance of the nested DealScope public app. The separate DealScope Vercel project still had an older READY preview, not current source.
5. The container cannot access GitHub via DNS, preventing a clean checkout/npm ci/actual tsc/build/browser exercise. Work must not be marked production-ready from simulated tests.

## Exact follow-on engineering in dependency order
- Verify legal/control of dealscope.co.za, mail and product support domains; establish explicit public site's website pages, privacy, company info, terms, cookie use and consent.
- Access/provision the dedicated SAR-owned DealScope Supabase org/project (currently the only accessible connection exposes TenderDesk/BidOS; prohibited fallback). Create verified identity, user/org membership, encrypted scoped case storage, deal trials and evidence/cost records with negative-path RLS.
- Reconcile all REVIEW-ONLY SQL into a single clean migration with exact foreign keys, unique claims, atomic trial activation + annual/PAYG usage; test replay/concurrent claims and tenant recovery on proper isolated DB.
- Implement actual signup/invitation/password/login recovery, consented trial activation, full-suite roles, onboarding first-value and safe no-auto-charge expiry. Connect only verified authorised issuer, market-feed and payment providers.
- Build real acquisition analytics (consented, PII minimized), referral attribution, signed-out helpful public marketing assets and real customer-trial UAT. Ensure no fabricated testimonials/live listings.
- Complete full DealScope independent Node/TypeScript/build, responsive/a11y/browser, Auth/RLS, issuer unavailability/fraud evidence, payment/refund/cashbook, privacy, backup/restore tests.
- Preserve SAR internal ResourceOS physical trading, BusinessOS, CommercialOS, AccountingOS, PayrollOS and website as independent workstreams; do not promote partial products to main to imply completion.

**Release disposition:** HOLD. Public trial CTAs currently lead to an honestly labelled onboarding preview, never a fake signup; no customer is onboarded or billed. PR #1 remains draft on SAR's existing source branch and production main is untouched.


## 28 October 2026 — SUPERSEDING FOUNDER DECISION
The 30-day free access in the preceding historical 27 October checkpoint is **obsolete**. The current offer is ONE FREE COMPLETE Deal Assistance & Assessment cycle, for one customer-owned deal dossier. A second free cycle requires a separately approved promotion. The UI source is corrected at apps/dealscope/app/page.tsx and app/start/page.tsx; the old full-trial module/test were removed from the active branch, replaced by deal-cycle-trial.mjs and its tests. The original suite remains wholly in scope. The authoritative active entitlement is SAR-DSC-TRIAL-20261028-002 (architecture 13). Do not restore the old offer from this dated checkpoint. No live registration/billing/issuer verification is claimed.
