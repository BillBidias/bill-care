create table public.body_regions (
  key text primary key,
  label jsonb not null,
  sort_order integer not null unique check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_regions_key_slug check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint body_regions_label_i18n check (
    jsonb_typeof(label) = 'object'
    and jsonb_typeof(label -> 'fr') = 'string'
    and jsonb_typeof(label -> 'en') = 'string'
    and jsonb_typeof(label -> 'de') = 'string'
  )
);

create table public.conditions (
  key text primary key,
  label jsonb not null,
  sort_order integer not null unique check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conditions_key_slug check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint conditions_label_i18n check (
    jsonb_typeof(label) = 'object'
    and jsonb_typeof(label -> 'fr') = 'string'
    and jsonb_typeof(label -> 'en') = 'string'
    and jsonb_typeof(label -> 'de') = 'string'
  )
);

create table public.contexts (
  key text primary key,
  label jsonb not null,
  sort_order integer not null unique check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contexts_key_slug check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint contexts_label_i18n check (
    jsonb_typeof(label) = 'object'
    and jsonb_typeof(label -> 'fr') = 'string'
    and jsonb_typeof(label -> 'en') = 'string'
    and jsonb_typeof(label -> 'de') = 'string'
  )
);

create table public.goals (
  key text primary key,
  label jsonb not null,
  sort_order integer not null unique check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_key_slug check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint goals_label_i18n check (
    jsonb_typeof(label) = 'object'
    and jsonb_typeof(label -> 'fr') = 'string'
    and jsonb_typeof(label -> 'en') = 'string'
    and jsonb_typeof(label -> 'de') = 'string'
  )
);

create table public.programme_body_regions (
  programme_id integer not null references public.programmes(id) on update cascade on delete cascade,
  body_region_key text not null references public.body_regions(key) on update cascade on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (programme_id, body_region_key)
);

create table public.programme_conditions (
  programme_id integer not null references public.programmes(id) on update cascade on delete cascade,
  condition_key text not null references public.conditions(key) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  primary key (programme_id, condition_key)
);

create table public.programme_contexts (
  programme_id integer not null references public.programmes(id) on update cascade on delete cascade,
  context_key text not null references public.contexts(key) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  primary key (programme_id, context_key)
);

create table public.programme_goals (
  programme_id integer not null references public.programmes(id) on update cascade on delete cascade,
  goal_key text not null references public.goals(key) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  primary key (programme_id, goal_key)
);

create index programme_body_regions_body_region_key_idx on public.programme_body_regions(body_region_key);
create index programme_conditions_condition_key_idx on public.programme_conditions(condition_key);
create index programme_contexts_context_key_idx on public.programme_contexts(context_key);
create index programme_goals_goal_key_idx on public.programme_goals(goal_key);

alter table public.body_regions enable row level security;
alter table public.conditions enable row level security;
alter table public.contexts enable row level security;
alter table public.goals enable row level security;
alter table public.programme_body_regions enable row level security;
alter table public.programme_conditions enable row level security;
alter table public.programme_contexts enable row level security;
alter table public.programme_goals enable row level security;

revoke all on table public.body_regions from public, anon, authenticated;
revoke all on table public.conditions from public, anon, authenticated;
revoke all on table public.contexts from public, anon, authenticated;
revoke all on table public.goals from public, anon, authenticated;
revoke all on table public.programme_body_regions from public, anon, authenticated;
revoke all on table public.programme_conditions from public, anon, authenticated;
revoke all on table public.programme_contexts from public, anon, authenticated;
revoke all on table public.programme_goals from public, anon, authenticated;

grant select on table public.body_regions to anon, authenticated;
grant select on table public.conditions to anon, authenticated;
grant select on table public.contexts to anon, authenticated;
grant select on table public.goals to anon, authenticated;
grant select on table public.programme_body_regions to anon, authenticated;
grant select on table public.programme_conditions to anon, authenticated;
grant select on table public.programme_contexts to anon, authenticated;
grant select on table public.programme_goals to anon, authenticated;

create policy body_regions_public_read_active on public.body_regions for select to anon, authenticated using (is_active = true);
create policy conditions_public_read_active on public.conditions for select to anon, authenticated using (is_active = true);
create policy contexts_public_read_active on public.contexts for select to anon, authenticated using (is_active = true);
create policy goals_public_read_active on public.goals for select to anon, authenticated using (is_active = true);

create policy programme_body_regions_public_read_published
on public.programme_body_regions for select to anon, authenticated
using (exists (
  select 1 from public.programmes p
  join public.body_regions br on br.key = programme_body_regions.body_region_key
  where p.id = programme_body_regions.programme_id and p.status = 'published' and br.is_active = true
));

create policy programme_conditions_public_read_published
on public.programme_conditions for select to anon, authenticated
using (exists (
  select 1 from public.programmes p
  join public.conditions c on c.key = programme_conditions.condition_key
  where p.id = programme_conditions.programme_id and p.status = 'published' and c.is_active = true
));

create policy programme_contexts_public_read_published
on public.programme_contexts for select to anon, authenticated
using (exists (
  select 1 from public.programmes p
  join public.contexts c on c.key = programme_contexts.context_key
  where p.id = programme_contexts.programme_id and p.status = 'published' and c.is_active = true
));

create policy programme_goals_public_read_published
on public.programme_goals for select to anon, authenticated
using (exists (
  select 1 from public.programmes p
  join public.goals g on g.key = programme_goals.goal_key
  where p.id = programme_goals.programme_id and p.status = 'published' and g.is_active = true
));

comment on table public.body_regions is 'M01 clinical taxonomy: stable body-region discovery dimension.';
comment on table public.conditions is 'M01 clinical taxonomy: stable condition discovery dimension; not a diagnostic engine.';
comment on table public.contexts is 'M01 clinical taxonomy: stable life/context discovery dimension.';
comment on table public.goals is 'M01 clinical taxonomy: stable user-goal discovery dimension.';
comment on table public.programme_body_regions is 'M01 many-to-many programme/body-region relationships.';
comment on table public.programme_conditions is 'M01 many-to-many programme/condition relationships.';
comment on table public.programme_contexts is 'M01 many-to-many programme/context relationships.';
comment on table public.programme_goals is 'M01 many-to-many programme/goal relationships.';
