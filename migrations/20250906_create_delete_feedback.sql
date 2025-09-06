-- Migration: create delete_feedback table
create table if not exists delete_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reason text,
  description text,
  created_at timestamptz default now()
);

create index if not exists delete_feedback_user_idx on delete_feedback(user_id, created_at desc);
