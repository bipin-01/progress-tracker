alter table public.study_folders add column if not exists exam_date date;
alter table public.study_folders add column if not exists objectives jsonb not null default '[]'::jsonb;

create index if not exists study_folders_user_exam_idx on public.study_folders (user_id, exam_date);
