# DealScope — Invoice, VAT, Merchant Reconciliation and SAR Cost-Centre Policy (CONTROLLED DRAFT)
**Version:** DS-INVOICE-20261028-001 | Draft / no invoicing provider or ledger active.
**Actual supplier:** Shobane African Resources (Pty) Ltd. **Product/service brand:** DealScope. Do NOT issue receipts or invoices as an unregistered "DealScope (Pty) Ltd".

## 1. Company and tax records
Previously user-supplied company registration **2019/626848/07** and VAT registration **4040314793** are recorded but need confirmation of current CIPC and SARS vendor status before tax invoices are enabled. The 2026 standard South African VAT rate shown by SARS is **15%** for standard-rated supplies, but individual transactions must be classified accurately; do not hardcode VAT for exempt/zero-rated or non-taxable supplies. Current company registered/service address, business name usage, official contact and bank merchant particulars require legal/Finance verification.

## 2. Document types and mandatory fields
Use a **full tax invoice by default for all taxable DealScope orders** (safe consistent internal standard), correctly reflecting required statutory fields and thresholds: 'Tax Invoice' label, unique sequential invoice number, issuance date, SAR supplier legal name/address/VAT no., purchaser name/address and VAT no. where required, item description, supplied quantity and unit, value ex VAT, applicable VAT amount/rate, total inclusive price, actual contractual service period, currency ZAR, order reference and immutable issued version. Tax point and VAT invoice timeframes must be validated; SARS states tax invoices generally issued within 21 days of supply. Full tax invoice is required above R5,000 consideration; simplified invoice may apply at lower amounts under legal conditions, but DealScope's platform standard shall remain full where validated.
A free full assessment is priced R0.00 under the offer: record the non-revenuefulfilment/marketing cost-centre event, not a fake paid capture or VAT liability. A free service need not falsely appear as a tax invoice; customer receives its service-completion report and any appropriate zero-value receipt if approved.

## 3. Invoice event lifecycle
Draft quotation/checkout summary -> customer-reviewed immutable priced order -> provider-authenticated capture -> ledger posting intent -> financial reconciliation -> sequential issued SAR tax invoice (only if legally appropriate) -> customer delivery and accessible archive -> credit note/refund if legally required -> audited close.
Never label a mock preview invoice 'Paid'. Never mark a provider event settled until provider settlement and bank reconciliation confirm. Prevent duplicate invoice for same order/capture idempotency event. Credit notes reference original invoice, service and original PSP transaction; validate signed amounts/tax adjustments and refund authority. Preserve electronic records durably, securely and with accessible customer transaction history.

## 4. Core financial postings (illustrative; requires accountant approval)
- Authorised payment capture: Dr PSP clearing / Cr customer deferred revenue or payable where performance remains outstanding; record output VAT at legally correct tax point, not blindly at delivery if the VAT law requires otherwise.
- Provider settlement: Dr SAR bank (net), Dr payment processing fee expense, Cr PSP clearing (gross). Reconcile any unsettled or disputed differences.
- Delivered paid analysis: Dr deferred revenue / Cr DealScope service revenue within SAR books (apply actual accounting recognition policy, not merely click/credit reservation).
- Reversals/refunds: approve and record linked credit notes/tax corrections, revenue or liability reversal and PSP/bank payout, with segregation of duties.
- Compensating credit for undelivered assessment: journal a service entitlement correction, not an unrelated bank refund.
- All customer funds and VAT remain under actual SAR statutory financial control, subject to payment provider terms and tax rules. DealScope is a BUSINESS UNIT/COST CENTRE of SAR, not a separate registered taxpayer or undisclosed second GL.

## 5. Pricing and cost attribution
Capture per-service gross contribution: price ex VAT; provider issuer/verification fees, data, model compute, payment processing, customer acquisition/WhatsApp campaigns, staff support, legal/compliance, hosting and report production cost. Segregate per-case free-cycle subsidy from paid runs and separately contracted issuer services. Track customer conversion, repeat paying clients, refund rates, paid analysis delivered, customer support burden, transaction margins and operational risk to assess whether an independently incorporated DealScope entity is justified later. Management segment reporting does not create a new legal company or standalone official AFS.

## 6. Release-gated implementation and evidence
Financial receipt, credit wallet and webhook work remains pure source contracts; actual licensed SAR merchant, bank feed, invoice issuing system, tax point, verified VAT status, accounting controls and financial-posting sign-off must be demonstrated before use. Invoices must be signed/issued by authorised SAR commercial/Finance roles via DoA; provider reconciliation, cancellation, dispute, audit and tax adjustments must be tested in sandbox and then approved. No other business (Possent/TenderDesk) may process these SAR receipts. External statutory audits and record retention follow applicable law, not promises invented in marketing.
Sources: https://www.sars.gov.za/businesses-and-employers/government/tax-invoices/ ; https://www.sars.gov.za/tax-rates/other-taxes/ .
