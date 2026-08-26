insert into public.assessment_options (stable_key,option_type,sort_order) values
('pain','symptom',0),('stiffness','symptom',1),('swelling','symptom',2),('weakness','symptom',3),('instability','symptom',4),('numbness-tingling','symptom',5),('reduced-mobility','symptom',6),('locking-catching','symptom',7),('dizziness','symptom',8),('jaw-discomfort','symptom',9),('fatigue-low-tolerance','symptom',10),('balance-difficulty','symptom',11),
('difficulty-walking','limitation',20),('difficulty-stairs','limitation',21),('difficulty-sit-to-stand','limitation',22),('difficulty-reaching-overhead','limitation',23),('difficulty-gripping','limitation',24),('difficulty-bending-lifting','limitation',25),('difficulty-prolonged-sitting','limitation',26),('difficulty-work','limitation',27),('difficulty-sport','limitation',28),('difficulty-sleep','limitation',29)
on conflict (stable_key) do nothing;

insert into public.assessment_option_translations (option_id,language,label,help_text)
select ao.id,v.language,v.label,v.help_text from public.assessment_options ao join (values
('pain','fr','Douleur','Douleur, gêne ou sensibilité dans cette région.'),('pain','en','Pain','Pain, discomfort, or tenderness in this area.'),('pain','de','Schmerz','Schmerz, Beschwerden oder Empfindlichkeit in diesem Bereich.'),
('stiffness','fr','Raideur','La région semble raide ou difficile à bouger.'),('stiffness','en','Stiffness','The area feels stiff or difficult to move.'),('stiffness','de','Steifigkeit','Der Bereich fühlt sich steif oder schwer beweglich an.'),
('swelling','fr','Gonflement','Vous remarquez un gonflement ou une augmentation de volume.'),('swelling','en','Swelling','You notice swelling or increased size.'),('swelling','de','Schwellung','Sie bemerken eine Schwellung oder Größenzunahme.'),
('weakness','fr','Faiblesse','La région semble moins forte que d’habitude.'),('weakness','en','Weakness','The area feels weaker than usual.'),('weakness','de','Schwäche','Der Bereich fühlt sich schwächer als gewöhnlich an.'),
('instability','fr','Sensation d’instabilité','La zone semble se dérober, lâcher ou manquer de stabilité.'),('instability','en','Feeling of instability','The area feels as if it gives way or lacks stability.'),('instability','de','Instabilitätsgefühl','Der Bereich fühlt sich unsicher an oder gibt nach.'),
('numbness-tingling','fr','Fourmillements ou engourdissement','Picotements, fourmillements ou perte de sensibilité.'),('numbness-tingling','en','Tingling or numbness','Pins and needles, tingling, or reduced sensation.'),('numbness-tingling','de','Kribbeln oder Taubheit','Kribbeln, Ameisenlaufen oder vermindertes Gefühl.'),
('reduced-mobility','fr','Mobilité réduite','Vous avez du mal à atteindre votre amplitude habituelle.'),('reduced-mobility','en','Reduced mobility','You have difficulty reaching your usual range of movement.'),('reduced-mobility','de','Eingeschränkte Beweglichkeit','Sie erreichen Ihre übliche Bewegungsweite nicht.'),
('locking-catching','fr','Blocage ou accrochage','La zone se bloque, accroche ou clique avec gêne.'),('locking-catching','en','Locking or catching','The area locks, catches, or clicks with discomfort.'),('locking-catching','de','Blockieren oder Haken','Der Bereich blockiert, hakt oder klickt mit Beschwerden.'),
('dizziness','fr','Vertiges liés aux mouvements de tête','Sensation de vertige ou déséquilibre lors de certains mouvements de tête.'),('dizziness','en','Dizziness with head movement','Dizziness or imbalance with certain head movements.'),('dizziness','de','Schwindel bei Kopfbewegung','Schwindel oder Unsicherheit bei bestimmten Kopfbewegungen.'),
('jaw-discomfort','fr','Gêne de la mâchoire','Douleur, tension, claquement ou difficulté à ouvrir la bouche.'),('jaw-discomfort','en','Jaw discomfort','Pain, tension, clicking, or difficulty opening the mouth.'),('jaw-discomfort','de','Kieferbeschwerden','Schmerz, Spannung, Knacken oder Probleme beim Mundöffnen.'),
('fatigue-low-tolerance','fr','Fatigue ou faible tolérance à l’effort','Vous vous fatiguez rapidement ou supportez mal l’effort.'),('fatigue-low-tolerance','en','Fatigue or low activity tolerance','You tire quickly or tolerate activity poorly.'),('fatigue-low-tolerance','de','Fatigue oder geringe Belastbarkeit','Sie ermüden schnell oder vertragen Belastung schlecht.'),
('balance-difficulty','fr','Difficulté d’équilibre','Vous vous sentez instable debout ou pendant la marche.'),('balance-difficulty','en','Balance difficulty','You feel unsteady while standing or walking.'),('balance-difficulty','de','Gleichgewichtsprobleme','Sie fühlen sich beim Stehen oder Gehen unsicher.'),
('difficulty-walking','fr','Difficulté à marcher','La marche est douloureuse, limitée ou moins sûre.'),('difficulty-walking','en','Difficulty walking','Walking is painful, limited, or less safe.'),('difficulty-walking','de','Schwierigkeiten beim Gehen','Gehen ist schmerzhaft, eingeschränkt oder unsicherer.'),
('difficulty-stairs','fr','Difficulté dans les escaliers','Monter ou descendre les escaliers est difficile.'),('difficulty-stairs','en','Difficulty with stairs','Going up or down stairs is difficult.'),('difficulty-stairs','de','Probleme auf Treppen','Treppensteigen oder -absteigen ist schwierig.'),
('difficulty-sit-to-stand','fr','Difficulté à se lever d’une chaise','Se relever ou se rasseoir est difficile.'),('difficulty-sit-to-stand','en','Difficulty standing from a chair','Standing up or sitting down is difficult.'),('difficulty-sit-to-stand','de','Probleme beim Aufstehen vom Stuhl','Aufstehen oder Hinsetzen ist schwierig.'),
('difficulty-reaching-overhead','fr','Difficulté à lever le bras','Lever le bras ou atteindre quelque chose en hauteur est difficile.'),('difficulty-reaching-overhead','en','Difficulty reaching overhead','Raising the arm or reaching overhead is difficult.'),('difficulty-reaching-overhead','de','Probleme beim Armheben','Armheben oder Überkopfgreifen ist schwierig.'),
('difficulty-gripping','fr','Difficulté à saisir ou porter','Saisir, tenir ou porter un objet est difficile.'),('difficulty-gripping','en','Difficulty gripping or carrying','Gripping, holding, or carrying an object is difficult.'),('difficulty-gripping','de','Probleme beim Greifen oder Tragen','Greifen, Halten oder Tragen eines Gegenstands ist schwierig.'),
('difficulty-bending-lifting','fr','Difficulté à se pencher ou soulever','Se pencher ou soulever un objet est difficile.'),('difficulty-bending-lifting','en','Difficulty bending or lifting','Bending or lifting an object is difficult.'),('difficulty-bending-lifting','de','Probleme beim Bücken oder Heben','Bücken oder Heben eines Gegenstands ist schwierig.'),
('difficulty-prolonged-sitting','fr','Difficulté à rester assis longtemps','Une position assise prolongée augmente votre gêne.'),('difficulty-prolonged-sitting','en','Difficulty sitting for long periods','Prolonged sitting increases your discomfort.'),('difficulty-prolonged-sitting','de','Probleme bei langem Sitzen','Langes Sitzen verstärkt Ihre Beschwerden.'),
('difficulty-work','fr','Difficulté au travail','Votre problème gêne vos tâches professionnelles.'),('difficulty-work','en','Difficulty at work','Your problem interferes with work tasks.'),('difficulty-work','de','Probleme bei der Arbeit','Ihr Problem beeinträchtigt berufliche Aufgaben.'),
('difficulty-sport','fr','Difficulté pendant le sport','Votre problème limite ou empêche une activité sportive.'),('difficulty-sport','en','Difficulty with sport','Your problem limits or prevents sports activity.'),('difficulty-sport','de','Probleme beim Sport','Ihr Problem schränkt sportliche Aktivität ein.'),
('difficulty-sleep','fr','Sommeil perturbé','Votre problème perturbe le sommeil ou certaines positions de sommeil.'),('difficulty-sleep','en','Sleep disturbed','Your problem disrupts sleep or certain sleeping positions.'),('difficulty-sleep','de','Gestörter Schlaf','Ihr Problem stört den Schlaf oder bestimmte Schlafpositionen.')
) v(stable_key,language,label,help_text) on ao.stable_key=v.stable_key
on conflict (option_id,language) do update set label=excluded.label,help_text=excluded.help_text;

insert into public.assessment_option_body_regions (option_id,body_region_key,sort_order)
select ao.id, br.key, ao.sort_order from public.assessment_options ao cross join public.body_regions br
where ao.stable_key in ('pain','stiffness','weakness','reduced-mobility')
on conflict do nothing;

insert into public.assessment_option_body_regions (option_id,body_region_key,sort_order)
select ao.id,v.region,v.sort_order from public.assessment_options ao join (values
('swelling','knee-thigh',2),('swelling','ankle-foot',2),('swelling','wrist-hand',2),('swelling','elbow-forearm',2),('swelling','shoulder-upper-arm',2),
('instability','knee-thigh',4),('instability','ankle-foot',4),('instability','shoulder-upper-arm',4),('instability','hip-pelvis',4),
('numbness-tingling','head-neck',5),('numbness-tingling','shoulder-upper-arm',5),('numbness-tingling','elbow-forearm',5),('numbness-tingling','wrist-hand',5),('numbness-tingling','spine-back',5),('numbness-tingling','hip-pelvis',5),('numbness-tingling','ankle-foot',5),
('locking-catching','knee-thigh',7),('locking-catching','hip-pelvis',7),('locking-catching','shoulder-upper-arm',7),('locking-catching','head-neck',7),
('dizziness','head-neck',8),('jaw-discomfort','head-neck',9),
('fatigue-low-tolerance','full-body',10),('balance-difficulty','full-body',11),('balance-difficulty','knee-thigh',11),('balance-difficulty','ankle-foot',11),
('difficulty-walking','hip-pelvis',20),('difficulty-walking','knee-thigh',20),('difficulty-walking','ankle-foot',20),('difficulty-walking','full-body',20),
('difficulty-stairs','hip-pelvis',21),('difficulty-stairs','knee-thigh',21),('difficulty-stairs','ankle-foot',21),('difficulty-stairs','full-body',21),
('difficulty-sit-to-stand','hip-pelvis',22),('difficulty-sit-to-stand','knee-thigh',22),('difficulty-sit-to-stand','spine-back',22),('difficulty-sit-to-stand','full-body',22),
('difficulty-reaching-overhead','shoulder-upper-arm',23),('difficulty-reaching-overhead','head-neck',23),
('difficulty-gripping','wrist-hand',24),('difficulty-gripping','elbow-forearm',24),('difficulty-gripping','shoulder-upper-arm',24),
('difficulty-bending-lifting','spine-back',25),('difficulty-bending-lifting','hip-pelvis',25),
('difficulty-prolonged-sitting','spine-back',26),('difficulty-prolonged-sitting','head-neck',26),('difficulty-prolonged-sitting','hip-pelvis',26),('difficulty-prolonged-sitting','full-body',26),
('difficulty-work','head-neck',27),('difficulty-work','shoulder-upper-arm',27),('difficulty-work','elbow-forearm',27),('difficulty-work','wrist-hand',27),('difficulty-work','spine-back',27),('difficulty-work','hip-pelvis',27),('difficulty-work','knee-thigh',27),('difficulty-work','ankle-foot',27),('difficulty-work','full-body',27),
('difficulty-sport','shoulder-upper-arm',28),('difficulty-sport','elbow-forearm',28),('difficulty-sport','wrist-hand',28),('difficulty-sport','spine-back',28),('difficulty-sport','hip-pelvis',28),('difficulty-sport','knee-thigh',28),('difficulty-sport','ankle-foot',28),('difficulty-sport','full-body',28),
('difficulty-sleep','head-neck',29),('difficulty-sleep','shoulder-upper-arm',29),('difficulty-sleep','spine-back',29),('difficulty-sleep','hip-pelvis',29),('difficulty-sleep','knee-thigh',29)
) v(stable_key,region,sort_order) on ao.stable_key=v.stable_key
on conflict do nothing;

insert into public.assessment_option_programmes (option_id,programme_id,score)
select ao.id,p.id,v.score from public.assessment_options ao join (values
('dizziness',1,9),('jaw-discomfort',1,9),('difficulty-prolonged-sitting',1,3),
('difficulty-bending-lifting',2,8),('difficulty-prolonged-sitting',2,7),('difficulty-work',2,5),
('difficulty-reaching-overhead',3,9),('instability',3,8),('difficulty-sport',3,6),
('difficulty-gripping',4,7),('difficulty-work',4,6),('difficulty-sport',4,6),
('difficulty-gripping',5,9),('numbness-tingling',5,6),('stiffness',5,5),
('difficulty-walking',6,7),('difficulty-sit-to-stand',6,7),('stiffness',6,5),
('difficulty-stairs',7,9),('difficulty-walking',7,8),('instability',7,8),('swelling',7,5),('locking-catching',7,6),
('difficulty-walking',8,8),('instability',8,7),('swelling',8,6),
('difficulty-prolonged-sitting',9,8),('difficulty-work',9,8),('stiffness',9,5),
('fatigue-low-tolerance',10,8),('balance-difficulty',10,8),('difficulty-sit-to-stand',10,7),('difficulty-walking',10,7),
('stiffness',11,8),('reduced-mobility',11,8),('difficulty-sport',11,4),
('fatigue-low-tolerance',12,8),('balance-difficulty',12,8),('difficulty-walking',12,7),('weakness',12,6)
) v(stable_key,programme_id,score) on ao.stable_key=v.stable_key join public.programmes p on p.id=v.programme_id
on conflict (option_id,programme_id) do update set score=excluded.score;

insert into public.programme_icd10_matches (programme_id,code_prefix,score) values
(1,'M50',8),(1,'M51',5),(1,'M53',8),(1,'M54',7),(1,'G54',6),
(2,'M40',6),(2,'M41',7),(2,'M51',9),(2,'M54',9),
(3,'M75',9),(3,'M77',5),(3,'G56',3),
(4,'M77.0',10),(4,'M77.1',10),(4,'M70',6),
(5,'G56',9),(5,'M15',7),(5,'M70',5),(5,'M77.2',8),
(6,'M16',10),(6,'M70',4),(6,'M76',6),(6,'Z96',6),
(7,'M17',10),(7,'M22',8),(7,'M23',8),(7,'M71',5),(7,'M76',5),
(8,'M72',8),(8,'M76',7),(8,'M77',6),(8,'G57.6',10),(8,'M20',8),
(9,'M40',8),(9,'M41',6),(9,'Z57.5',8),
(10,'M62',6),(10,'R26',9),(10,'N39',6),(10,'Z72',5),(10,'Z73',5),
(11,'M62',6),(11,'M79',6),(11,'Z72',5),
(12,'G20',10),(12,'G35',10),(12,'M79.70',10),(12,'O26',8),(12,'N99',6),(12,'F45',4)
on conflict (programme_id,code_prefix) do update set score=excluded.score;

insert into public.safety_acknowledgement_versions (version,title,body,checkbox_label,is_active) values
('1.0.0',
'{"fr":"Avant de continuer","en":"Before you continue","de":"Bevor Sie fortfahren"}'::jsonb,
'{"fr":"Les programmes proposés sont destinés à vous guider dans des exercices correspondant aux informations que vous avez fournies. Toute activité physique peut comporter des risques, notamment si un mouvement est mal exécuté, réalisé avec une intensité inadaptée ou malgré une contre-indication. Respectez les consignes, contre-indications et critères d’arrêt. Arrêtez en cas de douleur importante ou inhabituelle, aggravation nette, vertiges, malaise, faiblesse inhabituelle ou autre symptôme inquiétant. En cas d’incertitude sur votre état de santé, votre diagnostic ou votre aptitude à réaliser un exercice, demandez conseil à un médecin, physiothérapeute ou autre professionnel de santé qualifié. Les recommandations de la plateforme ne remplacent pas un diagnostic médical ni une prise en charge professionnelle lorsque celle-ci est nécessaire.","en":"The suggested programmes are intended to guide you through exercises based on the information you provided. Any physical activity may involve risks, especially if a movement is performed incorrectly, at an unsuitable intensity, or despite a contraindication. Follow all instructions, contraindications, and stop criteria. Stop if you develop significant or unusual pain, clear worsening, dizziness, faintness, unusual weakness, or another concerning symptom. If you are uncertain about your health, diagnosis, or ability to perform an exercise, seek advice from a doctor, physiotherapist, or another qualified health professional. Platform recommendations do not replace a medical diagnosis or professional care when such care is needed.","de":"Die vorgeschlagenen Programme sollen Sie anhand Ihrer Angaben bei Übungen unterstützen. Jede körperliche Aktivität kann Risiken bergen, insbesondere wenn eine Bewegung falsch, mit ungeeigneter Intensität oder trotz einer Gegenanzeige ausgeführt wird. Beachten Sie Anweisungen, Gegenanzeigen und Abbruchkriterien. Brechen Sie bei starken oder ungewöhnlichen Schmerzen, deutlicher Verschlechterung, Schwindel, Kreislaufproblemen, ungewöhnlicher Schwäche oder anderen bedenklichen Symptomen ab. Wenn Sie hinsichtlich Ihres Gesundheitszustands, Ihrer Diagnose oder Ihrer Eignung für eine Übung unsicher sind, holen Sie Rat bei einem Arzt, Physiotherapeuten oder einer anderen qualifizierten Gesundheitsfachkraft ein. Empfehlungen der Plattform ersetzen keine medizinische Diagnose oder professionelle Behandlung, wenn diese erforderlich ist."}'::jsonb,
'{"fr":"J’ai lu et compris ces informations et je souhaite continuer.","en":"I have read and understood this information and wish to continue.","de":"Ich habe diese Hinweise gelesen und verstanden und möchte fortfahren."}'::jsonb,
true)
on conflict (version) do update set title=excluded.title,body=excluded.body,checkbox_label=excluded.checkbox_label,is_active=excluded.is_active;