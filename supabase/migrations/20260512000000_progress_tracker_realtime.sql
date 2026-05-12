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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create trigger habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

create trigger task_projects_set_updated_at
before update on public.task_projects
for each row execute function public.set_updated_at();

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

alter table public.goals enable row level security;
alter table public.habits enable row level security;
alter table public.task_projects enable row level security;
alter table public.calendar_events enable row level security;

create policy "Allow public read goals"
on public.goals for select
to anon
using (true);

create policy "Allow public write goals"
on public.goals for all
to anon
using (true)
with check (true);

create policy "Allow public read habits"
on public.habits for select
to anon
using (true);

create policy "Allow public write habits"
on public.habits for all
to anon
using (true)
with check (true);

create policy "Allow public read task projects"
on public.task_projects for select
to anon
using (true);

create policy "Allow public write task projects"
on public.task_projects for all
to anon
using (true)
with check (true);

create policy "Allow public read calendar events"
on public.calendar_events for select
to anon
using (true);

create policy "Allow public write calendar events"
on public.calendar_events for all
to anon
using (true)
with check (true);

alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.habits;
alter publication supabase_realtime add table public.task_projects;
alter publication supabase_realtime add table public.calendar_events;
