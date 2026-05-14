create table if not exists public.agent_recommendations (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  agent_id text not null,
  agent_name text not null,
  title text not null,
  severity text not null,
  status text not null default 'pending',
  source text not null,
  action_type text,
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists agent_recommendations_user_status_idx on public.agent_recommendations (user_id, status, created_at desc);
create index if not exists agent_recommendations_user_agent_idx on public.agent_recommendations (user_id, agent_id, created_at desc);
create index if not exists agent_recommendations_user_severity_idx on public.agent_recommendations (user_id, severity, created_at desc);

drop trigger if exists agent_recommendations_set_updated_at on public.agent_recommendations;
create trigger agent_recommendations_set_updated_at
before update on public.agent_recommendations
for each row execute function public.set_updated_at();

alter table public.agent_recommendations enable row level security;

drop policy if exists "users read own agent recommendations" on public.agent_recommendations;
create policy "users read own agent recommendations" on public.agent_recommendations for select using (auth.uid() = user_id);
drop policy if exists "users insert own agent recommendations" on public.agent_recommendations;
create policy "users insert own agent recommendations" on public.agent_recommendations for insert with check (auth.uid() = user_id);
drop policy if exists "users update own agent recommendations" on public.agent_recommendations;
create policy "users update own agent recommendations" on public.agent_recommendations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own agent recommendations" on public.agent_recommendations;
create policy "users delete own agent recommendations" on public.agent_recommendations for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.agent_recommendations;
exception when duplicate_object then null;
end $$;
