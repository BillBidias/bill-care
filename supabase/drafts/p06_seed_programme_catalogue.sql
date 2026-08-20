-- P06 — Programme catalogue DATA migration (DRAFT — not applied)
-- Target: bill-care-dev (DEV, ref ezwkeoapkmeftbbhdjua)
-- Data only: no DDL, no constraints, no RLS, no policies, no functions, no triggers.

begin;

-- 0. Safety precondition ----------------------------------------------------
do $$
declare
  v_categories bigint;
  v_programmes bigint;
begin
  select count(*) into v_categories from public.programme_categories;
  select count(*) into v_programmes from public.programmes;

  if v_categories > 0 or v_programmes > 0 then
    raise exception
      'P06 aborted: expected empty catalogue, found % category row(s) and % programme row(s).',
      v_categories, v_programmes;
  end if;
end
$$;

-- 1. Categories (stable P02 keys, current display order) --------------------
insert into public.programme_categories (key, sort_order, is_active) values
  ('spine-back',            0, true),
  ('shoulder-arm',          1, true),
  ('knee-thigh',            2, true),
  ('hip-pelvis',            3, true),
  ('ankle-foot',            4, true),
  ('posture-ergonomics',    5, true),
  ('full-body-strength',    6, true),
  ('mobility-flexibility',  7, true),
  ('special-populations',   8, true),
  ('bundles-paths',         9, true);

-- 2. Programmes (exactly the current 12 frontend programmes) ----------------
insert into public.programmes
  (id, category_key, region, title, price_amount, currency, duration, level, image, icd10, status)
values
  (1, 'spine-back',
   '{"fr":"Tête & cou","en":"Head & neck","de":"Kopf & Hals"}'::jsonb,
   '{"fr":"Cervicalgies, nuque, ATM, vertiges positionnels","en":"Neck pain, TMJ, positional vertigo","de":"Nackenschmerzen, KG, Lagerungsschwindel"}'::jsonb,
   4400, 'EUR', '6 sem.', 'Débutant', '🧠', 'M50–M54 · G54 · M53', 'published'),

  (2, 'spine-back',
   '{"fr":"Colonne vertébrale","en":"Spine","de":"Wirbelsäule"}'::jsonb,
   '{"fr":"Lombalgies, hernies, scoliose, coccyx, dorsalgies","en":"Low back pain, hernias, scoliosis, coccyx","de":"Rückenschmerz, Bandscheiben, Skoliose"}'::jsonb,
   5900, 'EUR', '8 sem.', 'Intermédiaire', '🦴', 'M40–M54 · M51', 'published'),

  (3, 'shoulder-arm',
   '{"fr":"Épaule & bras","en":"Shoulder & arm","de":"Schulter & Arm"}'::jsonb,
   '{"fr":"Coiffe, capsulite, instabilité, biceps, post-op","en":"Rotator cuff, frozen shoulder, instability, post-op","de":"Rotatorenmanschette, Schultersteife, post-OP"}'::jsonb,
   5400, 'EUR', '6 sem.', 'Débutant', '💪', 'M75 · M77 · G56', 'published'),

  (4, 'shoulder-arm',
   '{"fr":"Coude & avant-bras","en":"Elbow & forearm","de":"Ellbogen & Unterarm"}'::jsonb,
   '{"fr":"Épicondylites, tendinopathies de l''avant-bras","en":"Epicondylitis, forearm tendinopathies","de":"Epicondylitis, Unterarm-Tendinopathien"}'::jsonb,
   4400, 'EUR', '5 sem.', 'Débutant', '💪', 'M77.0 · M77.1 · M70', 'published'),

  (5, 'shoulder-arm',
   '{"fr":"Poignet & main","en":"Wrist & hand","de":"Handgelenk & Hand"}'::jsonb,
   '{"fr":"Canal carpien, arthrose digitale, mobilité","en":"Carpal tunnel, finger OA, mobility","de":"Karpaltunnel, Fingerarthrose, Mobilität"}'::jsonb,
   3900, 'EUR', '4 sem.', 'Débutant', '✋', 'G56 · M15 · M70 · M77.2', 'published'),

  (6, 'hip-pelvis',
   '{"fr":"Hanche & bassin","en":"Hip & pelvis","de":"Hüfte & Becken"}'::jsonb,
   '{"fr":"Coxarthrose, FAI, prothèse, piriforme, pubalgies","en":"Hip OA, FAI, THR, piriformis, groin pain","de":"Hüftarthrose, FAI, Hüft-TEP, Piriformis"}'::jsonb,
   5400, 'EUR', '8 sem.', 'Débutant', '🦵', 'M16 · M70 · M76 · Z96', 'published'),

  (7, 'knee-thigh',
   '{"fr":"Genou & cuisse","en":"Knee & thigh","de":"Knie & Oberschenkel"}'::jsonb,
   '{"fr":"Gonarthrose, rotule, LCA, ménisque, PTG, bandelette IT","en":"Knee OA, patella, ACL, meniscus, TKR, IT band","de":"Gonarthrose, Patella, Kreuzband, Meniskus, KTEP"}'::jsonb,
   6900, 'EUR', '12 sem.', 'Avancé', '🦵', 'M17 · M22 · M23 · M71 · M76', 'published'),

  (8, 'ankle-foot',
   '{"fr":"Cheville & pied","en":"Ankle & foot","de":"Sprunggelenk & Fuß"}'::jsonb,
   '{"fr":"Entorse, Achille, fasciite, hallux valgus, Morton","en":"Sprain, Achilles, fasciitis, hallux valgus, Morton","de":"Verstauchung, Achilles, Fasziitis, Hallux, Morton"}'::jsonb,
   4900, 'EUR', '6 sem.', 'Intermédiaire', '🦶', 'M72 · M76 · M77 · G57.6 · M20', 'published'),

  (9, 'spine-back',
   '{"fr":"Posture & ergonomie","en":"Posture & ergonomics","de":"Haltung & Ergonomie"}'::jsonb,
   '{"fr":"Hypercyphose, lordose, télétravail, conducteurs","en":"Hyperkyphosis, lordosis, remote work, drivers","de":"Hyperkyphose, Lordose, Homeoffice, Fahrer"}'::jsonb,
   3900, 'EUR', '4 sem.', 'Débutant', '🧘', 'M40 · M41 · Z57.5', 'published'),

  (10, 'mobility-flexibility',
   '{"fr":"Renforcement global","en":"Global strengthening","de":"Ganzkörperkräftigung"}'::jsonb,
   '{"fr":"Core, senior, reconditionnement, plancher pelvien","en":"Core, senior, reconditioning, pelvic floor","de":"Core, Senior, Rekonditionierung, Beckenboden"}'::jsonb,
   5400, 'EUR', '8 sem.', 'Intermédiaire', '🏋️', 'M62 · R26 · N39 · Z72 · Z73', 'published'),

  (11, 'mobility-flexibility',
   '{"fr":"Mobilité & souplesse","en":"Mobility & flexibility","de":"Mobilität & Beweglichkeit"}'::jsonb,
   '{"fr":"Stretching, yoga thérapeutique, foam roller, masters","en":"Stretching, therapeutic yoga, foam roller, masters","de":"Stretching, Yogatherapie, Faszienrolle, Masters"}'::jsonb,
   3900, 'EUR', '5 sem.', 'Débutant', '🧘', 'M62 · M79 · Z72', 'published'),

  (12, 'special-populations',
   '{"fr":"Populations spéciales","en":"Special populations","de":"Besondere Gruppen"}'::jsonb,
   '{"fr":"Grossesse, fibromyalgie, SEP, Parkinson, AVC, ado","en":"Pregnancy, fibromyalgia, MS, Parkinson, stroke, teens","de":"Schwangerschaft, Fibromyalgie, MS, Parkinson, Schlaganfall"}'::jsonb,
   6400, 'EUR', '10 sem.', 'Avancé', '👶', 'G20 · G35 · M79.70 · O26 · N99 · F45', 'published');

-- 3. Post-insert parity assertions ------------------------------------------
do $$
declare
  v_categories bigint;
  v_programmes bigint;
begin
  select count(*) into v_categories from public.programme_categories;
  select count(*) into v_programmes from public.programmes;

  if v_categories <> 10 then
    raise exception 'P06 aborted: expected 10 categories, found %.', v_categories;
  end if;

  if v_programmes <> 12 then
    raise exception 'P06 aborted: expected 12 programmes, found %.', v_programmes;
  end if;
end
$$;

commit;
