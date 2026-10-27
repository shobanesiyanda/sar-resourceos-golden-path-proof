-- DealScope 30-day full-suite introductory trial candidate schema (REVIEW ONLY).
-- NEVER execute in TenderDesk/BidOS, SAR ResourceOS or the SAR corporate website.
-- Requires verified new SAR-controlled isolated DealScope Supabase project.
-- NOT AN APPLIED MIGRATION. No approval for production payment/registration.
-- Verify Supabase version, Data API grants, RLS and actual schema before migration.
-- Trust: identity/person/org correlation keys are deterministic HMACs from a
-- server-only key under documented POPIA retention; NEVER raw RSA/SA ID, company
-- proof or plain SHA of an ID in database/public browser.
create table if not exists public.ds_trial_offers (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 offer_version text not null,
 duration_seconds integer not null default 2592000 check(duration_seconds=2592000),
 full_suite boolean not null check(full_suite=true),
 auto_converts boolean not null default false check(auto_converts=false),
 requires_payment_method boolean not null default false check(requires_payment_method=false),
 status text not null check(status in ('draft','published','retired')),
 terms_version text not null,
 approved_by uuid references auth.users(id),
 approved_at timestamptz,
 created_at timestamptz not null default now(),
 check(status<>'published' or (approved_by is not null and approved_at is not null)),
 unique(code,offer_version)
);
create table if not exists public.ds_trial_claims (
 id uuid primary key default gen_random_uuid(),
 offer_id uuid not null references public.ds_trial_offers(id) on delete restrict,
 organization_id uuid not null references public.ds_organizations(id) on delete restrict,
 account_user_id uuid not null references auth.users(id) on delete restrict,
 person_identity_hmac char(64) not null check(person_identity_hmac ~ '^[0-9a-f]{64}$'),
 organization_identity_hmac char(64) check(organization_identity_hmac ~ '^[0-9a-f]{64}$'),
 identity_review_event_id text not null unique,
 claimed_at timestamptz not null default now(),
 claim_status text not null default 'accepted'
  check(claim_status in ('accepted','expired','revoked')),
 policy_version text not null,
 unique(person_identity_hmac),
 unique(organization_identity_hmac),
 unique(organization_id),
 unique(organization_id,id)
);
create table if not exists public.ds_trial_entitlements (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 trial_claim_id uuid not null,
 started_at timestamptz not null,
 expires_at timestamptz not null,
 current_state text not null check(current_state in ('active','expired','suspended','revoked')),
 version bigint not null default 1 check(version>0),
 activated_by uuid not null references auth.users(id),
 allowed_suite text not null check(allowed_suite='complete_dealscope'),
 requires_payment_method boolean not null default false check(requires_payment_method=false),
 automatic_charge boolean not null default false check(automatic_charge=false),
 auto_converts boolean not null default false check(auto_converts=false),
 created_at timestamptz not null default now(),
 unique(organization_id,trial_claim_id),
 foreign key(organization_id,trial_claim_id) references public.ds_trial_claims(organization_id,id) on delete restrict,
 check(expires_at=started_at+interval '30 days')
);
create index if not exists ds_trial_entitlement_org on public.ds_trial_entitlements(organization_id,current_state,expires_at);
create table if not exists public.ds_trial_events (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.ds_organizations(id) on delete restrict,
 trial_claim_id uuid not null,
 actor_user_id uuid references auth.users(id),
 kind text not null check(kind in ('eligible','rejected','activated','expired','suspended','revoked','appeal_received','appeal_decided')),
 reason text not null,
 policy_version text not null,
 event_id text not null unique,
 occurred_at timestamptz not null default now(),
 foreign key(organization_id,trial_claim_id) references public.ds_trial_claims(organization_id,id) on delete restrict
);
alter table public.ds_trial_offers enable row level security;
alter table public.ds_trial_claims enable row level security;
alter table public.ds_trial_entitlements enable row level security;
alter table public.ds_trial_events enable row level security;
-- Only published, approved trial offer may be viewed publicly.
create policy ds_trial_offer_public_read on public.ds_trial_offers for select to anon,authenticated
 using(status='published' and approved_by is not null and approved_at is not null);
-- Trials can be read by active members within the exact tenant.
create policy ds_trial_entitlement_tenant_read on public.ds_trial_entitlements for select to authenticated
 using(exists(select 1 from public.ds_memberships m where
 m.organization_id=ds_trial_entitlements.organization_id
 and m.user_id=(select auth.uid()) and m.membership_state='active'));
-- No client read of protected identity correlation keys or event ledger.
-- NO client INSERT/UPDATE/DELETE policies on ANY trial table.
-- Server activation requires transaction-level unique-key lock, authenticated
-- identity verification, independent account authorization and idempotency.
-- Read-only expiry and paid conversion are separate domain commands; explicit
-- payment-provider verified purchase only. Test under multiple user tokens.
