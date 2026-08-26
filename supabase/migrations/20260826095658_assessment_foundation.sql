create table public.assessment_options (
  id uuid primary key default gen_random_uuid(),
  stable_key text not null unique check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  option_type text not null check (option_type in ('symptom','limitation')),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.assessment_options is 'M05 non-diagnostic guided assessment options. Configuration only; no patient answers are stored here.';

create table public.assessment_option_translations (
  option_id uuid not null references public.assessment_options(id) on delete cascade,
  language text not null references public.supported_languages(code),
  label text not null check (length(btrim(label)) > 0),
  help_text text,
  primary key (option_id, language)
);
comment on table public.assessment_option_translations is 'Patient-friendly multilingual labels for M05 guided assessment options.';

create table public.assessment_option_body_regions (
  option_id uuid not null references public.assessment_options(id) on delete cascade,
  body_region_key text not null references public.body_regions(key),
  sort_order integer not null default 0 check (sort_order >= 0),
  primary key (option_id, body_region_key)
);
comment on table public.assessment_option_body_regions is 'Limits guided symptom/limitation options to relevant body regions.';

create table public.assessment_option_programmes (
  option_id uuid not null references public.assessment_options(id) on delete cascade,
  programme_id integer not null references public.programmes(id) on delete cascade,
  score smallint not null default 1 check (score between 1 and 10),
  primary key (option_id, programme_id)
);
comment on table public.assessment_option_programmes is 'Non-diagnostic relevance signals used by the Program Finder. Scores rank programmes but never establish a diagnosis.';

create table public.programme_icd10_matches (
  programme_id integer not null references public.programmes(id) on delete cascade,
  code_prefix text not null check (code_prefix ~ '^[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?$'),
  score smallint not null default 5 check (score between 1 and 10),
  primary key (programme_id, code_prefix)
);
comment on table public.programme_icd10_matches is 'Optional clinician-provided ICD-10 lookup hints for programme discovery; not a diagnostic engine.';

create table public.safety_acknowledgement_versions (
  version text primary key check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  title jsonb not null check (jsonb_typeof(title)='object' and jsonb_typeof(title->'fr')='string' and jsonb_typeof(title->'en')='string' and jsonb_typeof(title->'de')='string'),
  body jsonb not null check (jsonb_typeof(body)='object' and jsonb_typeof(body->'fr')='string' and jsonb_typeof(body->'en')='string' and jsonb_typeof(body->'de')='string'),
  checkbox_label jsonb not null check (jsonb_typeof(checkbox_label)='object' and jsonb_typeof(checkbox_label->'fr')='string' and jsonb_typeof(checkbox_label->'en')='string' and jsonb_typeof(checkbox_label->'de')='string'),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.safety_acknowledgement_versions is 'Versioned warning shown after safety screening and before programme recommendations. Acceptance storage is deferred to the safety/consent layer.';

alter table public.assessment_options enable row level security;
alter table public.assessment_option_translations enable row level security;
alter table public.assessment_option_body_regions enable row level security;
alter table public.assessment_option_programmes enable row level security;
alter table public.programme_icd10_matches enable row level security;
alter table public.safety_acknowledgement_versions enable row level security;

revoke all on public.assessment_options, public.assessment_option_translations, public.assessment_option_body_regions, public.assessment_option_programmes, public.programme_icd10_matches, public.safety_acknowledgement_versions from anon, authenticated;
grant select on public.assessment_options, public.assessment_option_translations, public.assessment_option_body_regions, public.assessment_option_programmes, public.programme_icd10_matches, public.safety_acknowledgement_versions to anon, authenticated;

create policy assessment_options_public_read on public.assessment_options for select to anon, authenticated using (is_active = true);
create policy assessment_option_translations_public_read on public.assessment_option_translations for select to anon, authenticated using (exists (select 1 from public.assessment_options ao where ao.id=option_id and ao.is_active=true));
create policy assessment_option_body_regions_public_read on public.assessment_option_body_regions for select to anon, authenticated using (exists (select 1 from public.assessment_options ao where ao.id=option_id and ao.is_active=true));
create policy assessment_option_programmes_public_read on public.assessment_option_programmes for select to anon, authenticated using (exists (select 1 from public.assessment_options ao join public.programmes p on p.id=programme_id where ao.id=option_id and ao.is_active=true and p.status='published'));
create policy programme_icd10_matches_public_read on public.programme_icd10_matches for select to anon, authenticated using (exists (select 1 from public.programmes p where p.id=programme_id and p.status='published'));
create policy safety_acknowledgement_versions_public_read on public.safety_acknowledgement_versions for select to anon, authenticated using (is_active=true);