alter table public.study_folders add column if not exists parent_id text;

create index if not exists study_folders_user_parent_idx on public.study_folders (user_id, parent_id, name);
