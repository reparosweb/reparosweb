import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 300; // ISR 5 min

const FALLBACK_IMG = "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=70";

async function getTenant(slug) {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase.from("public_tenants").select("*").eq("slug", slug).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const t = await getTenant(params.slug);
  if (!t) return { title: "Página não encontrada" };
  const title = `${t.company_name} — ${t.landing?.hero_title || "Reparos e Manutenção"} em ${t.city || ""}`.trim();
  const desc = t.landing?.hero_subtitle || t.about || `${t.company_name}: reparos e manutenção com qualidade e garantia.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/${t.slug}` },
    openGraph: { title, description: desc, url: `/${t.slug}`, images: [{ url: t.landing?.hero_image || FALLBACK_IMG }], type: "website", locale: "pt_BR" },
    robots: { index: true, follow: true },
  };
}

export default async function VitrinePage({ params }) {
  const t = await getTenant(params.slug);
  if (!t) notFound();
  const brand = t.brand_color || "#FF7A00";
  const services = t.landing?.services || [];
  const wa = t.landing?.whatsapp || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: t.company_name,
    description: t.about || t.landing?.hero_subtitle,
    image: t.landing?.hero_image || FALLBACK_IMG,
    areaServed: (t.service_areas || []).join(", "),
    address: { "@type": "PostalAddress", addressLocality: t.city, addressRegion: t.state, addressCountry: "BR" },
    url: `https://reparosweb.vercel.app/${t.slug}`,
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: brand }}>{t.company_name.charAt(0)}</div>
            <div><div className="font-black leading-tight">{t.company_name}</div><div className="text-[11px] text-slate-400 leading-tight">{t.city} • ★ {t.metrics?.rating ?? "novo"}</div></div>
          </div>
          {wa && <a href={`https://wa.me/${wa}`} className="text-sm px-4 py-2 rounded-xl text-white font-semibold" style={{ background: brand }}>Pedir orçamento</a>}
        </div>
      </header>

      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6">
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(1000px 500px at 15% -10%, ${brand}30, transparent)` }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-slate-200 mb-5">Atendendo em {t.city}</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">{t.landing?.hero_title || t.company_name}</h1>
            <p className="mt-5 text-lg text-slate-300 max-w-xl">{t.landing?.hero_subtitle}</p>
            {wa && <a href={`https://wa.me/${wa}`} className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-xl text-white font-bold" style={{ background: brand }}>{t.landing?.cta_text || "Pedir orçamento"} →</a>}
          </div>
          <img src={t.landing?.hero_image || FALLBACK_IMG} alt={t.company_name} className="w-full h-[380px] object-cover rounded-3xl border border-white/10 shadow-2xl" />
        </div>
      </section>

      {services.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Nossos serviços</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <div className="text-2xl font-black mt-3" style={{ color: brand }}>R$ {Number(s.price || 0).toLocaleString("pt-BR")}</div>
                  {wa && <a href={`https://wa.me/${wa}`} className="inline-block mt-3 text-sm font-bold" style={{ color: brand }}>Orçar →</a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {t.about && (
        <section className="py-16 px-4 sm:px-6 bg-slate-900/40">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4">Sobre</h2>
            <p className="text-slate-300 text-lg leading-relaxed">{t.about}</p>
          </div>
        </section>
      )}

      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl text-2xl">💬</a>
      )}

      <footer className="border-t border-white/10 text-slate-400 py-10 px-4 text-center text-xs">
        <div className="font-bold text-white mb-1">{t.company_name}</div>
        {t.city}/{t.state} • Powered by Marido de Aluguel
      </footer>
    </div>
  );
}
