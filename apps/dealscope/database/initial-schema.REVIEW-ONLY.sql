-- DealScope initial standalone database design, DRAFT ONLY.
-- NOT an applied Supabase migration. NOT tested against a DealScope database.
-- Authoritative owner organization must be chosen before provisioning.
-- Intended to run exclusively in a NEW, dedicated DealScope project after review,
-- local CLI migration generation, validation, and independent RLS acceptance.
-- NEVER run against BidOS, SAR ResourceOS, or the corporate website database.

create extension if not exists pgcrypto;

create table if not exists public.ds_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null check (length(btrim(legal_name)) between 2 and 240),
  display_name text not null check (length(btrim(display_name)) between 2 and 120),
  country_code char(2) not null default 'ZA',
  verification_state text not null default 'unverified'
    check (verification_state in ('unverified','under_review','verified','suspended')),
  created_at timestamptz not null default now()
);
create table if not exists public.ds_memberships (
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  membership_role text not null check (membership_role in ('owner','analyst','buyer','seller','viewer')),
  membership_state text not null default 'pending'
    check (membership_state in ('pending','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);
create index if not exists ds_memberships_user_idx on public.ds_memberships(user_id, membership_state);

create table if not exists public.ds_market_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  evidence_class text not null check (evidence_class in ('indicative','quoted','confirmed')),
  source_name text not null,
  source_document_key text,
  observed_on date not null,
  valid_until date,
  status text not null default 'pending_review'
    check (status in ('pending_review','verified','rejected','expired')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id,id)
);

create table if not exists public.ds_deal_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  creator_user_id uuid not null references auth.users(id) on delete restrict,
  input_snapshot jsonb not null check (jsonb_typeof(input_snapshot) = 'object'),
  result_snapshot jsonb not null check (jsonb_typeof(result_snapshot) = 'object'),
  engine_version text not null,
  qualification text not null
    check (qualification in ('incomplete','rejected','calculation_pass','evidence_qualified')),
  evidence_state text not null
    check (evidence_state in ('user_provided','pending_review','verified','rejected')),
  created_at timestamptz not null default now(),
  unique (organization_id,id)
);
create index if not exists ds_deal_runs_owner_idx
  on public.ds_deal_runs(organization_id,creator_user_id,created_at desc);

create table if not exists public.ds_offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  deal_run_id uuid not null,
  state text not null default 'draft'
    check (state in ('draft','under_review','authorised','withdrawn','expired','closed')),
  seller_consent_recorded_at timestamptz,
  validity_until timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id,id),
  foreign key (organization_id,deal_run_id)
    references public.ds_deal_runs(organization_id,id) on delete restrict
);

create table if not exists public.ds_offer_disclosures (
  id uuid primary key default gen_random_uuid(),
  seller_organization_id uuid not null,
  offer_id uuid not null,
  buyer_organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','approved','revoked','expired')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (offer_id,buyer_organization_id),
  foreign key (seller_organization_id,offer_id)
    references public.ds_offers(organization_id,id) on delete restrict,
  check (seller_organization_id <> buyer_organization_id)
);
create index if not exists ds_disclosures_buyer_idx
  on public.ds_offer_disclosures(buyer_organization_id,status);

create table if not exists public.ds_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  provider text,
  provider_subscription_id text,
  plan_code text not null,
  state text not null default 'pending'
    check (state in ('pending','trial','active','past_due','cancelled','expired')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (provider,provider_subscription_id)
);
create index if not exists ds_subscriptions_org_idx
  on public.ds_subscriptions(organization_id,state);

create table if not exists public.ds_payment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  amount_minor bigint,
  currency char(3),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_state text not null default 'received'
    check (processing_state in ('received','verified','processed','rejected','error')),
  payload_reference text,
  unique (provider,provider_event_id),
  check (amount_minor is null or amount_minor >= 0)
);
create index if not exists ds_payments_org_idx
  on public.ds_payment_events(organization_id,received_at desc);

create table if not exists public.ds_audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.ds_organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  target_type text not null,
  target_id uuid,
  event_payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(event_payload) = 'object'),
  occurred_at timestamptz not null default now()
);
create index if not exists ds_audit_events_org_idx
  on public.ds_audit_events(organization_id,occurred_at desc);

-- ALL tables in public are RLS protected, INCLUDING server-written ledgers.
alter table public.ds_organizations enable row level security;
alter table public.ds_memberships enable row level security;
alter table public.ds_market_evidence enable row level security;
alter table public.ds_deal_runs enable row level security;
alter table public.ds_offers enable row level security;
alter table public.ds_offer_disclosures enable row level security;
alter table public.ds_subscriptions enable row level security;
alter table public.ds_payment_events enable row level security;
alter table public.ds_audit_events enable row level security;

-- Minimum read-only authenticated policies.
-- No browser-client write policies. Offer, evidence, disclosure,
-- payment and audit ledgers remain deny-by-default through the Data API.
create policy "ds_member_read_self"
  on public.ds_memberships for select to authenticated
  using (user_id = (select auth.uid()));
create policy "ds_organization_read_active_member"
  on public.ds_organizations for select to authenticated
  using (exists (
    select 1 from public.ds_memberships m
    where m.organization_id = id and m.user_id = (select auth.uid())
      and m.membership_state = 'active'
  ));
create policy "ds_deal_run_read_own"
  on public.ds_deal_runs for select to authenticated
  using (creator_user_id = (select auth.uid()) and exists (
    select 1 from public.ds_memberships m
    where m.organization_id = ds_deal_runs.organization_id
      and m.user_id = (select auth.uid())
      and m.membership_state = 'active'
  ));
create policy "ds_subscription_read_active_member"
  on public.ds_subscriptions for select to authenticated
  using (exists (
    select 1 from public.ds_memberships m
    where m.organization_id = ds_subscriptions.organization_id
      and m.user_id = (select auth.uid())
      and m.membership_state = 'active'
  ));

-- Explicit API grants must be reviewed alongside the new project's
-- Data API exposure setting; RLS does not replace schema/table grants.
-- Implement writes only behind an authenticated, verified, audited server adapter.
-- Never expose service-role credentials or grant unscoped client writes.
