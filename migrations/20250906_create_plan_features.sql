-- Migration: create plan_features table
create table if not exists plan_features (
  id uuid primary key default gen_random_uuid(),
  feature_key text unique not null,
  feature_label_en text not null,
  feature_label_sv text not null,
  free_value_en text not null,
  free_value_sv text not null,
  premium_value_en text not null,
  premium_value_sv text not null,
  sort_order int not null default 100,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists plan_features_sort_idx on plan_features (active desc, sort_order asc);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_plan_features_updated_at on plan_features;
create trigger trg_plan_features_updated_at
before update on plan_features
for each row execute procedure public.set_updated_at();
