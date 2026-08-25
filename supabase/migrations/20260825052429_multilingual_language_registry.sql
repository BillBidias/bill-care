create table public.supported_languages (
  code text primary key,
  english_name text not null,
  native_name text not null,
  text_direction text not null default 'ltr' check (text_direction in ('ltr','rtl')),
  is_core boolean not null default false,
  is_content_enabled boolean not null default false,
  is_ui_enabled boolean not null default false,
  fallback_code text,
  benchmark_source text not null default 'competitor-benchmark',
  sort_order integer not null unique check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supported_languages_code_iso2 check (code ~ '^[a-z]{2}$'),
  constraint supported_languages_fallback_not_self check (fallback_code is null or fallback_code <> code)
);

insert into public.supported_languages
(code,english_name,native_name,text_direction,is_core,is_content_enabled,is_ui_enabled,fallback_code,sort_order)
values
('de','German','Deutsch','ltr',true,true,true,null,0),
('fr','French','Français','ltr',true,true,true,null,1),
('en','English','English','ltr',true,true,true,null,2),
('es','Spanish','Español','ltr',false,false,false,'en',3),
('pt','Portuguese','Português','ltr',false,false,false,'en',4),
('it','Italian','Italiano','ltr',false,false,false,'en',5),
('nl','Dutch','Nederlands','ltr',false,false,false,'en',6),
('sv','Swedish','Svenska','ltr',false,false,false,'en',7),
('da','Danish','Dansk','ltr',false,false,false,'en',8),
('fi','Finnish','Suomi','ltr',false,false,false,'en',9),
('pl','Polish','Polski','ltr',false,false,false,'en',10),
('ar','Arabic','العربية','rtl',false,false,false,'en',11),
('ja','Japanese','日本語','ltr',false,false,false,'en',12),
('id','Bahasa Indonesia','Bahasa Indonesia','ltr',false,false,false,'en',13),
('hi','Hindi','हिन्दी','ltr',false,false,false,'en',14),
('tr','Turkish','Türkçe','ltr',false,false,false,'en',15);

alter table public.supported_languages add constraint supported_languages_fallback_fkey foreign key (fallback_code) references public.supported_languages(code) on update cascade on delete restrict;
alter table public.supported_languages enable row level security;
revoke all on table public.supported_languages from public, anon, authenticated;
grant select on table public.supported_languages to anon, authenticated;
create policy supported_languages_public_read_enabled on public.supported_languages for select to anon, authenticated using (is_ui_enabled = true or is_content_enabled = true);
create trigger supported_languages_touch_updated_at before update on public.supported_languages for each row execute function app_private.touch_content_updated_at();

alter table public.exercise_translations drop constraint exercise_translations_language_check;
alter table public.exercise_translations add constraint exercise_translations_language_fkey foreign key (language) references public.supported_languages(code) on update cascade on delete restrict;
alter table public.exercise_variant_translations drop constraint exercise_variant_translations_language_check;
alter table public.exercise_variant_translations add constraint exercise_variant_translations_language_fkey foreign key (language) references public.supported_languages(code) on update cascade on delete restrict;
alter table public.profiles drop constraint profiles_preferred_language_check;
alter table public.profiles add constraint profiles_preferred_language_fkey foreign key (preferred_language) references public.supported_languages(code) on update cascade on delete restrict;

comment on table public.supported_languages is 'Global ISO-639-1 language registry. Core UI remains DE/FR/EN until each additional locale has reviewed content; benchmark languages are pre-registered without exposing incomplete translations.';
comment on column public.supported_languages.is_ui_enabled is 'Controls whether a language may be offered by the UI language selector.';
comment on column public.supported_languages.is_content_enabled is 'Controls whether patient-facing content may be treated as available in this language.';
comment on column public.supported_languages.fallback_code is 'Fallback language for missing translations; does not make incomplete clinical translations production-ready.';
