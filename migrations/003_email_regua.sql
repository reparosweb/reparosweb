-- ============================================================
-- Migration 003: Régua de e-mail (fila + enfileiramento automático)
-- Rode no SQL Editor do projeto xygppudatdiliyikzcem.
-- O ENVIO real é feito pela Edge Function `send-emails` (Resend) + cron.
-- ============================================================

create table if not exists public.email_queue (
  id         uuid primary key default gen_random_uuid(),
  to_email   text not null,
  subject    text not null,
  html       text not null,
  template   text,
  tenant_id  uuid references public.tenants(id) on delete cascade,
  send_after timestamptz not null default now(),
  sent_at    timestamptz,
  created_at timestamptz default now()
);

alter table public.email_queue enable row level security;
drop policy if exists email_admin_read on public.email_queue;
create policy email_admin_read on public.email_queue for select using (public.is_admin());

-- Enfileira a régua quando um tenant é criado (welcome + dia 3 + fim do trial)
create or replace function public.enqueue_welcome_sequence()
returns trigger language plpgsql security definer set search_path = public as $$
declare nm text := coalesce(new.owner_name, 'profissional');
        base text := 'https://reparosweb.vercel.app';
begin
  if new.email is null then return new; end if;
  insert into public.email_queue (to_email, subject, html, send_after, tenant_id, template) values
  (new.email, 'Bem-vindo ao Marido de Aluguel! 🎉',
   '<h2>Olá, '||nm||'!</h2><p>Seu site já está no ar:</p><p><a href="'||base||'/?empresa='||new.slug||'">'||base||'/?empresa='||new.slug||'</a></p><p>Edite seus serviços, adicione fotos e comece a receber clientes hoje.</p>',
   now(), new.id, 'welcome'),
  (new.email, 'Capriche na sua página e receba 3x mais orçamentos 💡',
   '<p>Olá '||nm||'! Já adicionou preços e caprichou nos seus serviços? Páginas completas convertem muito mais. Acesse seu painel e dê uma revisada.</p>',
   now() + interval '3 days', new.id, 'tip_day3'),
  (new.email, 'Seu teste grátis termina em breve ⏰',
   '<p>Olá '||nm||'! Seu período de teste está acabando. Para continuar recebendo clientes com seu site, agenda e CRM, ative seu plano no painel.</p>',
   now() + interval '12 days', new.id, 'trial_end');
  return new;
end; $$;

drop trigger if exists on_tenant_welcome on public.tenants;
create trigger on_tenant_welcome
  after insert on public.tenants
  for each row execute function public.enqueue_welcome_sequence();
