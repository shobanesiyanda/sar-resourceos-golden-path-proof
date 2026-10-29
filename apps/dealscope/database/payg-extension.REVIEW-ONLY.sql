-- DealScope PAYG extension for a NEW, independently verified SAR-controlled database.
-- SOURCE DESIGN ONLY. NOT A MIGRATION. DO NOT EXECUTE AGAINST BIDOS OR ANOTHER ENTITY.
-- Depends on ds_organizations, ds_memberships, ds_deal_runs, auth.users.
-- Implement atomic reserved-credit and payment settlement commands in a trusted
-- server/transaction layer after live Auth, RLS and fraud testing, never as client writes.

create table if not exists public.ds_payg_catalog (
  id uuid primary key default gen_random_uuid(),
  service_code text not null check (service_code='DEALSCOPE_DECISION_REPORT'),
  offer_version text not null,
  description text not null,
  price_minor bigint not null check (price_minor>0),
  included_credits integer not null check (included_credits between 1 and 100),
  currency char(3) not null default 'ZAR' check (currency='ZAR'),
  status text not null check (status in ('draft','published','retired')),
  valid_from timestamptz,
  valid_until timestamptz,
  unique(service_code,offer_version),
  check(valid_until is null or valid_from is null or valid_until>valid_from)
);
create table if not exists public.ds_payg_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete restrict,
  catalog_id uuid not null references public.ds_payg_catalog(id) on delete restrict,
  service_code text not null check(service_code='DEALSCOPE_DECISION_REPORT'),
  offer_version text not null,
  price_minor bigint not null check(price_minor>0),
  currency char(3) not null default 'ZAR' check(currency='ZAR'),
  legal_merchant text not null default 'Shobane African Resources (Pty) Ltd'
    check (legal_merchant='Shobane African Resources (Pty) Ltd'),
  order_state text not null default 'awaiting_payment'
    check(order_state in ('awaiting_payment','provider_confirmed','credited','failed','refunded','disputed')),
  created_at timestamptz not null default now(),
  unique(organization_id,id),
  unique(organization_id,customer_user_id,id)
);
create index if not exists ds_payg_orders_owner_idx
  on public.ds_payg_orders(organization_id,customer_user_id,created_at desc);
create table if not exists public.ds_payg_provider_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  order_id uuid not null,
  provider text not null,
  provider_event_id text not null,
  provider_payment_id text not null,
  provider_merchant_id text not null,
  amount_minor bigint not null check(amount_minor>=0),
  currency char(3) not null check(currency='ZAR'),
  event_kind text not null check(event_kind in ('payment_captured','payment_failed','refund_confirmed','chargeback')),
  authenticity_checked_at timestamptz,
  independently_confirmed_at timestamptz,
  verification_evidence_key text,
  received_at timestamptz not null default now(),
  unique(provider,provider_event_id),
  foreign key(organization_id,order_id)
    references public.ds_payg_orders(organization_id,id) on delete restrict
);
create table if not exists public.ds_payg_wallets (
  organization_id uuid not null references public.ds_organizations(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete restrict,
  available_credits integer not null default 0 check(available_credits>=0),
  reserved_credits integer not null default 0 check(reserved_credits>=0),
  consumed_credits integer not null default 0 check(consumed_credits>=0),
  lock_version bigint not null default 1 check(lock_version>=1),
  updated_at timestamptz not null default now(),
  primary key(organization_id,customer_user_id)
);
create table if not exists public.ds_payg_report_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  customer_user_id uuid not null,
  deal_run_id uuid,
  report_ref text,
  input_snapshot_hash text not null,
  engine_version text not null,
  delivery_state text not null default 'credit_reserved'
    check(delivery_state in ('credit_reserved','processing','delivered','failed_recredited','disputed')),
  issued_output_hash text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  unique(organization_id,customer_user_id,id),
  foreign key(organization_id,customer_user_id)
    references public.ds_payg_wallets(organization_id,customer_user_id) on delete restrict,
  foreign key(organization_id,deal_run_id,customer_user_id)
    references public.ds_deal_runs(organization_id,id,creator_user_id) on delete restrict,
  check((delivery_state='delivered' and issued_output_hash is not null and delivered_at is not null)
        or delivery_state<>'delivered')
);
create table if not exists public.ds_payg_credit_journal (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  customer_user_id uuid not null,
  order_id uuid,
  report_run_id uuid,
  event_kind text not null check(event_kind in ('grant','reserve','consume','recredit','refund_reversal','chargeback_hold')),
  quantity integer not null check(quantity>=1),
  idempotency_key text not null unique,
  audited_external_ref text,
  occurred_at timestamptz not null default now(),
  foreign key(organization_id,customer_user_id)
    references public.ds_payg_wallets(organization_id,customer_user_id) on delete restrict,
  foreign key(organization_id,order_id)
    references public.ds_payg_orders(organization_id,id) on delete restrict,
  foreign key(organization_id,customer_user_id,report_run_id)
    references public.ds_payg_report_runs(organization_id,customer_user_id,id) on delete restrict
);
create index if not exists ds_payg_journal_org_idx
  on public.ds_payg_credit_journal(organization_id,customer_user_id,occurred_at desc);

-- Treat these as exposed public-schema tables: RLS ON and no browser writes.
alter table public.ds_payg_catalog enable row level security;
alter table public.ds_payg_orders enable row level security;
alter table public.ds_payg_provider_receipts enable row level security;
alter table public.ds_payg_wallets enable row level security;
alter table public.ds_payg_report_runs enable row level security;
alter table public.ds_payg_credit_journal enable row level security;

-- Only published catalogue is public to read when API GRANT is separately granted.
create policy ds_payg_published_catalogue on public.ds_payg_catalog for select to anon,authenticated
 using (status='published' and (valid_from is null or valid_from<=now())
        and (valid_until is null or valid_until>now()));
-- The customer sees only their own orders/report runs/wallet within an active tenant membership.
create policy ds_payg_order_own_read on public.ds_payg_orders for select to authenticated
 using (customer_user_id=(select auth.uid()) and exists(
  select 1 from public.ds_memberships m
  where m.organization_id=ds_payg_orders.organization_id
   and m.user_id=(select auth.uid()) and m.membership_state='active'));
create policy ds_payg_wallet_own_read on public.ds_payg_wallets for select to authenticated
 using (customer_user_id=(select auth.uid()) and exists(
  select 1 from public.ds_memberships m
  where m.organization_id=ds_payg_wallets.organization_id
   and m.user_id=(select auth.uid()) and m.membership_state='active'));
create policy ds_payg_run_own_read on public.ds_payg_report_runs for select to authenticated
 using (customer_user_id=(select auth.uid()) and exists(
  select 1 from public.ds_memberships m
  where m.organization_id=ds_payg_report_runs.organization_id
   and m.user_id=(select auth.uid()) and m.membership_state='active'));

-- No client-write policies, including to credit movement or receipts.
-- Never expose a service-role key in Next.js/browser. Do not create a public
-- SECURITY DEFINER function to bypass RLS. Verify GRANT/Data API settings.
-- Next: generate a proper reviewed migration via Supabase CLI for the correct
-- project; test independent tenants, replay, race/atomicity, refund/reversal,
-- restored backups, provider signatures and company-ledger reconciliation.
