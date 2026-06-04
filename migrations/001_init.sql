-- ============================================================
-- Marido de Aluguel — Migration 001: Fundação (schema + RLS)
-- Projeto Supabase: xygppudatdiliyikzcem
-- Cole TUDO no SQL Editor do Supabase e clique RUN.
-- ============================================================

-- ---------- 1. PLANS ----------
create table if not exists public.plans (
  id          text primary key,              -- 'starter' | 'pro' | 'business'
  name        text not null,
  price_cents integer not null,
  features    jsonb not null default '[]'::jsonb,
  highlight   boolean default false,
  badge       text,
  sort_order  integer default 0
);

-- ---------- 2. TENANTS ----------
create table if not exists public.tenants (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  company_name         text not null,
  owner_name           text,
  email                text,
  phone                text,
  cpf                  text,
  cep                  text,
  address              text,
  number               text,
  complement           text,
  city                 text,
  state                text,
  plan_id              text references public.plans(id),
  status               text not null default 'trial',   -- trial|active|suspended|blocked
  brand_color          text default '#FF7A00',
  asaas_customer_id    text,
  asaas_subscription_id text,
  trial_ends           timestamptz,
  about                text,
  service_areas        jsonb default '[]'::jsonb,
  landing              jsonb default '{}'::jsonb,
  metrics              jsonb default '{}'::jsonb,
  created_at           timestamptz default now()
);

-- ---------- 3. PROFILES (1:1 com auth.users) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'seller',   -- super_admin | seller
  tenant_id  uuid references public.tenants(id) on delete set null,
  name       text,
  email      text,
  created_at timestamptz default now()
);

-- ---------- 4. SERVICES ----------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  category    text,
  price_cents integer default 0,
  icon        text,
  created_at  timestamptz default now()
);

-- ---------- 5. APPOINTMENTS ----------
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  client_name  text,
  client_phone text,
  scheduled_at timestamptz,
  value_cents  integer default 0,
  status       text default 'pending',
  created_at   timestamptz default now()
);

-- ---------- 6. CLIENTS ----------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text,
  phone      text,
  email      text,
  tag        text default 'client',
  created_at timestamptz default now()
);

-- ---------- 7. LEADS ----------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid references public.tenants(id) on delete cascade,  -- null = lead global (admin)
  name       text,
  company    text,
  phone      text,
  email      text,
  source     text,
  status     text default 'new',
  score      integer default 50,
  message    text,
  created_at timestamptz default now()
);

-- ---------- 8. SUBSCRIPTIONS (histórico de pagamento) ----------
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  asaas_payment_id text,
  amount_cents    integer,
  status          text,
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- ---------- 9. BLOG_POSTS (Fase 4) ----------
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references public.tenants(id) on delete cascade,
  title        text,
  slug         text,
  content      text,
  image_url    text,
  status       text default 'draft',
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- ============================================================
-- FUNÇÕES AUXILIARES (evitam recursão de RLS)
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.my_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- HABILITAR RLS
-- ============================================================
alter table public.plans         enable row level security;
alter table public.tenants       enable row level security;
alter table public.profiles      enable row level security;
alter table public.services      enable row level security;
alter table public.appointments  enable row level security;
alter table public.clients       enable row level security;
alter table public.leads         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.blog_posts    enable row level security;

-- ---------- PLANS: leitura pública ----------
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans for select using (true);

-- ---------- PROFILES ----------
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------- TENANTS (acesso autenticado) ----------
drop policy if exists tenants_admin_all on public.tenants;
create policy tenants_admin_all on public.tenants for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists tenants_seller_read on public.tenants;
create policy tenants_seller_read on public.tenants for select
  using (id = public.my_tenant_id());
drop policy if exists tenants_seller_update on public.tenants;
create policy tenants_seller_update on public.tenants for update
  using (id = public.my_tenant_id()) with check (id = public.my_tenant_id());

-- ---------- SERVICES ----------
drop policy if exists services_rw on public.services;
create policy services_rw on public.services for all
  using (public.is_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_admin() or tenant_id = public.my_tenant_id());

-- ---------- APPOINTMENTS ----------
drop policy if exists appts_rw on public.appointments;
create policy appts_rw on public.appointments for all
  using (public.is_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_admin() or tenant_id = public.my_tenant_id());

-- ---------- CLIENTS (inclui INSERT anônimo do formulário público) ----------
drop policy if exists clients_rw on public.clients;
create policy clients_rw on public.clients for all
  using (public.is_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_admin() or tenant_id = public.my_tenant_id());
drop policy if exists clients_public_insert on public.clients;
create policy clients_public_insert on public.clients for insert
  to anon with check (tenant_id is not null);

-- ---------- LEADS (inclui INSERT anônimo do formulário/chatbot) ----------
drop policy if exists leads_read on public.leads;
create policy leads_read on public.leads for select
  using (public.is_admin() or tenant_id = public.my_tenant_id());
drop policy if exists leads_seller_write on public.leads;
create policy leads_seller_write on public.leads for all
  using (public.is_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_admin() or tenant_id = public.my_tenant_id());
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads for insert
  to anon with check (tenant_id is not null);

-- ---------- SUBSCRIPTIONS ----------
drop policy if exists subs_read on public.subscriptions;
create policy subs_read on public.subscriptions for select
  using (public.is_admin() or tenant_id = public.my_tenant_id());

-- ---------- BLOG_POSTS ----------
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts for select using (status = 'published');
drop policy if exists blog_rw on public.blog_posts;
create policy blog_rw on public.blog_posts for all
  using (public.is_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_admin() or tenant_id = public.my_tenant_id());

-- ============================================================
-- VIEW PÚBLICA (landing) — expõe SÓ colunas seguras do tenant
-- (sem cpf, email, telefone, ids do Asaas)
-- ============================================================
create or replace view public.public_tenants as
  select id, slug, company_name, owner_name, city, state, brand_color,
         about, service_areas, landing, metrics, status
  from public.tenants
  where status <> 'blocked';

grant select on public.public_tenants to anon, authenticated;

-- ============================================================
-- SEED — PLANOS
-- ============================================================
insert into public.plans (id, name, price_cents, features, highlight, badge, sort_order) values
  ('starter','Starter', 9700,  '["1 usuário","Site básico","30 agendamentos","WhatsApp","CRM básico","Suporte email"]'::jsonb, false, null, 1),
  ('pro','Profissional', 19700, '["3 usuários","Site premium","Ilimitado","Chatbot IA","CRM completo","Automações","Relatórios"]'::jsonb, true, 'MAIS POPULAR', 2),
  ('business','Business', 29700,'["10 usuários","Multi-filiais","Domínio próprio","API","White-label","Gerente sucesso","SLA 99.9%","BI"]'::jsonb, false, 'ENTERPRISE', 3)
on conflict (id) do nothing;

-- ============================================================
-- DEPOIS que o admin (adrianrosa1@hotmail.com) fizer signup no app,
-- rode ISTO uma vez para promovê-lo a super_admin:
--
--   update public.profiles set role='super_admin', tenant_id=null
--   where email = 'adrianrosa1@hotmail.com';
-- ============================================================
