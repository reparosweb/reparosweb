// Edge Function: envia os e-mails pendentes da régua via Resend.
// Deploy:  supabase functions deploy send-emails --project-ref xygppudatdiliyikzcem
// Secrets: supabase secrets set RESEND_API_KEY=...  (SUPABASE_URL e SERVICE_ROLE já existem)
// Agende com pg_cron para rodar a cada 5 min (ver DEPLOY.md).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const RESEND = Deno.env.get("RESEND_API_KEY");
  if (!RESEND) return new Response("RESEND_API_KEY ausente", { status: 500 });

  const { data: pending } = await supabase
    .from("email_queue")
    .select("*")
    .is("sent_at", null)
    .lte("send_after", new Date().toISOString())
    .limit(50);

  let sent = 0;
  for (const m of pending ?? []) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Marido de Aluguel <nao-responda@reparosweb.com.br>",
        to: m.to_email,
        subject: m.subject,
        html: m.html,
      }),
    });
    if (r.ok) {
      await supabase.from("email_queue").update({ sent_at: new Date().toISOString() }).eq("id", m.id);
      sent++;
    }
  }
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
