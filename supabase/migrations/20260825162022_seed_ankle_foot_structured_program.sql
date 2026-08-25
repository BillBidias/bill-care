insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(8,'mobility-control',0,'draft'),
(8,'strength-stability',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-control','fr','Phase 1 — Mobilité et contrôle','Entretenir une mobilité confortable de la cheville et du pied, réactiver les muscles du pied et préparer la stabilité sans surcharge inutile.'),
('mobility-control','en','Phase 1 — Mobility and control','Maintain comfortable ankle-foot mobility, reactivate foot muscles, and prepare stability without unnecessary overload.'),
('mobility-control','de','Phase 1 — Beweglichkeit und Kontrolle','Angenehme Sprunggelenk-Fuß-Beweglichkeit erhalten, Fußmuskulatur aktivieren und Stabilität ohne unnötige Überlastung vorbereiten.'),
('strength-stability','fr','Phase 2 — Force et stabilité','Développer progressivement la force du mollet, le contrôle de cheville et l’équilibre nécessaires aux activités quotidiennes.'),
('strength-stability','en','Phase 2 — Strength and stability','Progressively develop calf strength, ankle control, and balance for everyday activities.'),
('strength-stability','de','Phase 2 — Kraft und Stabilität','Wadenkraft, Sprunggelenkskontrolle und Gleichgewicht für Alltagsaktivitäten schrittweise entwickeln.')
) as v(phase_key,language,name,objective)
on pp.programme_id=8 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-control','session-mobility-a',0,12),
('mobility-control','session-control-b',1,14),
('strength-stability','session-strength-a',0,15),
('strength-stability','session-stability-b',1,16)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=8 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','fr','Séance 1 — Mobilité douce','Commencez par une séance courte centrée sur une mobilité confortable de la cheville et du pied.','Séance terminée. Le mouvement doit rester fluide et confortable.'),
('session-mobility-a','en','Session 1 — Gentle mobility','Start with a short session focused on comfortable ankle-foot mobility.','Session complete. Movement should remain smooth and comfortable.'),
('session-mobility-a','de','Einheit 1 — Sanfte Mobilität','Beginnen Sie mit einer kurzen Einheit für angenehme Sprunggelenk-Fuß-Mobilität.','Einheit abgeschlossen. Die Bewegung soll flüssig und angenehm bleiben.'),
('session-control-b','fr','Séance 2 — Contrôle du pied et stabilité','Ajoutez un travail doux de la voûte plantaire et un premier exercice d’équilibre sécurisé.','Séance terminée. La sécurité et la qualité du contrôle priment sur la difficulté.'),
('session-control-b','en','Session 2 — Foot control and stability','Add gentle arch activation and an initial safe balance exercise.','Session complete. Safety and control quality matter more than difficulty.'),
('session-control-b','de','Einheit 2 — Fußkontrolle und Stabilität','Ergänzen Sie sanfte Gewölbeaktivierung und eine erste sichere Gleichgewichtsübung.','Einheit abgeschlossen. Sicherheit und Bewegungsqualität sind wichtiger als Schwierigkeit.'),
('session-strength-a','fr','Séance 3 — Force du mollet','Introduisez progressivement le renforcement du mollet avec une variante adaptée au niveau de sécurité.','Séance terminée. La charge doit progresser sans augmentation inhabituelle des symptômes.'),
('session-strength-a','en','Session 3 — Calf strength','Gradually introduce calf strengthening using a variation appropriate to the current safety level.','Session complete. Loading should progress without an unusual increase in symptoms.'),
('session-strength-a','de','Einheit 3 — Wadenkraft','Führen Sie die Wadenkräftigung schrittweise mit einer zum Sicherheitsniveau passenden Variante ein.','Einheit abgeschlossen. Belastung soll ohne ungewöhnliche Beschwerdezunahme gesteigert werden.'),
('session-stability-b','fr','Séance 4 — Stabilité fonctionnelle','Combinez mobilité, force et équilibre pour préparer progressivement la marche et les activités fonctionnelles.','Séance terminée. La progression doit rester graduelle, stable et sûre.'),
('session-stability-b','en','Session 4 — Functional stability','Combine mobility, strength, and balance to gradually prepare walking and functional activities.','Session complete. Progress should remain gradual, stable, and safe.'),
('session-stability-b','de','Einheit 4 — Funktionelle Stabilität','Kombinieren Sie Beweglichkeit, Kraft und Gleichgewicht zur schrittweisen Vorbereitung auf Gehen und funktionelle Aktivitäten.','Einheit abgeschlossen. Fortschritt soll schrittweise, stabil und sicher bleiben.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=8 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','ankle-foot-active-mobility',null::text,0,2,12,null,20,'slow-controlled'),
('session-mobility-a','ankle-foot-knee-to-wall-mobility',null::text,1,2,8,null,30,'slow-controlled'),
('session-mobility-a','ankle-foot-short-foot-activation',null::text,2,2,8,5,30,'isometric'),
('session-control-b','ankle-foot-active-mobility',null::text,0,2,12,null,20,'slow-controlled'),
('session-control-b','ankle-foot-short-foot-activation',null::text,1,3,8,5,30,'isometric'),
('session-control-b','ankle-foot-supported-balance','narrow-stance-supported',2,3,3,15,30,'steady'),
('session-strength-a','ankle-foot-knee-to-wall-mobility',null::text,0,2,10,null,30,'slow-controlled'),
('session-strength-a','ankle-foot-supported-calf-raise','seated-calf-raise',1,3,10,null,45,'controlled'),
('session-strength-a','ankle-foot-short-foot-activation',null::text,2,3,8,5,30,'isometric'),
('session-stability-b','ankle-foot-knee-to-wall-mobility',null::text,0,2,10,null,30,'slow-controlled'),
('session-stability-b','ankle-foot-supported-calf-raise','bilateral-standing',1,3,10,null,45,'controlled'),
('session-stability-b','ankle-foot-supported-balance','single-leg-light-support',2,3,3,20,30,'steady')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=8 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;