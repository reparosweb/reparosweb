import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import HomeNav from "@/components/HomeNav";

export const revalidate = 3600; // ISR: regenera de hora em hora

const FALLBACK_PLANS = [
  { id: "essencial", name: "Essencial", price: 19.9, features: ["Site profissional", "Agenda online", "CRM básico", "WhatsApp"] },
  { id: "profissional", name: "Profissional", price: 29.9, features: ["Tudo do Essencial", "Kanban de atendimento", "Mini-loja", "E-mails automáticos", "Blog"], highlight: true, badge: "MAIS POPULAR" },
  { id: "completo", name: "Completo", price: 49.9, features: ["Tudo do Profissional", "WhatsApp automático (IA)", "Conteúdo com IA", "Domínio próprio", "Relatórios"], badge: "TOP" },
];

async function getPlans() {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase.from("plans").select("*").order("sort_order");
    if (data?.length) return data.map((d) => ({ ...d, price: d.price_cents / 100 }));
  } catch {}
  return FALLBACK_PLANS;
}

export default async function Home() {
  const plans = await getPlans();
  const Eyebrow = ({ children }) => <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F5B301]">{children}</span>;
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <HomeNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1600&q=70" alt="Profissional de reparos" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur border border-[#F5B301]/30 text-xs font-bold text-[#F5B301]">★ A plataforma premium para profissionais de reparos</div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.03] mt-6">Tenha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B301] to-orange-500">próprio site</span> e deixe ele vender por você.</h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">Enquanto você trabalha, seu site capta clientes, agenda serviços, responde no WhatsApp e organiza seu financeiro — 24 horas por dia.</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/app" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#F5B301] to-orange-500 text-slate-900 font-bold text-lg shadow-2xl">Criar meu site grátis</Link>
            <a href="#recursos" className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur border border-white/20 text-white font-bold">Ver recursos</a>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12"><Eyebrow>Tudo em uma plataforma</Eyebrow><h2 className="text-3xl md:text-5xl font-black mt-3">Recursos que <span className="text-[#F5B301]">vendem por você</span></h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["Site profissional", "Página premium com seu link, indexada no Google."],
              ["Agenda online 24h", "Clientes agendam sozinhos por horário."],
              ["CRM em Kanban", "Acompanhe do lead à finalização do serviço."],
              ["Gestão financeira", "Faturamento e relatórios em um lugar."],
              ["WhatsApp & e-mail", "Mensagens automáticas de status e avaliação."],
              ["Blog com IA", "Conteúdo que coloca você no topo das buscas."],
            ].map(([t, d], i) => (
              <div key={i} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold text-lg text-white">{t}</h3>
                <p className="text-sm text-slate-400 mt-1.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12"><Eyebrow>Preços transparentes</Eyebrow><h2 className="text-3xl md:text-5xl font-black mt-3">Um plano que <span className="text-[#F5B301]">se paga no 1º serviço</span></h2></div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p) => (
              <div key={p.id} className={`relative rounded-3xl p-7 border backdrop-blur ${p.highlight ? "border-[#F5B301]/50 bg-gradient-to-b from-[#F5B301]/10 to-white/[0.03] md:scale-105" : "border-white/10 bg-white/5"}`}>
                {p.badge && <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black ${p.highlight ? "bg-gradient-to-r from-[#F5B301] to-orange-500 text-slate-900" : "bg-white/10 text-white"}`}>{p.badge}</div>}
                <div className="font-bold text-xl">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1"><span className="text-5xl font-black">R${String(p.price).replace(".", ",")}</span><span className="text-slate-400">/mês</span></div>
                <ul className="mt-6 space-y-2.5">{(p.features || []).map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300">✓ {f}</li>)}</ul>
                <Link href="/app" className={`mt-7 block text-center w-full py-3 rounded-xl font-bold ${p.highlight ? "bg-gradient-to-r from-[#F5B301] to-orange-500 text-slate-900" : "bg-white/10 text-white"}`}>Começar grátis</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10"><Eyebrow>FAQ</Eyebrow><h2 className="text-3xl md:text-5xl font-black mt-3">Dúvidas frequentes</h2></div>
          <div className="space-y-3">
            {[
              ["Preciso saber de tecnologia?", "Não. Se usa WhatsApp, usa a plataforma."],
              ["Quanto tempo para meu site ficar pronto?", "Minutos. Cadastrou, está no ar com link próprio."],
              ["Funciona no celular?", "Sim — site e painel funcionam em qualquer aparelho."],
              ["Posso cancelar quando quiser?", "Sim, direto no painel, sem multa."],
            ].map(([q, a], i) => (
              <details key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
                <summary className="font-bold text-white cursor-pointer">{q}</summary>
                <p className="text-slate-400 text-sm mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 text-slate-400 py-10 px-4 text-center text-xs">
        <div className="font-black text-white mb-1">Marido de Aluguel</div>
        © 2026 Marido de Aluguel SaaS • reparosweb.vercel.app
      </footer>
    </div>
  );
}
