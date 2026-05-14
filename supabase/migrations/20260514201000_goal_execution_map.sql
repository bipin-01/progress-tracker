alter table public.goals add column if not exists title text;
alter table public.goals add column if not exists due text;
alter table public.goals add column if not exists level text;
alter table public.goals add column if not exists progress integer;
alter table public.goals add column if not exists milestones jsonb not null default '[]'::jsonb;

alter table public.task_projects add column if not exists goal_id text;
alter table public.task_projects add column if not exists outcome text;
alter table public.task_projects add column if not exists name text;
alter table public.task_projects add column if not exists start_date date;
alter table public.task_projects add column if not exists end_date date;
alter table public.task_projects add column if not exists current_day integer;
alter table public.task_projects add column if not exists deadline_days integer;

create index if not exists goals_user_level_progress_idx on public.goals (user_id, level, progress);
create index if not exists task_projects_user_goal_idx on public.task_projects (user_id, goal_id, end_date);
