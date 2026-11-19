-- Update 4: Social Autopilot tables.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Everything here is admin-only: the public (anon) key cannot read or write any of it.

create table if not exists public.ap_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint ap_single_row check (id = 1)
);

create table if not exists public.ap_logs (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ap_posts (
  id uuid primary key default gen_random_uuid(),
  item_key text,                              -- 'post:<slug>' or 'case:<slug>' (what it was made from)
  log_id uuid references public.ap_logs(id) on delete set null,
  platform text not null,
  text text not null,
  art_url text default '',
  link text default '',
  source_label text default '',
  status text not null default 'pending'
    check (status in ('pending','scheduled','prepared','published','rejected','failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  external_url text,
  error text,
  why text default '',
  notes text default '',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ap_posts_status_idx on public.ap_posts(status, scheduled_for);
create index if not exists ap_posts_item_idx on public.ap_posts(item_key);

create table if not exists public.ap_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text default '',
  fit int default 70,
  signal text default '',
  source text default '',
  source_url text unique,                     -- 'enquiry:<id>' for briefs from your Services form
  status text not null default 'new' check (status in ('new','approved','skipped','sent')),
  why text default '',
  approach text default '',
  msg text default '',
  art text default '',
  follow text default '',
  fmt int,                                    -- 0 one-pager, 1 pitch page, 2 intro card; null = default
  chan int,                                   -- 0 DM, 1 email, 2 warm up first
  contact text default '',
  notes text default '',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ap_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text default '',
  match int default 70,
  source_url text unique,
  source text default '',
  status text not null default 'new' check (status in ('new','approved','skipped','applied')),
  description text default '',
  subject text default '',
  cover text default '',
  notes text default '',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ap_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('jobs','leads')),
  url text not null unique,
  label text default '',
  enabled boolean not null default true
);

create table if not exists public.ap_activity (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['ap_settings','ap_logs','ap_posts','ap_leads','ap_jobs','ap_sources','ap_activity'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admins all" on public.%I', t);
    execute format('create policy "admins all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

insert into public.ap_settings (id, data) values (1, '{}') on conflict (id) do nothing;
