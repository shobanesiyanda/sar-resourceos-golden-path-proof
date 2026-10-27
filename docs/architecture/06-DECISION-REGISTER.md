# SAR Controlled Architecture Decision Register

**ID:** SAR-ADR-REGISTER-001 • **Initial revision:** 27 October 2026  
**Scope:** Records explicit operating/product decisions communicated by SAR leadership. Their inclusion here preserves provenance; it does not fabricate signed corporate policies or turn code into a completed product.  
**State:** **Draft transcription awaiting Founder confirmation as a consolidated register**.

| Decision | Explicitly stated direction | Affected blueprints | Recorded status |
|---|---|---|---|
| SAR-ADR-001 | Shobane African Resources (Pty) Ltd **owns SAR ResourceOS, the corporate website and DealScope**; Possent Systems has no relationship or automatic rights. Do not transfer SAR assets or credentials there. | Corporate operating model, systems boundaries, infrastructure, GitHub custody | Founder direction, 27 Oct 2026 |
| SAR-ADR-002 | DealScope is SAR-owned but a distinct **external customer platform**, with a separately secured Supabase database and tenant access. There is **no DealScope Supabase project or database yet**. | DealScope architecture, database README, payment architecture | Founder direction, 27 Oct 2026 |
| SAR-ADR-003 | ResourceOS's central capability is intelligent interpretation of **projects not yet commenced**, breaking down their tender/BOQ/technical documents, modelling the full project and **simulating project execution** before business commitment. Feeds commodity trading and mining contracting. | ResourceOS §§1–5, macro carry-forward §8 | Confirmed earlier product direction, captured in repo 27 Oct |
| SAR-ADR-004 | ResourceOS must **prepare RFQs** to suppliers, OEMs, machinery manufacturers, equipment-hire companies and other providers; a human must review and approve **before** sending; responses must return directly to ResourceOS, update modelled costs and feed execution decisions. | ResourceOS §6, macro carry-forward §9 | Confirmed earlier product direction, captured in repo 27 Oct |
| SAR-ADR-005 | Public corporate brand: Shobane African Resources; exact tagline **“Built on resources. Driven by innovation. Focused on value.”**; general supplier CTA **“Sell to SAR”** with multi-commodity entry first. | Website Master Build Map | Approved website direction |
| SAR-ADR-006 | Public corporate business narrative centres Commodity Trading and Mining & Contract Services, with Project Development and Technology & Innovation cross-cutting. Proprietary internal systems are **not** advertised as public software divisions. | Website Master Build Map, corporate operating model | Approved website direction |
| SAR-ADR-007 | ResourceOS internal UI preserves dark executive shell, sidebar/topbar, central heat map, gold accents and strict status controls; preserve actual operational modules rather than replacing with demos. | ResourceOS §3, macro §1 SAR-03 | Historical technical direction, implementation unverified |
| SAR-ADR-008 | DealScope displays only **evidence-qualified profitable actionable opportunities** to users; rejected, break-even and under-threshold items remain in restricted screening logs. | DealScope §4 | Confirmed DealScope screening direction |
| SAR-ADR-009 | Commodity trading pricing is sourced and date-stamped; separate indicative export parity from buyer-confirmed PO terms, mass yield from grade, feedstock from concentrate assay, direct route cost from overhead, and owner/outsourced transport capacity. | ResourceOS §7, macro §3.1 | Historical trading controls, current price and route evidence not pre-approved |
| SAR-ADR-010 | No automated purchase, supplier award, finance release, external binding communication or production merge without the relevant **human** authorisation; no GitHub Actions or silent live deployment under present engineering mandate. | All three products, governance | Explicit engineering and operating direction |

| SAR-ADR-011 | **ALL** SAR client-facing, internal, supplier, buyer, financial, regulatory and counterparty documents must be professionally designed, consistent and accurately branded using the approved original SAR corporate identity. Templates and delivery are centrally governed. | SAR-DOC-001, ResourceOS and all external document flows | Founder-approved 27 Oct 2026 |
| SAR-ADR-012 | ResourceOS must include a **native, futuristic document viewing, creation and editing workspace** with an integrated corporate template library, instead of requiring external Word-style applications. Advanced editable PDF/DOCX, reviews, collaboration and authorised issuance are governed next-stage requirements. | SAR Document Studio engineering blueprint, ResourceOS | Founder direction 27 Oct 2026 |

## Supersessions and conflicts to track

- Earlier proposed transfer of SAR GitHub history/assets to **Possent Systems** is **cancelled** by SAR-ADR-001. Historical non-SAR staging snapshots require custody review, not continued expansion.
- Earlier architecture wording implying an existing but inaccessible DealScope database is superseded by SAR-ADR-002: the database has **never been created**.
- Older corporate website depiction of Commercial Intelligence as a standalone public pillar is superseded by SAR-ADR-006 and the current website master build map.
- The earlier one-parcel golden-path proof is **not** a full definition of ResourceOS. SAR-ADR-003/004 establish project interpretation, simulation, RFQs and virtual-to-physical execution as indispensable core capabilities.
- Approved website requirements and committed implementation are on a **separate repository/branch**; do not merge obsolete website PRs over them.

## Future change entry format

`decision_id`, `previous_version`, `new_text`, `decision_date`, `approving_actor/authority`, `rationale`, `affected_docs/code`, `required_tests`, `supersession_id`, `approved_branch_commit`.

**Open:** this is a controlled consolidation of decisions from project history, not a signed minute book. The complete corporate organogram, detailed delegation matrix, role assignments, permanent operating division charters, current actual commodities/contracts and AI engineering evaluations still require source-backed approval before the enterprise blueprints can be marked complete.
