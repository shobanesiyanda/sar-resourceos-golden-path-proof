-- DealScope SINGLE FREE COMPLETE DEAL-ASSISTANCE & ASSESSMENT CYCLE
-- REVIEW ONLY: DO NOT EXECUTE. No SAR-owned DealScope Supabase is connected.
-- Supersedes prior TIME-BASED 30-day-trial candidate dated 27 Oct 2026.
-- Offer is one complete deal cycle, not unlimited reports within a duration.
-- Independently approved promotions MAY authorise a second full cycle.
-- Requires existing NEW SAR-owned DealScope ds_organizations, ds_memberships, auth.users.
-- No TenderDesk/BidOS/Possent fallback. Validate real schema/RLS/provider/DoA first.

create table if not exists public.ds_intro_cycle_offers (
 id uuid primary key default gen_random_uuid(),
 offer_version text not null unique,
 service_code text not null default 'COMPLETE_DEAL_ASSESSMENT'
   check(service_code='COMPLETE_DEAL_ASSESSMENT'),
 included_cycles integer not null default 1 check(included_cycles=1),
 price_minor bigint not null default 0 check(price_minor=0),
 auto_converts boolean not null default false check(auto_converts=false),
 requires_payment_method boolean not null default false check(requires_payment_method=false),
 state text not null check(state in ('draft','published','retired')),
 terms_version text not null,
 approved_by uuid references auth.users(id),
 approved_at timestamptz,
 created_at timestamptz not null default now(),
 check (state<>'published' or (approved_by is not null and approved_at is not null))
);
create table if not exists public.ds_intro_cycle_claims (
 id uuid primary key default gen_random_uuid(),
 offer_id uuid not null references public.ds_intro_cycle_offers(id) on delete restrict,
 organisation_id uuid not null references public.ds_organizations(id) on delete restrict,
 owner_user_id uuid not null references auth.users(id) on delete restrict,
 -- Use privacy-reviewed keyed deterministic server HMACs only; no raw IDs in exposed tables.
 person_identity_hmac char(64) not null check(person_identity_hmac ~ '^[0-9a-f]{64}$'),
 organisation_identity_hmac char(64) check(organisation_identity_hmac ~ '^[0-9a-f]{64}$'),
 eligibility_review_event_id text not null unique,
 eligibility_policy_version text not null,
 state text not null default 'accepted' check(state in ('accepted','revoked','disputed')),
 claimed_at timestamptz not null default now(),
 unique(person_identity_hmac),
 unique(organisation_identity_hmac),
 unique(organisation_id),
 unique(organisation_id,id)
);
create table if not exists public.ds_intro_cycle_entitlements (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null,
 claim_id uuid not null,
 owner_user_id uuid not null references auth.users(id) on delete restrict,
 cycles_granted integer not null default 1 check(cycles_granted between 1 and 2),
 cycles_available integer not null default 1 check(cycles_available between 0 and 2),
 cycles_reserved integer not null default 0 check(cycles_reserved between 0 and 2),
 cycles_completed integer not null default 0 check(cycles_completed between 0 and 2),
 state text not null check(state in ('active','suspended','revoked','closed')),
 version bigint not null default 1 check(version>0),
 intro_activation_event_id text not null unique,
 activated_at timestamptz not null default now(),
 automatic_charge boolean not null default false check(automatic_charge=false),
 auto_converts boolean not null default false check(auto_converts=false),
 unique(organisation_id,claim_id),
 foreign key(organisation_id,claim_id) references public.ds_intro_cycle_claims(organisation_id,id),
 check(cycles_available+cycles_reserved+cycles_completed=cycles_granted)
);
create table if not exists public.ds_intro_cycle_campaign_approvals (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.ds_organizations(id),
 entitlement_id uuid not null,
 approver_user_id uuid not null references auth.users(id),
 campaign_version text not null,
 reason text not null,
 valid_until timestamptz not null,
 reviewed_at timestamptz not null default now(),
 unique(entitlement_id),
 foreign key(organisation_id,entitlement_id)
  references public.ds_intro_cycle_entitlements(organisation_id,id),
 unique(organisation_id,id)
);
create table if not exists public.ds_intro_cycle_cases (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null,
 entitlement_id uuid not null,
 dossier_ref text not null,
 source_set_sha256 char(64) not null check(source_set_sha256 ~ '^[0-9a-f]{64}$'),
 state text not null check(state in ('in_progress','delivered','failed_recredited','disputed')),
 delivered_report_ref text,
 delivered_report_sha256 char(64),
 delivered_at timestamptz,
 evidence_review_event_id text,
 created_at timestamptz not null default now(),
 unique(organisation_id,dossier_ref),
 unique(organisation_id,id),
 foreign key(organisation_id,entitlement_id)
  references public.ds_intro_cycle_entitlements(organisation_id,id),
 check(state<>'delivered' or (delivered_report_ref is not null
  and delivered_report_sha256 is not null and delivered_at is not null))
);
create table if not exists public.ds_intro_cycle_events (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.ds_organizations(id),
 claim_id uuid,
 case_id uuid,
 actor_user_id uuid references auth.users(id),
 event_id text not null unique,
 kind text not null check(kind in ('eligibility_approved','cycle_granted','cycle_reserved',
  'intake_attested','integrity_attested','viability_attested','readiness_attested',
  'report_delivered','service_failed','recredit','promotion_approved',
  'additional_cycle_granted','revoked','appeal')),
 evidence_ref text,
 reason text not null,
 event_sha256 char(64),
 occurred_at timestamptz not null default now(),
 foreign key(organisation_id,claim_id) references public.ds_intro_cycle_claims(organisation_id,id),
 foreign key(organisation_id,case_id) references public.ds_intro_cycle_cases(organisation_id,id)
);
-- All writes are privileged and authenticated via backend atomic transactions.
-- Do not create public RPC functions bypassing authorisation or use browser service keys.
alter table public.ds_intro_cycle_offers enable row level security;
alter table public.ds_intro_cycle_claims enable row level security;
alter table public.ds_intro_cycle_entitlements enable row level security;
alter table public.ds_intro_cycle_campaign_approvals enable row level security;
alter table public.ds_intro_cycle_cases enable row level security;
alter table public.ds_intro_cycle_events enable row level security;
create policy ds_intro_offer_public on public.ds_intro_cycle_offers for select to anon,authenticated
 using(state='published' and approved_by is not null and approved_at is not null);
create policy ds_intro_entitlement_member_read on public.ds_intro_cycle_entitlements for select to authenticated
 using(owner_user_id=(select auth.uid()) and exists(
  select 1 from public.ds_memberships m where m.organization_id=ds_intro_cycle_entitlements.organisation_id
  and m.user_id=(select auth.uid()) and m.membership_state='active'));
-- Do not let a client read HMAC identity claims or approval/event ledgers, or alter balances.
-- Validation: no extra grants from fresh email, cloned company name, replayed campaign,
-- browser data, parallel sessions, missing report or violated stage sequence.
-- Only report delivery consumes completed free cycle; service failure recredits once.
-- No time window controls on deal lifecycle; case acceptance, evidence validity,
-- document/customer due diligence and abandoned-case policies remain separately governed.
