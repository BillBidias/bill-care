create table public.programme_phases (
  id uuid primary key default gen_random_uuid(),
  programme_id integer not null references public.programmes(id) on update cascade on delete cascade,
  stable_key text not null,
  sort_order integer not null check (sort_order >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programme_phases_stable_key_slug check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint programme_phases_unique_key unique (programme_id,stable_key),
  constraint programme_phases_unique_order unique (programme_id,sort_order)
);

create table public.programme_phase_translations (
  phase_id uuid not null references public.programme_phases(id) on update cascade on delete cascade,
  language text not null references public.supported_languages(code) on update cascade on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  objective text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (phase_id,language)
);

create table public.programme_sessions (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.programme_phases(id) on update cascade on delete cascade,
  stable_key text not null,
  sort_order integer not null check (sort_order >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  estimated_duration_minutes smallint check (estimated_duration_minutes is null or (estimated_duration_minutes > 0 and estimated_duration_minutes <= 180)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programme_sessions_stable_key_slug check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint programme_sessions_unique_key unique (phase_id,stable_key),
  constraint programme_sessions_unique_order unique (phase_id,sort_order)
);

create table public.programme_session_translations (
  session_id uuid not null references public.programme_sessions(id) on update cascade on delete cascade,
  language text not null references public.supported_languages(code) on update cascade on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  intro text,
  completion_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id,language)
);

alter table public.exercise_variants add constraint exercise_variants_id_exercise_unique unique (id,exercise_id);

create table public.programme_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.programme_sessions(id) on update cascade on delete cascade,
  exercise_id uuid not null references public.exercises(id) on update cascade on delete restrict,
  exercise_variant_id uuid,
  sort_order integer not null check (sort_order >= 0),
  is_optional boolean not null default false,
  sets_override smallint check (sets_override is null or sets_override > 0),
  repetitions_override smallint check (repetitions_override is null or repetitions_override > 0),
  hold_seconds_override integer check (hold_seconds_override is null or hold_seconds_override >= 0),
  rest_seconds_override integer check (rest_seconds_override is null or rest_seconds_override >= 0),
  tempo_override text,
  created_at timestamptz not null default now(),
  constraint programme_session_exercises_unique_order unique (session_id,sort_order),
  constraint programme_session_exercises_variant_matches_exercise foreign key (exercise_variant_id,exercise_id) references public.exercise_variants(id,exercise_id) on update cascade on delete restrict
);

create index programme_phases_programme_id_idx on public.programme_phases(programme_id);
create index programme_sessions_phase_id_idx on public.programme_sessions(phase_id);
create index programme_session_exercises_session_id_idx on public.programme_session_exercises(session_id);
create index programme_session_exercises_exercise_id_idx on public.programme_session_exercises(exercise_id);
create index programme_session_exercises_variant_id_idx on public.programme_session_exercises(exercise_variant_id) where exercise_variant_id is not null;

create trigger programme_phases_touch_updated_at before update on public.programme_phases for each row execute function app_private.touch_content_updated_at();
create trigger programme_phase_translations_touch_updated_at before update on public.programme_phase_translations for each row execute function app_private.touch_content_updated_at();
create trigger programme_sessions_touch_updated_at before update on public.programme_sessions for each row execute function app_private.touch_content_updated_at();
create trigger programme_session_translations_touch_updated_at before update on public.programme_session_translations for each row execute function app_private.touch_content_updated_at();

alter table public.programme_phases enable row level security;
alter table public.programme_phase_translations enable row level security;
alter table public.programme_sessions enable row level security;
alter table public.programme_session_translations enable row level security;
alter table public.programme_session_exercises enable row level security;

revoke all on table public.programme_phases from public,anon,authenticated;
revoke all on table public.programme_phase_translations from public,anon,authenticated;
revoke all on table public.programme_sessions from public,anon,authenticated;
revoke all on table public.programme_session_translations from public,anon,authenticated;
revoke all on table public.programme_session_exercises from public,anon,authenticated;

comment on table public.programme_phases is 'M03 ordered reusable programme structure. Content remains private until entitlement-aware access is implemented.';
comment on table public.programme_phase_translations is 'M03 multilingual phase names/objectives using the central supported language registry.';
comment on table public.programme_sessions is 'M03 ordered sessions belonging to a programme phase.';
comment on table public.programme_session_translations is 'M03 multilingual patient-facing session copy.';
comment on table public.programme_session_exercises is 'M03 ordered exercise prescription within a session, with optional variant and dosage overrides. No patient progress data.';
