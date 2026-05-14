create table if not exists public.kanban_activity (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists kanban_activity_set_updated_at on public.kanban_activity;
create trigger kanban_activity_set_updated_at
before update on public.kanban_activity
for each row execute function public.set_updated_at();

alter table public.kanban_activity enable row level security;

drop policy if exists "anon read kanban activity" on public.kanban_activity;
create policy "anon read kanban activity" on public.kanban_activity for select using (true);

drop policy if exists "anon write kanban activity" on public.kanban_activity;
create policy "anon write kanban activity" on public.kanban_activity for all using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.kanban_activity;
exception
  when duplicate_object then null;
end $$;
