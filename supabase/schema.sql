-- SAR ResourceOS Live v1 — Supabase Data Spine
-- Core schema for profiles, parcels, counterparties, route chains,
-- documents, approvals and audit events.

create extension if not exists "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum (
      'admin',
      'operator',
      'field_agent',
      'finance',
      'viewer'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'control_state') then
    create type control_state as enum (
      'Approved',
      'Pending',
      'Held',
      'Blocked',
      'Exception',
      'Complete'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'counterparty_type') then
    create type counterparty_type as enum (
      'Supplier',
      'Buyer',
      'Transporter',
      'Wash Plant',
      'Broker',
      'Mandate Holder',
      'Investor',
      'Other'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type document_type as enum (
      'KYC',
      'Supplier Quote',
      'Plant Tolling Quote',
      'Transport Quote',
      'Assay',
      'Weighbridge',
      'Contract',
      'Invoice',
      'Proof of Delivery',
      'Other'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'approval_type') then
    create type approval_type as enum (
      'Counterparty Approval',
      'Route Approval',
      'Plant Approval',
      'Dispatch Approval',
      'Finance Approval',
      'Document Approval',
      'Other'
    );
  end if;
end $$;

-- =========================================================
-- PROFILES
-- One profile per Supabase auth user.
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  company_name text default 'Shobane African Resources',
  role user_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- COUNTERPARTIES
-- Master directory for suppliers, buyers, transporters, plants, etc.
-- =========================================================

create table if not exists public.counterparties (
  id uuid primary key default gen_random_uuid(),
  counterparty_type counterparty_type not null,
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  location text,
  province text,
  country text default 'South Africa',
  status control_state not null default 'Pending',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PARCELS
-- Core operating parcel record.
-- =========================================================

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  parcel_code text not null unique,
  commodity text not null default 'Chrome',
  product_description text,
  accepted_tons numeric(12, 3) not null default 0,
  expected_price_per_ton numeric(12, 2),
  indicative_revenue numeric(14, 2) generated always as (
    accepted_tons * coalesce(expected_price_per_ton, 0)
  ) stored,
  control_state control_state not null default 'Pending',
  operator_name text,
  company_name text default 'Shobane African Resources',
  supplier_id uuid references public.counterparties(id),
  buyer_id uuid references public.counterparties(id),
  transporter_id uuid references public.counterparties(id),
  wash_plant_id uuid references public.counterparties(id),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ROUTE CHAINS
-- Supplier → Plant → Buyer route logic.
-- =========================================================

create table if not exists public.route_chains (
  id uuid primary key default gen_random_uuid(),
  route_code text not null unique,
  parcel_id uuid references public.parcels(id) on delete cascade,
  supplier_id uuid references public.counterparties(id),
  wash_plant_id uuid references public.counterparties(id),
  buyer_id uuid references public.counterparties(id),
  transporter_id uuid references public.counterparties(id),
  route_name text,
  origin_location text,
  plant_location text,
  delivery_location text,
  transport_cost_per_ton numeric(12, 2),
  tolling_cost_per_ton numeric(12, 2),
  estimated_margin_per_ton numeric(12, 2),
  status control_state not null default 'Pending',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- DOCUMENTS
-- Document registry metadata. File storage wiring comes later.
-- =========================================================

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  parcel_id uuid references public.parcels(id) on delete cascade,
  counterparty_id uuid references public.counterparties(id),
  document_type document_type not null default 'Other',
  title text not null,
  file_url text,
  status control_state not null default 'Pending',
  uploaded_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- APPROVALS
-- Approval workflow records.
-- =========================================================

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  approval_code text not null unique,
  approval_type approval_type not null,
  parcel_id uuid references public.parcels(id) on delete cascade,
  route_chain_id uuid references public.route_chains(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  status control_state not null default 'Pending',
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- AUDIT EVENTS
-- Immutable-style event log for important actions.
-- =========================================================

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  event_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_counterparties_updated_at on public.counterparties;
create trigger set_counterparties_updated_at
before update on public.counterparties
for each row execute function public.set_updated_at();

drop trigger if exists set_parcels_updated_at on public.parcels;
create trigger set_parcels_updated_at
before update on public.parcels
for each row execute function public.set_updated_at();

drop trigger if exists set_route_chains_updated_at on public.route_chains;
create trigger set_route_chains_updated_at
before update on public.route_chains
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_approvals_updated_at on public.approvals;
create trigger set_approvals_updated_at
before update on public.approvals
for each row execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.counterparties enable row level security;
alter table public.parcels enable row level security;
alter table public.route_chains enable row level security;
alter table public.documents enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_events enable row level security;

-- PROFILES POLICIES

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
    and p.is_active = true
  )
);

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
    and p.is_active = true
  )
);

-- SHARED READ POLICIES FOR ACTIVE USERS

drop policy if exists "Active users can read counterparties" on public.counterparties;
create policy "Active users can read counterparties"
on public.counterparties
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

drop policy if exists "Active users can read parcels" on public.parcels;
create policy "Active users can read parcels"
on public.parcels
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

drop policy if exists "Active users can read route chains" on public.route_chains;
create policy "Active users can read route chains"
on public.route_chains
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

drop policy if exists "Active users can read documents" on public.documents;
create policy "Active users can read documents"
on public.documents
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

drop policy if exists "Active users can read approvals" on public.approvals;
create policy "Active users can read approvals"
on public.approvals
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

drop policy if exists "Active users can read audit events" on public.audit_events;
create policy "Active users can read audit events"
on public.audit_events
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);

-- WRITE POLICIES FOR ADMIN / OPERATOR / FINANCE

drop policy if exists "Admin operator can insert counterparties" on public.counterparties;
create policy "Admin operator can insert counterparties"
on public.counterparties
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator can update counterparties" on public.counterparties;
create policy "Admin operator can update counterparties"
on public.counterparties
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator can insert parcels" on public.parcels;
create policy "Admin operator can insert parcels"
on public.parcels
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator can update parcels" on public.parcels;
create policy "Admin operator can update parcels"
on public.parcels
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator can write route chains" on public.route_chains;
create policy "Admin operator can write route chains"
on public.route_chains
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator')
    and p.is_active = true
  )
);

drop policy if exists "Active users can insert documents" on public.documents;
create policy "Active users can insert documents"
on public.documents
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator', 'field_agent', 'finance')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator finance can update documents" on public.documents;
create policy "Admin operator finance can update documents"
on public.documents
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator', 'finance')
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator', 'finance')
    and p.is_active = true
  )
);

drop policy if exists "Admin operator finance can write approvals" on public.approvals;
create policy "Admin operator finance can write approvals"
on public.approvals
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator', 'finance')
    and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('admin', 'operator', 'finance')
    and p.is_active = true
  )
);

drop policy if exists "Active users can insert audit events" on public.audit_events;
create policy "Active users can insert audit events"
on public.audit_events
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_active = true
  )
);
