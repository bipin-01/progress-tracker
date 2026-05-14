create or replace function public.claim_user_owned_table(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I add column if not exists user_id uuid references auth.users(id) on delete cascade', table_name);
  execute format('delete from public.%I where user_id is null', table_name);
  execute format('alter table public.%I alter column user_id set not null', table_name);
  execute format('alter table public.%I drop constraint if exists %I', table_name, table_name || '_pkey');
  execute format('alter table public.%I add constraint %I primary key (user_id, id)', table_name, table_name || '_pkey');
  execute format('create index if not exists %I on public.%I (user_id, updated_at desc)', table_name || '_user_updated_idx', table_name);
end;
$$;

select public.claim_user_owned_table('goals');
select public.claim_user_owned_table('habits');
select public.claim_user_owned_table('task_projects');
select public.claim_user_owned_table('calendar_events');
select public.claim_user_owned_table('kanban_cards');
select public.claim_user_owned_table('kanban_activity');

drop function public.claim_user_owned_table(text);

drop policy if exists "anon read goals" on public.goals;
drop policy if exists "anon write goals" on public.goals;
drop policy if exists "users read own goals" on public.goals;
create policy "users read own goals" on public.goals for select using (auth.uid() = user_id);
drop policy if exists "users insert own goals" on public.goals;
create policy "users insert own goals" on public.goals for insert with check (auth.uid() = user_id);
drop policy if exists "users update own goals" on public.goals;
create policy "users update own goals" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own goals" on public.goals;
create policy "users delete own goals" on public.goals for delete using (auth.uid() = user_id);

drop policy if exists "anon read habits" on public.habits;
drop policy if exists "anon write habits" on public.habits;
drop policy if exists "users read own habits" on public.habits;
create policy "users read own habits" on public.habits for select using (auth.uid() = user_id);
drop policy if exists "users insert own habits" on public.habits;
create policy "users insert own habits" on public.habits for insert with check (auth.uid() = user_id);
drop policy if exists "users update own habits" on public.habits;
create policy "users update own habits" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own habits" on public.habits;
create policy "users delete own habits" on public.habits for delete using (auth.uid() = user_id);

drop policy if exists "anon read task projects" on public.task_projects;
drop policy if exists "anon write task projects" on public.task_projects;
drop policy if exists "users read own task projects" on public.task_projects;
create policy "users read own task projects" on public.task_projects for select using (auth.uid() = user_id);
drop policy if exists "users insert own task projects" on public.task_projects;
create policy "users insert own task projects" on public.task_projects for insert with check (auth.uid() = user_id);
drop policy if exists "users update own task projects" on public.task_projects;
create policy "users update own task projects" on public.task_projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own task projects" on public.task_projects;
create policy "users delete own task projects" on public.task_projects for delete using (auth.uid() = user_id);

drop policy if exists "anon read calendar events" on public.calendar_events;
drop policy if exists "anon write calendar events" on public.calendar_events;
drop policy if exists "users read own calendar events" on public.calendar_events;
create policy "users read own calendar events" on public.calendar_events for select using (auth.uid() = user_id);
drop policy if exists "users insert own calendar events" on public.calendar_events;
create policy "users insert own calendar events" on public.calendar_events for insert with check (auth.uid() = user_id);
drop policy if exists "users update own calendar events" on public.calendar_events;
create policy "users update own calendar events" on public.calendar_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own calendar events" on public.calendar_events;
create policy "users delete own calendar events" on public.calendar_events for delete using (auth.uid() = user_id);

drop policy if exists "anon read kanban cards" on public.kanban_cards;
drop policy if exists "anon write kanban cards" on public.kanban_cards;
drop policy if exists "users read own kanban cards" on public.kanban_cards;
create policy "users read own kanban cards" on public.kanban_cards for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban cards" on public.kanban_cards;
create policy "users insert own kanban cards" on public.kanban_cards for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban cards" on public.kanban_cards;
create policy "users update own kanban cards" on public.kanban_cards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban cards" on public.kanban_cards;
create policy "users delete own kanban cards" on public.kanban_cards for delete using (auth.uid() = user_id);

drop policy if exists "anon read kanban activity" on public.kanban_activity;
drop policy if exists "anon write kanban activity" on public.kanban_activity;
drop policy if exists "users read own kanban activity" on public.kanban_activity;
create policy "users read own kanban activity" on public.kanban_activity for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban activity" on public.kanban_activity;
create policy "users insert own kanban activity" on public.kanban_activity for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban activity" on public.kanban_activity;
create policy "users update own kanban activity" on public.kanban_activity for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban activity" on public.kanban_activity;
create policy "users delete own kanban activity" on public.kanban_activity for delete using (auth.uid() = user_id);
