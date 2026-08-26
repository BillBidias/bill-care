alter table public.programmes alter column icd10 drop not null;

comment on column public.programmes.icd10 is 'Optional catalogue metadata for clinician-provided ICD-10 references. May be null for prevention/maintenance programmes. Never infer a patient diagnosis from this field.';