-- Canonical migration applied to Supabase as 20260826003517 seed_shoulder_upper_arm_exercise_pilot.
-- This GitHub mirror documents the full structured content created for programme 3 (Shoulder / Upper Arm).

insert into public.exercises (
  stable_key,status,clinical_version,default_sets,default_repetitions,default_hold_seconds,default_rest_seconds,default_frequency_per_week,default_tempo,motion_trackable
) values
('shoulder-scapular-setting','draft','1.0.0',3,8,5,30,5,'isometric',false),
('shoulder-supported-table-slide','draft','1.0.0',2,10,0,30,5,'slow-controlled',false),
('shoulder-external-rotation-isometric','draft','1.0.0',3,8,5,30,3,'isometric',false),
('shoulder-wall-slide','draft','1.0.0',3,8,0,45,3,'slow-controlled',false),
('shoulder-supported-row','draft','1.0.0',3,10,0,45,3,'controlled',false)
on conflict (stable_key) do update set
  status=excluded.status,clinical_version=excluded.clinical_version,default_sets=excluded.default_sets,
  default_repetitions=excluded.default_repetitions,default_hold_seconds=excluded.default_hold_seconds,
  default_rest_seconds=excluded.default_rest_seconds,default_frequency_per_week=excluded.default_frequency_per_week,
  default_tempo=excluded.default_tempo;

-- Exercise translations, body-region links, variants, and variant translations are part of the canonical Supabase migration.
-- Core records seeded here:
-- 5 draft exercises
-- 15 FR/EN/DE exercise translations
-- primary body region: shoulder-upper-arm
-- 6 draft variants across supported table slide and external-rotation isometric exercises
-- 18 FR/EN/DE variant translations
-- No browser publication or clinical approval is implied by this migration.
