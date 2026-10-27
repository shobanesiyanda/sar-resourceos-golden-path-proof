-- SOURCE-ONLY Greenfield DealScope IntegrityOS schema design (NOT APPLIED).
-- Requires separately verified SAR-controlled DealScope Supabase project.
-- Never run in TenderDesk, BidOS, SAR ResourceOS or the SAR website database.
-- Existing prerequisite: ds_organizations, ds_memberships, auth.users.
-- Approval, evidence ingestion/verification, issuer-callback logging and writes
-- must use authenticated, server-controlled transaction adapters.
create table if not exists public.ds_integrity_cases(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.ds_organizations(id) on delete restrict,
 created_by uuid not null references auth.users(id) on delete restrict,
 subject_kind text not null check (subject_kind in ('deal','counterparty','material_lot','buyer','seller')),
 private_case_ref text not null,
 case_state text not null default 'investigation_open'
  check (case_state in ('investigation_open','review_required','reviewed_with_gaps',
                       'reviewed_corroborated_with_residual_risk','closed','disputed')),
 baseline_version bigint not null default 1 check(baseline_version>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,id),
 unique(organization_id,private_case_ref)
);
create table if not exists public.ds_integrity_evidence(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 case_id uuid not null,
 claim_type text not null,
 source_document_key text not null,
 sha256 char(64) not null check(sha256 ~ '^[0-9a-f]{64}$'),
 source_locator text not null,
 observed_on date,
 valid_until date,
 source_class text not null check(source_class in ('self_declaration','uploaded_copy',
          'direct_issuer_record','direct_verified_callback','licensed_provider_result')),
 verification_state text not null default 'unverified'
  check (verification_state in ('unverified','under_review','independently_corrobated','contradicted','stale','rejected')),
 reviewed_by uuid references auth.users(id),
 verified_at timestamptz,
 reviewer_decision_ref text,
 created_at timestamptz not null default now(),
 unique(organization_id,case_id,id),
 foreign key(organization_id,case_id)
  references public.ds_integrity_cases(organization_id,id) on delete restrict,
 check (valid_until is null or observed_on is null or valid_until>=observed_on),
 check (verification_state<>'independently_corrobated' OR
        (reviewed_by is not null and verified_at is not null and reviewer_decision_ref is not null))
);
create table if not exists public.ds_integrity_findings(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 case_id uuid not null,
 evidence_id uuid,
 claim_type text not null,
 status text not null check (status in ('missing','unverified_claim','corroborated','stale','material_inconsistency')),
 reasoning text not null,
 investigation_action text not null,
 review_status text not null default 'draft'
  check (review_status in ('draft','review_requested','accepted','rejected','superseded')),
 reviewer_id uuid references auth.users(id),
 decided_at timestamptz,
 revision_hash char(64) not null check(revision_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now(),
 unique(organization_id,case_id,id),
 foreign key(organization_id,case_id)
  references public.ds_integrity_cases(organization_id,id) on delete restrict,
 foreign key(organization_id,case_id,evidence_id)
  references public.ds_integrity_evidence(organization_id,case_id,id) on delete restrict
);
create table if not exists public.ds_integrity_case_events(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 case_id uuid not null,
 actor_user_id uuid references auth.users(id),
 kind text not null check (kind in ('created','source_submitted','review_requested',
  'verification_recorded','finding_issued','correction_requested','correction_reviewed',
  'status_changed','closed')),
 event_reason text not null,
 event_ref text not null unique,
 before_hash char(64),
 after_hash char(64),
 occurred_at timestamptz not null default now(),
 foreign key(organization_id,case_id)
  references public.ds_integrity_cases(organization_id,id) on delete restrict
);
create index if not exists ds_integrity_cases_owner_idx
 on public.ds_integrity_cases(organization_id,created_by,created_at desc);
create index if not exists ds_integrity_evidence_case_idx
 on public.ds_integrity_evidence(organization_id,case_id,created_at desc);
create index if not exists ds_integrity_findings_case_idx
 on public.ds_integrity_findings(organization_id,case_id,created_at desc);
alter table public.ds_integrity_cases enable row level security;
alter table public.ds_integrity_evidence enable row level security;
alter table public.ds_integrity_findings enable row level security;
alter table public.ds_integrity_case_events enable row level security;
-- Browser users can read ONLY their own private case within an active tenant;
-- these READ policies DO NOT authorise uploads, audits, reviews or conclusions.
create policy ds_integrity_own_case_read on public.ds_integrity_cases
 for select to authenticated using (
  created_by=(select auth.uid()) and exists(
   select 1 from public.ds_memberships m where
   m.organization_id=ds_integrity_cases.organization_id
   and m.user_id=(select auth.uid()) and m.membership_state='active'));
create policy ds_integrity_evidence_read on public.ds_integrity_evidence
 for select to authenticated using (exists(
  select 1 from public.ds_integrity_cases c
  where c.organization_id=ds_integrity_evidence.organization_id
   and c.id=ds_integrity_evidence.case_id and c.created_by=(select auth.uid())
   and exists(select 1 from public.ds_memberships m where
      m.organization_id=c.organization_id and m.user_id=(select auth.uid())
      and m.membership_state='active')));
create policy ds_integrity_findings_read on public.ds_integrity_findings
 for select to authenticated using (exists(
  select 1 from public.ds_integrity_cases c
  where c.organization_id=ds_integrity_findings.organization_id
   and c.id=ds_integrity_findings.case_id and c.created_by=(select auth.uid())
   and exists(select 1 from public.ds_memberships m where
      m.organization_id=c.organization_id and m.user_id=(select auth.uid())
      and m.membership_state='active')));
-- No browser mutations; no public reputation lists or broad counterparty reads.
-- Case events are internal server-only (zero browser access policies).
-- No public SECURITY DEFINER function, no client service key.
-- Needs transaction locks, append-only triggers, change review, data retention,
-- storage ACL, tests for wrong tenant and forged source, and review with legal.
