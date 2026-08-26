create table public.safety_questions (
  id uuid primary key default gen_random_uuid(),
  stable_key text not null unique check (stable_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  risk_if_yes text not null check (risk_if_yes in ('green','amber','red')),
  risk_if_no text not null default 'green' check (risk_if_no in ('green','amber','red')),
  is_global boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.safety_questions is 'M06 rule-based safety screening configuration. Questions are non-diagnostic and patient answers are not stored by this foundation.';

create table public.safety_question_translations (
  question_id uuid not null references public.safety_questions(id) on delete cascade,
  language text not null references public.supported_languages(code),
  question text not null check (length(btrim(question)) > 0),
  help_text text,
  primary key (question_id, language)
);
comment on table public.safety_question_translations is 'Multilingual patient-facing safety-screening copy for M06.';

create table public.safety_question_body_regions (
  question_id uuid not null references public.safety_questions(id) on delete cascade,
  body_region_key text not null references public.body_regions(key),
  primary key (question_id, body_region_key)
);
comment on table public.safety_question_body_regions is 'Optional body-region applicability for non-global safety questions.';

create table public.safety_outcomes (
  level text primary key check (level in ('green','amber','red')),
  sort_order smallint not null unique check (sort_order between 0 and 2),
  allows_recommendations boolean not null,
  requires_acknowledgement boolean not null,
  requires_professional_review boolean not null,
  blocks_programme_start boolean not null,
  title jsonb not null check (jsonb_typeof(title)='object' and jsonb_typeof(title->'fr')='string' and jsonb_typeof(title->'en')='string' and jsonb_typeof(title->'de')='string'),
  body jsonb not null check (jsonb_typeof(body)='object' and jsonb_typeof(body->'fr')='string' and jsonb_typeof(body->'en')='string' and jsonb_typeof(body->'de')='string'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.safety_outcomes is 'Authoritative M06 GREEN/AMBER/RED behavior. RED blocks recommendations; AMBER requires professional review before programme start; GREEN may continue through acknowledgement.';

alter table public.safety_questions enable row level security;
alter table public.safety_question_translations enable row level security;
alter table public.safety_question_body_regions enable row level security;
alter table public.safety_outcomes enable row level security;

revoke all on public.safety_questions, public.safety_question_translations, public.safety_question_body_regions, public.safety_outcomes from anon, authenticated;
grant select on public.safety_questions, public.safety_question_translations, public.safety_question_body_regions, public.safety_outcomes to anon, authenticated;

create policy safety_questions_public_read on public.safety_questions
for select to anon, authenticated using (is_active = true);

create policy safety_question_translations_public_read on public.safety_question_translations
for select to anon, authenticated using (
  exists (select 1 from public.safety_questions q where q.id = question_id and q.is_active = true)
);

create policy safety_question_body_regions_public_read on public.safety_question_body_regions
for select to anon, authenticated using (
  exists (select 1 from public.safety_questions q where q.id = question_id and q.is_active = true)
);

create policy safety_outcomes_public_read on public.safety_outcomes
for select to anon, authenticated using (true);