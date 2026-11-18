-- Update 2: website visits for the admin, and read access for draft case studies.
-- Run once in Supabase → SQL Editor → New query → paste all → Run. Safe to run again.

create table if not exists public.page_views (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path       text not null,
  ref        text,
  device     text,
  country    text,
  sid        text
);
create index if not exists page_views_created on public.page_views (created_at desc);
alter table public.page_views enable row level security;

drop policy if exists "public logs visits" on public.page_views;
create policy "public logs visits" on public.page_views for insert
  with check (char_length(path) < 300 and coalesce(char_length(ref), 0) < 200);
drop policy if exists "admins read visits" on public.page_views;
create policy "admins read visits" on public.page_views for select using (public.is_admin());

grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;

-- All the numbers for the admin's Visits page, worked out in the database.
create or replace function public.visit_stats(days int default 30) returns json
language plpgsql security definer set search_path = public as $$
declare since timestamptz := now() - make_interval(days => days); r json;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select json_build_object(
    'today',    (select count(*) from page_views where created_at >= date_trunc('day', now())),
    'week',     (select count(*) from page_views where created_at >= now() - interval '7 days'),
    'month',    (select count(*) from page_views where created_at >= since),
    'visitors', (select count(distinct sid) from page_views where created_at >= since),
    'daily',    (select coalesce(json_agg(json_build_object('day', d, 'n', n) order by d), '[]') from
                  (select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') d, count(*) n from page_views where created_at >= since group by 1) x),
    'pages',    (select coalesce(json_agg(json_build_object('path', path, 'n', n)), '[]') from
                  (select path, count(*) n from page_views where created_at >= since group by 1 order by 2 desc limit 10) x),
    'refs',     (select coalesce(json_agg(json_build_object('ref', ref, 'n', n)), '[]') from
                  (select coalesce(nullif(ref, ''), 'Direct') ref, count(*) n from page_views where created_at >= since group by 1 order by 2 desc limit 10) x),
    'devices',  (select coalesce(json_agg(json_build_object('device', device, 'n', n)), '[]') from
                  (select coalesce(device, 'unknown') device, count(*) n from page_views where created_at >= since group by 1 order by 2 desc) x),
    'countries',(select coalesce(json_agg(json_build_object('country', country, 'n', n)), '[]') from
                  (select coalesce(nullif(country, ''), 'Unknown') country, count(*) n from page_views where created_at >= since group by 1 order by 2 desc limit 10) x)
  ) into r;
  return r;
end $$;
revoke all on function public.visit_stats(int) from public, anon;
grant execute on function public.visit_stats(int) to authenticated;
