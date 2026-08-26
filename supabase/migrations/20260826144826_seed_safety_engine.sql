insert into public.safety_outcomes (
  level, sort_order, allows_recommendations, requires_acknowledgement, requires_professional_review, blocks_programme_start, title, body
) values
('green',0,true,true,false,false,
 '{"fr":"Vous pouvez poursuivre le parcours","en":"You can continue","de":"Sie können fortfahren"}'::jsonb,
 '{"fr":"Aucun signal d’alerte majeur n’a été identifié dans ce dépistage. Vous pouvez poursuivre vers l’avertissement de sécurité puis les programmes recommandés. Cela ne constitue pas un diagnostic médical.","en":"No major warning signal was identified in this screening. You may continue to the safety acknowledgement and then the recommended programmes. This is not a medical diagnosis.","de":"In diesem Screening wurde kein wesentliches Warnsignal erkannt. Sie können mit dem Sicherheitshinweis und anschließend den empfohlenen Programmen fortfahren. Dies ist keine medizinische Diagnose."}'::jsonb),
('amber',1,true,true,true,true,
 '{"fr":"Un avis professionnel est recommandé avant de commencer","en":"Professional advice is recommended before starting","de":"Vor Beginn wird fachlicher Rat empfohlen"}'::jsonb,
 '{"fr":"Vos réponses indiquent une situation qui mérite davantage de prudence. La plateforme peut encore afficher les programmes potentiellement pertinents, mais vous ne devriez pas commencer le programme sans avoir vérifié votre situation avec un médecin, physiothérapeute ou autre professionnel de santé qualifié. L’avertissement de sécurité reste obligatoire.","en":"Your answers indicate a situation that needs extra caution. The platform may still show potentially relevant programmes, but you should not start a programme before checking your situation with a doctor, physiotherapist, or another qualified health professional. The safety acknowledgement remains mandatory.","de":"Ihre Antworten weisen auf eine Situation hin, die zusätzliche Vorsicht erfordert. Die Plattform kann weiterhin möglicherweise passende Programme anzeigen, Sie sollten jedoch kein Programm beginnen, bevor Sie Ihre Situation mit einem Arzt, Physiotherapeuten oder einer anderen qualifizierten Gesundheitsfachkraft geklärt haben. Der Sicherheitshinweis bleibt verpflichtend."}'::jsonb),
('red',2,false,false,true,true,
 '{"fr":"Ne poursuivez pas vers un programme automatique","en":"Do not continue to an automatic programme","de":"Nicht mit einem automatischen Programm fortfahren"}'::jsonb,
 '{"fr":"Une ou plusieurs de vos réponses correspondent à un signal d’alerte qui nécessite une évaluation médicale ou professionnelle avant tout programme d’exercices automatique. La plateforme bloque donc les recommandations de programmes à cette étape. Si les symptômes sont soudains, sévères ou s’aggravent rapidement, recherchez une aide médicale urgente appropriée.","en":"One or more of your answers match a warning signal that requires medical or professional assessment before any automatic exercise programme. Programme recommendations are therefore blocked at this step. If symptoms are sudden, severe, or rapidly worsening, seek appropriate urgent medical help.","de":"Eine oder mehrere Ihrer Antworten entsprechen einem Warnsignal, das vor einem automatischen Übungsprogramm eine medizinische oder fachliche Abklärung erfordert. Programme werden deshalb an dieser Stelle nicht empfohlen. Bei plötzlich auftretenden, starken oder rasch zunehmenden Beschwerden suchen Sie bitte geeignete dringende medizinische Hilfe."}'::jsonb)
on conflict (level) do update set
  sort_order=excluded.sort_order,
  allows_recommendations=excluded.allows_recommendations,
  requires_acknowledgement=excluded.requires_acknowledgement,
  requires_professional_review=excluded.requires_professional_review,
  blocks_programme_start=excluded.blocks_programme_start,
  title=excluded.title,
  body=excluded.body;

insert into public.safety_questions (stable_key,risk_if_yes,risk_if_no,is_global,sort_order) values
('chest-pain-severe-breathlessness-fainting','red','green',true,0),
('sudden-neurological-change','red','green',true,1),
('new-bowel-bladder-saddle-change','red','green',false,2),
('major-recent-trauma-deformity','red','green',true,3),
('fever-hot-red-swollen-area','red','green',true,4),
('severe-unusual-headache-with-neurological-symptoms','red','green',false,5),
('new-one-sided-leg-swelling-with-breathing-symptoms','red','green',false,6),
('recent-surgery-fracture-not-cleared','amber','green',true,20),
('medical-movement-or-weightbearing-restrictions','amber','green',true,21),
('frequent-falls-or-unsafe-standing','amber','green',false,22),
('pregnancy-postpartum-with-concerns-or-restrictions','amber','green',false,23),
('rapidly-worsening-or-unexplained-severe-symptoms','amber','green',true,24)
on conflict (stable_key) do update set
  risk_if_yes=excluded.risk_if_yes,
  risk_if_no=excluded.risk_if_no,
  is_global=excluded.is_global,
  sort_order=excluded.sort_order,
  is_active=true;

insert into public.safety_question_translations (question_id,language,question,help_text)
select q.id,v.language,v.question,v.help_text
from public.safety_questions q
join (values
('chest-pain-severe-breathlessness-fainting','fr','Avez-vous actuellement une douleur thoracique, un essoufflement important ou inhabituel, ou avez-vous fait un malaise/perdu connaissance ?','Si oui, ne commencez pas un programme d’exercices automatique.'),
('chest-pain-severe-breathlessness-fainting','en','Do you currently have chest pain, severe or unusual shortness of breath, or have you fainted/lost consciousness?','If yes, do not start an automatic exercise programme.'),
('chest-pain-severe-breathlessness-fainting','de','Haben Sie aktuell Brustschmerzen, starke oder ungewöhnliche Atemnot oder sind Sie ohnmächtig geworden?','Wenn ja, beginnen Sie kein automatisches Übungsprogramm.'),
('sudden-neurological-change','fr','Avez-vous récemment développé brutalement une nouvelle faiblesse, un engourdissement important, un trouble de la parole, de la vision, de la déglutition ou une perte inhabituelle de coordination ?','Un changement neurologique soudain nécessite une évaluation professionnelle.'),
('sudden-neurological-change','en','Have you recently developed sudden new weakness, significant numbness, speech, vision or swallowing difficulty, or an unusual loss of coordination?','A sudden neurological change requires professional assessment.'),
('sudden-neurological-change','de','Haben Sie kürzlich plötzlich neue Schwäche, deutliche Taubheit, Sprach-, Seh- oder Schluckstörungen oder einen ungewöhnlichen Koordinationsverlust entwickelt?','Eine plötzliche neurologische Veränderung erfordert fachliche Abklärung.'),
('new-bowel-bladder-saddle-change','fr','Avec votre problème de dos ou de bassin, avez-vous un nouveau trouble du contrôle de la vessie ou des intestins, ou un engourdissement inhabituel autour du périnée ?','Ces signes ne doivent pas être traités par un programme automatique.'),
('new-bowel-bladder-saddle-change','en','With your back or pelvic problem, do you have new loss of bladder or bowel control, or unusual numbness around the saddle/perineal area?','These signs should not be managed through an automatic programme.'),
('new-bowel-bladder-saddle-change','de','Haben Sie zusammen mit Rücken- oder Beckenbeschwerden neu Probleme mit Blasen- oder Darmkontrolle oder eine ungewöhnliche Taubheit im Sattel-/Dammbereich?','Diese Zeichen sollten nicht über ein automatisches Programm behandelt werden.'),
('major-recent-trauma-deformity','fr','Votre problème a-t-il commencé après un traumatisme important récent, avec déformation visible ou incapacité importante à utiliser le membre concerné ?','Un traumatisme important doit être évalué avant les exercices.'),
('major-recent-trauma-deformity','en','Did your problem start after a recent major injury, with visible deformity or major inability to use the affected limb?','A major injury should be assessed before exercise.'),
('major-recent-trauma-deformity','de','Begann Ihr Problem nach einer kürzlich erlittenen größeren Verletzung mit sichtbarer Fehlstellung oder deutlicher Unfähigkeit, die betroffene Extremität zu benutzen?','Eine größere Verletzung sollte vor Übungen abgeklärt werden.'),
('fever-hot-red-swollen-area','fr','Avez-vous de la fièvre ou vous sentez-vous très malade avec une zone douloureuse particulièrement chaude, rouge ou fortement gonflée ?','Une combinaison de symptômes généraux et locaux nécessite une évaluation.'),
('fever-hot-red-swollen-area','en','Do you have a fever or feel acutely unwell together with an especially hot, red, or markedly swollen painful area?','A combination of systemic and local symptoms needs assessment.'),
('fever-hot-red-swollen-area','de','Haben Sie Fieber oder fühlen Sie sich akut krank zusammen mit einem besonders heißen, geröteten oder deutlich geschwollenen schmerzhaften Bereich?','Die Kombination aus Allgemein- und Lokalsymptomen muss abgeklärt werden.'),
('severe-unusual-headache-with-neurological-symptoms','fr','Pour un problème de tête ou de cou : avez-vous un mal de tête soudain et inhabituellement intense accompagné de vertiges sévères, vision double, faiblesse, trouble de la parole ou autre symptôme neurologique nouveau ?','Ne poursuivez pas vers un programme cervical automatique si ces signes sont présents.'),
('severe-unusual-headache-with-neurological-symptoms','en','For a head or neck problem: do you have a sudden unusually severe headache with severe dizziness, double vision, weakness, speech difficulty, or another new neurological symptom?','Do not continue to an automatic neck programme if these signs are present.'),
('severe-unusual-headache-with-neurological-symptoms','de','Bei Kopf- oder Nackenbeschwerden: Haben Sie plötzlich ungewöhnlich starke Kopfschmerzen zusammen mit starkem Schwindel, Doppelbildern, Schwäche, Sprachstörungen oder einem anderen neuen neurologischen Symptom?','Bei diesen Zeichen nicht mit einem automatischen Nackenprogramm fortfahren.'),
('new-one-sided-leg-swelling-with-breathing-symptoms','fr','Avez-vous un gonflement nouveau et marqué d’une seule jambe, surtout s’il s’accompagne d’une douleur du mollet, d’un essoufflement ou d’une douleur thoracique ?','Ce tableau nécessite une évaluation médicale avant les exercices.'),
('new-one-sided-leg-swelling-with-breathing-symptoms','en','Do you have new marked swelling of one leg, especially with calf pain, shortness of breath, or chest pain?','This pattern needs medical assessment before exercise.'),
('new-one-sided-leg-swelling-with-breathing-symptoms','de','Haben Sie eine neue deutliche Schwellung nur eines Beins, besonders zusammen mit Wadenschmerz, Atemnot oder Brustschmerz?','Dieses Muster muss vor Übungen medizinisch abgeklärt werden.'),
('recent-surgery-fracture-not-cleared','fr','Avez-vous eu récemment une opération ou une fracture et n’avez-vous pas encore reçu d’autorisation claire concernant les exercices ?','Le programme peut être pertinent, mais les restrictions postopératoires ou de consolidation doivent d’abord être vérifiées.'),
('recent-surgery-fracture-not-cleared','en','Have you recently had surgery or a fracture and have not yet received clear guidance about exercise?','A programme may be relevant, but post-operative or healing restrictions should be checked first.'),
('recent-surgery-fracture-not-cleared','de','Hatten Sie kürzlich eine Operation oder Fraktur und noch keine klare Freigabe bezüglich Übungen?','Ein Programm kann passend sein, aber postoperative oder Heilungs-Einschränkungen müssen zuerst geklärt werden.'),
('medical-movement-or-weightbearing-restrictions','fr','Un professionnel de santé vous a-t-il donné des restrictions de mouvement, d’appui, de charge ou d’effort que vous devez encore respecter ?','Ces restrictions doivent être prises en compte avant de commencer.'),
('medical-movement-or-weightbearing-restrictions','en','Has a health professional given you movement, weight-bearing, loading, or activity restrictions that still apply?','These restrictions must be considered before starting.'),
('medical-movement-or-weightbearing-restrictions','de','Hat Ihnen eine Gesundheitsfachkraft Bewegungs-, Belastungs-, Gewichtsbelastungs- oder Aktivitätseinschränkungen gegeben, die noch gelten?','Diese Einschränkungen müssen vor Beginn berücksichtigt werden.'),
('frequent-falls-or-unsafe-standing','fr','Avez-vous actuellement des chutes répétées, ou vous sentez-vous incapable de rester debout ou marcher en sécurité sans aide ?','Un programme peut nécessiter supervision ou assistance.'),
('frequent-falls-or-unsafe-standing','en','Are you currently falling repeatedly, or unable to stand or walk safely without assistance?','A programme may require supervision or assistance.'),
('frequent-falls-or-unsafe-standing','de','Stürzen Sie derzeit wiederholt oder können Sie ohne Hilfe nicht sicher stehen oder gehen?','Ein Programm kann Aufsicht oder Unterstützung erfordern.'),
('pregnancy-postpartum-with-concerns-or-restrictions','fr','Êtes-vous enceinte ou en post-partum avec une complication, une restriction médicale ou une incertitude concernant l’activité physique ?','Une adaptation professionnelle est recommandée avant de commencer.'),
('pregnancy-postpartum-with-concerns-or-restrictions','en','Are you pregnant or postpartum with a complication, medical restriction, or uncertainty about physical activity?','Professional adaptation is recommended before starting.'),
('pregnancy-postpartum-with-concerns-or-restrictions','de','Sind Sie schwanger oder im Wochenbett und bestehen Komplikationen, medizinische Einschränkungen oder Unsicherheit bezüglich körperlicher Aktivität?','Vor Beginn wird eine fachliche Anpassung empfohlen.'),
('rapidly-worsening-or-unexplained-severe-symptoms','fr','Vos symptômes sont-ils très importants, inhabituels ou s’aggravent-ils rapidement sans raison claire ?','Une aggravation rapide ou inhabituelle mérite une évaluation avant un programme automatique.'),
('rapidly-worsening-or-unexplained-severe-symptoms','en','Are your symptoms very severe, unusual, or rapidly worsening without a clear reason?','Rapid or unusual worsening deserves assessment before an automatic programme.'),
('rapidly-worsening-or-unexplained-severe-symptoms','de','Sind Ihre Beschwerden sehr stark, ungewöhnlich oder verschlechtern sie sich ohne klaren Grund rasch?','Eine rasche oder ungewöhnliche Verschlechterung sollte vor einem automatischen Programm abgeklärt werden.')
) v(stable_key,language,question,help_text)
on q.stable_key=v.stable_key
on conflict (question_id,language) do update set question=excluded.question,help_text=excluded.help_text;

insert into public.safety_question_body_regions (question_id,body_region_key)
select q.id,v.region
from public.safety_questions q
join (values
('new-bowel-bladder-saddle-change','spine-back'),('new-bowel-bladder-saddle-change','hip-pelvis'),('new-bowel-bladder-saddle-change','pelvic-floor'),
('severe-unusual-headache-with-neurological-symptoms','head-neck'),
('new-one-sided-leg-swelling-with-breathing-symptoms','hip-pelvis'),('new-one-sided-leg-swelling-with-breathing-symptoms','knee-thigh'),('new-one-sided-leg-swelling-with-breathing-symptoms','ankle-foot'),
('frequent-falls-or-unsafe-standing','full-body'),('frequent-falls-or-unsafe-standing','hip-pelvis'),('frequent-falls-or-unsafe-standing','knee-thigh'),('frequent-falls-or-unsafe-standing','ankle-foot'),
('pregnancy-postpartum-with-concerns-or-restrictions','full-body'),('pregnancy-postpartum-with-concerns-or-restrictions','hip-pelvis'),('pregnancy-postpartum-with-concerns-or-restrictions','pelvic-floor')
) v(stable_key,region)
on q.stable_key=v.stable_key
on conflict do nothing;