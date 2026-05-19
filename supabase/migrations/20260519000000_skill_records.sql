create table if not exists public.skill_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  domain text not null,
  route text not null,
  title text not null,
  career text not null,
  status text not null default 'learning',
  level integer not null default 0,
  xp integer not null default 0,
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists skill_records_user_domain_idx on public.skill_records (user_id, domain, updated_at desc);
create index if not exists skill_records_user_route_idx on public.skill_records (user_id, route, updated_at desc);
create index if not exists skill_records_user_career_idx on public.skill_records (user_id, career, updated_at desc);
create index if not exists skill_records_user_status_idx on public.skill_records (user_id, status, updated_at desc);

drop trigger if exists skill_records_set_updated_at on public.skill_records;
create trigger skill_records_set_updated_at
before update on public.skill_records
for each row execute function public.set_updated_at();

alter table public.skill_records enable row level security;

drop policy if exists "users read own skill records" on public.skill_records;
create policy "users read own skill records" on public.skill_records for select using (auth.uid() = user_id);
drop policy if exists "users insert own skill records" on public.skill_records;
create policy "users insert own skill records" on public.skill_records for insert with check (auth.uid() = user_id);
drop policy if exists "users update own skill records" on public.skill_records;
create policy "users update own skill records" on public.skill_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own skill records" on public.skill_records;
create policy "users delete own skill records" on public.skill_records for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.skill_records;
exception when duplicate_object then null;
end $$;
