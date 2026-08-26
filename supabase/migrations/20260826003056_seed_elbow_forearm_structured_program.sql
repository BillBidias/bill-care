insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(4,'mobility-load-control',0,'draft'),
(4,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-load-control','fr','Phase 1 — Mobilité et contrôle de charge','Entretenir une mobilité confortable du coude et de l’avant-bras, puis introduire progressivement une charge isométrique légère.'),
('mobility-load-control','en','Phase 1 — Mobility and load control','Maintain comfortable elbow-forearm mobility, then gradually introduce light isometric loading.'),
('mobility-load-control','de','Phase 1 — Beweglichkeit und Belastungskontrolle','Angenehme Ellenbogen-Unterarm-Beweglichkeit erhalten und anschließend leichte isometrische Belastung schrittweise einführen.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la capacité de charge des muscles de l’avant-bras et préparer les activités quotidiennes, professionnelles ou sportives.'),
('strength-function','en','Phase 2 — Strength and function','Progressively build forearm load capacity and prepare daily, work-related, or sports activities.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Belastbarkeit der Unterarmmuskulatur schrittweise aufbauen und Alltag, Arbeit oder Sport vorbereiten.')
) as v(phase_key,language,name,objective)
on pp.programme_id=4 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-load-control','session-mobility-a',0,10),
('mobility-load-control','session-isometric-b',1,12),
('strength-function','session-strength-a',0,14),
('strength-function','session-function-b',1,16)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=4 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','fr','Séance 1 — Mobilité douce','Commencez par une séance courte de mobilité confortable du coude, du poignet et de l’avant-bras.','Séance terminée. Les mouvements doivent rester souples et sans augmentation durable des symptômes.'),
('session-mobility-a','en','Session 1 — Gentle mobility','Start with a short session of comfortable elbow, wrist, and forearm mobility.','Session complete. Movements should remain smooth without a lasting increase in symptoms.'),
('session-mobility-a','de','Einheit 1 — Sanfte Beweglichkeit','Beginnen Sie mit einer kurzen Einheit für angenehme Ellenbogen-, Handgelenk- und Unterarmbeweglichkeit.','Einheit abgeschlossen. Bewegungen sollen weich bleiben und keine anhaltende Beschwerdezunahme verursachen.'),
('session-isometric-b','fr','Séance 2 — Charge isométrique légère','Ajoutez une charge isométrique légère des muscles de l’avant-bras, sans chercher la force maximale.','Séance terminée. La réaction après l’exercice compte davantage que l’intensité maximale.'),
('session-isometric-b','en','Session 2 — Light isometric loading','Add light isometric loading of the forearm muscles without seeking maximal force.','Session complete. The response after exercise matters more than maximal intensity.'),
('session-isometric-b','de','Einheit 2 — Leichte isometrische Belastung','Ergänzen Sie leichte isometrische Belastung der Unterarmmuskulatur, ohne Maximalkraft anzustreben.','Einheit abgeschlossen. Die Reaktion nach der Übung ist wichtiger als maximale Intensität.'),
('session-strength-a','fr','Séance 3 — Charge lente et contrôlée','Introduisez progressivement une extension lente du poignet et une préhension douce.','Séance terminée. La technique et la tolérance priment sur la charge.'),
('session-strength-a','en','Session 3 — Slow controlled loading','Gradually introduce slow wrist extension and gentle gripping.','Session complete. Technique and tolerance matter more than load.'),
('session-strength-a','de','Einheit 3 — Langsame kontrollierte Belastung','Führen Sie schrittweise langsame Handgelenkstreckung und sanftes Greifen ein.','Einheit abgeschlossen. Technik und Verträglichkeit sind wichtiger als Last.'),
('session-function-b','fr','Séance 4 — Fonction avant-bras','Combinez mobilité, force et préhension pour préparer progressivement les gestes quotidiens, professionnels ou sportifs.','Séance terminée. La progression doit rester graduelle et ne pas augmenter durablement les symptômes.'),
('session-function-b','en','Session 4 — Forearm function','Combine mobility, strength, and gripping to gradually prepare daily, work, or sports tasks.','Session complete. Progress should remain gradual without a lasting increase in symptoms.'),
('session-function-b','de','Einheit 4 — Unterarmfunktion','Kombinieren Sie Beweglichkeit, Kraft und Griffarbeit zur schrittweisen Vorbereitung von Alltag, Arbeit oder Sport.','Einheit abgeschlossen. Fortschritt soll schrittweise erfolgen und Beschwerden nicht anhaltend verstärken.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=4 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','elbow-forearm-active-rotation',null::text,0,2,10,null,20,'slow-controlled'),
('session-mobility-a','elbow-forearm-wrist-extension-isometric','very-light-resistance',1,2,6,3,30,'isometric'),
('session-mobility-a','elbow-forearm-wrist-flexion-isometric',null::text,2,2,6,3,30,'isometric'),
('session-isometric-b','elbow-forearm-active-rotation',null::text,0,2,10,null,20,'slow-controlled'),
('session-isometric-b','elbow-forearm-wrist-extension-isometric','light-resistance-standard',1,3,8,5,30,'isometric'),
('session-isometric-b','elbow-forearm-wrist-flexion-isometric',null::text,2,3,8,5,30,'isometric'),
('session-strength-a','elbow-forearm-active-rotation',null::text,0,2,8,null,20,'slow-controlled'),
('session-strength-a','elbow-forearm-slow-wrist-extension','unloaded-slow-extension',1,2,8,null,30,'slow-controlled'),
('session-strength-a','elbow-forearm-soft-grip-isometric',null::text,2,3,6,3,30,'isometric'),
('session-function-b','elbow-forearm-active-rotation',null::text,0,2,8,null,20,'slow-controlled'),
('session-function-b','elbow-forearm-slow-wrist-extension','very-light-load',1,3,8,null,45,'slow-controlled'),
('session-function-b','elbow-forearm-soft-grip-isometric',null::text,2,3,8,5,30,'isometric')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=4 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;