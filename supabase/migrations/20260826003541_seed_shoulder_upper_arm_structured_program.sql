insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(3,'mobility-control',0,'draft'),
(3,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-control','fr','Phase 1 — Mobilité et contrôle','Entretenir une mobilité confortable de l’épaule, améliorer le contrôle de l’omoplate et introduire une charge légère sans dépasser les restrictions éventuelles.'),
('mobility-control','en','Phase 1 — Mobility and control','Maintain comfortable shoulder mobility, improve scapular control, and introduce light loading without exceeding any restrictions.'),
('mobility-control','de','Phase 1 — Beweglichkeit und Kontrolle','Angenehme Schulterbeweglichkeit erhalten, Schulterblattkontrolle verbessern und leichte Belastung ohne Überschreiten möglicher Einschränkungen einführen.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la force de la coiffe et de la ceinture scapulaire, puis préparer les gestes fonctionnels du membre supérieur.'),
('strength-function','en','Phase 2 — Strength and function','Progressively develop rotator-cuff and shoulder-girdle strength, then prepare functional upper-limb tasks.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Kraft von Rotatorenmanschette und Schultergürtel schrittweise entwickeln und funktionelle Armaktivitäten vorbereiten.')
) as v(phase_key,language,name,objective)
on pp.programme_id=3 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-control','session-mobility-a',0,12),
('mobility-control','session-control-b',1,14),
('strength-function','session-strength-a',0,15),
('strength-function','session-function-b',1,16)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=3 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','fr','Séance 1 — Mobilité assistée','Commencez par une séance courte centrée sur une mobilité assistée confortable et le contrôle de l’omoplate.','Séance terminée. L’amplitude doit rester compatible avec vos restrictions et sans augmentation durable des symptômes.'),
('session-mobility-a','en','Session 1 — Assisted mobility','Start with a short session focused on comfortable assisted mobility and scapular control.','Session complete. Range should remain within your restrictions without a lasting increase in symptoms.'),
('session-mobility-a','de','Einheit 1 — Assistierte Beweglichkeit','Beginnen Sie mit einer kurzen Einheit für angenehme assistierte Beweglichkeit und Schulterblattkontrolle.','Einheit abgeschlossen. Bewegungsweite muss zu den Einschränkungen passen und Beschwerden nicht anhaltend verstärken.'),
('session-control-b','fr','Séance 2 — Contrôle de l’épaule','Ajoutez une contraction isométrique légère de rotation externe et poursuivez le travail de mobilité contrôlée.','Séance terminée. La qualité et la stabilité priment sur l’intensité.'),
('session-control-b','en','Session 2 — Shoulder control','Add light isometric external-rotation work while continuing controlled mobility.','Session complete. Quality and stability matter more than intensity.'),
('session-control-b','de','Einheit 2 — Schulterkontrolle','Ergänzen Sie leichte isometrische Außenrotation und setzen Sie kontrollierte Beweglichkeit fort.','Einheit abgeschlossen. Qualität und Stabilität sind wichtiger als Intensität.'),
('session-strength-a','fr','Séance 3 — Force légère','Introduisez progressivement un glissement au mur et un tirage léger si ces mouvements sont autorisés et confortables.','Séance terminée. La progression doit rester lente, contrôlée et adaptée aux restrictions éventuelles.'),
('session-strength-a','en','Session 3 — Light strength','Gradually introduce a wall slide and light row if these movements are allowed and comfortable.','Session complete. Progress should remain slow, controlled, and adapted to any restrictions.'),
('session-strength-a','de','Einheit 3 — Leichte Kraft','Führen Sie schrittweise Wandgleiten und leichtes Rudern ein, sofern diese Bewegungen erlaubt und angenehm sind.','Einheit abgeschlossen. Fortschritt soll langsam, kontrolliert und an mögliche Einschränkungen angepasst bleiben.'),
('session-function-b','fr','Séance 4 — Fonction du membre supérieur','Combinez mobilité, contrôle de la coiffe et travail scapulaire pour préparer progressivement les gestes quotidiens ou sportifs autorisés.','Séance terminée. La progression doit rester graduelle et sans signe d’instabilité.'),
('session-function-b','en','Session 4 — Upper-limb function','Combine mobility, cuff control, and scapular work to gradually prepare allowed daily or sports-related tasks.','Session complete. Progress should remain gradual and free of instability signs.'),
('session-function-b','de','Einheit 4 — Armfunktion','Kombinieren Sie Beweglichkeit, Rotatorenmanschetten-Kontrolle und Schulterblattarbeit zur Vorbereitung erlaubter Alltags- oder Sportaktivitäten.','Einheit abgeschlossen. Fortschritt soll schrittweise und ohne Instabilitätszeichen erfolgen.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=3 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-mobility-a','shoulder-scapular-setting',null::text,0,3,8,5,30,'isometric'),
('session-mobility-a','shoulder-supported-table-slide','short-range-supported',1,2,8,null,30,'slow-controlled'),
('session-mobility-a','shoulder-external-rotation-isometric','very-light-pressure',2,2,6,3,30,'isometric'),
('session-control-b','shoulder-scapular-setting',null::text,0,3,8,5,30,'isometric'),
('session-control-b','shoulder-supported-table-slide','standard-table-slide',1,2,10,null,30,'slow-controlled'),
('session-control-b','shoulder-external-rotation-isometric','light-pressure-standard',2,3,8,5,30,'isometric'),
('session-strength-a','shoulder-supported-table-slide','standard-table-slide',0,2,10,null,30,'slow-controlled'),
('session-strength-a','shoulder-wall-slide',null::text,1,3,6,null,45,'slow-controlled'),
('session-strength-a','shoulder-supported-row',null::text,2,3,8,null,45,'controlled'),
('session-function-b','shoulder-external-rotation-isometric','light-pressure-standard',0,3,8,5,30,'isometric'),
('session-function-b','shoulder-wall-slide',null::text,1,3,8,null,45,'slow-controlled'),
('session-function-b','shoulder-supported-row',null::text,2,3,10,null,45,'controlled')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=3 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;