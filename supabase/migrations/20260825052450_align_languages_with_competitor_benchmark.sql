delete from public.supported_languages
where code in ('nl','sv','da','fi','pl','ar','ja','id','hi','tr');

update public.supported_languages
set benchmark_source = case
  when code in ('de','fr','en') then 'core-v1'
  when code in ('es','pt','it') then 'competitor-benchmark-priority'
  else benchmark_source
end;
