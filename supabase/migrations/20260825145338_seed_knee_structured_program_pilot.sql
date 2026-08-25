insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(7,'foundation-control',0,'draft'),
(7,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('foundation-control','fr','Phase 1 — Activation, mobilité et contrôle','Réactiver le quadriceps, entretenir la mobilité du genou et préparer les mouvements fonctionnels sans surcharge inutile.'),
('foundation-control','en','Phase 1 — Activation, mobility and control','Re-engage the quadriceps, maintain knee mobility, and prepare functional movement without unnecessary overload.'),
('foundation-control','de','Phase 1 — Aktivierung, Beweglichkeit und Kontrolle','Quadrizeps aktivieren, Kniebeweglichkeit erhalten und funktionelle Bewegungen ohne unnötige Überlastung vorbereiten.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la force fonctionnelle et le contrôle nécessaires aux transferts et aux activités avec marches.'),
('strength-function','en','Phase 2 — Strength and function','Progressively develop functional strength and control for transfers and step-related activities.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Funktionelle Kraft und Kontrolle für Transfers und Aktivitäten mit Stufen schrittweise entwickeln.')
) as v(phase_key,language,name,objective)
on pp.programme_id=7 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.duration
from public.programme_phases pp
join (values
('foundation-control','session-foundation-a',0,12),
('foundation-control','session-foundation-b',1,14),
('strength-function','session-function-a',0,15),
('strength-function','session-function-b',1,16)
) as v(phase_key,stable_key,sort_order,duration)
on pp.programme_id=7 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-foundation-a','fr','Séance 1 — Activation et mobilité','Commencez par une séance courte centrée sur l’activation du quadriceps et une mobilité confortable.','Séance terminée. La qualité du mouvement est prioritaire sur la quantité.'),
('session-foundation-a','en','Session 1 — Activation and mobility','Start with a short session focused on quadriceps activation and comfortable mobility.','Session complete. Movement quality matters more than quantity.'),
('session-foundation-a','de','Einheit 1 — Aktivierung und Beweglichkeit','Beginnen Sie mit einer kurzen Einheit zur Quadrizepsaktivierung und angenehmen Beweglichkeit.','Einheit abgeschlossen. Bewegungsqualität ist wichtiger als Menge.'),
('session-foundation-b','fr','Séance 2 — Contrôle actif','Consolidez l’activation puis ajoutez un contrôle actif simple de la jambe.','Séance terminée. Continuez seulement si le genou réagit de façon habituelle et confortable.'),
('session-foundation-b','en','Session 2 — Active control','Reinforce activation, then add simple active leg control.','Session complete. Continue only if the knee responds in its usual and comfortable way.'),
('session-foundation-b','de','Einheit 2 — Aktive Kontrolle','Festigen Sie die Aktivierung und ergänzen Sie eine einfache aktive Beinkontrolle.','Einheit abgeschlossen. Nur fortfahren, wenn das Knie wie gewohnt und angenehm reagiert.'),
('session-function-a','fr','Séance 3 — Transfert fonctionnel','Ajoutez progressivement le mouvement assis-debout pour travailler la fonction quotidienne.','Séance terminée. Gardez un mouvement régulier et contrôlé.'),
('session-function-a','en','Session 3 — Functional transfer','Gradually add sit-to-stand to train an everyday functional movement.','Session complete. Keep the movement smooth and controlled.'),
('session-function-a','de','Einheit 3 — Funktioneller Transfer','Ergänzen Sie schrittweise das Aufstehen und Hinsetzen als alltagsnahe Funktion.','Einheit abgeschlossen. Bewegung gleichmäßig und kontrolliert ausführen.'),
('session-function-b','fr','Séance 4 — Fonction avec marche','Combinez les exercices précédents avec une montée sur marche basse contrôlée lorsque cela est sûr.','Séance terminée. La progression doit rester graduelle et sûre.'),
('session-function-b','en','Session 4 — Step function','Combine the earlier exercises with a controlled low step-up when it is safe to do so.','Session complete. Progress should remain gradual and safe.'),
('session-function-b','de','Einheit 4 — Funktion an der Stufe','Kombinieren Sie die bisherigen Übungen mit kontrolliertem Aufsteigen auf eine niedrige Stufe, sofern dies sicher ist.','Einheit abgeschlossen. Die Steigerung soll schrittweise und sicher bleiben.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=7 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-foundation-a','knee-quadriceps-isometric',null::text,0,3,8,5,30,'isometric'),
('session-foundation-a','knee-heel-slide',null::text,1,3,10,null::integer,30,'slow-controlled'),
('session-foundation-b','knee-quadriceps-isometric',null::text,0,3,10,5,30,'isometric'),
('session-foundation-b','knee-heel-slide',null::text,1,3,10,null::integer,30,'slow-controlled'),
('session-foundation-b','knee-straight-leg-raise',null::text,2,3,8,null::integer,45,'slow-controlled'),
('session-function-a','knee-heel-slide',null::text,0,2,10,null::integer,30,'slow-controlled'),
('session-function-a','knee-straight-leg-raise',null::text,1,3,10,null::integer,45,'slow-controlled'),
('session-function-a','knee-sit-to-stand','raised-seat-with-support',2,3,6,null::integer,60,'controlled'),
('session-function-b','knee-straight-leg-raise',null::text,0,3,10,null::integer,45,'slow-controlled'),
('session-function-b','knee-sit-to-stand','standard-chair',1,3,8,null::integer,60,'controlled'),
('session-function-b','knee-low-step-up','low-step-with-support',2,3,6,null::integer,60,'controlled')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=7 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;
