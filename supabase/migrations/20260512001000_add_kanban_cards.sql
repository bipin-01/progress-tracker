create table if not exists public.kanban_cards (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists kanban_cards_set_updated_at on public.kanban_cards;
create trigger kanban_cards_set_updated_at
before update on public.kanban_cards
for each row execute function public.set_updated_at();

alter table public.kanban_cards enable row level security;

drop policy if exists "anon read kanban cards" on public.kanban_cards;
create policy "anon read kanban cards" on public.kanban_cards for select using (true);

drop policy if exists "anon write kanban cards" on public.kanban_cards;
create policy "anon write kanban cards" on public.kanban_cards for all using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.kanban_cards;
exception
  when duplicate_object then null;
end $$;
