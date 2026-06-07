# Marido de Aluguel — Status e ativações pendentes

**LIVE:** https://reparosweb.vercel.app · Repo: reparosweb/reparosweb · Supabase: xygppudatdiliyikzcem

## ✅ Pronto e no ar (feito por mim)
- App Vite+React+Tailwind, design **Premium Escuro** (home, página da empresa, painel) — responsivo + **PWA instalável** (app no celular).
- Multi-tenant **real** no Supabase (schema + RLS, migrations 001/002), banco nunca apagado.
- Auth e-mail/senha real; cadastro cria empresa via RPC seguro; dashboards com dados reais; landing pública `?empresa=slug`; formulário grava lead real.
- Login com Google **no código** (botão pronto).
- Régua de e-mail: **código pronto** (migration 003 + Edge Function `send-emails`).

## ⚠️ Precisa das SUAS mãos/chaves (não consigo fazer por você)

### 1. Supabase — Auth (pra cadastro/login funcionar no ar)
- Authentication → Providers → **Email** → desmarcar **"Confirm email"** → Save.
- Authentication → URL Configuration → **Site URL** = `https://reparosweb.vercel.app` · **Redirect URLs** = `https://reparosweb.vercel.app/**` → Save.

### 2. Login Google (opcional, já tem botão)
- Google Cloud Console → criar credencial OAuth → redirect `https://xygppudatdiliyikzcem.supabase.co/auth/v1/callback`.
- Supabase → Authentication → Providers → **Google** → colar Client ID/Secret → Enable.

### 3. Régua de e-mail (ativar)
- Rodar `migrations/003_email_regua.sql` no SQL Editor.
- Criar conta **Resend** + verificar domínio remetente.
- `supabase functions deploy send-emails` + `supabase secrets set RESEND_API_KEY=...`
- Agendar com pg_cron (a cada 5 min):
  ```sql
  select cron.schedule('send-emails','*/5 * * * *',
    $$ select net.http_post(
      url:='https://xygppudatdiliyikzcem.supabase.co/functions/v1/send-emails',
      headers:='{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb) $$);
  ```

### 4. Fase 2 — Pagamento real (Asaas)
- Próxima fase: Edge Functions create-subscription + webhook; precisa de `ASAAS_API_KEY`.
