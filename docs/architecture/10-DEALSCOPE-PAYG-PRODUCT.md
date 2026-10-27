# DealScope PAYG — Outcome-Independent Deal Analysis Product Contract
**ID:** SAR-DSC-PAYG-20261027-001 | **Date:** 27 October 2026 | **Owner:** Shobane African Resources (Pty) Ltd | **Status:** Founder-directed commercial model; implementation/terms/pricing/payment infrastructure OPEN.

## Customer and monetisation thesis
DealScope's first monetisable service is a clearly defined **per-run commercial analysis**, especially for South African mineral deal originators, independent traders, buyer/seller intermediaries, mandate holders and sourcing agents already spending money on travel, sampling, assays and deal diligence. They pay for an analytical service, not a promise of successful procurement/offtake, buyer availability, a mine right or eventual deal closure. A rejected/uneconomic proposed transaction can still be an honestly and properly delivered, valuable assessment showing the customer's exposure and reasons to avoid continuing.

**Critical product distinction:** the prior evidence-qualified opportunity shortlist rule remains absolute. DealScope cannot market a rejected or break-even candidate as a qualified offer. Separately, an authenticated customer may purchase an analysis **of their own unqualified candidate**, and the result may legitimately be negative. This distinction resolves the apparent contradiction without changing either rule.

## Product order
1. Public landing page describing report scope, assumptions and exclusions; perhaps a free arithmetic teaser, prominently marked non-verified and not a paid report.
2. A paid **single Deal Run report** is the initial launch SKU, optional multi-run credit packs next. Assisted evidence-verification/report service can be priced separately only where staff and source data are available. Subscriptions and Exchange are independent later layers.
3. Display actual offered price, VAT treatment, report scope, required input/document checklist, evidence quality tier, typical deliverables and cancellation/refund/complaints terms before order. Founder-set price and actual tax/provider setup remain open; do not infer a price from a R600-R700 laboratory fee anecdote.
4. Order binds one authenticated customer and organisation to service version and price in minor units, order ID and licensed SAR merchant account.
5. Payment provider must verify signature, actual provider-side capture, legal merchant ID, correct currency/amount and order, with replay-safe idempotent event and invoice/GL reconciliation. A redirect to "success" is NOT evidence of capture.
6. Validated purchase creates report credits through an atomic tenant-scoped ledger. A customer authorises a Deal Run; reserve credit atomically; on actual report delivery consume exactly once. If delivery fails, re-credit or refund under valid policy and applicable law; do not silently consume a credit.
7. A completed report is evidence of performance of the purchased analysis. SAR/DealScope has no contractual duty to make the commercial trade succeed; this does NOT nullify laws on misrepresentation, defective service, cancellation, applicable cooling-off, provider reversal, refunds or consumer rights. Obtain South African legal review of ECTA/CPA applicability and terms, especially whether paid services begin with explicit customer consent.
8. Reports display **user-supplied/indicative** vs **independently corroborated** source quality clearly and preserve assumptions, date, scenario, route, revenue model, direct costs, sensitivity, negative findings, decision limitations and source citations. Avoid representing typed prices as live market quotations.
9. Optional Commercial Exchange sharing requires new distinct seller/buyer rights, offer evidence and consent; DealScope's internal customer data and SAR ResourceOS physical commercial records are separate trust zones. Billing a report never grants universal buyer access or seller disclosure.
10. Human-delivered concierge pilots may be evaluated separately only with real SAR invoices, merchant/bank authorisation, actual report quality and a legally reviewed customer agreement; no unverified payment link or provider claim.

## Engineering boundary / actual work
- \`apps/dealscope/lib/payg-entitlements.mjs\`: published-price order, provider evidence gate, idempotent credit candidate, tenant-bound reservation and completed/failed report disposition.
- \`apps/dealscope/test/payg-entitlements.test.mjs\`: duplicate, cross-tenant, merchant/capture mismatch, non-delivery and successful-report accounting tests.
- No live SAR Supabase project, Auth, hosted report documents, durable wallet, real provider adapter, refund provider adapter, merchant settlement or tax invoice exists in accepted DealScope infrastructure. PAYG is NOT operational.
- Dedicated SAR-owned DealScope database with tested RLS, Auth, immutable money/credit ledger, atomic RPC, licensed provider sandbox/live contract, compliance/POPIA and real customer acceptance must precede production checkout.

## Commercial experiments (proposals, not adopted prices)
Prove repeat willingness to pay through an opt-in pilot with transparent consent and report quality measurement. Track paid report conversion, actual production cost, negative-finding usefulness, support burden, repeat purchase, reversals, fraud and gross contribution per analysis. Do NOT optimise solely for paid clicks or fabricate qualified deals. Prioritise user-supplied candidate analysis before marketplace brokerage and live two-way trade fulfilment.

## Legal source-review note
South African ECTA section 43 specifies disclosures and an opportunity to review/correct an online transaction; sections 44-46 establish cooling-off and service-performance requirements with exceptions depending on actual facts. The product must be reviewed for CPA/ECTA and POPIA compliance before accepting money. No unconditional blanket 'no refunds regardless of circumstances' terms.
