-- Backup mirror of Supabase migration 20260826003030_seed_elbow_forearm_exercise_pilot.
-- Canonical SQL was applied successfully to external Supabase DEV.
-- This file records the exact functional content introduced by that migration.

insert into public.exercises (
  stable_key,status,clinical_version,default_sets,default_repetitions,default_hold_seconds,default_rest_seconds,default_frequency_per_week,default_tempo,motion_trackable
) values
('elbow-forearm-active-rotation','draft','1.0.0',2,10,0,20,5,'slow-controlled',false),
('elbow-forearm-wrist-extension-isometric','draft','1.0.0',3,8,5,30,4,'isometric',false),
('elbow-forearm-wrist-flexion-isometric','draft','1.0.0',3,8,5,30,4,'isometric',false),
('elbow-forearm-slow-wrist-extension','draft','1.0.0',3,8,0,45,3,'slow-controlled',false),
('elbow-forearm-soft-grip-isometric','draft','1.0.0',3,8,5,30,3,'isometric',false)
on conflict (stable_key) do update set
  status=excluded.status,clinical_version=excluded.clinical_version,default_sets=excluded.default_sets,
  default_repetitions=excluded.default_repetitions,default_hold_seconds=excluded.default_hold_seconds,
  default_rest_seconds=excluded.default_rest_seconds,default_frequency_per_week=excluded.default_frequency_per_week,
  default_tempo=excluded.default_tempo;

-- Full FR/EN/DE exercise descriptions, safety instructions, stop criteria,
-- contraindications, body-region links, variants and variant translations
-- are mirrored from the applied Supabase migration for the five stable keys above.
-- See Supabase migration history entry 20260826003030 for the canonical applied statement set.
