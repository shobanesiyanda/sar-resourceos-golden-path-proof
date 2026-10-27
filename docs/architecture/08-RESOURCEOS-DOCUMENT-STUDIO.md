# SAR ResourceOS Document Studio — Native Authoring, Viewer and Controlled Document Operations

**Architecture ID:** SAR-ROS-DOCSTUDIO-001 · **Owner:** Shobane African Resources (Pty) Ltd
**Founder-mandated scope:** Integrated document preparation, viewing, editing and professional branding; modern/futuristic executive experience; no dependency on a separate desktop word processor for normal SAR drafting.
**Status:** Direction approved. First interactive structured authoring route on unmerged preview branch; comprehensive secure document platform **NOT** delivered/accepted.

## 1. Intended end-state and native experience

ResourceOS shall own the entire document lifecycle: **create -> edit -> compare -> source-verify -> review -> approve -> issue -> trace responses -> archive/renew**. Editing and presentation happen within its authenticated shell. Downloads and external copies are formats for delivery only. The Document Studio must work on desktop, tablets and mobiles. The approved SAR corporate design standard `SAR-DOC-001` governs every output.

The experience combines an executive-grade dark navy/gold command rail, a bright responsive A4 canvas, templates/library/outline, context-sensitive formatting and properties, a live source-evidence inspector, versioned document timeline, review workflow and approved issue control. Avoid decorative animation that hides critical content or exhausts low-end mobile hardware. Support reduced-motion, keyboard shortcuts and screen readers.

## 2. Document Studio subsystems

| Domain | Required behaviour | Current evidence |
|---|---|---|
| Document library | Search/filter by division, project, parcel, counterparty, owner, type, version, state, classification, validity, tag | **OPEN — no accepted SAR document registry** |
| Branded template studio | Controlled letter, RFQ, proposal, tender, project, mine feasibility, contract, memo, commercial and finance templates | Five structured template starters in `lib/document-studio.ts`; standard in `07-DOCUMENT-DESIGN-AND-TEMPLATES.md` |
| Native editor | Headings, paragraphs, lists, tables, structured clauses, rich inline formatting, images, source tokens and calculated fields | **Partial:** editor supports headings, paragraphs, bullet lists, callouts, editable props, duplicate/reorder/remove. Rich inline/table/image editing OPEN |
| Viewer | Native browsing of own authored documents, selected existing document revisions, secure PDF/DOCX preview, sidebar notes | **Partial:** instant styled in-app draft preview, browser A4 print, and *local read-only PDF source viewer*. Authentic SAR document registry, editable PDF/DOCX imports, annotations and stored attachment access OPEN |
| Document intelligence | AI-assisted authoring from source evidence, document classification, citations, clause extraction, comparison and redlines | OPEN — require evidence groundedness and human review |
| Collaboration | Secure autosave, comments, mentions, simultaneous edits, tracked changes, merge/conflict resolution and locked versions | OPEN — needs SAR backend/RLS/event locking |
| Source links | Original tender/BOQ/RFQ/provider response, project/route, supplier, quote and price-source lineage | OPEN — needs verified authoritative records |
| Review and approval | Designated reviewers, technical and commercial signatures, version and recipient seal, issue gate | OPEN — draft cannot approve or send |
| Publishing | SAR-branded PDF and editable DOCX, printing, QR/verification, signing, optional digital identity, delivery receipts | Partial browser print and HTML/local JSON backup; true brand/logo parity, PDF and DOCX conversion OPEN |
| Lifecycle and retention | Classify, store privately, log, revoke/supersede, recover earlier revisions, verify original hashes | OPEN — live SAR DB/storage unverified |

## 3. Live first-stage implementation boundary

- `/documents` retains historical parcel evidence/readiness workflow and now links to `/documents/studio` in loading, exception and loaded states.
- `/documents/studio` opens a client-side draft session with template picker, editable block-canvas, structural outline, reference, division, classification, recipient and date fields, detail inspector, review gaps, HTML export, JSON portable local draft backup/import and browser A4 print.
- Mark draft visibly **SESSION ONLY / NOT SAVED**. No `localStorage`, privileged API route, Supabase inserts or synchronisation is attached. A browser reload can destroy work unless the user deliberately downloads a backup.
- Import accepts only bounded SAR structured JSON (`*.sardoc.json`), **not arbitrary HTML**. Imported fields are validated and all rendered body text is escaped by React or the exported HTML renderer. No untrusted markup is inserted into the editor.
- Export is a **watermarked draft** with the verified legal entity. The exact official main logo PNG from the SAR website, original Git blob `7c7a25d45c0a386e2b885499d7f7e9727623be6d` (506×262 RGBA), is now embedded byte-for-byte in the first draft Studio through `lib/sar-brand-assets.mjs` for the canvas and printable HTML. The browser renders the ORIGINAL asset, not a recreated emblem. Final A4/PDF visual validation, design sign-off, efficient binary asset packaging and authorised issuance are still OPEN.
- No "save to SAR", "send", "approve", "issue", "sign", "pay" or "place order" action is enabled. It is forbidden to misrepresent exporting as server persistence.

## 4. Authoritative object and revision contracts (planned, not migrated)

```text
Document
  id, owner_legal_entity, division, project_id?, parcel_id?, counterparty_id?,
  security_class, template_id, type, title, doc_ref, workflow_state, current_revision
DocumentRevision (immutable once reviewed)
  document_id, revision_id, parent_revision_id, content_format,
  structured_body, printed_snapshot, content_hash, schema_version,
  authored_by, created_at, source_refs[], document_template_version
DocumentEvidenceLink
  revision_id, linked_object_type, linked_object_id, original_file_hash,
  source_page_locator, consent, confirmed_by, validity
ReviewDecision
  revision_id, review_kind, reviewer_user_id, role_at_decision, decision,
  decision_timestamp, comments, signed_content_hash
DocumentIssue
  revision_id, issue_approval_id, exact_recipients[], delivery_adapter,
  idempotency_key, sent_event_id, provider_receipt, acknowledged_at
DocumentComment
  document_id, revision_id, location/selection_anchor, commenter,
  text, resolved_at, visibility
DocumentAttachment
  document_id, storage_key, media_type, file_hash, scan_state, uploader, permissions
```

Enforce foreign-key project and division scoping, real authenticated identities, immutable document versioning and tenant/project RLS. External client/counterparty documents require specific recipient checks. SAR/DealScope customer-private data boundaries remain strict. Do not substitute browser-scoped role booleans for back-end authorisation or permit service-role bypasses.

## 5. Controlled rendering and import/export

**Canonical format:** structured document AST/JSON with typed sections and business data references. WYSIWYG display is a view over the structured model. Sanitise all untrusted import and paste paths; enforce table/attachment/paragraph caps. Original uploaded DOCX/PDF is always kept immutable with hash, confidentiality, malware scan and version provenance.

**DOCX import:** authorised parser extracts paragraphs, runs, lists, tables, headers/footers, comments and embedded media to intermediate AST, emits fidelity/conflict warnings; never promise lossless roundtrip until tested. **PDF import:** default source viewer and annotation; editable version may require extraction/OCR and human review. Never imply binary PDF structure is freely editable in place.

**Exports:** in-app print to PDF and future server-generated PDF/DOCX with strict original SAR branding and business/legal version stamps. Issue and signature workflows operate only on exact output bytes with approved recipients. No unapproved automatic RFQ dispatch.

## 6. Intended phased engineering sequence

- **D-STUDIO-01 (source added):** session-based editor, approved design direction, template starters and structured validation; verify screen across phones/desktop and safe draft exports.
- **D-STUDIO-02:** verify SAR Supabase project and Auth/Storage; create separate `documents`, `document_revisions`, `document_approvals`, `document_comments`, `document_issue_events`, `document_attachments` data with RLS; use advisory transaction locks and server-owned version increments.
- **D-STUDIO-03:** persistent save, library, access scopes, optimistic revisions and version comparisons/restore; typed source linking and template registry.
- **D-STUDIO-04:** responsive rich-text editor with table/inline styles, embedded media and accessibility; real authenticated server autosave, collaboration and annotation.
- **D-STUDIO-05:** safe DOCX/PDF import/conversion, original binary viewer, branded high-fidelity issue-grade PDF/DOCX, final issue-grade logo visual QA and efficient binary asset packaging, retention and audit.
- **D-STUDIO-06:** Document Intelligence/AI-assisted drafting grounded in approved project/commodity/contract evidence; clause/price verification, human redlines.
- **D-STUDIO-07:** approval/recipient/contract/finance authority, provider-connected correspondence and direct counterparty response ingestion, RFQ/quotation/project feedback and notifications.
- **D-STUDIO-08:** security, POPIA, restore, collaborative denial/conflict, mobile/print/export parity, digital signature and full UAT; Founder-governed release.

## 7. Automated and human acceptance

**Basic source tests:** templates pass validator; arbitrary HTML is rendered as escaped text; all exported HTML is marked unapproved; invalid calendar dates and oversized/duplicate blocks are rejected. Node test file: `lib/document-studio.test.mjs`. These tests must be run on an exact checked-out source (not inferred from Vercel READY).

**UI acceptance:** author and edit every block, reorder/duplicate/delete, choose a template, view preview, print A4, download safe JSON and HTML, deliberately import a valid draft, reject malicious content; confirm A11y, focus behavior and viewport performance on Android and desktop.

**Platform acceptance:** independent users cannot read/alter another project; invalid user cannot auto-save; concurrent edit conflict does not overwrite accepted versions; false approval and expired quote are denied; provider emails/payments are authenticated and idempotent; original logo and document fidelity verified; browser/server audit and disaster recovery tests pass.

## 8. Product safety and UX promises

Future advanced viewer can incorporate **AI document companion panels**, verified clause/evidence highlights, project timeline overlays, live data-source tokens and predictive deviation cues, but each must be distinguishable as *AI suggestion, extracted fact, approved fact or computed result*. The editor must remain useful without AI. Never introduce synthetic legal identity, false supplier readiness, fictitious financial authority or simulated signatures into an issued artifact.

**Current baseline is a professional first-stage editing experience, not a Word-equivalent feature set or an accepted document-management platform.**
