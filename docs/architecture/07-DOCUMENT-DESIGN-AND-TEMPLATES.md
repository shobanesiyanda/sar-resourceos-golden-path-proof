# SAR Corporate Documentation, Branding and Document Studio Standard

**Standard:** SAR-DOC-001 · **Owner:** Shobane African Resources (Pty) Ltd · **Founder direction:** 27 October 2026.
**Authority:** Approved requirement that all internal, client-facing and counterparty documents be professionally designed and prepared under SAR corporate branding. Specific templates, document content and outbound approval remain controlled.
**Scope:** SAR ResourceOS internal authoring, review, internal library, downloadable/printed drafts; proposals, tender documents, RFQs, price sheets, contracts, equipment enquiries, meeting packs, technical reports, financial packs, counterparties and regulatory records.

## A. Visual identity

Match the approved SAR corporate website design: navy `#04111F` and `#07192F`, restrained mineral gold `#C2A14A`, white and neutral stone, contemporary sans-serif typography and precise grid/spacing. Letterheads must show the public brand **Shobane African Resources** and legally applicable entity **Shobane African Resources (Pty) Ltd**. Include the correct legal information only where verified. Preserve the approved Africa-circle emblem **without improvising or replacing it**. The website master assets `public/images/1.png`, `2.png`, `2.svg` are the canonical identity candidates; only embed licensed, verified and approved assets in an issued document. The first Document Studio draft now embeds the website-approved main `1.png` logo with exact source bytes as a local ESM data URI (SHA `7c7a25d45c0a386e2b885499d7f7e9727623be6d`). Production-grade asset packaging, legibility and A4/PDF output QA remain OPEN; never render an invented substitute.

The interactive editing surface may be deliberately futuristic—a dark executive shell, precision gold accents, translucent control rails, readable document canvas, source/evidence chips, and clear state—not visual clutter. Printed/issued documents must be restrained, legible and polished on A4 and in black-and-white. Print/export must omit interactive controls.

## B. Mandatory document anatomy

1. Document type, title and project/reference number; version, author, internal division, effective date and lifecycle state.
2. Letterhead with approved brand; legitimate and verified physical/legal details as necessary.
3. Counterparty identity, addressee, subject, salutation and the content appropriate to the document type.
4. Document body in a clear numbered/unnumbered structure; tables with aligned units, currency and source basis when relevant.
5. Commercial terms and qualifications including validity, technical assumptions, currency, delivery basis, taxes, supporting evidence and disclaimers where applicable—not fabricated defaults.
6. Confidentiality classification, evidence or attachment schedule, footer version/reference and page numbering.
7. Explicit preparation, review, approval, authorised issue and recipient-delivery evidence. A user clicking `Preview` or `Export` is **not** approval.

## C. Document classes and template library

- Corporate letter; internal memorandum; commercial proposal; procurement RFQ; supplier offer/price sheet; service agreement/contract draft; tender submission; mine/project feasibility report; technical specifications/BOQ; working-capital/lender pack; meeting minutes; risk register; purchase order and invoice (**issuance exclusively through separate approvals/AccountingOS**).
- Templates are revision-controlled SAR assets, linked to originating approval, division, document type, locale, delivery channel and applicable legal entity; **never use generic placeholder bank/legal/contact information in an issued document**.
- Templates may be populated from ResourceOS **authorised, versioned source records**; data conflicts, missing evidence and placeholders must block `Issue`. No silent AI-generated legal promises, prices, certifications, tax treatment, signatory details or financial obligations.

## D. ResourceOS Document Studio — mandatory capability

Document authoring, editing, viewing and reviewing must occur natively inside **ResourceOS**; Microsoft Word, Google Docs or external editors are not the default authoring environment. Users must be able to create from template, edit structured sections and rich text, insert authorised facts, preview branded A4 documents, use an outline/navigator, compare revisions, annotate and collaborate according to roles, attach evidence, and submit for approval. Support future PDF/DOCX import, preservation of original binary, safe scanned preview, searchable indexing and export to controlled PDF/DOCX as approved. Print/download is an **optional delivery format**, not the primary editor.

**Current build sequence:** First-party session-based draft Studio with template picker, editable document blocks, live branded preview, outline, local draft export, and A4 browser printing. **Not yet** a persistent document management system; save/version history, real editable DOCX import, live PDF annotation, comments, simultaneous collaboration, final branded asset/export visual QA, signatures, document AI composition and external issue remain OPEN pending verified SAR Auth/Storage/database and external adapter tests.

## E. State, security and audit

`Draft` -> `In review` -> `Revisions requested` -> `Approved` -> `Authorised to issue` -> `Sent` -> `Acknowledged` (with `Revoked`, `Expired`, `Superseded`). Transitions require actual role/permission, immutable revision hashes and audit evidence. Outgoing RFQs have additional technical, commercial, approved-recipient and dispatch gates; no self-approval via UI. No confidential third-party document becomes visible across projects, customer tenants or SAR/DealScope database boundaries by ownership alone.

Treat uploaded PDF, DOCX and HTML as **untrusted** content, stored privately with malware checks and format-specific sanitisation. Autosave requires controlled, encrypted SAR storage; do not store confidential documents in shared browser `localStorage`. In-memory editing cannot be represented as a permanent save.

## F. Acceptance

- Branded A4 preview matches template and no fictitious corporate identity is printed; accessible keyboard/mobile reader/editor.
- Section edits, copy, reorder, restore and export cannot introduce unsafe HTML or overwrite approved source documents.
- Preview/export reveals an unapproved-draft watermark/status until real server-side approval.
- Role/tenant/project RLS, revisions, comments, merges and audit retention pass server-backed tests before collaborative release.
- Image/logo hash parity, typography rights, PDF/DOCX fidelity, print/pagination, template and source-field completeness, digital signatures and authorised outbound dispatch are independently verified.
- All released client/counterparty/internal documents conform to this standard with evidence of who prepared, reviewed, authorised and issued each revision.
