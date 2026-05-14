alter table public.kanban_cards add column if not exists title text;
alter table public.kanban_cards add column if not exists description text not null default '';
alter table public.kanban_cards add column if not exists column_id text;
alter table public.kanban_cards add column if not exists priority text;
alter table public.kanban_cards add column if not exists linked_task_project_id text;
alter table public.kanban_cards add column if not exists linked_day integer;
alter table public.kanban_cards add column if not exists due_date date;
alter table public.kanban_cards add column if not exists tags text[] not null default '{}';
alter table public.kanban_cards add column if not exists estimate_minutes integer;
alter table public.kanban_cards add column if not exists tracked_minutes integer not null default 0;
alter table public.kanban_cards add column if not exists blocked_by text;
alter table public.kanban_cards add column if not exists archived_at timestamptz;
alter table public.kanban_cards add column if not exists card_order integer not null default 0;

update public.kanban_cards
set
  title = coalesce(title, data->>'title'),
  description = coalesce(nullif(description, ''), data->>'description', ''),
  column_id = coalesce(column_id, data->>'columnId'),
  priority = coalesce(priority, data->>'priority'),
  linked_task_project_id = coalesce(linked_task_project_id, data->>'linkedTaskProjectId'),
  linked_day = coalesce(linked_day, nullif(data->>'linkedDay', '')::integer),
  due_date = coalesce(due_date, nullif(data->>'dueDate', '')::date),
  tags = case
    when tags = '{}' then coalesce(ARRAY(select jsonb_array_elements_text(data->'tags')), '{}')
    else tags
  end,
  estimate_minutes = coalesce(estimate_minutes, nullif(data->>'estimateMinutes', '')::integer),
  tracked_minutes = coalesce(tracked_minutes, nullif(data->>'trackedMinutes', '')::integer, 0),
  blocked_by = coalesce(blocked_by, data->>'blockedBy'),
  archived_at = coalesce(archived_at, nullif(data->>'archivedAt', '')::timestamptz),
  card_order = coalesce(nullif(card_order, 0), nullif(data->>'order', '')::integer, 0)
where data is not null;

alter table public.kanban_cards alter column title set not null;
alter table public.kanban_cards alter column column_id set not null;
alter table public.kanban_cards alter column priority set not null;

create index if not exists kanban_cards_user_column_order_idx on public.kanban_cards (user_id, column_id, card_order);
create index if not exists kanban_cards_user_priority_idx on public.kanban_cards (user_id, priority);
create index if not exists kanban_cards_user_due_idx on public.kanban_cards (user_id, due_date);
create index if not exists kanban_cards_user_tags_idx on public.kanban_cards using gin (tags);

create table if not exists public.kanban_card_labels (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  name text not null,
  color text not null,
  label_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id, name),
  foreign key (user_id, card_id) references public.kanban_cards(user_id, id) on delete cascade
);

create table if not exists public.kanban_card_subtasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  id text not null,
  title text not null,
  done boolean not null default false,
  subtask_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id, id),
  foreign key (user_id, card_id) references public.kanban_cards(user_id, id) on delete cascade
);

create table if not exists public.kanban_card_attachments (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  id text not null,
  name text not null,
  url text not null,
  attachment_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id, id),
  foreign key (user_id, card_id) references public.kanban_cards(user_id, id) on delete cascade
);

create table if not exists public.kanban_card_comments (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  id text not null,
  body text not null,
  created_at timestamptz not null,
  comment_order integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id, id),
  foreign key (user_id, card_id) references public.kanban_cards(user_id, id) on delete cascade
);

alter table public.kanban_activity add column if not exists card_id text;
alter table public.kanban_activity add column if not exists card_title text;
alter table public.kanban_activity add column if not exists action text;
alter table public.kanban_activity add column if not exists from_column_id text;
alter table public.kanban_activity add column if not exists to_column_id text;
alter table public.kanban_activity add column if not exists created_at timestamptz;

update public.kanban_activity
set
  card_id = coalesce(card_id, data->>'cardId'),
  card_title = coalesce(card_title, data->>'cardTitle'),
  action = coalesce(action, data->>'action'),
  from_column_id = coalesce(from_column_id, data->>'fromColumnId'),
  to_column_id = coalesce(to_column_id, data->>'toColumnId'),
  created_at = coalesce(created_at, nullif(data->>'createdAt', '')::timestamptz, updated_at)
where data is not null;

create index if not exists kanban_activity_user_card_idx on public.kanban_activity (user_id, card_id, created_at desc);
create index if not exists kanban_activity_user_action_idx on public.kanban_activity (user_id, action, created_at desc);

drop trigger if exists kanban_card_labels_set_updated_at on public.kanban_card_labels;
create trigger kanban_card_labels_set_updated_at
before update on public.kanban_card_labels
for each row execute function public.set_updated_at();

drop trigger if exists kanban_card_subtasks_set_updated_at on public.kanban_card_subtasks;
create trigger kanban_card_subtasks_set_updated_at
before update on public.kanban_card_subtasks
for each row execute function public.set_updated_at();

drop trigger if exists kanban_card_attachments_set_updated_at on public.kanban_card_attachments;
create trigger kanban_card_attachments_set_updated_at
before update on public.kanban_card_attachments
for each row execute function public.set_updated_at();

drop trigger if exists kanban_card_comments_set_updated_at on public.kanban_card_comments;
create trigger kanban_card_comments_set_updated_at
before update on public.kanban_card_comments
for each row execute function public.set_updated_at();

alter table public.kanban_card_labels enable row level security;
alter table public.kanban_card_subtasks enable row level security;
alter table public.kanban_card_attachments enable row level security;
alter table public.kanban_card_comments enable row level security;

drop policy if exists "users read own kanban card labels" on public.kanban_card_labels;
create policy "users read own kanban card labels" on public.kanban_card_labels for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban card labels" on public.kanban_card_labels;
create policy "users insert own kanban card labels" on public.kanban_card_labels for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban card labels" on public.kanban_card_labels;
create policy "users update own kanban card labels" on public.kanban_card_labels for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban card labels" on public.kanban_card_labels;
create policy "users delete own kanban card labels" on public.kanban_card_labels for delete using (auth.uid() = user_id);

drop policy if exists "users read own kanban card subtasks" on public.kanban_card_subtasks;
create policy "users read own kanban card subtasks" on public.kanban_card_subtasks for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban card subtasks" on public.kanban_card_subtasks;
create policy "users insert own kanban card subtasks" on public.kanban_card_subtasks for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban card subtasks" on public.kanban_card_subtasks;
create policy "users update own kanban card subtasks" on public.kanban_card_subtasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban card subtasks" on public.kanban_card_subtasks;
create policy "users delete own kanban card subtasks" on public.kanban_card_subtasks for delete using (auth.uid() = user_id);

drop policy if exists "users read own kanban card attachments" on public.kanban_card_attachments;
create policy "users read own kanban card attachments" on public.kanban_card_attachments for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban card attachments" on public.kanban_card_attachments;
create policy "users insert own kanban card attachments" on public.kanban_card_attachments for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban card attachments" on public.kanban_card_attachments;
create policy "users update own kanban card attachments" on public.kanban_card_attachments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban card attachments" on public.kanban_card_attachments;
create policy "users delete own kanban card attachments" on public.kanban_card_attachments for delete using (auth.uid() = user_id);

drop policy if exists "users read own kanban card comments" on public.kanban_card_comments;
create policy "users read own kanban card comments" on public.kanban_card_comments for select using (auth.uid() = user_id);
drop policy if exists "users insert own kanban card comments" on public.kanban_card_comments;
create policy "users insert own kanban card comments" on public.kanban_card_comments for insert with check (auth.uid() = user_id);
drop policy if exists "users update own kanban card comments" on public.kanban_card_comments;
create policy "users update own kanban card comments" on public.kanban_card_comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own kanban card comments" on public.kanban_card_comments;
create policy "users delete own kanban card comments" on public.kanban_card_comments for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.kanban_card_labels;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.kanban_card_subtasks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.kanban_card_attachments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.kanban_card_comments;
exception when duplicate_object then null;
end $$;
