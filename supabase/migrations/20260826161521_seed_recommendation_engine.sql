insert into public.recommendation_engine_versions (
  version,is_active,max_results,min_score,primary_body_region_weight,secondary_body_region_weight,goal_weight,context_weight,assessment_signal_multiplier,icd10_signal_multiplier
) values (
  '1.0.0',true,3,8,10,6,5,3,1.00,1.00
)
on conflict (version) do update set
  is_active=excluded.is_active,
  max_results=excluded.max_results,
  min_score=excluded.min_score,
  primary_body_region_weight=excluded.primary_body_region_weight,
  secondary_body_region_weight=excluded.secondary_body_region_weight,
  goal_weight=excluded.goal_weight,
  context_weight=excluded.context_weight,
  assessment_signal_multiplier=excluded.assessment_signal_multiplier,
  icd10_signal_multiplier=excluded.icd10_signal_multiplier;