create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  stable_key text not null unique,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  clinical_version text not null default '1.0.0' check (clinical_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  default_sets smallint check (default_sets is null or default_sets > 0),
  default_repetitions smallint check (default_repetitions is null or default_repetitions > 0),
  default_hold_seconds integer check (default_hold_seconds is null or default_hold_seconds >= 0),
  default_rest_seconds integer check (default_rest_seconds is null or default_rest_seconds >= 0),
  default_frequency_per_week smallint check (default_frequency_per_week is null or (default_frequency_per_week > 0 and default_frequency_per_week <= 21)),
  default_tempo text,
  video_asset_ref text,
  thumbnail_asset_ref text,
  audio_asset_ref text,
  motion_trackable boolean not null default false,
  author_name text,
  reviewer_name text,
  reviewed_at timestamptz,
  next_review_at timestamptz,
  evidence_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_stable_key_slug check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint exercises_review_dates check (next_review_at is null or reviewed_at is not null)
);

create table public.exercise_translations (
  exercise_id uuid not null references public.exercises(id) on update cascade on delete cascade,
  language text not null check (language in ('fr','en','de')),
  name text not null check (length(btrim(name)) > 0),
  target text,
  starting_position text,
  movement text,
  why_this_exercise text,
  main_tip text,
  common_mistakes text,
  safety_instructions text,
  stop_criteria text,
  contraindications text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (exercise_id, language)
);

create table public.exercise_body_regions (
  exercise_id uuid not null references public.exercises(id) on update cascade on delete cascade,
  body_region_key text not null references public.body_regions(key) on update cascade on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (exercise_id, body_region_key)
);

create unique index exercise_body_regions_one_primary_idx on public.exercise_body_regions(exercise_id) where is_primary = true;
create index exercise_body_regions_body_region_key_idx on public.exercise_body_regions(body_region_key);

create table public.exercise_variants (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on update cascade on delete cascade,
  stable_key text not null,
  difficulty text not null check (difficulty in ('easy','standard','hard')),
  sort_order integer not null default 0 check (sort_order >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sets_override smallint check (sets_override is null or sets_override > 0),
  repetitions_override smallint check (repetitions_override is null or repetitions_override > 0),
  hold_seconds_override integer check (hold_seconds_override is null or hold_seconds_override >= 0),
  rest_seconds_override integer check (rest_seconds_override is null or rest_seconds_override >= 0),
  tempo_override text,
  video_asset_ref text,
  thumbnail_asset_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_variants_stable_key_slug check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint exercise_variants_unique_key unique (exercise_id, stable_key)
);

create index exercise_variants_exercise_id_idx on public.exercise_variants(exercise_id);
create index exercise_variants_status_idx on public.exercise_variants(status);

create table public.exercise_variant_translations (
  variant_id uuid not null references public.exercise_variants(id) on update cascade on delete cascade,
  language text not null check (language in ('fr','en','de')),
  name text not null check (length(btrim(name)) > 0),
  instructions text,
  coaching_tip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (variant_id, language)
);

create index exercises_status_idx on public.exercises(status);

create or replace function app_private.touch_content_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
revoke all on function app_private.touch_content_updated_at() from public, anon, authenticated;

create trigger exercises_touch_updated_at before update on public.exercises for each row execute function app_private.touch_content_updated_at();
create trigger exercise_translations_touch_updated_at before update on public.exercise_translations for each row execute function app_private.touch_content_updated_at();
create trigger exercise_variants_touch_updated_at before update on public.exercise_variants for each row execute function app_private.touch_content_updated_at();
create trigger exercise_variant_translations_touch_updated_at before update on public.exercise_variant_translations for each row execute function app_private.touch_content_updated_at();

alter table public.exercises enable row level security;
alter table public.exercise_translations enable row level security;
alter table public.exercise_body_regions enable row level security;
alter table public.exercise_variants enable row level security;
alter table public.exercise_variant_translations enable row level security;

revoke all on table public.exercises from public, anon, authenticated;
revoke all on table public.exercise_translations from public, anon, authenticated;
revoke all on table public.exercise_body_regions from public, anon, authenticated;
revoke all on table public.exercise_variants from public, anon, authenticated;
revoke all on table public.exercise_variant_translations from public, anon, authenticated;

comment on table public.exercises is 'M02 reusable exercise content objects. No patient data. Asset refs are provider-neutral and are not public video URLs.';
comment on table public.exercise_translations is 'M02 multilingual FR/EN/DE exercise instructions and safety content for one canonical exercise object.';
comment on table public.exercise_body_regions is 'M02 many-to-many exercise/body-region taxonomy relationships.';
comment on table public.exercise_variants is 'M02 reusable easy/standard/hard exercise variants with optional dosage and media overrides.';
comment on table public.exercise_variant_translations is 'M02 multilingual content for exercise variants.';
