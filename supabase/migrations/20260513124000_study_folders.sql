create table if not exists public.study_folders (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  name text not null,
  color text not null default 'cyan',
  created_at timestamptz not null,
  primary key (user_id, id)
);

alter table public.study_notes add column if not exists folder_id text;

create index if not exists study_folders_user_created_idx on public.study_folders (user_id, created_at);
create index if not exists study_notes_user_folder_idx on public.study_notes (user_id, folder_id, updated_at desc);

alter table public.study_folders enable row level security;

drop policy if exists "users read own study folders" on public.study_folders;
create policy "users read own study folders" on public.study_folders for select using (auth.uid() = user_id);
drop policy if exists "users insert own study folders" on public.study_folders;
create policy "users insert own study folders" on public.study_folders for insert with check (auth.uid() = user_id);
drop policy if exists "users update own study folders" on public.study_folders;
create policy "users update own study folders" on public.study_folders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own study folders" on public.study_folders;
create policy "users delete own study folders" on public.study_folders for delete using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.study_folders;
exception when duplicate_object then null;
end $$;
