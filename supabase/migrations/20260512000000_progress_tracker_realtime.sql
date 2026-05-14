create table if not exists public.goals (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.task_projects (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.kanban_cards (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

drop trigger if exists task_projects_set_updated_at on public.task_projects;
create trigger task_projects_set_updated_at
before update on public.task_projects
for each row execute function public.set_updated_at();

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

drop trigger if exists kanban_cards_set_updated_at on public.kanban_cards;
create trigger kanban_cards_set_updated_at
before update on public.kanban_cards
for each row execute function public.set_updated_at();

alter table public.goals enable row level security;
alter table public.habits enable row level security;
alter table public.task_projects enable row level security;
alter table public.calendar_events enable row level security;
alter table public.kanban_cards enable row level security;

drop policy if exists "anon read goals" on public.goals;
create policy "anon read goals" on public.goals for select using (true);
drop policy if exists "anon write goals" on public.goals;
create policy "anon write goals" on public.goals for all using (true) with check (true);

drop policy if exists "anon read habits" on public.habits;
create policy "anon read habits" on public.habits for select using (true);
drop policy if exists "anon write habits" on public.habits;
create policy "anon write habits" on public.habits for all using (true) with check (true);

drop policy if exists "anon read task projects" on public.task_projects;
create policy "anon read task projects" on public.task_projects for select using (true);
drop policy if exists "anon write task projects" on public.task_projects;
create policy "anon write task projects" on public.task_projects for all using (true) with check (true);

drop policy if exists "anon read calendar events" on public.calendar_events;
create policy "anon read calendar events" on public.calendar_events for select using (true);
drop policy if exists "anon write calendar events" on public.calendar_events;
create policy "anon write calendar events" on public.calendar_events for all using (true) with check (true);

drop policy if exists "anon read kanban cards" on public.kanban_cards;
create policy "anon read kanban cards" on public.kanban_cards for select using (true);
drop policy if exists "anon write kanban cards" on public.kanban_cards;
create policy "anon write kanban cards" on public.kanban_cards for all using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.goals;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.habits;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.task_projects;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.calendar_events;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.kanban_cards;
exception
  when duplicate_object then null;
end $$;
