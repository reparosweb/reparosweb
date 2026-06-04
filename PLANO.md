# Plano de Produção — Marido de Aluguel (SaaS multi-tenant)

> Objetivo: transformar o protótipo front-end (100% fake) em produto **real em produção**,
> **sem simulações**. Repo: `reparosweb/reparosweb`. Supabase: `xygppudatdiliyikzcem`.
> Regra: cada fase só avança após testada em produção.

---

## 1. Arquitetura geral

```
[ Navegador ]
   │  React + Vite + Tailwind (front)
   │  @supabase/supabase-js (auth + dados, via anon key + RLS)
   ▼
[ Supabase xygppudatdiliyikzcem ]
   ├─ Auth (email/senha)            ← login real, sem senha hardcoded
   ├─ Postgres + RLS multi-tenant   ← isolamento por tenant
   └─ Edge Functions / RPC          ← criar tenant, webhooks
   ▲
   │  Vercel Serverless (/api/*)    ← integrações server-side (chaves secretas)
   ├─ /api/asaas/webhook            ← ativa tenant ao pagar
   ├─ /api/asaas/create-subscription
   ├─ /api/whatsapp (Evolution)
   └─ /api/content (IA real)
```

Decisões de identidade:
- **super_admin** = `adrianrosa1@hotmail.com` (marcado 1x no banco).
- **seller** = cada profissional que se cadastra (vira dono de 1 tenant).

---

## 2. Banco de dados (Supabase) — schema

**Tabelas:**

- `profiles` — 1:1 com `auth.users`
  `id (uuid, PK = auth.uid)`, `role ('super_admin'|'seller')`, `tenant_id (fk, null p/ admin)`, `name`, `email`, `created_at`
- `tenants`
  `id`, `slug (unique)`, `company_name`, `owner_name`, `email`, `phone`, `cpf`, `cep`, `address`, `number`, `complement`, `city`, `state`, `plan_id`, `status ('trial'|'active'|'suspended'|'blocked')`, `brand_color`, `asaas_customer_id`, `asaas_subscription_id`, `trial_ends`, `about`, `service_areas (jsonb)`, `landing (jsonb)`, `created_at`
- `plans` — `id ('starter'|'pro'|'business')`, `name`, `price_cents`, `features (jsonb)`, `highlight`, `badge`
- `services` — `id`, `tenant_id`, `name`, `category`, `price_cents`, `icon`, `created_at`
- `appointments` — `id`, `tenant_id`, `client_name`, `client_phone`, `scheduled_at`, `value_cents`, `status`, `created_at`
- `clients` — `id`, `tenant_id`, `name`, `phone`, `email`, `tag`, `created_at`
- `leads` — `id`, `tenant_id (null=lead global do admin)`, `name`, `company`, `phone`, `email`, `source`, `status`, `score`, `message`, `created_at`
- `subscriptions` (histórico de pagamento) — `id`, `tenant_id`, `asaas_payment_id`, `amount_cents`, `status`, `paid_at`, `created_at`
- `blog_posts` (Fase 4) — `id`, `tenant_id`, `title`, `slug`, `content`, `image_url`, `status`, `published_at`

**RLS (Row Level Security) — o coração do multi-tenant:**
- `profiles`: cada um lê/edita só o próprio; admin lê todos.
- `tenants/services/appointments/clients`: seller acessa só onde `tenant_id = profile.tenant_id`; admin acessa todos.
- **Landing pública**: leitura anônima de `tenants` (por `slug`) + `services` quando `status != 'blocked'`.
- **Formulário público**: `INSERT` anônimo em `leads`/`clients` apenas com `tenant_id` válido.

---

## 3. Fluxos críticos (reais)

**Cadastro (signup):** front chama Edge Function `create-tenant` (service role) que:
1. cria `auth.user` (ou usa o já logado), 2. cria `tenant` (status=trial, trial_ends=+15d),
3. cria `profile` (role=seller, tenant_id), 4. retorna o tenant. (Atômico, sem furar RLS.)

**Login:** Supabase Auth (email/senha). Sessão real e persistente.

**Pagamento (Asaas):** dashboard chama `/api/asaas/create-subscription` → cria cobrança;
Asaas dispara `/api/asaas/webhook` em `PAYMENT_CONFIRMED` → marca `tenant.status='active'`.

---

## 4. Telas (reaproveitando o componente atual, ligado ao real)
- **Home** (vitrine do SaaS) — estática, ok.
- **Signup / Login** — ligados ao Supabase Auth.
- **Seller Dashboard** — overview, PageBuilder, Serviços, Agenda, CRM, Config → tudo lendo/gravando no banco.
- **Admin Dashboard** — tenants, billing (status real Asaas), leads, (agentes na Fase 4).
- **Landing pública** `/{slug}` — lê tenant real; formulário grava lead real.

---

## 5. Variáveis de ambiente (Vercel + .env local)
**Cliente (público, prefixo VITE_):**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Servidor (secreto, só nas Functions):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `ASAAS_API_KEY` (Fase 2)
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` (Fase 3)
- `RESEND_API_KEY` (Fase 3)
- `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` (Fase 4)

> Chaves secretas **nunca** vão no código nem no Git — só nos secrets da Vercel/Supabase.

---

## 6. Roadmap por fases (cada uma testada em produção)

### Fase 1 — Fundação real ✅ (começamos aqui)
- [ ] Schema + RLS no Supabase `xygppudatdiliyikzcem` (migrations)
- [ ] `plans` populado (starter/pro/business)
- [ ] Edge Function `create-tenant`
- [ ] Front: adicionar `@supabase/supabase-js` + `recharts`; criar `src/lib/supabase.js`
- [ ] Trocar TODO `useState` fake por dados reais (auth, tenants, services, appointments, clients, leads)
- [ ] Marcar `adrianrosa1@hotmail.com` como super_admin
- [ ] Corrigir bugs do debug (BASE_URL, imports)
- [ ] Deploy Vercel + testar signup→login→dashboard real
- **Preciso de você:** anon key do Supabase (ou autenticar o MCP); conta Vercel para o deploy.

### Fase 2 — Pagamento real (Asaas)
- [ ] Functions create-subscription + webhook; ativar tenant ao pagar
- **Preciso de você:** `ASAAS_API_KEY` (sandbox p/ testar, depois produção)

### Fase 3 — Comunicação real
- [ ] WhatsApp via Evolution API; Email via Resend (domínio verificado)
- **Preciso de você:** instância Evolution + número; conta Resend + domínio

### Fase 4 — IA real + captação legal
- [ ] Agente Content real (OpenAI/Anthropic) gerando/publicando blog
- [ ] **Redesenhar captação de leads de forma LEGAL** (opt-in, formulários, anúncios) — sem scraping/spam
- **Preciso de você:** chave de IA; decisão sobre estratégia de captação

---

## 7. Pendências/decisões em aberto
- **Domínio:** `maridodealuguel.com.br` é seu? (hoje o `BASE_URL` está como placeholder quebrado)
- **Conta Vercel** para este projeto (não está no mapa do CLAUDE.md)
- **Agente Hunter:** a versão "varre internet e manda mensagem" é ilegal (ToS + LGPD) — será substituída por captação legítima.
