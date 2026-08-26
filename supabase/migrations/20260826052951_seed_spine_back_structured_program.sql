insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(2,'mobility-control',0,'draft'),
(2,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-control','fr','Phase 1 — Mobilité et contrôle','Entretenir une mobilité confortable du dos et du bassin, améliorer le contrôle du tronc et identifier une amplitude de mouvement bien tolérée.'),
('mobility-control','en','Phase 1 — Mobility and control','Maintain comfortable back and pelvic mobility, improve trunk control, and identify a well-tolerated movement range.'),
('mobility-control','de','Phase 1 — Beweglichkeit und Kontrolle','Angenehme Rücken- und Beckenbeweglichkeit erhalten, Rumpfkontrolle verbessern und einen gut verträglichen Bewegungsbereich finden.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la stabilité du tronc et la force fonctionnelle nécessaires aux activités quotidiennes et professionnelles.'),
('strength-function','en','Phase 2 — Strength and function','Progressively develop trunk stability and functional strength for daily and work-related activities.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Rumpfstabilität und funktionelle Kraft für Alltag und Arbeit schrittweise entwickeln.')
) as v(phase_key,language,name,objective)
on pp.programme_id=2 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-control','session-control-a',0,12),
('mobility-control','session-mobility-b',1,14),
('strength-function','session-stability-a',0,15),
('strength-function','session-function-b',1,16)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=2 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-control-a','fr','Séance 1 — Respiration et contrôle','Commencez par une séance courte centrée sur la respiration, le contrôle abdominal léger et une mobilité lombo-pelvienne confortable.','Séance terminée. La qualité du mouvement et la réaction des symptômes priment sur l’amplitude.'),
('session-control-a','en','Session 1 — Breathing and control','Start with a short session focused on breathing, gentle abdominal control, and comfortable lumbopelvic mobility.','Session complete. Movement quality and symptom response matter more than range.'),
('session-control-a','de','Einheit 1 — Atmung und Kontrolle','Beginnen Sie mit einer kurzen Einheit für Atmung, leichte Bauchkontrolle und angenehme lumbopelvine Beweglichkeit.','Einheit abgeschlossen. Bewegungsqualität und Beschwerdereaktion sind wichtiger als Bewegungsweite.'),
('session-mobility-b','fr','Séance 2 — Mobilité contrôlée','Ajoutez une mobilité douce du tronc et un travail à quatre pattes dans une amplitude confortable.','Séance terminée. Continuez uniquement avec les mouvements qui restent bien tolérés.'),
('session-mobility-b','en','Session 2 — Controlled mobility','Add gentle trunk mobility and hands-and-knees work within a comfortable range.','Session complete. Continue only with movements that remain well tolerated.'),
('session-mobility-b','de','Einheit 2 — Kontrollierte Beweglichkeit','Ergänzen Sie sanfte Rumpfbeweglichkeit und Vierfüßlerarbeit in angenehmer Bewegungsweite.','Einheit abgeschlossen. Nur Bewegungen fortsetzen, die gut vertragen werden.'),
('session-stability-a','fr','Séance 3 — Stabilité du tronc','Introduisez progressivement un travail de stabilité à quatre pattes et un pont de faible amplitude si ces exercices sont confortables.','Séance terminée. La stabilité doit progresser sans augmentation durable des symptômes.'),
('session-stability-a','en','Session 3 — Trunk stability','Gradually introduce quadruped stability work and a short-range bridge when these exercises are comfortable.','Session complete. Stability should progress without a lasting increase in symptoms.'),
('session-stability-a','de','Einheit 3 — Rumpfstabilität','Führen Sie schrittweise Stabilitätsarbeit im Vierfüßlerstand und eine kleine Brücke ein, wenn diese Übungen angenehm sind.','Einheit abgeschlossen. Stabilität soll ohne anhaltende Beschwerdezunahme fortschreiten.'),
('session-function-b','fr','Séance 4 — Fonction quotidienne','Combinez contrôle du tronc et force fonctionnelle pour préparer progressivement les transferts et les activités du quotidien ou du travail.','Séance terminée. La progression doit rester graduelle, contrôlée et compatible avec votre tolérance.'),
('session-function-b','en','Session 4 — Daily function','Combine trunk control and functional strength to gradually prepare transfers and daily or work-related activities.','Session complete. Progress should remain gradual, controlled, and compatible with your tolerance.'),
('session-function-b','de','Einheit 4 — Alltagsfunktion','Kombinieren Sie Rumpfkontrolle und funktionelle Kraft zur schrittweisen Vorbereitung von Transfers sowie Alltags- oder Arbeitsaktivitäten.','Einheit abgeschlossen. Fortschritt soll schrittweise, kontrolliert und verträglich bleiben.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=2 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-control-a','spine-back-breathing-brace',null::text,0,2,6,5,20,'slow-controlled'),
('session-control-a','spine-back-pelvic-tilt',null::text,1,2,10,null,20,'slow-controlled'),
('session-control-a','spine-back-knee-roll',null::text,2,2,6,null,20,'slow-controlled'),
('session-mobility-b','spine-back-pelvic-tilt',null::text,0,2,10,null,20,'slow-controlled'),
('session-mobility-b','spine-back-knee-roll',null::text,1,2,8,null,20,'slow-controlled'),
('session-mobility-b','spine-back-quadruped-rock-back','small-range',2,2,6,null,30,'slow-controlled'),
('session-stability-a','spine-back-quadruped-rock-back','standard-range',0,2,8,null,30,'slow-controlled'),
('session-stability-a','spine-back-quadruped-stability','hand-unweighting',1,3,6,2,30,'controlled'),
('session-stability-a','hip-pelvis-bridge','short-range-bridge',2,3,8,null,45,'controlled'),
('session-function-b','spine-back-quadruped-stability','leg-slide',0,3,6,3,30,'controlled'),
('session-function-b','hip-pelvis-bridge','short-range-bridge',1,3,8,null,45,'controlled'),
('session-function-b','knee-sit-to-stand','raised-seat-with-support',2,3,6,null,60,'controlled')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=2 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;