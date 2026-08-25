insert into public.body_regions (key, label, sort_order) values
('head-neck','{"fr":"Tête et cou","en":"Head and neck","de":"Kopf und Hals"}'::jsonb,0),
('shoulder-upper-arm','{"fr":"Épaule et bras","en":"Shoulder and upper arm","de":"Schulter und Oberarm"}'::jsonb,1),
('elbow-forearm','{"fr":"Coude et avant-bras","en":"Elbow and forearm","de":"Ellbogen und Unterarm"}'::jsonb,2),
('wrist-hand','{"fr":"Poignet et main","en":"Wrist and hand","de":"Handgelenk und Hand"}'::jsonb,3),
('thorax','{"fr":"Thorax","en":"Thorax","de":"Thorax"}'::jsonb,4),
('spine-back','{"fr":"Colonne vertébrale et dos","en":"Spine and back","de":"Wirbelsäule und Rücken"}'::jsonb,5),
('hip-pelvis','{"fr":"Hanche et bassin","en":"Hip and pelvis","de":"Hüfte und Becken"}'::jsonb,6),
('pelvic-floor','{"fr":"Plancher pelvien","en":"Pelvic floor","de":"Beckenboden"}'::jsonb,7),
('knee-thigh','{"fr":"Genou et cuisse","en":"Knee and thigh","de":"Knie und Oberschenkel"}'::jsonb,8),
('ankle-foot','{"fr":"Cheville et pied","en":"Ankle and foot","de":"Sprunggelenk und Fuß"}'::jsonb,9),
('full-body','{"fr":"Corps entier","en":"Full body","de":"Ganzkörper"}'::jsonb,10)
on conflict (key) do update set label=excluded.label,sort_order=excluded.sort_order,is_active=true;

insert into public.goals (key,label,sort_order) values
('reduce-symptoms','{"fr":"Réduire les symptômes","en":"Reduce symptoms","de":"Beschwerden reduzieren"}'::jsonb,0),
('improve-mobility','{"fr":"Améliorer la mobilité","en":"Improve mobility","de":"Mobilität verbessern"}'::jsonb,1),
('build-strength','{"fr":"Renforcer","en":"Build strength","de":"Kraft aufbauen"}'::jsonb,2),
('improve-balance','{"fr":"Améliorer l’équilibre","en":"Improve balance","de":"Gleichgewicht verbessern"}'::jsonb,3),
('improve-function','{"fr":"Améliorer la fonction","en":"Improve function","de":"Funktion verbessern"}'::jsonb,4),
('return-to-walking','{"fr":"Reprendre ou améliorer la marche","en":"Return to or improve walking","de":"Gehen wiederaufnehmen oder verbessern"}'::jsonb,5),
('return-to-sport','{"fr":"Retour au sport","en":"Return to sport","de":"Rückkehr zum Sport"}'::jsonb,6),
('return-to-work','{"fr":"Retour au travail","en":"Return to work","de":"Rückkehr zur Arbeit"}'::jsonb,7),
('improve-posture','{"fr":"Améliorer la posture","en":"Improve posture","de":"Haltung verbessern"}'::jsonb,8),
('improve-flexibility','{"fr":"Améliorer la souplesse","en":"Improve flexibility","de":"Beweglichkeit verbessern"}'::jsonb,9),
('post-operative-recovery','{"fr":"Récupération post-opératoire","en":"Post-operative recovery","de":"Postoperative Rehabilitation"}'::jsonb,10),
('reconditioning','{"fr":"Reconditionnement physique","en":"Physical reconditioning","de":"Körperliche Rekonditionierung"}'::jsonb,11),
('prevention','{"fr":"Prévention","en":"Prevention","de":"Prävention"}'::jsonb,12),
('maintain-function','{"fr":"Maintenir la fonction","en":"Maintain function","de":"Funktion erhalten"}'::jsonb,13),
('maintain-independence','{"fr":"Maintenir l’autonomie","en":"Maintain independence","de":"Selbstständigkeit erhalten"}'::jsonb,14)
on conflict (key) do update set label=excluded.label,sort_order=excluded.sort_order,is_active=true;

insert into public.contexts (key,label,sort_order) values
('general','{"fr":"Vie quotidienne","en":"Everyday life","de":"Alltag"}'::jsonb,0),
('post-operative','{"fr":"Post-opératoire","en":"Post-operative","de":"Postoperativ"}'::jsonb,1),
('sport','{"fr":"Sport","en":"Sport","de":"Sport"}'::jsonb,2),
('work','{"fr":"Travail et ergonomie","en":"Work and ergonomics","de":"Arbeit und Ergonomie"}'::jsonb,3),
('pregnancy-postpartum','{"fr":"Grossesse et post-partum","en":"Pregnancy and postpartum","de":"Schwangerschaft und Wochenbett"}'::jsonb,4),
('seniors','{"fr":"Seniors et vieillissement actif","en":"Seniors and healthy ageing","de":"Senioren und gesundes Altern"}'::jsonb,5),
('neurological','{"fr":"Contexte neurologique","en":"Neurological context","de":"Neurologischer Kontext"}'::jsonb,6),
('chronic-condition','{"fr":"Affection chronique","en":"Chronic condition","de":"Chronische Erkrankung"}'::jsonb,7),
('sedentary-lifestyle','{"fr":"Mode de vie sédentaire","en":"Sedentary lifestyle","de":"Bewegungsarmer Alltag"}'::jsonb,8),
('prevention-maintenance','{"fr":"Prévention et maintien","en":"Prevention and maintenance","de":"Prävention und Erhaltung"}'::jsonb,9),
('adolescents','{"fr":"Adolescents","en":"Adolescents","de":"Jugendliche"}'::jsonb,10)
on conflict (key) do update set label=excluded.label,sort_order=excluded.sort_order,is_active=true;

insert into public.conditions (key,label,sort_order) values
('neck-pain','{"fr":"Cervicalgie","en":"Neck pain","de":"Nackenschmerzen"}'::jsonb,0),
('tmj-dysfunction','{"fr":"Troubles de l’articulation temporo-mandibulaire","en":"Temporomandibular joint dysfunction","de":"Kiefergelenkbeschwerden"}'::jsonb,1),
('positional-vertigo','{"fr":"Vertige positionnel","en":"Positional vertigo","de":"Lagerungsschwindel"}'::jsonb,2),
('low-back-pain','{"fr":"Lombalgie","en":"Low back pain","de":"Kreuzschmerzen"}'::jsonb,3),
('disc-related-back-pain','{"fr":"Troubles discaux du rachis","en":"Disc-related back pain","de":"Bandscheibenbedingte Rückenbeschwerden"}'::jsonb,4),
('scoliosis','{"fr":"Scoliose","en":"Scoliosis","de":"Skoliose"}'::jsonb,5),
('thoracic-back-pain','{"fr":"Dorsalgie","en":"Thoracic back pain","de":"Brustwirbelsäulenbeschwerden"}'::jsonb,6),
('rotator-cuff-disorder','{"fr":"Troubles de la coiffe des rotateurs","en":"Rotator cuff disorder","de":"Rotatorenmanschettenbeschwerden"}'::jsonb,7),
('frozen-shoulder','{"fr":"Capsulite rétractile","en":"Frozen shoulder","de":"Schultersteife"}'::jsonb,8),
('shoulder-instability','{"fr":"Instabilité de l’épaule","en":"Shoulder instability","de":"Schulterinstabilität"}'::jsonb,9),
('elbow-tendinopathy','{"fr":"Tendinopathie du coude","en":"Elbow tendinopathy","de":"Ellenbogen-Tendinopathie"}'::jsonb,10),
('forearm-tendinopathy','{"fr":"Tendinopathie de l’avant-bras","en":"Forearm tendinopathy","de":"Unterarm-Tendinopathie"}'::jsonb,11),
('carpal-tunnel','{"fr":"Syndrome du canal carpien","en":"Carpal tunnel syndrome","de":"Karpaltunnelsyndrom"}'::jsonb,12),
('hand-osteoarthritis','{"fr":"Arthrose de la main et des doigts","en":"Hand and finger osteoarthritis","de":"Hand- und Fingerarthrose"}'::jsonb,13),
('wrist-hand-stiffness','{"fr":"Raideur du poignet et de la main","en":"Wrist and hand stiffness","de":"Steifigkeit von Handgelenk und Hand"}'::jsonb,14),
('hip-osteoarthritis','{"fr":"Coxarthrose","en":"Hip osteoarthritis","de":"Hüftarthrose"}'::jsonb,15),
('hip-impingement','{"fr":"Conflit fémoro-acétabulaire","en":"Femoroacetabular impingement","de":"Femoroazetabuläres Impingement"}'::jsonb,16),
('post-hip-replacement','{"fr":"Après prothèse totale de hanche","en":"After total hip replacement","de":"Nach Hüfttotalendoprothese"}'::jsonb,17),
('piriformis-related-pain','{"fr":"Douleur liée au piriforme","en":"Piriformis-related pain","de":"Piriformisbezogene Beschwerden"}'::jsonb,18),
('groin-pain','{"fr":"Douleur de l’aine","en":"Groin pain","de":"Leistenschmerzen"}'::jsonb,19),
('knee-osteoarthritis','{"fr":"Gonarthrose","en":"Knee osteoarthritis","de":"Gonarthrose"}'::jsonb,20),
('patellofemoral-disorder','{"fr":"Troubles fémoro-patellaires","en":"Patellofemoral disorder","de":"Patellofemorale Beschwerden"}'::jsonb,21),
('acl-injury','{"fr":"Lésion du ligament croisé antérieur","en":"ACL injury","de":"Verletzung des vorderen Kreuzbands"}'::jsonb,22),
('meniscus-injury','{"fr":"Lésion méniscale","en":"Meniscus injury","de":"Meniskusverletzung"}'::jsonb,23),
('post-knee-replacement','{"fr":"Après prothèse totale de genou","en":"After total knee replacement","de":"Nach Knieendoprothese"}'::jsonb,24),
('iliotibial-band-syndrome','{"fr":"Syndrome de la bandelette ilio-tibiale","en":"Iliotibial band syndrome","de":"Iliotibiales Bandsyndrom"}'::jsonb,25),
('ankle-sprain','{"fr":"Entorse de cheville","en":"Ankle sprain","de":"Sprunggelenksdistorsion"}'::jsonb,26),
('achilles-tendinopathy','{"fr":"Tendinopathie d’Achille","en":"Achilles tendinopathy","de":"Achillessehnen-Tendinopathie"}'::jsonb,27),
('plantar-fasciopathy','{"fr":"Fasciopathie plantaire","en":"Plantar fasciopathy","de":"Plantarfasziopathie"}'::jsonb,28),
('hallux-valgus','{"fr":"Hallux valgus","en":"Hallux valgus","de":"Hallux valgus"}'::jsonb,29),
('morton-neuroma','{"fr":"Névrome de Morton","en":"Morton neuroma","de":"Morton-Neurom"}'::jsonb,30),
('postural-discomfort','{"fr":"Inconfort postural","en":"Postural discomfort","de":"Haltungsbedingte Beschwerden"}'::jsonb,31),
('deconditioning','{"fr":"Déconditionnement physique","en":"Physical deconditioning","de":"Körperliche Dekonditionierung"}'::jsonb,32),
('balance-gait-limitations','{"fr":"Limitations de l’équilibre et de la marche","en":"Balance and gait limitations","de":"Einschränkungen von Gleichgewicht und Gang"}'::jsonb,33),
('pelvic-floor-reconditioning','{"fr":"Reconditionnement du plancher pelvien","en":"Pelvic floor reconditioning","de":"Beckenboden-Rekonditionierung"}'::jsonb,34),
('mobility-stiffness','{"fr":"Raideur et mobilité réduite","en":"Stiffness and reduced mobility","de":"Steifigkeit und eingeschränkte Beweglichkeit"}'::jsonb,35),
('fibromyalgia','{"fr":"Fibromyalgie","en":"Fibromyalgia","de":"Fibromyalgie"}'::jsonb,36),
('multiple-sclerosis','{"fr":"Sclérose en plaques","en":"Multiple sclerosis","de":"Multiple Sklerose"}'::jsonb,37),
('parkinson','{"fr":"Maladie de Parkinson","en":"Parkinson’s disease","de":"Parkinson-Krankheit"}'::jsonb,38),
('stroke-rehabilitation','{"fr":"Rééducation après AVC","en":"Stroke rehabilitation","de":"Rehabilitation nach Schlaganfall"}'::jsonb,39),
('pregnancy-postpartum-reconditioning','{"fr":"Reconditionnement grossesse et post-partum","en":"Pregnancy and postpartum reconditioning","de":"Rekonditionierung in Schwangerschaft und Wochenbett"}'::jsonb,40)
on conflict (key) do update set label=excluded.label,sort_order=excluded.sort_order,is_active=true;

insert into public.programme_body_regions (programme_id,body_region_key,is_primary) values
(1,'head-neck',true),(2,'spine-back',true),(3,'shoulder-upper-arm',true),(4,'elbow-forearm',true),(5,'wrist-hand',true),(6,'hip-pelvis',true),(7,'knee-thigh',true),(8,'ankle-foot',true),(9,'spine-back',true),(9,'full-body',false),(10,'full-body',true),(10,'pelvic-floor',false),(11,'full-body',true),(12,'full-body',true)
on conflict (programme_id,body_region_key) do update set is_primary=excluded.is_primary;

insert into public.programme_conditions (programme_id,condition_key) values
(1,'neck-pain'),(1,'tmj-dysfunction'),(1,'positional-vertigo'),(2,'low-back-pain'),(2,'disc-related-back-pain'),(2,'scoliosis'),(2,'thoracic-back-pain'),(3,'rotator-cuff-disorder'),(3,'frozen-shoulder'),(3,'shoulder-instability'),(4,'elbow-tendinopathy'),(4,'forearm-tendinopathy'),(5,'carpal-tunnel'),(5,'hand-osteoarthritis'),(5,'wrist-hand-stiffness'),(6,'hip-osteoarthritis'),(6,'hip-impingement'),(6,'post-hip-replacement'),(6,'piriformis-related-pain'),(6,'groin-pain'),(7,'knee-osteoarthritis'),(7,'patellofemoral-disorder'),(7,'acl-injury'),(7,'meniscus-injury'),(7,'post-knee-replacement'),(7,'iliotibial-band-syndrome'),(8,'ankle-sprain'),(8,'achilles-tendinopathy'),(8,'plantar-fasciopathy'),(8,'hallux-valgus'),(8,'morton-neuroma'),(9,'postural-discomfort'),(9,'scoliosis'),(10,'deconditioning'),(10,'balance-gait-limitations'),(10,'pelvic-floor-reconditioning'),(11,'mobility-stiffness'),(12,'fibromyalgia'),(12,'multiple-sclerosis'),(12,'parkinson'),(12,'stroke-rehabilitation'),(12,'pregnancy-postpartum-reconditioning')
on conflict do nothing;

insert into public.programme_contexts (programme_id,context_key) values
(1,'general'),(1,'work'),(2,'general'),(2,'work'),(3,'general'),(3,'post-operative'),(3,'sport'),(4,'general'),(4,'sport'),(4,'work'),(5,'general'),(5,'work'),(6,'general'),(6,'post-operative'),(6,'seniors'),(7,'general'),(7,'post-operative'),(7,'sport'),(7,'seniors'),(8,'general'),(8,'sport'),(9,'work'),(9,'sedentary-lifestyle'),(9,'prevention-maintenance'),(10,'general'),(10,'seniors'),(10,'sedentary-lifestyle'),(10,'pregnancy-postpartum'),(10,'prevention-maintenance'),(11,'general'),(11,'sport'),(11,'seniors'),(11,'prevention-maintenance'),(12,'chronic-condition'),(12,'neurological'),(12,'pregnancy-postpartum'),(12,'seniors'),(12,'adolescents')
on conflict do nothing;

insert into public.programme_goals (programme_id,goal_key) values
(1,'reduce-symptoms'),(1,'improve-mobility'),(1,'improve-function'),(2,'reduce-symptoms'),(2,'improve-mobility'),(2,'build-strength'),(2,'improve-function'),(2,'return-to-work'),(3,'reduce-symptoms'),(3,'improve-mobility'),(3,'build-strength'),(3,'improve-function'),(3,'post-operative-recovery'),(3,'return-to-sport'),(4,'reduce-symptoms'),(4,'build-strength'),(4,'improve-function'),(4,'return-to-sport'),(4,'return-to-work'),(5,'reduce-symptoms'),(5,'improve-mobility'),(5,'improve-function'),(5,'return-to-work'),(6,'reduce-symptoms'),(6,'improve-mobility'),(6,'build-strength'),(6,'improve-function'),(6,'return-to-walking'),(6,'post-operative-recovery'),(7,'reduce-symptoms'),(7,'improve-mobility'),(7,'build-strength'),(7,'improve-function'),(7,'return-to-walking'),(7,'return-to-sport'),(7,'post-operative-recovery'),(8,'reduce-symptoms'),(8,'improve-mobility'),(8,'build-strength'),(8,'improve-function'),(8,'return-to-walking'),(8,'return-to-sport'),(9,'reduce-symptoms'),(9,'improve-posture'),(9,'improve-function'),(9,'return-to-work'),(9,'prevention'),(10,'build-strength'),(10,'improve-balance'),(10,'improve-function'),(10,'return-to-walking'),(10,'reconditioning'),(10,'maintain-independence'),(10,'prevention'),(11,'improve-mobility'),(11,'improve-flexibility'),(11,'improve-function'),(11,'prevention'),(11,'maintain-function'),(12,'improve-mobility'),(12,'build-strength'),(12,'improve-balance'),(12,'improve-function'),(12,'maintain-function'),(12,'maintain-independence')
on conflict do nothing;
