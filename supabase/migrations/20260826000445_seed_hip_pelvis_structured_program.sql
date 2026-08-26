insert into public.programme_phases (programme_id,stable_key,sort_order,status) values
(6,'mobility-activation',0,'draft'),
(6,'strength-function',1,'draft')
on conflict (programme_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status;

insert into public.programme_phase_translations (phase_id,language,name,objective)
select pp.id,v.language,v.name,v.objective
from public.programme_phases pp
join (values
('mobility-activation','fr','Phase 1 — Mobilité et activation','Entretenir une mobilité confortable de la hanche, réactiver les fessiers et préparer progressivement la mise en charge.'),
('mobility-activation','en','Phase 1 — Mobility and activation','Maintain comfortable hip mobility, reactivate the glutes, and gradually prepare weight bearing.'),
('mobility-activation','de','Phase 1 — Beweglichkeit und Aktivierung','Angenehme Hüftbeweglichkeit erhalten, Gesäßmuskeln aktivieren und Belastung schrittweise vorbereiten.'),
('strength-function','fr','Phase 2 — Force et fonction','Développer progressivement la force des fessiers, le contrôle du bassin et les capacités nécessaires à la marche et aux transferts.'),
('strength-function','en','Phase 2 — Strength and function','Progressively develop glute strength, pelvic control, and capacity for walking and transfers.'),
('strength-function','de','Phase 2 — Kraft und Funktion','Gesäßkraft, Beckenkontrolle und Fähigkeiten für Gehen und Transfers schrittweise entwickeln.')
) as v(phase_key,language,name,objective)
on pp.programme_id=6 and pp.stable_key=v.phase_key
on conflict (phase_id,language) do update set name=excluded.name,objective=excluded.objective;

insert into public.programme_sessions (phase_id,stable_key,sort_order,status,estimated_duration_minutes)
select pp.id,v.stable_key,v.sort_order,'draft',v.minutes
from public.programme_phases pp
join (values
('mobility-activation','session-activation-a',0,12),
('mobility-activation','session-control-b',1,14),
('strength-function','session-strength-a',0,15),
('strength-function','session-function-b',1,16)
) as v(phase_key,stable_key,sort_order,minutes)
on pp.programme_id=6 and pp.stable_key=v.phase_key
on conflict (phase_id,stable_key) do update set sort_order=excluded.sort_order,status=excluded.status,estimated_duration_minutes=excluded.estimated_duration_minutes;

insert into public.programme_session_translations (session_id,language,name,intro,completion_message)
select ps.id,v.language,v.name,v.intro,v.completion_message
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-activation-a','fr','Séance 1 — Activation douce','Commencez par une séance courte centrée sur une activation confortable des fessiers et une mobilité douce de hanche.','Séance terminée. Le mouvement doit rester confortable et conforme à vos éventuelles restrictions médicales.'),
('session-activation-a','en','Session 1 — Gentle activation','Start with a short session focused on comfortable glute activation and gentle hip mobility.','Session complete. Movement should remain comfortable and within any medical restrictions.'),
('session-activation-a','de','Einheit 1 — Sanfte Aktivierung','Beginnen Sie mit einer kurzen Einheit für angenehme Gesäßaktivierung und sanfte Hüftmobilität.','Einheit abgeschlossen. Die Bewegung soll angenehm bleiben und medizinische Einschränkungen beachten.'),
('session-control-b','fr','Séance 2 — Contrôle du bassin et mise en charge','Ajoutez un contrôle simple du bassin et de petits transferts de poids avec appui sécurisé.','Séance terminée. La sécurité et la qualité du contrôle sont prioritaires.'),
('session-control-b','en','Session 2 — Pelvic control and loading','Add simple pelvic control and small supported weight shifts.','Session complete. Safety and control quality come first.'),
('session-control-b','de','Einheit 2 — Beckenkontrolle und Belastung','Ergänzen Sie einfache Beckenkontrolle und kleine Gewichtsverlagerungen mit sicherer Unterstützung.','Einheit abgeschlossen. Sicherheit und Kontrollqualität haben Vorrang.'),
('session-strength-a','fr','Séance 3 — Force des fessiers','Introduisez progressivement le renforcement des fessiers avec des variantes adaptées au niveau de sécurité.','Séance terminée. La charge doit progresser sans réaction inhabituelle.'),
('session-strength-a','en','Session 3 — Glute strength','Gradually introduce glute strengthening using variations appropriate to the current safety level.','Session complete. Loading should progress without an unusual reaction.'),
('session-strength-a','de','Einheit 3 — Gesäßkraft','Führen Sie die Gesäßkräftigung schrittweise mit zum Sicherheitsniveau passenden Varianten ein.','Einheit abgeschlossen. Belastung soll ohne ungewöhnliche Reaktion gesteigert werden.'),
('session-function-b','fr','Séance 4 — Fonction et stabilité','Combinez mobilité, force et contrôle en position debout pour préparer progressivement les activités quotidiennes.','Séance terminée. La progression doit rester graduelle, stable et sûre.'),
('session-function-b','en','Session 4 — Function and stability','Combine mobility, strength, and standing control to gradually prepare everyday activities.','Session complete. Progress should remain gradual, stable, and safe.'),
('session-function-b','de','Einheit 4 — Funktion und Stabilität','Kombinieren Sie Beweglichkeit, Kraft und Standkontrolle zur schrittweisen Vorbereitung auf Alltagsaktivitäten.','Einheit abgeschlossen. Fortschritt soll schrittweise, stabil und sicher bleiben.')
) as v(session_key,language,name,intro,completion_message)
on pp.programme_id=6 and ps.stable_key=v.session_key
on conflict (session_id,language) do update set name=excluded.name,intro=excluded.intro,completion_message=excluded.completion_message;

insert into public.programme_session_exercises (
  session_id,exercise_id,exercise_variant_id,sort_order,is_optional,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override
)
select ps.id,e.id,ev.id,v.sort_order,false,v.sets_override,v.repetitions_override,v.hold_seconds_override,v.rest_seconds_override,v.tempo_override
from public.programme_sessions ps
join public.programme_phases pp on pp.id=ps.phase_id
join (values
('session-activation-a','hip-pelvis-glute-set',null::text,0,3,8,5,30,'isometric'),
('session-activation-a','hip-pelvis-heel-slide',null::text,1,2,10,null,30,'slow-controlled'),
('session-activation-a','hip-pelvis-supported-weight-shift',null::text,2,2,6,null,30,'slow-controlled'),
('session-control-b','hip-pelvis-glute-set',null::text,0,3,10,5,30,'isometric'),
('session-control-b','hip-pelvis-heel-slide',null::text,1,2,10,null,30,'slow-controlled'),
('session-control-b','hip-pelvis-supported-weight-shift',null::text,2,3,8,null,30,'slow-controlled'),
('session-strength-a','hip-pelvis-bridge','glute-set-only',0,3,8,5,45,'isometric'),
('session-strength-a','hip-pelvis-supported-abduction','small-range-supported',1,3,6,null,45,'controlled'),
('session-strength-a','hip-pelvis-supported-weight-shift',null::text,2,3,8,null,30,'slow-controlled'),
('session-function-b','hip-pelvis-bridge','short-range-bridge',0,3,8,null,45,'controlled'),
('session-function-b','hip-pelvis-supported-abduction','standard-supported',1,3,8,null,45,'controlled'),
('session-function-b','hip-pelvis-supported-weight-shift',null::text,2,3,8,null,30,'slow-controlled')
) as v(session_key,exercise_key,variant_key,sort_order,sets_override,repetitions_override,hold_seconds_override,rest_seconds_override,tempo_override)
on pp.programme_id=6 and ps.stable_key=v.session_key
join public.exercises e on e.stable_key=v.exercise_key
left join public.exercise_variants ev on ev.exercise_id=e.id and ev.stable_key=v.variant_key
on conflict (session_id,sort_order) do update set
  exercise_id=excluded.exercise_id,exercise_variant_id=excluded.exercise_variant_id,is_optional=excluded.is_optional,
  sets_override=excluded.sets_override,repetitions_override=excluded.repetitions_override,hold_seconds_override=excluded.hold_seconds_override,
  rest_seconds_override=excluded.rest_seconds_override,tempo_override=excluded.tempo_override;