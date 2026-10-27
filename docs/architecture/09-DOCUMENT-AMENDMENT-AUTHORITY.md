# SAR Document Amendment Authority — Controlled Engineering Contract
**ID:** SAR-DOC-AMEND-20261027-001 | **Date:** 27 October 2026 | **Owner:** SAR | **Status:** Founder-required controls, source-level prototype; backend/DoA and operational issuance not accepted.

## Binding rule
A system-generated or approved SAR document is NOT editable simply because a person has a staff login, project membership or engineering role. Authors may request changes to specific identified sections with a meaningful reason and intended effect. An independent authorised approver must grant a version-bound, section-bound permission BEFORE changes are permitted. Changes create a separate candidate revision; never mutate the issued binary or original facts. After editing, each designated independent reviewer must approve the exact content hash. Only a trusted server-side document-domain service may atomically promote the candidate to the next issued revision, subject to current base revision, roles, DoA, source evidence and release gates.

## Mandatory event and data controls
- \`AmendmentRequest\`: request ID, legal entity, owner project/division, originating document ID, immutable base revision ID/hash, section IDs, requester authenticated user ID, request timestamp, reason, intended change, cited evidence, urgency and review class.
- \`AmendmentPreapproval\`: independent approver identity, effective role/policy version, scoped sections/operation, signed base hash, decision, recorded reason, server timestamp and expiry/revocation capability.
- \`RevisionCandidate\`: author, allowed field/section paths, immutable before/after comparison, proposed content hash, source evidence, risk flags, changed calculations and impacted downstream dependencies, submission timestamp.
- \`PostReview\`: role-specific technical/commercial/legal/document-controller review as per policy, independent reviewer, exact candidate hash, accepted/rejected and reason/timestamp. Require two separate reviewer roles for technical mine/project documents; ordinary documents may have a different documented approved policy.
- \`DocumentCommit\`: compare-and-swap on original document base, content hash integrity, post-review quorum, issue authority, version/sequence, immutable signed audit trail and sealed PDF/DOCX output, optional notice to recipients.
- \`DocumentSupersession\`: old issue remains permanently traceable; current issue pointer only changes in one controlled transaction; externally issued documents require controlled recall/reissue notices where necessary.

All timestamps must come from trusted server clocks, never arbitrary browser times. Stable immutable user/role identity and verified company-bound authentication must be used; UI flags do not confer authority. No self-preapproval or self-post-review. Reviewers approve exact bytes/structured content revision, not a broad document name. Ordinary free authoring in Document Studio remains possible only for a new UNISSUED scratch draft, clearly separated from governed system-generated and previously approved documents.

## Simulation-aware change impact
Any amendment affecting BOQ quantities, physical specifications, costs, supplier rates, deadlines, grade, assays, operating capacity, safety/compliance or contract terms must mark affected scenarios, RFQs, procurement comparisons, quotes, offers and financial forecasts as **stale pending revalidation**. Re-run deterministic calculations with unchanged source provenance where possible, re-verify quote dates and issue a revised pack for approval. No silent cross-system adjustment, purchase or financial posting.

## State and permission diagram
\`awaiting_preapproval -> edit_authorised -> awaiting_postreview -> approved_pending_atomic_commit -> issued_vN+1\`.
Rejection/cancellation generates immutable reasoned events; submission after a rejection requires a new approved scope or explicitly governed revision cycle. Editing outside the section scope is denied by backend policy; client-side readonly controls are merely defence in depth.

## Engineering status and exact gates
- Added \`packages/document-governance/src/amendment-workflow.mjs\` + six source-level test cases. Functions are pure domain transitions; authenticated server attestation is a REQUIRED external dependency, never assumed.
- Document Studio now displays imported system-prepared drafts read-only and blocks its edit mode pending a real amendment grant. This client control does not constitute backend security.
- **NOT implemented:** SAR-only Auth/DoA/RLS, encrypted persisted request ledger, section-level grants/leases, signed diff editor, immutable object versions, cross-service event outbox, approver queue and notification, atomic promotion, signed provider issue or audited restore.
- Required independent test gates: logged-in user role denial, project cross-scope denial, self approval, changed section denial, stale base hash, concurrent edits, duplicated approvals, malicious content, revoked authoriser, replayed issue/notification, post-approval exact document hash, output rendering parity, end-to-end restoration and disaster recovery.

No external document, supplier RFQ, contract, financial document or issued revision may use these source-level contracts as authority until complete integration evidence passes.
