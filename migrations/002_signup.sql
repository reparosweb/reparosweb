-- ============================================================
-- Migration 002: cadastro seguro (profile automático + RPC create_my_tenant)
-- Rode no SQL Editor do projeto xygppudatdiliyikzcem APÓS o 001.
-- ============================================================

-- Cria um profile automaticamente quando um usuário se registra (auth.users)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, email, name)
  values (new.id, 'seller', new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC: o usuário logado cria o próprio tenant (atômico, sem furar RLS)
create or replace function public.create_my_tenant(p jsonb)
returns public.tenants language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  t public.tenants;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.profiles where id = uid and tenant_id is not null) then
    raise exception 'usuario ja possui empresa';
  end if;

  insert into public.tenants (
    slug, company_name, owner_name, email, phone, cpf, cep, address, number, complement,
    city, state, plan_id, status, brand_color, trial_ends, about, service_areas, landing, metrics
  ) values (
    lower(trim(p->>'slug')), p->>'company_name', p->>'owner_name', p->>'email', p->>'phone',
    p->>'cpf', p->>'cep', p->>'address', p->>'number', p->>'complement', p->>'city', p->>'state',
    coalesce(p->>'plan_id','pro'), 'trial', coalesce(p->>'brand_color','#FF7A00'),
    now() + interval '15 days',
    coalesce(p->>'about','Empresa especializada em serviços de qualidade.'),
    coalesce(p->'service_areas', '[]'::jsonb),
    coalesce(p->'landing', '{}'::jsonb),
    '{"jobs":0,"clients":0,"revenue":0,"rating":0,"responseTime":"—"}'::jsonb
  ) returning * into t;

  update public.profiles
     set tenant_id = t.id, role = 'seller',
         name = coalesce(p->>'owner_name', name),
         email = coalesce(p->>'email', email)
   where id = uid;

  return t;
end; $$;

grant execute on function public.create_my_tenant(jsonb) to authenticated;
