-- DealScope customer identity and legal acceptance ledger, REVIEW ONLY / DO NOT APPLY.
-- Requires initial-schema.REVIEW-ONLY.sql: ds_organizations, ds_memberships and auth.users.
-- No connected SAR-owned DealScope database. Not a generated migration.
-- Never use against existing TenderDesk/BidOS or SAR internal ResourceOS databases.
-- Complements trial-entitlements.REVIEW-ONLY.sql, which requires actual authenticated eligibility.
-- Trust: published legal versions require independent company/counsel authority; customer
-- acceptance must be captured via verified server-side identity and policy document hashes.

create table if not exists public.ds_customer_policy_versions(
 id uuid primary key default gen_random_uuid(),
 policy_kind text not null check(policy_kind in ('terms','privacy','payments')),
 policy_version text not null,
 sha256 char(64) not null check(sha256 ~ '^[0-9a-f]{64}$'),
 legal_supplier text not null default 'Shobane African Resources (Pty) Ltd'
  check(legal_supplier='Shobane African Resources (Pty) Ltd'),
 state text not null default 'draft' check(state in ('draft','approved','effective','retired')),
 reviewed_by uuid references auth.users(id) on delete restrict,
 published_by uuid references auth.users(id) on delete restrict,
 approval_event_id text,
 effective_at timestamptz,
 created_at timestamptz not null default now(),
 unique(policy_kind,policy_version),
 unique(id,policy_kind),
 check(state not in ('effective','retired') or
   (reviewed_by is not null and published_by is not null and
   reviewed_by<>published_by and approval_event_id is not null and effective_at is not null))
);
create table if not exists public.ds_customer_policy_acceptances(
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.ds_organizations(id) on delete restrict,
 customer_user_id uuid not null references auth.users(id) on delete restrict,
 terms_policy_id uuid not null,
 terms_kind text not null default 'terms' check(terms_kind='terms'),
 privacy_policy_id uuid not null,
 privacy_kind text not null default 'privacy' check(privacy_kind='privacy'),
 payments_policy_id uuid not null,
 payments_kind text not null default 'payments' check(payments_kind='payments'),
 service_code text not null check(service_code in
   ('COMPLETE_DEAL_ASSESSMENT','DEALSCOPE_DECISION_REPORT')),
 offer_version text not null,
 amount_minor bigint not null check(amount_minor>=0),
 currency char(3) not null default 'ZAR' check(currency='ZAR'),
 legal_supplier text not null default 'Shobane African Resources (Pty) Ltd'
  check(legal_supplier='Shobane African Resources (Pty) Ltd'),
 automatic_charge boolean not null default false check(automatic_charge=false),
 terms_seen boolean not null check(terms_seen=true),
 privacy_seen boolean not null check(privacy_seen=true),
 payments_seen boolean not null check(payments_seen=true),
 review_confirmed boolean not null check(review_confirmed=true),
 affirmative_agreement boolean not null check(affirmative_agreement=true),
 browser_session_audit_ref text not null,
 server_auth_event_ref text not null,
 acceptance_event_id text not null unique,
 accepted_at timestamptz not null default now(),
 unique(organisation_id,id),
 foreign key(terms_policy_id,terms_kind)
   references public.ds_customer_policy_versions(id,policy_kind) on delete restrict,
 foreign key(privacy_policy_id,privacy_kind)
   references public.ds_customer_policy_versions(id,policy_kind) on delete restrict,
 foreign key(payments_policy_id,payments_kind)
   references public.ds_customer_policy_versions(id,policy_kind) on delete restrict,
 check(service_code<>'COMPLETE_DEAL_ASSESSMENT' or amount_minor=0),
 check(service_code<>'DEALSCOPE_DECISION_REPORT' or amount_minor>0)
);
create index if not exists ds_customer_acceptance_owner_idx
 on public.ds_customer_policy_acceptances(organisation_id,customer_user_id,accepted_at desc);

create table if not exists public.ds_customer_verification_reviews(
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.ds_organizations(id) on delete restrict,
 customer_user_id uuid not null references auth.users(id) on delete restrict,
 reviewer_user_id uuid not null references auth.users(id) on delete restrict,
 review_event_id text not null unique,
 source_evidence_sha256 char(64) not null check(source_evidence_sha256 ~ '^[0-9a-f]{64}$'),
 review_state text not null check(review_state in ('pending','approved','rejected','revoked','expired')),
 verified_at timestamptz,
 valid_until timestamptz,
 reviewer_note_ref text not null,
 created_at timestamptz not null default now(),
 unique(organisation_id,id),
 check(reviewer_user_id<>customer_user_id),
 check(review_state<>'approved' or verified_at is not null),
 check(valid_until is null or verified_at is null or valid_until>verified_at)
);

-- All exposed-schema tables must be RLS protected, even server-written ledgers.
alter table public.ds_customer_policy_versions enable row level security;
alter table public.ds_customer_policy_acceptances enable row level security;
alter table public.ds_customer_verification_reviews enable row level security;

-- Public reads: only currently-effective versions whose sign-off exists.
-- Actual immutable documents require separate hash-checked publication.
create policy ds_customer_policy_current_read on public.ds_customer_policy_versions
 for select to anon,authenticated using (
  state='effective' and effective_at<=now() and
  reviewed_by is not null and published_by is not null and
  reviewed_by<>published_by and approval_event_id is not null);

-- Only a customer with an active member row may see their own receipt.
create policy ds_customer_acceptance_self_read on public.ds_customer_policy_acceptances
 for select to authenticated using (
 customer_user_id=(select auth.uid()) and exists(
  select 1 from public.ds_memberships m
  where m.organization_id=ds_customer_policy_acceptances.organisation_id
   and m.user_id=(select auth.uid()) and m.membership_state='active'));

-- NO browser read on private verification review evidence or identity proof.
-- NO browser write policy on any of these tables.
-- Trusted server transaction must atomically verify latest legal versions,
-- real company/policy signoff, member+session, exact document hashes, offer,
-- pricing, consent, duplicates, and eventual grant/checkout.
-- Explicit API grants/Data API exposure setting and cross-tenant negative SQL
-- tests remain open in the SAR-owned project; never trust user_metadata for roles.
