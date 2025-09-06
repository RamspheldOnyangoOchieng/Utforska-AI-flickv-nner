-- Plan features table for dynamic Free vs Premium comparison
create table if not exists public.plan_features (
  id uuid primary key default gen_random_uuid(),
  feature_key text not null unique,
  feature_label_en text not null,
  feature_label_sv text not null,
  free_value_en text not null,
  free_value_sv text not null,
  premium_value_en text not null,
  premium_value_sv text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Basic RLS setup
alter table public.plan_features enable row level security;

create policy "Allow read for all" on public.plan_features for select using (true);
-- Only admins (role claim) can modify
create policy "Allow admin modify" on public.plan_features for all using (
  auth.role() = 'authenticated' and (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
) with check (
  auth.role() = 'authenticated' and (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

create or replace function public.update_plan_features_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger trg_plan_features_updated
before update on public.plan_features
for each row execute function public.update_plan_features_updated_at();
