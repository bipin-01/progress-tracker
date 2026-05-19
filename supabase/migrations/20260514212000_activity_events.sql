create table if not exists public.activity_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  domain text not null,
  action text not null,
  entity_id text not null,
  entity_title text not null,
  source text not null,
  day_key date not null,
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists activity_events_user_created_idx on public.activity_events (user_id, created_at desc);
create index if not exists activity_events_user_domain_idx on public.activity_events (user_id, domain, created_at desc);
create index if not exists activity_events_user_action_idx on public.activity_events (user_id, action, created_at desc);
create index if not exists activity_events_user_day_idx on public.activity_events (user_id, day_key desc);
create index if not exists activity_events_user_entity_idx on public.activity_events (user_id, entity_id, created_at desc);

drop trigger if exists activity_events_set_updated_at on public.activity_events;
create trigger activity_events_set_updated_at
before update on public.activity_events
for each row execute function public.set_updated_at();

alter table public.activity_events enable row level security;

drop policy if exists "users read own activity events" on public.activity_events;
create policy "users read own activity events" on public.activity_events for select using (auth.uid() = user_id);
drop policy if exists "users insert own activity events" on public.activity_events;
create policy "users insert own activity events" on public.activity_events for insert with check (auth.uid() = user_id);
drop policy if exists "users update own activity events" on public.activity_events;
create policy "users update own activity events" on public.activity_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own activity events" on public.activity_events;
create policy "users delete own activity events" on public.activity_events for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.activity_events;
exception when duplicate_object then null;
end $$;
