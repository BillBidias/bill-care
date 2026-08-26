create table public.recommendation_engine_versions (
  version text primary key check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  is_active boolean not null default false,
  max_results smallint not null default 3 check (max_results between 1 and 10),
  min_score smallint not null default 8 check (min_score between 0 and 100),
  primary_body_region_weight smallint not null default 10 check (primary_body_region_weight between 0 and 50),
  secondary_body_region_weight smallint not null default 6 check (secondary_body_region_weight between 0 and 50),
  goal_weight smallint not null default 5 check (goal_weight between 0 and 50),
  context_weight smallint not null default 3 check (context_weight between 0 and 50),
  assessment_signal_multiplier numeric(4,2) not null default 1.00 check (assessment_signal_multiplier between 0 and 10),
  icd10_signal_multiplier numeric(4,2) not null default 1.00 check (icd10_signal_multiplier between 0 and 10),
  created_at timestamptz not null default now()
);
comment on table public.recommendation_engine_versions is 'M07 versioned non-diagnostic recommendation ranking policy. It combines body region, declared symptoms/limitations, goals, context and optional clinician-provided ICD-10 hints. Safety remains authoritative and can block recommendations.';

create unique index recommendation_engine_one_active_idx
on public.recommendation_engine_versions ((is_active))
where is_active = true;

alter table public.recommendation_engine_versions enable row level security;
revoke all on public.recommendation_engine_versions from anon, authenticated;
grant select on public.recommendation_engine_versions to anon, authenticated;
create policy recommendation_engine_versions_public_read
on public.recommendation_engine_versions
for select to anon, authenticated
using (is_active = true);