-- ============================================================
-- Migration 004: módulos do painel do profissional (seller)
-- Equipe, Depoimentos, Mídia & Eventos, Negócios
-- Rode no SQL Editor do projeto xygppudatdiliyikzcem.
-- ============================================================

-- coluna de profissão no tenant
alter table public.tenants add column if not exists profession text;

-- EQUIPE DE ACESSO
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text,
  role       text default 'tecnico',   -- tecnico | atendente | gestor
  active     boolean default true,
  created_at timestamptz default now()
);

-- DEPOIMENTOS (gerenciáveis; aparecem na página pública)
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  city       text,
  rating     integer default 5,
  text       text not null,
  published  boolean default true,
  created_at timestamptz default now()
);

-- MÍDIA & EVENTOS (galeria de fotos/vídeos e eventos)
create table if not exists public.media_items (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  type       text default 'photo',     -- photo | video
  url        text not null,
  title      text,
  created_at timestamptz default now()
);
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  title      text not null,
  description text,
  event_date timestamptz,
  location   text,
  created_at timestamptz default now()
);

-- MÓDULO DE NEGÓCIOS (oportunidades / pipeline de vendas)
create table if not exists public.deals (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  title      text not null,
  client_name text,
  value_cents integer default 0,
  stage      text default 'novo',      -- novo | proposta | ganho | perdido
  notes      text,
  created_at timestamptz default now()
);

-- RLS: cada tabela acessível por admin OU pelo dono do tenant
do $$
declare t text;
begin
  foreach t in array array['team_members','testimonials','media_items','events','deals'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I_rw on public.%I;', t, t);
    execute format('create policy %I_rw on public.%I for all using (public.is_admin() or tenant_id = public.my_tenant_id()) with check (public.is_admin() or tenant_id = public.my_tenant_id());', t, t);
  end loop;
end $$;

-- Leitura pública de depoimentos publicados e mídia (para a página do profissional)
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials for select to anon using (published = true);
drop policy if exists media_public_read on public.media_items;
create policy media_public_read on public.media_items for select to anon using (true);
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select to anon using (true);
