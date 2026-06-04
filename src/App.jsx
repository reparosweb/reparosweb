import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "./lib/supabase";
import {
  LayoutDashboard, Users, Search, Settings, Zap, Globe, CreditCard,
  MessageSquare, Plus, Trash2, CheckCircle, Bot, RefreshCw,
  Mail, DollarSign, Calendar, Briefcase, AlertCircle, Activity, LogOut,
  Star, Award, Clock, ArrowRight, Menu, X, Check, Play, ChevronRight,
  Sparkles, Target, Send, Eye, FileText, ThumbsUp, MapPin, Shield
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */
const ADMIN_EMAIL = "adrianrosa1@hotmail.com";
const BASE_URL = "www.maridodealuguel.com.br";
const BRAND_COLORS = { primary: "#FF7A00", secondary: "#FFB000", dark: "#2C2C2C" };

const PLANS_FALLBACK = [
  { id: "starter", name: "Starter", price: 97, features: ["1 usuário","Site básico","30 agendamentos","WhatsApp","CRM básico","Suporte email"] },
  { id: "pro", name: "Profissional", price: 197, features: ["3 usuários","Site premium","Ilimitado","Chatbot IA","CRM completo","Automações","Relatórios"], highlight: true, badge: "MAIS POPULAR" },
  { id: "business", name: "Business", price: 297, features: ["10 usuários","Multi-filiais","Domínio próprio","API","White-label","Gerente sucesso","SLA 99.9%","BI"], badge: "ENTERPRISE" },
];

const SELLER_DEFAULT_SERVICES = [
  { id: "s1", name: "Instalação elétrica", price: 180, icon: "⚡", cat: "Elétrica" },
  { id: "s2", name: "Encanamento", price: 150, icon: "🔧", cat: "Hidráulica" },
  { id: "s3", name: "Montagem de móveis", price: 120, icon: "🪑", cat: "Marcenaria" },
  { id: "s4", name: "Pintura residencial", price: 45, icon: "🎨", cat: "Pintura" },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const centsBrl = c => brl((Number(c) || 0) / 100);
const cls = (...a) => a.filter(Boolean).join(" ");
const maskCPF = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})/,"$1-$2");
const maskPhone = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
const maskCEP = v => v.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d)/,"$1-$2");

async function buscarCEP(cep) {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();
    if (d.erro) return null;
    return { logradouro: d.logradouro, bairro: d.bairro, cidade: d.localidade, estado: d.uf };
  } catch { return null; }
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g,"");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += +cpf[i] * (10-i);
  let d1 = 11 - (s % 11); if (d1 >= 10) d1 = 0;
  if (d1 !== +cpf[9]) return false;
  s = 0; for (let i = 0; i < 10; i++) s += +cpf[i] * (11-i);
  let d2 = 11 - (s % 11); if (d2 >= 10) d2 = 0;
  return d2 === +cpf[10];
}

function fireConfetti() {
  const colors = ["#FF7A00", "#FFB000", "#2C2C2C"];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(container);
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 1.5;
    p.style.cssText = `position:absolute;left:${left}%;top:-20px;width:8px;height:12px;background:${color};transform:rotate(${Math.random()*360}deg);animation:confettiFall ${duration}s ease-in ${delay}s forwards;border-radius:2px;`;
    container.appendChild(p);
  }
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `@keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
    document.head.appendChild(style);
  }
  setTimeout(() => container.remove(), 4000);
}

const publicUrl = slug => `${window.location.origin}/?empresa=${slug}`;

// Foto real e contextual por tipo de serviço (com fallback seguro)
const FALLBACK_IMG = "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80";
const SERVICE_IMG = [
  { kw: ["elétr","eletr","tomada","chuveiro","fiação","disjuntor"], img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80" },
  { kw: ["encan","hidrá","hidra","água","agua","vazamento","torneira","cano","pia"], img: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80" },
  { kw: ["móvei","movei","montag","marcen","prateleira","armário","armario"], img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80" },
  { kw: ["pintur","pintor","parede","tinta"], img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80" },
  { kw: ["limp","faxina"], img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" },
  { kw: ["jardim","jardin","poda","grama"], img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80" },
  { kw: ["ar-condicionado","ar condicionado","climatiz","refriger"], img: "https://images.unsplash.com/photo-1631545806609-c2b999c9f9f4?auto=format&fit=crop&w=600&q=80" },
];
function serviceImage(name = "") {
  const n = name.toLowerCase();
  const hit = SERVICE_IMG.find(s => s.kw.some(k => n.includes(k)));
  return hit ? hit.img : FALLBACK_IMG;
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT  (Auth + dados REAIS via Supabase)
   ═══════════════════════════════════════════════════════════════ */
const Ctx = createContext();
const useApp = () => useContext(Ctx);

function Provider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [route, setRoute] = useState("home");
  const [plans, setPlans] = useState(PLANS_FALLBACK);
  const [tenants, setTenants] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);

  const user = profile ? {
    id: profile.id, role: profile.role, tenant_id: profile.tenant_id,
    name: profile.name, email: profile.email,
  } : null;

  useEffect(() => {
    supabase.from("plans").select("*").order("sort_order").then(({ data }) => {
      if (data?.length) setPlans(data.map(d => ({ ...d, price: d.price_cents / 100 })));
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!session?.user) { setProfile(null); setAuthReady(true); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (!active) return;
      setProfile(data || { id: session.user.id, role: "seller", tenant_id: null, email: session.user.email });
      setAuthReady(true);
    })();
    return () => { active = false; };
  }, [session]);

  async function reloadData(p = profile) {
    if (!p) return;
    if (p.role === "super_admin") {
      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from("tenants").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
      ]);
      setTenants(t || []); setLeads(l || []);
    } else if (p.tenant_id) {
      const [{ data: t }, { data: s }, { data: a }, { data: c }, { data: l }] = await Promise.all([
        supabase.from("tenants").select("*").eq("id", p.tenant_id),
        supabase.from("services").select("*").eq("tenant_id", p.tenant_id).order("created_at"),
        supabase.from("appointments").select("*").eq("tenant_id", p.tenant_id).order("scheduled_at"),
        supabase.from("clients").select("*").eq("tenant_id", p.tenant_id).order("created_at", { ascending: false }),
        supabase.from("leads").select("*").eq("tenant_id", p.tenant_id).order("created_at", { ascending: false }),
      ]);
      setTenants(t || []); setServices(s || []); setAppointments(a || []); setClients(c || []); setLeads(l || []);
    }
  }
  useEffect(() => { if (profile) reloadData(profile); /* eslint-disable-next-line */ }, [profile?.id, profile?.role, profile?.tenant_id]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert("Não foi possível entrar: " + error.message); return false; }
    setRoute("app");
    return true;
  };

  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert("Não foi possível entrar com Google: " + error.message);
  };

  const logout = async () => { await supabase.auth.signOut(); setProfile(null); setSession(null); setRoute("home"); };

  const checkSlug = async (slug) => {
    const { data } = await supabase.from("public_tenants").select("id").eq("slug", slug.toLowerCase().trim()).maybeSingle();
    return !data;
  };

  const signup = async (form) => {
    let uid = session?.user?.id;
    if (!uid) {
      const { data: au, error: e1 } = await supabase.auth.signUp({
        email: form.email, password: form.password, options: { data: { name: form.owner_name } },
      });
      if (e1) return { success: false, error: e1.message };
      uid = au.user?.id;
      if (!au.session) {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (e2) return { success: false, error: "Confirme seu e-mail (verifique a caixa de entrada) e tente entrar." };
      }
    }
    const landing = {
      hero_title: `${form.company_name} - Serviços Profissionais`,
      hero_subtitle: "Qualidade, confiança e pontualidade em cada atendimento.",
      cta_text: "Quero um orçamento grátis",
      whatsapp: (form.phone || "").replace(/\D/g, ""),
      services: SELLER_DEFAULT_SERVICES,
      testimonials: [],
      hero_image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
      banner_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200",
    };
    const payload = {
      slug: form.slug, company_name: form.company_name, owner_name: form.owner_name,
      email: form.email, phone: form.phone, cpf: form.cpf, cep: form.cep, address: form.address,
      number: form.number, complement: form.complement, city: form.city, state: form.state,
      plan_id: form.plan_id, brand_color: "#FF7A00",
      service_areas: form.city ? [form.city] : [], landing,
    };
    const { data: t, error: e3 } = await supabase.rpc("create_my_tenant", { p: payload });
    if (e3) return { success: false, error: e3.message };
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (prof) setProfile(prof);
    return { success: true, tenant: t };
  };

  const updateTenant = async (id, patch) => { await supabase.from("tenants").update(patch).eq("id", id); reloadData(); };
  const updateLanding = async (id, patch) => {
    const t = tenants.find(x => x.id === id);
    await supabase.from("tenants").update({ landing: { ...(t?.landing || {}), ...patch } }).eq("id", id);
    reloadData();
  };
  const activateTenant = async (id) => { await updateTenant(id, { status: "active", trial_ends: null }); };
  const suspendTenant = async (id) => { await updateTenant(id, { status: "suspended" }); };

  const addService = async (s) => { await supabase.from("services").insert(s); reloadData(); };
  const removeService = async (id) => { await supabase.from("services").delete().eq("id", id); reloadData(); };
  const addClient = async (c) => { await supabase.from("clients").insert(c); reloadData(); };
  const addAppointment = async (a) => { await supabase.from("appointments").insert(a); reloadData(); };
  const addLead = async (l) => { await supabase.from("leads").insert(l); reloadData(); };

  return (
    <Ctx.Provider value={{
      user, authReady, route, setRoute, plans,
      tenants, services, appointments, clients, leads,
      login, loginGoogle, logout, signup, checkSlug,
      updateTenant, updateLanding, activateTenant, suspendTenant,
      addService, removeService, addClient, addAppointment, addLead,
      reloadData,
    }}>
      {children}
    </Ctx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
const Badge = ({ children, variant = "default" }) => {
  const s = { default:"bg-slate-100 text-slate-700", success:"bg-green-100 text-green-700", warning:"bg-amber-100 text-amber-700", danger:"bg-red-100 text-red-700", blue:"bg-blue-100 text-blue-700", purple:"bg-purple-100 text-purple-700", orange:"bg-orange-100 text-orange-700" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s[variant]}`}>{children}</span>;
};
const Btn = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled, type = "button" }) => {
  const v = { primary:"bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-900/10", secondary:"bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200", danger:"bg-red-50 text-red-600 hover:bg-red-100", success:"bg-green-600 text-white hover:bg-green-700", ghost:"text-slate-600 hover:bg-slate-100", outline:"border-2 border-orange-600 text-orange-600 hover:bg-orange-50", dark:"bg-slate-900 text-white hover:bg-slate-800" };
  return <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 justify-center text-sm disabled:opacity-50 ${v[variant]} ${className}`}>{Icon && <Icon size={16}/>} {children}</button>;
};
const Input = ({ label, error, ...p }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>}
    <input {...p} className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none ${error?"border-red-400":"border-slate-200"} ${p.className||""}`}/>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex items-center gap-3 text-slate-500"><RefreshCw className="animate-spin" size={20}/> Carregando...</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   LANDING PÚBLICA DO SELLER
   ═══════════════════════════════════════════════════════════════ */
function SellerHeader({ tenant }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{background: tenant.brand_color}}>{tenant.company_name.charAt(0)}</div>
          <div>
            <div className="font-black text-slate-900 leading-tight">{tenant.company_name}</div>
            <div className="text-[11px] text-slate-500 leading-tight">{tenant.city} • ★ {tenant.metrics?.rating ?? "novo"}</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          <a href="#servicos" className="hover:text-slate-950">Serviços</a>
          <a href="#como-funciona" className="hover:text-slate-950">Como funciona</a>
          <a href="#depoimentos" className="hover:text-slate-950">Depoimentos</a>
          <a href="#orcamento" className="hover:text-slate-950">Orçamento</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`https://wa.me/${tenant.landing.whatsapp}`} className="hidden sm:inline text-sm px-4 py-2 rounded-xl text-white font-semibold shadow-sm" style={{background: tenant.brand_color}}>Pedir orçamento</a>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm">
          <a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a>
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#depoimentos" onClick={() => setMenuOpen(false)}>Depoimentos</a>
          <a href="#orcamento" onClick={() => setMenuOpen(false)}>Orçamento</a>
        </div>
      )}
    </header>
  );
}

function SellerHero({ tenant }) {
  const words = (tenant.landing.hero_title || "").split(" ");
  return (
    <section className="pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{background:`radial-gradient(1200px 600px at 10% -10%, ${tenant.brand_color}22, transparent), radial-gradient(900px 500px at 100% 10%, #FFB00022, transparent)`}}/>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{background: tenant.brand_color}}/> Atendendo agora em {tenant.city}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900">
            {words.slice(0,-3).join(" ")} <span style={{color: tenant.brand_color}}>{words.slice(-3).join(" ")}</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl">{tenant.landing.hero_subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#orcamento" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition" style={{background: tenant.brand_color}}>{tenant.landing.cta_text} <ArrowRight size={16}/></a>
            <a href={`https://wa.me/${tenant.landing.whatsapp}`} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition"><MessageSquare size={16}/> WhatsApp</a>
          </div>
        </div>
        <div className="relative">
          <img src={tenant.landing.hero_image} alt="" className="w-full rounded-3xl shadow-2xl"/>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[260px]">
            <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle size={20}/></div>
            <div><div className="text-xs text-slate-500">Agendamento</div><div className="font-bold text-sm">Confirmado! 🎉</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SellerServices({ tenant }) {
  const services = tenant.landing.services || [];
  return (
    <section id="servicos" className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold tracking-widest uppercase" style={{color: tenant.brand_color}}>Nossos serviços</div>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900">Tudo o que sua casa precisa</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s,i) => (
            <div key={s.id || i} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={s.image || serviceImage(s.name)}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  alt={s.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                <div className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{background: tenant.brand_color}}>{s.icon}</div>
                <h3 className="absolute bottom-3 left-4 right-4 font-black text-lg text-white drop-shadow">{s.name}</h3>
              </div>
              <div className="p-5 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">A partir de</p>
                  <div className="text-2xl font-black" style={{color: tenant.brand_color}}>{brl(s.price)}</div>
                </div>
                <a href="#orcamento" className="text-sm font-bold px-3 py-2 rounded-lg text-white shadow" style={{background: tenant.brand_color}}>Orçar</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerHowItWorks({ tenant }) {
  const steps = [
    { n: "01", t: "Peça um orçamento", d: "Descreva o problema em 30 segundos." },
    { n: "02", t: "Receba o preço", d: "Orçamento fechado em minutos." },
    { n: "03", t: "Agende o dia", d: "Escolha o melhor horário." },
    { n: "04", t: "Problema resolvido", d: "Pagamento após o serviço." },
  ];
  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold tracking-widest uppercase" style={{color: tenant.brand_color}}>Como funciona</div>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900">Simples, rápido e sem dor de cabeça</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step,i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-black" style={{color:`${tenant.brand_color}20`}}>{step.n}</div>
              <div className="font-bold text-lg text-slate-900 mt-1">{step.t}</div>
              <div className="text-sm text-slate-600 mt-1">{step.d}</div>
              {i < 3 && <ChevronRight className="hidden md:block absolute top-8 -right-3 text-slate-300" size={24}/>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerTestimonials({ tenant }) {
  const items = tenant.landing.testimonials || [];
  if (items.length === 0) return null;
  return (
    <section id="depoimentos" className="py-20 px-4 sm:px-6 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mt-2">Quem contrata, recomenda</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t,i) => (
            <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex gap-0.5 text-amber-400 mb-3">{[...Array(t.rating || 5)].map((_,j) => <Star key={j} size={14} className="fill-current"/>)}</div>
              <p className="text-slate-200 leading-relaxed italic">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 pt-5 border-t border-slate-700">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{background: tenant.brand_color}}>{t.name.charAt(0)}</div>
                <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-slate-400">{t.city}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerQuoteForm({ tenant }) {
  const { addLead, addClient } = useApp();
  const [form, setForm] = useState({ name:"", phone:"", service:"", description:"" });
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    await addLead({ name: form.name, phone: form.phone, message: `${form.service}: ${form.description}`, tenant_id: tenant.id, source: "Landing page", status: "new", score: 85 });
    await addClient({ name: form.name, phone: form.phone, tenant_id: tenant.id, tag: "lead" });
    setSent(true);
    setTimeout(() => { setSent(false); setForm({name:"",phone:"",service:"",description:""}); }, 4500);
  };
  return (
    <section id="orcamento" className="py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-2">
          <div className="text-xs font-bold tracking-widest uppercase" style={{color: tenant.brand_color}}>Orçamento grátis</div>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900">Resposta rápida no WhatsApp</h2>
          <p className="text-slate-600 mt-3">Preencha e vamos te chamar com o preço fechado.</p>
        </div>
        <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nome completo *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">WhatsApp *</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: maskPhone(e.target.value)})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none" placeholder="(11) 99999-9999"/>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Tipo de serviço *</label>
              <select required value={form.service} onChange={e => setForm({...form, service: e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none bg-white">
                <option value="">Selecione...</option>
                {(tenant.landing.services || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                <option>Outro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Descreva o problema *</label>
              <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none" placeholder="Ex: torneira pingando..."/>
            </div>
          </div>
          <button type="submit" className="mt-5 w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2" style={{background: tenant.brand_color}}>
            {sent ? <><Check size={18}/> Enviado! Te chamamos em breve</> : <>Receber orçamento grátis <ArrowRight size={16}/></>}
          </button>
        </form>
      </div>
    </section>
  );
}

function SellerFooter({ tenant }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{background: tenant.brand_color}}>{tenant.company_name.charAt(0)}</div>
            <div className="font-bold text-white">{tenant.company_name}</div>
          </div>
          <p className="text-sm">Resolvemos qualquer reparo da sua casa com rapidez e garantia.</p>
        </div>
        <div>
          <div className="font-bold text-white mb-3 text-sm">Contato</div>
          <ul className="space-y-2 text-sm">
            <li>📱 {tenant.landing.whatsapp}</li>
            <li>📍 {tenant.city}/{tenant.state}</li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-white mb-3 text-sm">Atendimento</div>
          <ul className="space-y-2 text-sm"><li>Seg–Sáb, 8h–18h</li></ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-xs">© 2026 {tenant.company_name}</div>
    </footer>
  );
}

function SellerWhatsAppFloat({ tenant }) {
  return (
    <a href={`https://wa.me/${tenant.landing.whatsapp}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition">
      <MessageSquare size={26} className="fill-current"/>
    </a>
  );
}

function SellerPublicPage({ tenant }) {
  useEffect(() => { fireConfetti(); }, [tenant.id]);
  return (
    <div className="min-h-screen bg-white">
      <SellerHeader tenant={tenant}/>
      <SellerHero tenant={tenant}/>
      <SellerServices tenant={tenant}/>
      <SellerHowItWorks tenant={tenant}/>
      <SellerTestimonials tenant={tenant}/>
      <SellerQuoteForm tenant={tenant}/>
      <SellerFooter tenant={tenant}/>
      <SellerWhatsAppFloat tenant={tenant}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME (vitrine do SaaS)
   ═══════════════════════════════════════════════════════════════ */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 flex items-center justify-between text-left">
        <span className="font-bold text-slate-900">{q}</span>
        <ChevronRight className={cls("transition", open && "rotate-90")} size={20}/>
      </button>
      {open && <div className="px-5 pb-5 text-slate-600 text-sm border-t pt-4">{a}</div>}
    </div>
  );
}

function HomePage() {
  const { setRoute, plans } = useApp();
  const [menu, setMenu] = useState(false);
  const IMG = {
    hero: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1100&q=80",
    dash: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1100&q=80",
    site: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1100&q=80",
    money: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1100&q=80",
  };
  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black">M</div>
            <div><div className="font-black text-slate-900 leading-tight">Marido de Aluguel</div><div className="text-[10px] text-slate-500 leading-tight">Plataforma para profissionais</div></div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <a href="#como" className="hover:text-orange-600">Como funciona</a>
            <a href="#recursos" className="hover:text-orange-600">Recursos</a>
            <a href="#precos" className="hover:text-orange-600">Preços</a>
            <a href="#faq" className="hover:text-orange-600">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setRoute("login")} className="hidden sm:inline text-sm font-semibold text-slate-700 px-3 py-2">Entrar</button>
            <button onClick={() => setRoute("signup")} className="text-sm px-4 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg shadow-orange-600/20">Teste grátis</button>
            <button className="md:hidden p-2 text-slate-700" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
          </div>
        </div>
        {menu && (
          <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
            <a href="#como" onClick={() => setMenu(false)}>Como funciona</a>
            <a href="#recursos" onClick={() => setMenu(false)}>Recursos</a>
            <a href="#precos" onClick={() => setMenu(false)}>Preços</a>
            <a href="#faq" onClick={() => setMenu(false)}>FAQ</a>
            <button onClick={() => { setMenu(false); setRoute("login"); }} className="text-left text-orange-600 font-bold">Entrar</button>
          </div>
        )}
      </header>

      {/* HERO com vídeo de fundo */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <video
          autoPlay muted loop playsInline preload="auto"
          poster={IMG.hero}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* overlay para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/85"/>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-orange-300">
            🔥 +2.300 profissionais já lotam a agenda com a gente
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.03] mt-6">
            Tenha seu <span className="text-orange-500">próprio site</span><br className="hidden sm:block"/> e deixe ele <span className="text-orange-500">vender por você</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto">
            Enquanto você trabalha, seu site capta clientes, agenda serviços, responde no WhatsApp e organiza seu financeiro — <b className="text-white">24 horas por dia</b>.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setRoute("signup")} className="px-8 py-4 rounded-xl bg-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-600/40 hover:bg-orange-700 hover:-translate-y-0.5 transition flex items-center justify-center gap-2">Criar meu site grátis <ArrowRight size={20}/></button>
            <a href="#como" className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold hover:bg-white hover:text-slate-900 transition flex items-center justify-center gap-2"><Play size={18}/> Como funciona</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 justify-center text-sm text-slate-200">
            <div className="flex items-center gap-1.5"><Check size={16} className="text-green-400"/> 15 dias grátis</div>
            <div className="flex items-center gap-1.5"><Check size={16} className="text-green-400"/> Sem cartão</div>
            <div className="flex items-center gap-1.5"><Check size={16} className="text-green-400"/> Pronto em minutos</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{n:"2.347+",l:"Profissionais"},{n:"127 mil",l:"Serviços agendados"},{n:"98%",l:"Recomendam"},{n:"7 min",l:"Para montar"}].map((s,i) => (
            <div key={i}><div className="text-3xl sm:text-4xl font-black text-orange-500">{s.n}</div><div className="text-sm text-slate-400 mt-1">{s.l}</div></div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA / showcase site trabalhando */}
      <section id="como" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <img src={IMG.dash} alt="Painel de gestão" className="w-full h-[300px] sm:h-[400px] object-cover rounded-3xl shadow-2xl"/>
          </div>
          <div className="order-1 lg:order-2">
            <Badge variant="orange">⚙️ No automático</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 text-slate-900 leading-tight">Deixe o site trabalhar <span className="text-orange-600">enquanto você trabalha</span>.</h2>
            <p className="mt-5 text-lg text-slate-600">O cliente entra no seu site, vê seus serviços, pede orçamento e agenda — tudo sozinho. Você recebe o lead no celular e só confirma.</p>
            <div className="mt-7 space-y-4">
              {[
                {i:Globe, t:"Sua própria página profissional", d:"Com seu nome, seus serviços, seus preços e seu link para divulgar."},
                {i:Calendar, t:"Sua agenda online 24h", d:"Clientes marcam horário sozinhos, sem te ligar. Acabou a bagunça."},
                {i:MessageSquare, t:"Novos clientes caindo direto", d:"Formulário e WhatsApp captam e organizam cada novo cliente no seu CRM."},
                {i:DollarSign, t:"Gestão financeira na palma da mão", d:"Veja quanto entrou, o que está a receber e o faturamento do mês."},
              ].map((f,idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><f.i size={20}/></div>
                  <div><div className="font-bold text-slate-900">{f.t}</div><div className="text-sm text-slate-600 mt-0.5">{f.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOR -> SOLUÇÃO */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <Badge variant="orange">😮‍💨 Reconhece isso?</Badge>
          <h2 className="text-3xl sm:text-4xl font-black mt-4 text-slate-900">Perder cliente porque não respondeu a tempo dói no bolso.</h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-red-100">
            <div className="font-bold text-red-600 mb-3">❌ Sem a plataforma</div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>• Cliente manda mensagem e você só vê horas depois</li>
              <li>• Agenda anotada em papel, esquece horário</li>
              <li>• Sem site, parece amador e perde para o concorrente</li>
              <li>• Não sabe quanto faturou no mês</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-orange-300 shadow-lg">
            <div className="font-bold text-orange-600 mb-3">✅ Com o Marido de Aluguel</div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex gap-2"><Check size={16} className="text-green-600 shrink-0 mt-0.5"/> Lead chega organizado no seu CRM na hora</li>
              <li className="flex gap-2"><Check size={16} className="text-green-600 shrink-0 mt-0.5"/> Agenda online que o cliente preenche sozinho</li>
              <li className="flex gap-2"><Check size={16} className="text-green-600 shrink-0 mt-0.5"/> Site profissional que passa confiança</li>
              <li className="flex gap-2"><Check size={16} className="text-green-600 shrink-0 mt-0.5"/> Painel financeiro mostrando seus ganhos</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <Badge variant="orange">✨ Tudo em uma plataforma</Badge>
            <h2 className="text-3xl md:text-5xl font-black mt-4 text-slate-900">Recursos que <span className="text-orange-600">vendem por você</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {icon: Globe, t: "Site profissional", d: "Página linda com seu link, pronta para divulgar no WhatsApp e Instagram."},
              {icon: Calendar, t: "Agenda online 24h", d: "Clientes agendam sozinhos. Você só confirma e aparece para fazer."},
              {icon: MessageSquare, t: "WhatsApp integrado", d: "Botão direto e leads que caem organizados no seu painel."},
              {icon: Users, t: "CRM completo", d: "Cada cliente com histórico, telefone e tags. Nunca mais perca um contato."},
              {icon: DollarSign, t: "Gestão financeira", d: "Faturamento, valores a receber e relatórios — tudo em um lugar."},
              {icon: CreditCard, t: "Pagamento online", d: "PIX, boleto e cartão. Receba sem complicação."},
              {icon: Bot, t: "Atendimento automático", d: "Responde dúvidas comuns e capta o cliente mesmo de madrugada."},
              {icon: Mail, t: "Régua de e-mail", d: "Mensagens automáticas que reativam clientes e trazem mais serviços."},
              {icon: Shield, t: "Dados seguros", d: "Seu negócio na nuvem, com backup. Nunca perde nada."},
            ].map((f,i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center mb-4"><f.icon size={22}/></div>
                <h3 className="font-bold text-lg">{f.t}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCEIRO showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="orange">💰 Seu dinheiro organizado</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 leading-tight">Saiba exatamente <span className="text-orange-400">quanto você fatura</span>.</h2>
            <p className="mt-5 text-lg text-slate-300">Chega de não saber se o mês foi bom. Veja serviços fechados, valores a receber e a evolução do seu faturamento — direto no celular.</p>
            <button onClick={() => setRoute("signup")} className="mt-7 px-7 py-4 rounded-xl bg-orange-600 text-white font-bold shadow-xl hover:bg-orange-700 transition inline-flex items-center gap-2">Quero organizar meu negócio <ArrowRight size={18}/></button>
          </div>
          <img src={IMG.money} alt="Gestão financeira" className="w-full h-[300px] object-cover rounded-3xl shadow-2xl"/>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <Badge variant="orange">💸 Preços transparentes</Badge>
            <h2 className="text-3xl md:text-5xl font-black mt-4 text-slate-900">Investimento que <span className="text-orange-600">se paga no 1º serviço</span></h2>
            <p className="text-slate-600 mt-3">15 dias grátis. Sem cartão. Cancele quando quiser.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(p => (
              <div key={p.id} className={cls("relative bg-white rounded-3xl p-7 border-2 transition", p.highlight?"border-orange-500 shadow-2xl md:scale-105":"border-slate-200")}>
                {p.badge && <div className={cls("absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-black", p.highlight?"bg-orange-500":"bg-slate-900")}>{p.badge}</div>}
                <div className="font-bold text-xl">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1"><span className="text-5xl font-black">R${p.price}</span><span className="text-slate-500">/mês</span></div>
                <ul className="mt-6 space-y-2.5">{(p.features||[]).map((f,i) => <li key={i} className="flex items-start gap-2 text-sm"><Check size={16} className="text-green-600 shrink-0 mt-0.5"/>{f}</li>)}</ul>
                <button onClick={() => setRoute("signup")} className={cls("mt-7 w-full py-3 rounded-xl font-bold transition", p.highlight?"bg-orange-600 text-white shadow-lg":"bg-slate-900 text-white")}>Começar grátis</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12"><Badge variant="orange">⭐ Quem usa, recomenda</Badge><h2 className="text-3xl md:text-5xl font-black mt-4 text-slate-900">Profissionais que mudaram de patamar</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {n:"Carlos Silva", c:"Eletricista • SP", t:"Em 2 meses minha agenda lotou. O site trabalha sozinho captando cliente enquanto eu faço serviço."},
              {n:"Eduardo Alves", c:"Encanador • RJ", t:"Parei de perder cliente por demora. Agora chega tudo organizado e eu só confirmo o horário."},
              {n:"Patrícia Lima", c:"Pintora • MG", t:"Finalmente sei quanto faturo. E ter um site profissional me deu uma credibilidade que não tinha."},
            ].map((d,i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex gap-0.5 text-amber-400 mb-3">{[...Array(5)].map((_,j) => <Star key={j} size={14} className="fill-current"/>)}</div>
                <p className="text-slate-700 leading-relaxed italic">"{d.t}"</p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t"><div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">{d.n.charAt(0)}</div><div><div className="font-semibold text-sm">{d.n}</div><div className="text-xs text-slate-500">{d.c}</div></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><Badge variant="blue">❓ FAQ</Badge><h2 className="text-3xl md:text-5xl font-black mt-4 text-slate-900">Dúvidas frequentes</h2></div>
          <div className="space-y-3">
            {[
              {q:"Preciso saber mexer com tecnologia?", a:"Não! Se você usa WhatsApp, consegue usar a plataforma. É tudo simples e em português."},
              {q:"Quanto tempo leva para ter meu site no ar?", a:"Minutos. Você se cadastra, preenche seus dados e seu site já fica pronto com um link para divulgar."},
              {q:"Como funciona o teste de 15 dias?", a:"Você cria a conta e usa tudo de graça por 15 dias, sem cartão. Só paga se quiser continuar."},
              {q:"O site funciona no celular?", a:"Sim! Seu site e seu painel funcionam perfeitamente no celular, tablet e computador."},
              {q:"Posso cancelar quando quiser?", a:"Sim, direto no painel, sem multa e sem burocracia."},
            ].map((f,i) => <FAQItem key={i} q={f.q} a={f.a}/>)}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-orange-600 to-amber-500 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">Comece hoje. Em 15 dias você não vai querer mais viver sem.</h2>
          <p className="mt-4 text-lg text-orange-50">Seu site, sua agenda e seu financeiro trabalhando por você — 24h por dia.</p>
          <button onClick={() => setRoute("signup")} className="mt-8 px-8 py-4 rounded-xl bg-white text-orange-600 font-black text-lg hover:scale-105 transition shadow-2xl">Criar minha conta grátis →</button>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-10 px-4 text-center text-xs">
        <div className="font-bold text-white mb-1">Marido de Aluguel</div>
        © 2026 Marido de Aluguel SaaS • {BASE_URL}
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN / SIGNUP
   ═══════════════════════════════════════════════════════════════ */
function GoogleButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.9 36.1 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
      Continuar com Google
    </button>
  );
}

function LoginPage() {
  const { login, loginGoogle, setRoute } = useApp();
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); await login(email, pwd); setBusy(false); };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => setRoute("home")} className="text-sm text-slate-600 mb-4">← Voltar</button>
        <Card className="p-8 border-t-4 border-t-orange-600 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black">M</div>
            <div><div className="font-black text-lg">Marido de Aluguel</div><div className="text-xs text-slate-500">SaaS</div></div>
          </div>
          <h1 className="text-2xl font-black">Entrar</h1>
          <div className="mt-6"><GoogleButton onClick={loginGoogle}/></div>
          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-slate-200"/><span className="text-xs text-slate-400">ou com e-mail</span><div className="flex-1 h-px bg-slate-200"/></div>
          <form onSubmit={submit} className="space-y-4">
            <Input label="E-mail" type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
            <Input label="Senha" type="password" required value={pwd} onChange={e => setPwd(e.target.value)}/>
            <Btn type="submit" className="w-full" disabled={busy}>{busy ? "Entrando..." : "Entrar no painel"}</Btn>
          </form>
          <div className="mt-5 text-center text-sm">Não tem conta? <button onClick={() => setRoute("signup")} className="text-orange-600 font-bold">Cadastre-se</button></div>
        </Card>
      </div>
    </div>
  );
}

function SignupPage() {
  const { signup, checkSlug, setRoute } = useApp();
  const [loading, setLoading] = useState(false);
  const [slugOk, setSlugOk] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    owner_name:"", company_name:"", email:"", phone:"", cpf:"",
    cep:"", address:"", number:"", complement:"", city:"", state:"",
    slug:"", plan_id:"pro", password:"",
  });

  useEffect(() => {
    if (form.cep.replace(/\D/g,"").length === 8) {
      buscarCEP(form.cep.replace(/\D/g,"")).then(d => { if (d) setForm(f => ({...f, address: d.logradouro, city: d.cidade, state: d.estado})); });
    }
  }, [form.cep]);

  useEffect(() => {
    let active = true;
    if (form.slug.length >= 3) checkSlug(form.slug).then(ok => { if (active) setSlugOk(ok); });
    else setSlugOk(null);
    return () => { active = false; };
  }, [form.slug]);

  const submit = async () => {
    const errs = {};
    if (!form.owner_name) errs.owner_name = "Obrigatório";
    if (!form.company_name) errs.company_name = "Obrigatório";
    if (!form.email) errs.email = "Obrigatório";
    if (form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (!form.phone) errs.phone = "Obrigatório";
    if (!validarCPF(form.cpf)) errs.cpf = "CPF inválido";
    if (!form.cep) errs.cep = "Obrigatório";
    if (!form.number) errs.number = "Obrigatório";
    if (!form.slug) errs.slug = "Escolha uma URL";
    if (slugOk === false) errs.slug = "URL em uso";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const r = await signup(form);
    setLoading(false);
    if (r.success) { setSuccess(r.tenant); fireConfetti(); setTimeout(() => setRoute("app"), 2200); }
    else alert(r.error);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-t-4 border-t-green-500">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
          <h2 className="text-2xl font-black">Conta criada! 🎉</h2>
          <p className="text-slate-600 mt-2">Trial de 15 dias começou.</p>
          <div className="mt-5 p-4 bg-slate-50 rounded-xl text-left text-sm space-y-1">
            <div><b>Sua página:</b> <span className="text-orange-600 font-mono break-all">{publicUrl(success.slug)}</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 justify-center"><RefreshCw size={14} className="animate-spin"/> Entrando no painel...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setRoute("home")} className="text-sm text-slate-600 mb-4">← Voltar</button>
        <Card className="p-6 md:p-8 border-t-4 border-t-orange-600">
          <h1 className="text-2xl font-black">Crie sua conta grátis</h1>
          <p className="text-slate-500 mt-1">15 dias sem cartão.</p>
          <div className="mt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Nome completo *" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} error={errors.owner_name}/>
              <Input label="Empresa *" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} error={errors.company_name}/>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} error={errors.email}/>
              <Input label="Senha *" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} error={errors.password}/>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="WhatsApp *" value={form.phone} onChange={e => setForm({...form, phone: maskPhone(e.target.value)})} error={errors.phone}/>
              <Input label="CPF *" value={form.cpf} onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})} error={errors.cpf}/>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input label="CEP *" value={form.cep} onChange={e => setForm({...form, cep: maskCEP(e.target.value)})} error={errors.cep}/>
              <Input label="Número *" value={form.number} onChange={e => setForm({...form, number: e.target.value})} error={errors.number}/>
              <Input label="Complemento" value={form.complement} onChange={e => setForm({...form, complement: e.target.value})}/>
            </div>
            <Input label="Endereço (automático pelo CEP)" value={form.address} disabled className="bg-slate-50"/>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sua URL personalizada *</label>
              <div className="flex items-stretch gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-sm text-slate-500 pl-2 self-center whitespace-nowrap">.../?empresa=</span>
                <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono outline-none" placeholder="sua-empresa"/>
              </div>
              {slugOk === true && <p className="text-xs text-green-600 mt-1.5">✓ Disponível</p>}
              {slugOk === false && <p className="text-xs text-red-600 mt-1.5">✗ Em uso</p>}
              {errors.slug && <p className="text-xs text-red-600 mt-1.5">{errors.slug}</p>}
            </div>
            <Btn className="w-full !py-3.5" onClick={submit} disabled={loading || slugOk === false}>
              {loading ? <><RefreshCw className="animate-spin" size={16}/> Criando...</> : <>Criar conta grátis <ArrowRight size={16}/></>}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const { tenants, leads, plans, activateTenant, suspendTenant, logout } = useApp();
  const [tab, setTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const planPrice = id => plans.find(p => p.id === id)?.price || 0;
  const stats = {
    mrr: tenants.filter(t => t.status === "active").reduce((a,t) => a + planPrice(t.plan_id), 0),
    active: tenants.filter(t => t.status === "active").length,
    trial: tenants.filter(t => t.status === "trial").length,
    leads: leads.length,
  };
  const navItems = [
    {id:"overview", l:"Dashboard", i: LayoutDashboard},
    {id:"tenants", l:"Empresas", i: Users},
    {id:"agents", l:"Agentes IA", i: Bot},
    {id:"leads", l:"Leads", i: Target},
  ];
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className={cls("fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform md:relative md:translate-x-0", mobileOpen?"translate-x-0":"-translate-x-full")}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black">M</div>
          <div><div className="font-black">Admin</div><div className="text-[10px] text-slate-400">Super</div></div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setMobileOpen(false); }} className={cls("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition", tab===n.id?"bg-orange-600 text-white":"text-slate-400 hover:bg-slate-800")}><n.i size={18}/>{n.l}</button>
          ))}
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-slate-800 mt-4"><LogOut size={16}/> Sair</button>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3"><button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu/></button><h1 className="font-black capitalize">{navItems.find(n => n.id === tab)?.l}</h1></div>
          <Badge variant="success">🟢 Online</Badge>
        </header>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {l:"MRR", v:brl(stats.mrr), i:DollarSign, c:"bg-green-500"},
                  {l:"Ativos", v:stats.active, i:Users, c:"bg-blue-500"},
                  {l:"Trial", v:stats.trial, i:Clock, c:"bg-amber-500"},
                  {l:"Leads", v:stats.leads, i:Target, c:"bg-purple-500"},
                ].map((s,i) => (
                  <Card key={i} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-500 uppercase font-bold">{s.l}</p><p className="text-2xl font-black mt-1">{s.v}</p></div><div className={`p-2 ${s.c} rounded-lg text-white`}><s.i size={18}/></div></div></Card>
                ))}
              </div>
              <Card className="p-6">
                <h3 className="font-bold mb-4">Empresas por status</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={[{m:"Trial",v:stats.trial},{m:"Ativos",v:stats.active},{m:"Total",v:tenants.length}]}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ea580c" stopOpacity={0.4}/><stop offset="100%" stopColor="#ea580c" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis allowDecimals={false}/><Tooltip/>
                    <Area type="monotone" dataKey="v" stroke="#ea580c" strokeWidth={3} fill="url(#g)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
          {tab === "tenants" && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-slate-50 font-bold">Empresas ({tenants.length})</div>
              {tenants.length === 0 ? <div className="p-12 text-center text-slate-400">Nenhuma empresa cadastrada ainda.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-3">Empresa</th><th className="text-left px-4 py-3">URL</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Ações</th></tr></thead>
                  <tbody className="divide-y">
                    {tenants.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3"><div className="font-bold">{t.company_name}</div><div className="text-xs text-slate-500">{t.email}</div></td>
                        <td className="px-4 py-3 text-xs font-mono">?empresa={t.slug}</td>
                        <td className="px-4 py-3"><Badge variant={t.status==="active"?"success":t.status==="trial"?"warning":"danger"}>{t.status}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {t.status !== "active" && <Btn variant="success" className="!px-2 !py-1 !text-xs" onClick={() => activateTenant(t.id)}>Ativar</Btn>}
                            {t.status === "active" && <Btn variant="danger" className="!px-2 !py-1 !text-xs" onClick={() => suspendTenant(t.id)}>Suspender</Btn>}
                            <a href={publicUrl(t.slug)} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-100 flex items-center"><Eye size={12}/></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </Card>
          )}
          {tab === "agents" && (
            <Card className="p-8 text-center">
              <Bot size={48} className="mx-auto text-orange-500 mb-3"/>
              <h3 className="font-black text-xl">Agentes de IA — em construção (Fase 4)</h3>
              <p className="text-slate-600 mt-2 max-w-lg mx-auto">Geração real de conteúdo e captação de leads serão implementadas de forma <b>real e legal</b> (opt-in, sem scraping/spam). Nada de simulação.</p>
            </Card>
          )}
          {tab === "leads" && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-slate-50 font-bold">Leads ({leads.length})</div>
              {leads.length === 0 ? <div className="p-12 text-center text-slate-400">Nenhum lead ainda. Eles aparecem quando alguém preenche o formulário de uma empresa.</div> : (
                <div className="divide-y">
                  {leads.map(l => (
                    <div key={l.id} className="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={cls("w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm", (l.score||0) > 85 ? "bg-green-500" : (l.score||0) > 70 ? "bg-amber-500" : "bg-slate-400")}>{l.score}</div>
                        <div><div className="font-bold">{l.name}</div><div className="text-xs text-slate-500">{l.phone} {l.email ? `• ${l.email}`:""}</div><div className="text-xs text-slate-400">Fonte: {l.source}</div></div>
                      </div>
                      <Badge variant={l.status==="new"?"blue":"success"}>{l.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SELLER DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function SellerDashboard() {
  const { tenants, plans, updateTenant, updateLanding, logout, services, appointments, clients } = useApp();
  const tenant = tenants[0];
  const [tab, setTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!tenant) return <Loading/>;

  const trialDays = tenant.trial_ends ? Math.ceil((new Date(tenant.trial_ends) - new Date()) / 86400000) : null;
  const nav = [
    {id:"overview",l:"Dashboard",i:LayoutDashboard},
    {id:"page",l:"Minha Página",i:Globe},
    {id:"services",l:"Serviços",i:Briefcase},
    {id:"agenda",l:"Agenda",i:Calendar},
    {id:"crm",l:"Clientes",i:Users},
    {id:"settings",l:"Config",i:Settings},
  ];
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className={cls("fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform md:relative md:translate-x-0", mobileOpen?"translate-x-0":"-translate-x-full")}>
        <div className="p-5 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{background: tenant.brand_color}}>{tenant.company_name.charAt(0)}</div>
          <div className="min-w-0"><div className="font-black truncate">{tenant.company_name}</div><div className="text-[10px] text-slate-500 truncate">Plano {plans.find(p => p.id === tenant.plan_id)?.name || tenant.plan_id}</div></div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map(n => <button key={n.id} onClick={() => { setTab(n.id); setMobileOpen(false); }} className={cls("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition", tab===n.id?"bg-slate-900 text-white":"text-slate-600 hover:bg-slate-100")}><n.i size={18}/>{n.l}</button>)}
          <a href={publicUrl(tenant.slug)} target="_blank" rel="noreferrer" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-orange-600 hover:bg-orange-50 mt-2"><Eye size={16}/> Ver minha página</a>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"><LogOut size={16}/> Sair</button>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3"><button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu/></button><h1 className="font-black capitalize">{nav.find(n => n.id === tab)?.l}</h1></div>
          <Badge variant="success">✅ {tenant.status}</Badge>
        </header>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
          {tenant.status === "trial" && trialDays !== null && (
            <Card className={cls("p-4 border-2", trialDays <= 5?"border-red-500 bg-red-50":"border-blue-500 bg-blue-50")}>
              <div className="flex items-start gap-3 flex-wrap"><AlertCircle size={24}/><div className="flex-1"><p className="font-bold">Trial: {trialDays} dias restantes</p><p className="text-sm">Aproveite todos os recursos.</p></div></div>
            </Card>
          )}
          {tab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {l:"Agendamentos",v:appointments.length,i:Calendar,c:"bg-blue-500"},
                {l:"Clientes",v:clients.length,i:Users,c:"bg-purple-500"},
                {l:"Serviços",v:services.length,i:Briefcase,c:"bg-orange-500"},
                {l:"Plano",v:plans.find(p=>p.id===tenant.plan_id)?.name||"—",i:CreditCard,c:"bg-green-500"},
              ].map((s,i) => (
                <Card key={i} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-500 uppercase font-bold">{s.l}</p><p className="text-2xl font-black mt-1">{s.v}</p></div><div className={`p-2 ${s.c} rounded-lg text-white`}><s.i size={18}/></div></div></Card>
              ))}
              <Card className="col-span-2 lg:col-span-4 p-6">
                <h3 className="font-bold mb-4">Sua página pública</h3>
                <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm break-all">{publicUrl(tenant.slug)}</div>
                <a href={publicUrl(tenant.slug)} target="_blank" rel="noreferrer"><Btn className="mt-3"><Eye size={16}/> Ver ao vivo</Btn></a>
              </Card>
            </div>
          )}
          {tab === "page" && <PageBuilder tenant={tenant} onUpdate={updateLanding}/>}
          {tab === "services" && <ServicesManager tenant={tenant}/>}
          {tab === "agenda" && <AgendaManager tenant={tenant}/>}
          {tab === "crm" && <CRMManager tenant={tenant}/>}
          {tab === "settings" && <SettingsPanel tenant={tenant} onUpdate={updateTenant}/>}
        </div>
      </main>
    </div>
  );
}

function PageBuilder({ tenant, onUpdate }) {
  const [f, setF] = useState(tenant.landing || {});
  const [saved, setSaved] = useState(false);
  const save = async () => { await onUpdate(tenant.id, f); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const services = f.services || [];
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">✏️ Editar minha página</h3>
        <div className="space-y-3">
          <Input label="Título (Hero)" value={f.hero_title||""} onChange={e => setF({...f, hero_title: e.target.value})}/>
          <Input label="Subtítulo" value={f.hero_subtitle||""} onChange={e => setF({...f, hero_subtitle: e.target.value})}/>
          <Input label="Texto do botão" value={f.cta_text||""} onChange={e => setF({...f, cta_text: e.target.value})}/>
          <Input label="WhatsApp (só números, com DDI 55)" value={f.whatsapp||""} onChange={e => setF({...f, whatsapp: e.target.value.replace(/\D/g,"")})}/>
          <Input label="URL imagem hero" value={f.hero_image||""} onChange={e => setF({...f, hero_image: e.target.value})}/>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Serviços em destaque</label>
            {services.map((s,i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                <input value={s.icon} onChange={e => { const arr=[...services]; arr[i]={...arr[i],icon:e.target.value}; setF({...f,services:arr}); }} className="col-span-2 px-2 py-1.5 border rounded text-sm" placeholder="⚡"/>
                <input value={s.name} onChange={e => { const arr=[...services]; arr[i]={...arr[i],name:e.target.value}; setF({...f,services:arr}); }} className="col-span-6 px-2 py-1.5 border rounded text-sm"/>
                <input type="number" value={s.price} onChange={e => { const arr=[...services]; arr[i]={...arr[i],price:+e.target.value}; setF({...f,services:arr}); }} className="col-span-3 px-2 py-1.5 border rounded text-sm"/>
                <button onClick={() => setF({...f, services: services.filter((_,j)=>j!==i)})} className="col-span-1 text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
            <button onClick={() => setF({...f, services: [...services, { id:"s"+Date.now(), name:"Novo serviço", price:100, icon:"⚙️" }]})} className="text-xs text-orange-600 font-bold">+ Adicionar serviço</button>
          </div>
          <Btn onClick={save} className="w-full">{saved?<><Check size={16}/> Salvo!</>:<>💾 Salvar</>}</Btn>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden h-fit">
        <div className="p-3 bg-slate-900 text-white text-xs font-mono break-all">{publicUrl(tenant.slug)}</div>
        <div className="relative bg-slate-900 text-white h-48">
          <img src={f.hero_image} alt="" className="w-full h-full object-cover opacity-50"/>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-black">{f.hero_title}</h2>
            <p className="text-xs mt-2 opacity-90">{(f.hero_subtitle||"").slice(0,80)}</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {services.map((s,i) => <div key={i} className="border rounded-lg p-2 text-center"><div className="text-2xl">{s.icon}</div><div className="text-xs font-bold">{s.name}</div><div className="text-[10px]">{brl(s.price)}</div></div>)}
        </div>
      </Card>
    </div>
  );
}

function ServicesManager({ tenant }) {
  const { services, addService, removeService } = useApp();
  const [form, setForm] = useState({ name:"", category:"", price:"" });
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-bold mb-4">➕ Adicionar serviço</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Input placeholder="Nome" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/>
          <Input placeholder="Categoria" value={form.category} onChange={e => setForm({...form,category:e.target.value})}/>
          <Input type="number" placeholder="Preço (R$)" value={form.price} onChange={e => setForm({...form,price:e.target.value})}/>
        </div>
        <Btn className="mt-3" icon={Plus} onClick={async () => { if(form.name){ await addService({ name:form.name, category:form.category, price_cents: Math.round((+form.price||0)*100), tenant_id: tenant.id }); setForm({name:"",category:"",price:""}); } }}>Adicionar</Btn>
      </Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map(s => (
          <Card key={s.id} className="p-4"><div className="flex justify-between items-start"><div><div className="font-bold">{s.name}</div><div className="text-xs text-slate-500">{s.category}</div><div className="text-lg font-black mt-1" style={{color:tenant.brand_color}}>{centsBrl(s.price_cents)}</div></div><button onClick={() => removeService(s.id)} className="text-red-400"><Trash2 size={16}/></button></div></Card>
        ))}
      </div>
    </div>
  );
}

function AgendaManager({ tenant }) {
  const { appointments, addAppointment } = useApp();
  const [form, setForm] = useState({ client_name:"", client_phone:"", scheduled_at:"", value:"" });
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-bold mb-4">📅 Novo agendamento</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Input placeholder="Cliente" value={form.client_name} onChange={e => setForm({...form,client_name:e.target.value})}/>
          <Input placeholder="Telefone" value={form.client_phone} onChange={e => setForm({...form,client_phone:maskPhone(e.target.value)})}/>
          <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form,scheduled_at:e.target.value})}/>
          <Input type="number" placeholder="Valor (R$)" value={form.value} onChange={e => setForm({...form,value:e.target.value})}/>
        </div>
        <Btn className="mt-3" icon={Plus} onClick={async () => { if(form.client_name){ await addAppointment({ client_name:form.client_name, client_phone:form.client_phone, scheduled_at: form.scheduled_at || null, value_cents: Math.round((+form.value||0)*100), tenant_id: tenant.id, status:"pending" }); setForm({client_name:"",client_phone:"",scheduled_at:"",value:""}); } }}>Agendar</Btn>
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-bold">Agendamentos ({appointments.length})</div>
        {appointments.length === 0 ? <div className="p-8 text-center text-slate-400">Nenhum.</div> : (
          <div className="divide-y">{appointments.map(a => (
            <div key={a.id} className="p-4 flex justify-between items-center flex-wrap gap-3">
              <div><div className="font-bold">{a.client_name}</div><div className="text-xs text-slate-500">{a.client_phone} {a.scheduled_at ? `• ${new Date(a.scheduled_at).toLocaleString("pt-BR")}`:""}</div></div>
              <div className="text-right"><div className="font-black">{centsBrl(a.value_cents)}</div><Badge variant="warning">{a.status}</Badge></div>
            </div>
          ))}</div>
        )}
      </Card>
    </div>
  );
}

function CRMManager({ tenant }) {
  const { clients, addClient } = useApp();
  const [form, setForm] = useState({ name:"", phone:"", email:"", tag:"client" });
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-bold mb-4">👥 Adicionar cliente</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <Input placeholder="Nome" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/>
          <Input placeholder="Telefone" value={form.phone} onChange={e => setForm({...form,phone:maskPhone(e.target.value)})}/>
          <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/>
          <select value={form.tag} onChange={e => setForm({...form,tag:e.target.value})} className="px-3 py-2.5 border rounded-xl text-sm bg-white"><option value="lead">Lead</option><option value="client">Cliente</option><option value="vip">VIP</option></select>
        </div>
        <Btn className="mt-3" icon={Plus} onClick={async () => { if(form.name){ await addClient({ ...form, tenant_id: tenant.id }); setForm({name:"",phone:"",email:"",tag:"client"}); } }}>Adicionar</Btn>
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-bold">Clientes ({clients.length})</div>
        {clients.length === 0 ? <div className="p-8 text-center text-slate-400">Nenhum.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Nome</th><th className="text-left px-4 py-2">Contato</th><th className="text-left px-4 py-2">Tag</th></tr></thead>
            <tbody className="divide-y">{clients.map(c => (<tr key={c.id} className="hover:bg-slate-50"><td className="px-4 py-2 font-bold">{c.name}</td><td className="px-4 py-2 text-xs">{c.phone} {c.email?`• ${c.email}`:""}</td><td className="px-4 py-2"><Badge variant={c.tag==="vip"?"purple":c.tag==="client"?"blue":"default"}>{c.tag}</Badge></td></tr>))}</tbody>
          </table></div>
        )}
      </Card>
    </div>
  );
}

function SettingsPanel({ tenant, onUpdate }) {
  const { plans } = useApp();
  const [f, setF] = useState(tenant);
  const [saved, setSaved] = useState(false);
  const save = async () => { await onUpdate(tenant.id, { company_name:f.company_name, about:f.about, service_areas:f.service_areas, brand_color:f.brand_color }); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-6">
        <h3 className="font-bold mb-4">Dados da empresa</h3>
        <div className="space-y-3">
          <Input label="Empresa" value={f.company_name||""} onChange={e => setF({...f, company_name: e.target.value})}/>
          <Input label="Sobre" value={f.about||""} onChange={e => setF({...f, about: e.target.value})}/>
          <Input label="Cidades atendidas (vírgula)" value={(f.service_areas||[]).join(", ")} onChange={e => setF({...f, service_areas: e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/>
          <Input label="Cor da marca" type="color" value={f.brand_color||"#FF7A00"} onChange={e => setF({...f, brand_color: e.target.value})}/>
          <Btn onClick={save} className="w-full">{saved?<><Check size={16}/> Salvo!</>:<>💾 Salvar</>}</Btn>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-bold mb-4">Plano atual</h3>
        <div className="p-4 rounded-xl border-2" style={{borderColor: tenant.brand_color}}>
          <div className="text-2xl font-black">{plans.find(p => p.id === f.plan_id)?.name || f.plan_id}</div>
          <div className="text-3xl font-black mt-2">{brl(plans.find(p => p.id === f.plan_id)?.price)}<span className="text-sm text-slate-500 font-normal">/mês</span></div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Pagamento real (Asaas) chega na Fase 2.</p>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROUTER + APP
   ═══════════════════════════════════════════════════════════════ */
function Router() {
  const { user, authReady, route } = useApp();
  const [publicTenant, setPublicTenant] = useState(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const slug = params.get("empresa") || (path && !["app","login","signup"].includes(path) ? path : null);
    if (slug) {
      supabase.from("public_tenants").select("*").eq("slug", slug).maybeSingle()
        .then(({ data }) => setPublicTenant(data || null));
    } else {
      setPublicTenant(null);
    }
  }, []);

  if (publicTenant === undefined) return <Loading/>;
  if (publicTenant) return <SellerPublicPage tenant={publicTenant}/>;

  if (!authReady) return <Loading/>;
  if (!user) {
    if (route === "login") return <LoginPage/>;
    if (route === "signup") return <SignupPage/>;
    return <HomePage/>;
  }
  if (user.role === "super_admin") return <AdminDashboard/>;
  if (user.tenant_id) return <SellerDashboard/>;
  return <SignupPage/>;
}

export default function App() {
  return <Provider><Router/></Provider>;
}
