-- Noskshade portfolio: database schema for Supabase (free plan).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- LEARN (lesson 3): each table mirrors a type in src/lib/content/types.ts.

-- ---------- Admin allow-list ----------
-- Only emails listed here can change content, even if someone else manages to sign up.
create table if not exists public.admins (
  email text primary key
);
-- insert into public.admins (email) values ('thenoskshade@gmail.com');  -- run this line yourself

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email');
$$;

-- ---------- Blog posts ----------
create table if not exists public.posts (
  slug          text primary key,
  title         text not null,
  excerpt       text not null default '',
  category      text not null check (category in ('uiux', 'brand', 'systems', 'code')),
  published_at  date not null default current_date,
  read_minutes  int  not null default 5,
  cover         text not null default '',
  cover_alt     text not null default '',
  tags          text[] not null default '{}',
  featured      boolean not null default false,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  blocks        jsonb not null default '[]',
  updated_at    timestamptz not null default now()
);

-- ---------- Case studies ----------
create table if not exists public.case_studies (
  slug        text primary key,
  title       text not null,
  kind        text not null default '',
  sort_order  int  not null default 0,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  card        jsonb not null default '{}',   -- cover image, tags and summary for the Work grid
  brief       jsonb not null default '{}',   -- result, what I did, problem, trade-off, next
  sections    jsonb not null default '[]',   -- the page body, section by section
  updated_at  timestamptz not null default now()
);

-- ---------- Site settings (homepage text, stats, contact links) ----------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- Row-level security ----------
-- LEARN: the public (anon) key can only READ published rows. Writes need a signed-in admin.
alter table public.posts        enable row level security;
alter table public.case_studies enable row level security;
alter table public.settings     enable row level security;
alter table public.admins       enable row level security;

create policy "public reads published posts" on public.posts for select using (status = 'published' or public.is_admin());
create policy "admins write posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads published cases" on public.case_studies for select using (status = 'published' or public.is_admin());
create policy "admins write cases" on public.case_studies for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads settings" on public.settings for select using (true);
create policy "admins write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

create policy "admins read admin list" on public.admins for select using (public.is_admin());

-- ---------- Image storage ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create policy "public reads media" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "admins change media" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ---------- Keep-alive ----------
-- Free projects pause after a week with no activity. A scheduled job calls this every few days.
create or replace function public.ping() returns text language sql stable as $$ select 'ok'::text $$;
grant execute on function public.ping() to anon;

-- ---------- Client enquiries (from /services) ----------
create table if not exists public.enquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  status      text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  data        jsonb not null
);
alter table public.enquiries enable row level security;
-- Anyone can send an enquiry; only admins can read or update them.
create policy "public sends enquiries" on public.enquiries for insert with check (true);
create policy "admins read enquiries" on public.enquiries for select using (public.is_admin());
create policy "admins update enquiries" on public.enquiries for update using (public.is_admin());

-- ---------- Table access for the Data API ----------
-- LEARN: with "Automatically expose new tables" turned off, each table is opened to the API explicitly.
-- Row-level security above still decides WHICH rows each person can see or change.
grant usage on schema public to anon, authenticated;
grant select on public.posts, public.case_studies, public.settings to anon, authenticated;
grant insert, update, delete on public.posts, public.case_studies, public.settings to authenticated;
grant select on public.admins to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, update on public.enquiries to authenticated;
grant usage on sequence public.enquiries_id_seq to anon, authenticated;
