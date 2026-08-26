insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(5,'mobility-coordination',0,'draft'),
(5,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-coordination','fr','Phase 1 — Mobilité et coordination','Entretenir une mobilité confortable du poignet, des doigts et du pouce, et restaurer progressivement le contrôle de la main.'),
('mobility-coordination','en','Phase 1 — Mobility and coordination','Maintain comfortable wrist, finger, and thumb mobility and progressively restore hand control.'),
('mobility-coordination','de','Phase 1 — Beweglichkeit und Koordination','Angenehme Beweglichkeit von Handgelenk, Fingern und Daumen erhalten und die Handkontrolle schrittweise verbessern.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la force légère de préhension et le contrôle du poignet utiles aux activités quotidiennes et professionnelles.'),
('strength-function','en','Phase 2 — Strength and function','Progressively develop light grip strength and wrist control for daily and work-related activities.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Leichte Griffkraft und Handgelenkskontrolle für Alltag und Arbeit schrittweise entwickeln.')
) as v(phase_key,language,name,objective)
on pp.programme_id=5 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-coordination','session-mobility-a',0,10),
('mobility-coordination','session-coordination-b',1,12),
('strength-function','session-strength-a',0,14),
('strength-function','session-function-b',1,15)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=5 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','fr','Séance 1 — Mobilité douce','Commencez par une séance courte centrée sur la mobilité confortable du poignet et des doigts.','Séance terminée. Les mouvements doivent rester souples et sans augmentation durable des symptômes.'),
('session-mobility-a','en','Session 1 — Gentle mobility','Start with a short session focused on comfortable wrist and finger mobility.','Session complete. Movements should remain smooth without a lasting increase in symptoms.'),
('session-mobility-a','de','Einheit 1 — Sanfte Beweglichkeit','Beginnen Sie mit einer kurzen Einheit für angenehme Handgelenk- und Fingerbeweglichkeit.','Einheit abgeschlossen. Bewegungen sollen weich bleiben und keine anhaltende Beschwerdezunahme verursachen.'),
('session-coordination-b','fr','Séance 2 — Coordination de la main','Ajoutez un travail doux du pouce et du glissement des doigts pour améliorer la précision du mouvement.','Séance terminée. Cherchez la qualité du mouvement plutôt que la force.'),
('session-coordination-b','en','Session 2 — Hand coordination','Add gentle thumb and finger-gliding work to improve movement precision.','Session complete. Prioritise movement quality rather than force.'),
('session-coordination-b','de','Einheit 2 — Handkoordination','Ergänzen Sie sanfte Daumen- und Fingerbewegungen zur Verbesserung der Bewegungsgenauigkeit.','Einheit abgeschlossen. Bewegungsqualität ist wichtiger als Kraft.'),
('session-strength-a','fr','Séance 3 — Force légère','Introduisez progressivement une préhension douce et une contraction isométrique du poignet avec faible résistance.','Séance terminée. La charge doit rester sous-maximale et confortable.'),
('session-strength-a','en','Session 3 — Light strength','Gradually introduce gentle gripping and low-resistance isometric wrist work.','Session complete. Loading should remain submaximal and comfortable.'),
('session-strength-a','de','Einheit 3 — Leichte Kraft','Führen Sie schrittweise sanftes Greifen und isometrische Handgelenksarbeit mit geringem Widerstand ein.','Einheit abgeschlossen. Belastung soll untermaximal und angenehm bleiben.'),
('session-function-b','fr','Séance 4 — Fonction main-poignet','Combinez mobilité, coordination et force légère pour préparer les gestes quotidiens et professionnels.','Séance terminée. La progression doit rester graduelle et ne pas augmenter durablement les symptômes.'),
('session-function-b','en','Session 4 — Hand-wrist function','Combine mobility, coordination, and light strength to prepare daily and work-related hand tasks.','Session complete. Progress should remain gradual without a lasting increase in symptoms.'),
('session-function-b','de','Einheit 4 — Hand-Handgelenk-Funktion','Kombinieren Sie Beweglichkeit, Koordination und leichte Kraft zur Vorbereitung von Alltags- und Arbeitsaktivitäten.','Einheit abgeschlossen. Fortschritt soll schrittweise erfolgen und Beschwerden nicht anhaltend verstärken.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=5 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','wrist-hand-active-mobility',null::text,0,2,10,null,20,'slow-controlled'),
('session-mobility-a','wrist-hand-tendon-glide',null::text,1,2,5,2,20,'slow-controlled'),
('session-mobility-a','wrist-hand-thumb-opposition',null::text,2,2,5,1,20,'controlled'),
('session-coordination-b','wrist-hand-active-mobility',null::text,0,2,10,null,20,'slow-controlled'),
('session-coordination-b','wrist-hand-tendon-glide',null::text,1,2,5,2,20,'slow-controlled'),
('session-coordination-b','wrist-hand-thumb-opposition',null::text,2,3,5,1,20,'controlled'),
('session-strength-a','wrist-hand-active-mobility',null::text,0,2,8,null,20,'slow-controlled'),
('session-strength-a','wrist-hand-soft-grip-isometric','very-soft-grip',1,3,6,3,30,'isometric'),
('session-strength-a','wrist-hand-wrist-extension-isometric','very-light-resistance',2,3,6,3,30,'isometric'),
('session-function-b','wrist-hand-thumb-opposition',null::text,0,2,5,1,20,'controlled'),
('session-function-b','wrist-hand-soft-grip-isometric','soft-grip-standard',1,3,8,5,30,'isometric'),
('session-function-b','wrist-hand-wrist-extension-isometric','light-resistance-standard',2,3,8,5,30,'isometric')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=5 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;