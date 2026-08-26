insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(1,'relaxation-mobility',0,'draft'),
(1,'control-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('relaxation-mobility','fr','Phase 1 — Relâchement et mobilité','Réduire les tensions inutiles, entretenir une mobilité cervicale confortable et introduire un contrôle doux de la tête, de la mâchoire et des omoplates.'),
('relaxation-mobility','en','Phase 1 — Relaxation and mobility','Reduce unnecessary tension, maintain comfortable neck mobility, and introduce gentle control of the head, jaw, and shoulder blades.'),
('relaxation-mobility','de','Phase 1 — Entspannung und Beweglichkeit','Unnötige Spannung reduzieren, angenehme Halsbeweglichkeit erhalten und sanfte Kontrolle von Kopf, Kiefer und Schulterblättern einführen.'),
('control-function','fr','Phase 2 — Contrôle et fonction','Améliorer progressivement le contrôle cervical et postural pour les activités quotidiennes et professionnelles, sans utiliser de manœuvre vestibulaire spécifique non évaluée.'),
('control-function','en','Phase 2 — Control and function','Progressively improve cervical and postural control for daily and work activities without using unassessed condition-specific vestibular manoeuvres.'),
('control-function','de','Phase 2 — Kontrolle und Funktion','Hals- und Haltungskontrolle für Alltag und Arbeit schrittweise verbessern, ohne nicht abgeklärte spezifische vestibuläre Manöver einzusetzen.')
) as v(phase_key,language,name,objective)
on pp.programme_id=1 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('relaxation-mobility','session-relaxation-a',0,10),
('relaxation-mobility','session-mobility-b',1,12),
('control-function','session-control-a',0,14),
('control-function','session-function-b',1,15)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=1 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-relaxation-a','fr','Séance 1 — Relâchement tête-nuque','Commencez par une séance courte de respiration, relâchement cervical, contrôle des omoplates et détente de la mâchoire.','Séance terminée. Les mouvements doivent rester calmes, stables et sans aggravation durable des symptômes.'),
('session-relaxation-a','en','Session 1 — Head-neck relaxation','Start with a short session of breathing, neck relaxation, scapular control, and jaw relaxation.','Session complete. Movements should remain calm and stable without a lasting increase in symptoms.'),
('session-relaxation-a','de','Einheit 1 — Kopf-Nacken-Entspannung','Beginnen Sie mit Atmung, Nackenentspannung, Schulterblattkontrolle und Kieferentspannung.','Einheit abgeschlossen. Bewegungen sollen ruhig und stabil bleiben und Beschwerden nicht anhaltend verstärken.'),
('session-mobility-b','fr','Séance 2 — Mobilité cervicale douce','Ajoutez une petite rotation cervicale et une rétraction douce, sans mouvement rapide ni position provocatrice non évaluée.','Séance terminée. La qualité du mouvement compte davantage que l’amplitude.'),
('session-mobility-b','en','Session 2 — Gentle neck mobility','Add small-range neck rotation and gentle retraction without rapid or unassessed provocative head positions.','Session complete. Movement quality matters more than range.'),
('session-mobility-b','de','Einheit 2 — Sanfte Halsbeweglichkeit','Ergänzen Sie kleine Halsrotation und sanfte Retraktion ohne schnelle oder nicht abgeklärte provokative Kopfpositionen.','Einheit abgeschlossen. Bewegungsqualität ist wichtiger als Bewegungsweite.'),
('session-control-a','fr','Séance 3 — Contrôle cervical et postural','Renforcez progressivement le contrôle de la tête et des omoplates, tout en maintenant la mâchoire détendue.','Séance terminée. Le contrôle doit rester léger, précis et sans signe neurologique ou vestibulaire inquiétant.'),
('session-control-a','en','Session 3 — Cervical and postural control','Progressively reinforce head and scapular control while keeping the jaw relaxed.','Session complete. Control should remain light and precise without concerning neurological or vestibular signs.'),
('session-control-a','de','Einheit 3 — Hals- und Haltungskontrolle','Kopf- und Schulterblattkontrolle schrittweise verbessern und den Kiefer entspannt halten.','Einheit abgeschlossen. Kontrolle soll leicht und präzise bleiben, ohne bedenkliche neurologische oder vestibuläre Zeichen.'),
('session-function-b','fr','Séance 4 — Fonction tête-nuque','Combinez mobilité et contrôle postural pour préparer progressivement les activités quotidiennes et professionnelles. Les manœuvres spécifiques des vertiges positionnels ne font pas partie de cette séance pilote.','Séance terminée. La progression doit rester graduelle et stable.'),
('session-function-b','en','Session 4 — Head-neck function','Combine mobility and postural control to gradually prepare daily and work activities. Condition-specific positional-vertigo manoeuvres are not part of this pilot session.','Session complete. Progress should remain gradual and stable.'),
('session-function-b','de','Einheit 4 — Kopf-Nacken-Funktion','Kombinieren Sie Beweglichkeit und Haltungskontrolle zur Vorbereitung von Alltag und Arbeit. Spezifische Lagerungsmanöver bei positionellem Schwindel sind nicht Teil dieser Piloteinheit.','Einheit abgeschlossen. Fortschritt soll schrittweise und stabil bleiben.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=1 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-relaxation-a','head-neck-breathing-relaxation',null::text,0,2,6,5,20,'slow-controlled'),
('session-relaxation-a','head-neck-scapular-setting',null::text,1,2,6,5,30,'isometric'),
('session-relaxation-a','head-neck-jaw-relaxation',null::text,2,2,6,3,20,'slow-controlled'),
('session-mobility-b','head-neck-breathing-relaxation',null::text,0,2,6,5,20,'slow-controlled'),
('session-mobility-b','head-neck-gentle-rotation','micro-range',1,2,4,null,20,'slow-controlled'),
('session-mobility-b','head-neck-cervical-retraction','supported-retraction',2,3,6,2,30,'controlled'),
('session-control-a','head-neck-cervical-retraction','standard-retraction',0,3,8,3,30,'controlled'),
('session-control-a','head-neck-scapular-setting',null::text,1,3,8,5,30,'isometric'),
('session-control-a','head-neck-jaw-relaxation',null::text,2,2,6,3,20,'slow-controlled'),
('session-function-b','head-neck-gentle-rotation','comfortable-range',0,2,6,null,20,'slow-controlled'),
('session-function-b','head-neck-cervical-retraction','standard-retraction',1,3,8,3,30,'controlled'),
('session-function-b','head-neck-scapular-setting',null::text,2,3,8,5,30,'isometric')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=1 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;