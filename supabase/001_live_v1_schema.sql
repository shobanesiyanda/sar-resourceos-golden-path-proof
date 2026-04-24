-- SAR ResourceOS Live v1
-- Supabase schema + auth/role/control foundation

create extension if not exists pgcrypto;

-- =========================
-- Core role / permission layer
-- =========================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  role_name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  permission_name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role_id uuid references public.roles(id),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- ResourceOS business objects
-- =========================

create table if not exists public.counterparties (
  id uuid primary key default gen_random_uuid(),
  counterparty_name text not null,
  counterparty_type text not null check (
    counterparty_type in (
      'supplier',
      'buyer',
      'wash_plant',
      'transporter',
      'investor',
      'strategic_partner',
      'other'
    )
  ),
  company_registration_number text,
  contact_name text,
  email text,
  phone text,
  location text,
  status text not null default 'screening' check (
    status in ('new', 'screening', 'qualified', 'approved', 'rejected', 'inactive')
  ),
  risk_state text not null default 'pending review' check (
    risk_state in ('approved', 'pending review', 'held', 'blocked', 'rejected')
  ),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  opportunity_code text not null unique,
  opportunity_name text not null,
  commodity text not null default 'Chrome',
  product_spec text,
  source_type text,
  location text,
  counterparty_id uuid references public.counterparties(id),
  indicative_tons numeric(14,2),
  indicative_grade text,
  commercial_state text not null default 'new' check (
    commercial_state in ('new', 'screening', 'qualified', 'rejected', 'converted')
  ),
  qualification_state text not null default 'new' check (
    qualification_state in ('new', 'screening', 'qualified', 'rejected')
  ),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  blocker text,
  next_action text,
  created_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  parcel_code text not null unique,
  opportunity_id uuid references public.opportunities(id),
  commodity text not null default 'Chrome concentrate',
  product_spec text not null default '40–42% Cr2O3 concentrate',
  source_type text,
  operating_region text,
  buyer_route text,
  accepted_tons numeric(14,2) default 0,
  target_batch_tons numeric(14,2) default 500,
  monthly_target_tons numeric(14,2) default 5000,
  payment_term text,
  master_state text not null default 'pending review' check (
    master_state in ('approved', 'complete', 'ready', 'pending review', 'held', 'blocked', 'rejected')
  ),
  finance_state text not null default 'pending review',
  accounting_export_state text not null default 'pending review',
  created_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_economics (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  route_name text not null,
  sale_basis text not null check (sale_basis in ('FOT', 'FOB', 'CIF', 'EXW')),
  sell_price_per_ton numeric(14,2) not null default 0,
  feedstock_per_ton numeric(14,2) not null default 0,
  transport_per_ton numeric(14,2) not null default 0,
  tolling_per_ton numeric(14,2) not null default 0,
  other_direct_per_ton numeric(14,2) not null default 0,
  recovery_pct numeric(8,2),
  yield_pct numeric(8,2),
  target_margin_pct numeric(8,2) default 18,
  gross_margin_pct numeric(8,2),
  max_feedstock_buy_price numeric(14,2),
  max_transport_price numeric(14,2),
  max_tolling_price numeric(14,2),
  state text not null default 'pending review' check (
    state in ('pass', 'caution', 'fail', 'pending review')
  ),
  signal text,
  blocker text,
  next_action text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.readiness_checks (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  check_key text not null,
  check_label text not null,
  check_group text not null,
  state text not null default 'pending review' check (
    state in ('approved', 'complete', 'ready', 'pending review', 'held', 'blocked', 'rejected')
  ),
  note text,
  owner_role text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dispatch_loads (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  load_code text not null unique,
  truck_ref text not null,
  source_location text,
  destination_location text,
  planned_tonnage numeric(14,2),
  released_tonnage numeric(14,2),
  release_state text not null default 'pending review' check (
    release_state in ('approved', 'released', 'pending review', 'held', 'blocked')
  ),
  movement_state text not null default 'not started' check (
    movement_state in ('not started', 'in transit', 'delivered', 'held', 'blocked')
  ),
  delivery_state text not null default 'not started' check (
    delivery_state in ('not started', 'awaiting weighbridge', 'awaiting unload', 'delivered', 'held', 'blocked')
  ),
  driver_name text,
  driver_phone text,
  transporter_id uuid references public.counterparties(id),
  note text,
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reconciliation_records (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  dispatch_load_id uuid references public.dispatch_loads(id) on delete set null,
  truck_ref text,
  source_weight numeric(14,2),
  destination_weight numeric(14,2),
  variance numeric(14,2),
  state text not null default 'pending review' check (
    state in ('matched', 'pending review', 'held', 'exception', 'blocked')
  ),
  note text,
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exceptions (
  id uuid primary key default gen_random_uuid(),
  exception_code text not null unique,
  parcel_id uuid references public.parcels(id) on delete cascade,
  related_table text,
  related_id uuid,
  title text not null,
  reason text,
  status text not null default 'pending review' check (
    status in ('approved', 'resolved', 'pending review', 'held', 'blocked', 'rejected')
  ),
  owner_role text,
  assigned_to uuid references auth.users(id),
  finance_allowed text not null default 'yes' check (finance_allowed in ('yes', 'no')),
  note text,
  created_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  approval_code text not null unique,
  parcel_id uuid references public.parcels(id) on delete cascade,
  exception_id uuid references public.exceptions(id) on delete set null,
  subject text not null,
  queue text not null,
  decision_state text not null default 'pending review' check (
    decision_state in ('approved', 'pending review', 'held', 'blocked', 'rejected')
  ),
  owner_role text,
  assigned_to uuid references auth.users(id),
  note text,
  decision_note text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_handoffs (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  handoff_code text not null unique,
  finance_state text not null default 'pending review' check (
    finance_state in ('finance_handoff_ready', 'ready_for_export', 'approved', 'pending review', 'held', 'blocked')
  ),
  accounting_export_state text not null default 'pending review' check (
    accounting_export_state in ('ready_for_export', 'exported', 'approved', 'pending review', 'held', 'blocked')
  ),
  settlement_state text not null default 'pending review' check (
    settlement_state in ('approved', 'pending review', 'held', 'blocked', 'settled')
  ),
  finance_blocked_count integer not null default 0,
  note text,
  owner_role text default 'finance',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.field_tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  parcel_id uuid references public.parcels(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  assigned_to uuid references auth.users(id),
  task_type text not null check (
    task_type in (
      'supplier_visit',
      'site_inspection',
      'sample_collection',
      'photo_evidence',
      'weighbridge_upload',
      'pod_upload',
      'general_field_task'
    )
  ),
  title text not null,
  instructions text,
  state text not null default 'pending review' check (
    state in ('pending review', 'in progress', 'submitted', 'approved', 'held', 'blocked', 'rejected')
  ),
  due_at timestamptz,
  submitted_at timestamptz,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'resourceos-evidence',
  storage_path text not null,
  file_name text not null,
  file_type text,
  file_size bigint,
  entity_type text not null check (
    entity_type in (
      'counterparty',
      'opportunity',
      'parcel',
      'route_economics',
      'readiness_check',
      'dispatch_load',
      'reconciliation_record',
      'exception',
      'approval',
      'finance_handoff',
      'field_task'
    )
  ),
  entity_id uuid not null,
  evidence_type text not null,
  status text not null default 'pending review' check (
    status in ('pending review', 'approved', 'rejected', 'held')
  ),
  uploaded_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- =========================
-- Updated-at trigger
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_counterparties_updated_at on public.counterparties;
create trigger set_counterparties_updated_at
before update on public.counterparties
for each row execute function public.set_updated_at();

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists set_parcels_updated_at on public.parcels;
create trigger set_parcels_updated_at
before update on public.parcels
for each row execute function public.set_updated_at();

drop trigger if exists set_route_economics_updated_at on public.route_economics;
create trigger set_route_economics_updated_at
before update on public.route_economics
for each row execute function public.set_updated_at();

drop trigger if exists set_readiness_checks_updated_at on public.readiness_checks;
create trigger set_readiness_checks_updated_at
before update on public.readiness_checks
for each row execute function public.set_updated_at();

drop trigger if exists set_dispatch_loads_updated_at on public.dispatch_loads;
create trigger set_dispatch_loads_updated_at
before update on public.dispatch_loads
for each row execute function public.set_updated_at();

drop trigger if exists set_reconciliation_records_updated_at on public.reconciliation_records;
create trigger set_reconciliation_records_updated_at
before update on public.reconciliation_records
for each row execute function public.set_updated_at();

drop trigger if exists set_exceptions_updated_at on public.exceptions;
create trigger set_exceptions_updated_at
before update on public.exceptions
for each row execute function public.set_updated_at();

drop trigger if exists set_approvals_updated_at on public.approvals;
create trigger set_approvals_updated_at
before update on public.approvals
for each row execute function public.set_updated_at();

drop trigger if exists set_finance_handoffs_updated_at on public.finance_handoffs;
create trigger set_finance_handoffs_updated_at
before update on public.finance_handoffs
for each row execute function public.set_updated_at();

drop trigger if exists set_field_tasks_updated_at on public.field_tasks;
create trigger set_field_tasks_updated_at
before update on public.field_tasks
for each row execute function public.set_updated_at();

-- =========================
-- Profile auto-create trigger
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id
  from public.roles
  where role_key = 'field_agent'
  limit 1;

  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    default_role_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================
-- Auth helper functions
-- =========================

create or replace function public.current_role_key()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.role_key
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.has_role(role_keys text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_key() = any(role_keys), false)
$$;

create or replace function public.has_permission(permission_key_input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid()
      and perm.permission_key = permission_key_input
  )
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array[
    'admin',
    'executive',
    'operations_controller',
    'commercial_sourcing',
    'finance'
  ])
$$;

-- =========================
-- Storage bucket
-- =========================

insert into storage.buckets (id, name, public)
values ('resourceos-evidence', 'resourceos-evidence', false)
on conflict (id) do nothing;

-- =========================
-- RLS enablement
-- =========================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.counterparties enable row level security;
alter table public.opportunities enable row level security;
alter table public.parcels enable row level security;
alter table public.route_economics enable row level security;
alter table public.readiness_checks enable row level security;
alter table public.dispatch_loads enable row level security;
alter table public.reconciliation_records enable row level security;
alter table public.exceptions enable row level security;
alter table public.approvals enable row level security;
alter table public.finance_handoffs enable row level security;
alter table public.field_tasks enable row level security;
alter table public.evidence_files enable row level security;
alter table public.audit_events enable row level security;

-- =========================
-- RLS policies
-- =========================

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles for select
to authenticated
using (true);

drop policy if exists "permissions_select_authenticated" on public.permissions;
create policy "permissions_select_authenticated"
on public.permissions for select
to authenticated
using (true);

drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
create policy "role_permissions_select_authenticated"
on public.role_permissions for select
to authenticated
using (true);

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.has_role(array['admin', 'executive'])
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (
  id = auth.uid()
  or public.has_role(array['admin'])
)
with check (
  id = auth.uid()
  or public.has_role(array['admin'])
);

-- Core business select
drop policy if exists "counterparties_select_by_role" on public.counterparties;
create policy "counterparties_select_by_role"
on public.counterparties for select
to authenticated
using (
  public.is_internal_user()
  or created_by = auth.uid()
);

drop policy if exists "opportunities_select_by_role" on public.opportunities;
create policy "opportunities_select_by_role"
on public.opportunities for select
to authenticated
using (
  public.is_internal_user()
  or created_by = auth.uid()
  or assigned_to = auth.uid()
);

drop policy if exists "parcels_select_by_role" on public.parcels;
create policy "parcels_select_by_role"
on public.parcels for select
to authenticated
using (
  public.is_internal_user()
  or created_by = auth.uid()
  or assigned_to = auth.uid()
);

drop policy if exists "route_economics_select_by_role" on public.route_economics;
create policy "route_economics_select_by_role"
on public.route_economics for select
to authenticated
using (public.is_internal_user());

drop policy if exists "readiness_checks_select_by_role" on public.readiness_checks;
create policy "readiness_checks_select_by_role"
on public.readiness_checks for select
to authenticated
using (public.is_internal_user());

drop policy if exists "dispatch_loads_select_by_role" on public.dispatch_loads;
create policy "dispatch_loads_select_by_role"
on public.dispatch_loads for select
to authenticated
using (
  public.is_internal_user()
  or assigned_to = auth.uid()
);

drop policy if exists "reconciliation_records_select_by_role" on public.reconciliation_records;
create policy "reconciliation_records_select_by_role"
on public.reconciliation_records for select
to authenticated
using (public.is_internal_user());

drop policy if exists "exceptions_select_by_role" on public.exceptions;
create policy "exceptions_select_by_role"
on public.exceptions for select
to authenticated
using (
  public.is_internal_user()
  or assigned_to = auth.uid()
);

drop policy if exists "approvals_select_by_role" on public.approvals;
create policy "approvals_select_by_role"
on public.approvals for select
to authenticated
using (
  public.is_internal_user()
  or assigned_to = auth.uid()
);

drop policy if exists "finance_handoffs_select_by_role" on public.finance_handoffs;
create policy "finance_handoffs_select_by_role"
on public.finance_handoffs for select
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
);

drop policy if exists "field_tasks_select_by_role" on public.field_tasks;
create policy "field_tasks_select_by_role"
on public.field_tasks for select
to authenticated
using (
  public.is_internal_user()
  or assigned_to = auth.uid()
);

drop policy if exists "evidence_files_select_by_role" on public.evidence_files;
create policy "evidence_files_select_by_role"
on public.evidence_files for select
to authenticated
using (
  public.is_internal_user()
  or uploaded_by = auth.uid()
  or exists (
    select 1
    from public.field_tasks ft
    where ft.id = evidence_files.entity_id
      and evidence_files.entity_type = 'field_task'
      and ft.assigned_to = auth.uid()
  )
);

drop policy if exists "audit_events_select_admin_executive" on public.audit_events;
create policy "audit_events_select_admin_executive"
on public.audit_events for select
to authenticated
using (
  public.has_role(array['admin', 'executive'])
);

-- Insert/update policies

drop policy if exists "counterparties_write_by_role" on public.counterparties;
create policy "counterparties_write_by_role"
on public.counterparties for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'commercial_sourcing'])
)
with check (
  public.has_role(array['admin', 'executive', 'commercial_sourcing'])
);

drop policy if exists "opportunities_write_by_role" on public.opportunities;
create policy "opportunities_write_by_role"
on public.opportunities for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'commercial_sourcing'])
)
with check (
  public.has_role(array['admin', 'executive', 'commercial_sourcing'])
);

drop policy if exists "parcels_write_by_role" on public.parcels;
create policy "parcels_write_by_role"
on public.parcels for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller', 'commercial_sourcing'])
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller', 'commercial_sourcing'])
);

drop policy if exists "route_economics_write_by_role" on public.route_economics;
create policy "route_economics_write_by_role"
on public.route_economics for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'commercial_sourcing', 'operations_controller'])
)
with check (
  public.has_role(array['admin', 'executive', 'commercial_sourcing', 'operations_controller'])
);

drop policy if exists "readiness_checks_write_by_role" on public.readiness_checks;
create policy "readiness_checks_write_by_role"
on public.readiness_checks for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller'])
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller'])
);

drop policy if exists "dispatch_loads_write_by_role" on public.dispatch_loads;
create policy "dispatch_loads_write_by_role"
on public.dispatch_loads for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller'])
  or assigned_to = auth.uid()
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller'])
  or assigned_to = auth.uid()
);

drop policy if exists "reconciliation_records_write_by_role" on public.reconciliation_records;
create policy "reconciliation_records_write_by_role"
on public.reconciliation_records for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
);

drop policy if exists "exceptions_write_by_role" on public.exceptions;
create policy "exceptions_write_by_role"
on public.exceptions for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
);

drop policy if exists "approvals_write_by_role" on public.approvals;
create policy "approvals_write_by_role"
on public.approvals for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller', 'finance'])
);

drop policy if exists "finance_handoffs_write_by_role" on public.finance_handoffs;
create policy "finance_handoffs_write_by_role"
on public.finance_handoffs for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'finance'])
)
with check (
  public.has_role(array['admin', 'executive', 'finance'])
);

drop policy if exists "field_tasks_write_by_role" on public.field_tasks;
create policy "field_tasks_write_by_role"
on public.field_tasks for all
to authenticated
using (
  public.has_role(array['admin', 'executive', 'operations_controller'])
  or assigned_to = auth.uid()
)
with check (
  public.has_role(array['admin', 'executive', 'operations_controller'])
  or assigned_to = auth.uid()
);

drop policy if exists "evidence_files_write_by_role" on public.evidence_files;
create policy "evidence_files_write_by_role"
on public.evidence_files for insert
to authenticated
with check (
  public.is_internal_user()
  or uploaded_by = auth.uid()
);

drop policy if exists "audit_events_insert_authenticated" on public.audit_events;
create policy "audit_events_insert_authenticated"
on public.audit_events for insert
to authenticated
with check (
  actor_id = auth.uid()
);

-- Storage object policies

drop policy if exists "resourceos_evidence_select" on storage.objects;
create policy "resourceos_evidence_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resourceos-evidence'
);

drop policy if exists "resourceos_evidence_insert" on storage.objects;
create policy "resourceos_evidence_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resourceos-evidence'
);

drop policy if exists "resourceos_evidence_update" on storage.objects;
create policy "resourceos_evidence_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resourceos-evidence'
  and public.is_internal_user()
)
with check (
  bucket_id = 'resourceos-evidence'
  and public.is_internal_user()
);
