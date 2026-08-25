create or replace view public.programme_discovery
with (security_invoker = true)
as
select
  p.id,
  p.category_key,
  p.region,
  p.title,
  p.price_amount,
  p.currency,
  p.duration,
  p.level,
  p.image,
  p.icd10,
  coalesce((
    select jsonb_agg(jsonb_build_object('key',br.key,'label',br.label,'is_primary',pbr.is_primary) order by pbr.is_primary desc,br.sort_order,br.key)
    from public.programme_body_regions pbr
    join public.body_regions br on br.key=pbr.body_region_key
    where pbr.programme_id=p.id and br.is_active=true
  ),'[]'::jsonb) as body_regions,
  coalesce((
    select jsonb_agg(jsonb_build_object('key',c.key,'label',c.label) order by c.sort_order,c.key)
    from public.programme_conditions pc
    join public.conditions c on c.key=pc.condition_key
    where pc.programme_id=p.id and c.is_active=true
  ),'[]'::jsonb) as conditions,
  coalesce((
    select jsonb_agg(jsonb_build_object('key',c.key,'label',c.label) order by c.sort_order,c.key)
    from public.programme_contexts pct
    join public.contexts c on c.key=pct.context_key
    where pct.programme_id=p.id and c.is_active=true
  ),'[]'::jsonb) as contexts,
  coalesce((
    select jsonb_agg(jsonb_build_object('key',g.key,'label',g.label) order by g.sort_order,g.key)
    from public.programme_goals pg
    join public.goals g on g.key=pg.goal_key
    where pg.programme_id=p.id and g.is_active=true
  ),'[]'::jsonb) as goals
from public.programmes p
where p.status='published';

revoke all on public.programme_discovery from public,anon,authenticated;
grant select on public.programme_discovery to anon,authenticated;

comment on view public.programme_discovery is 'M04 public discovery read model for published programmes. Aggregates active body regions, conditions, contexts and goals while respecting underlying RLS via security_invoker.';
