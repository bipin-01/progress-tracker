create table if not exists public.study_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  title text not null,
  kind text not null default 'note',
  pinned boolean not null default false,
  tags text[] not null default '{}',
  source_name text,
  updated_at timestamptz not null,
  primary key (user_id, id)
);

create index if not exists study_notes_user_updated_idx on public.study_notes (user_id, updated_at desc);
create index if not exists study_notes_user_pinned_idx on public.study_notes (user_id, pinned, updated_at desc);
create index if not exists study_notes_user_kind_idx on public.study_notes (user_id, kind);
create index if not exists study_notes_user_tags_idx on public.study_notes using gin (tags);

alter table public.study_notes enable row level security;

drop policy if exists "users read own study notes" on public.study_notes;
create policy "users read own study notes" on public.study_notes for select using (auth.uid() = user_id);
drop policy if exists "users insert own study notes" on public.study_notes;
create policy "users insert own study notes" on public.study_notes for insert with check (auth.uid() = user_id);
drop policy if exists "users update own study notes" on public.study_notes;
create policy "users update own study notes" on public.study_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own study notes" on public.study_notes;
create policy "users delete own study notes" on public.study_notes for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.study_notes;
exception when duplicate_object then null;
end $$;
