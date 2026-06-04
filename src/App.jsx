import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { 
  Check, Star, Shield, Clock, Zap, Phone, MapPin, MessageSquare, 
  ArrowRight, Menu, X, ChevronRight, Play, Award, ThumbsUp, Send, Bot
} from "lucide-react";

// --- DADOS DO TENANT (Simulando o banco de dados) ---
const DATA = {
  companyName: "Carlos Reparos",
  ownerName: "Carlos Silva",
  city: "São Paulo",
  phone: "(11) 99999-9999",
  whatsapp: "5511999999999",
  rating: 4.9,
  jobsCount: 148,
  clientsCount: 92,
  responseTime: "7 min",
  heroTitle: "Resolvemos qualquer reparo da sua casa em até 24h",
  heroSubtitle: "Mais de 148 serviços realizados e 92 clientes satisfeitos. Orçamento grátis, preço justo e garantia escrita.",
  heroImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  about: "Mais de 10 anos resolvendo qualquer reparo da sua casa com pontualidade britânica, preço justo e garantia por escrito.",
  services: [
    { id: 1, name: "Instalação elétrica", price: 180, icon: "⚡" },
    { id: 2, name: "Encanamento", price: 150, icon: "🔧" },
    { id: 3, name: "Montagem de móveis", price: 120, icon: "🪑" },
    { id: 4, name: "Pintura residencial", price: 45, icon: "🎨" },
  ],
  testimonials: [
    { name: "Mariana Prado", city: "São Paulo", text: "Chegou no horário, resolveu tudo e ainda deu dicas. Preço honesto!", rating: 5 },
    { name: "Eduardo Alves", city: "São Paulo", text: "Já é a terceira vez que contrato. Virou meu 'faz-tudo' oficial.", rating: 5 },
    { name: "Patrícia Lima", city: "Guarulhos", text: "Orçamento rápido pelo WhatsApp, serviço no dia seguinte.", rating: 5 },
  ],
  serviceAreas: ["São Paulo", "Guarulhos", "Osasco", "Santo André"],
  brandColor: "#FF7A00"
};

// --- COMPONENTES ---
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: DATA.brandColor }}>
            {DATA.companyName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">{DATA.companyName}</div>
            <div className="text-[11px] text-slate-500 leading-tight flex items-center gap-1">
              {DATA.city} • <Star size={10} className="fill-amber-400 text-amber-400" /> {DATA.rating}
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#servicos" className="hover:text-slate-900">Serviços</a>
          <a href="#como-funciona" className="hover:text-slate-900">Como funciona</a>
          <a href="#depoimentos" className="hover:text-slate-900">Depoimentos</a>
          <a href="#orcamento" className="hover:text-slate-900">Orçamento</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href={`https://wa.me/${DATA.whatsapp}`} className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm" style={{ backgroundColor: DATA.brandColor }}>
            Pedir orçamento
          </a>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-4 text-sm font-medium">
          <a href="#servicos" onClick={() => setIsOpen(false)}>Serviços</a>
          <a href="#como-funciona" onClick={() => setIsOpen(false)}>Como funciona</a>
          <a href="#depoimentos" onClick={() => setIsOpen(false)}>Depoimentos</a>
          <a href="#orcamento" onClick={() => setIsOpen(false)} className="text-[#FF7A00] font-bold">Pedir Orçamento</a>
        </div>
      )}
    </header>
  );
};

const Hero = () => (
  <section className="pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Atendendo agora em {DATA.city}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
          {DATA.heroTitle}
        </h1>
        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">{DATA.heroSubtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <a href="#orcamento" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold shadow-xl hover:-translate-y-1 transition-all text-lg" style={{ backgroundColor: DATA.brandColor }}>
            Quero orçamento grátis <ArrowRight size={20} />
          </a>
          <a href={`https://wa.me/${DATA.whatsapp}`} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-slate-900 transition-all">
            <MessageSquare size={20} /> WhatsApp
          </a>
        </div>
        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-sm">👤</div>)}
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
              <span className="text-slate-900 ml-1">{DATA.rating}</span>
            </div>
            <div className="text-slate-500">Avaliado por {DATA.clientsCount}+ clientes</div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <img src={DATA.heroImage} alt="Profissional" className="w-full h-[500px] object-cover" />
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 max-w-xs hidden md:flex">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check size={24} strokeWidth={3} /></div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Último serviço</div>
            <div className="font-bold text-slate-900">Instalação concluída com sucesso!</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SocialProof = () => (
  <section className="py-12 bg-slate-900 text-white border-y border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
      {[
        { value: `${DATA.jobsCount}+`, label: "Serviços realizados" },
        { value: `${DATA.clientsCount}+`, label: "Clientes atendidos" },
        { value: DATA.rating, label: "Avaliação média" },
        { value: "24h", label: "Atendimento rápido" },
      ].map((stat, idx) => (
        <div key={idx} className="p-2">
          <div className="text-3xl sm:text-4xl font-black mb-1" style={{ color: DATA.brandColor }}>{stat.value}</div>
          <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

const Services = () => (
  <section id="servicos" className="py-24 px-4 sm:px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: DATA.brandColor }}>Nossos Serviços</span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Tudo o que sua casa precisa</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DATA.services.map((service) => (
          <div key={service.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-[#FF7A00]/30 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${DATA.brandColor}15` }}>
              {service.icon}
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">{service.name}</h3>
            <p className="text-sm text-slate-500 mb-6">A partir de</p>
            <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
              <div className="text-2xl font-black text-slate-900">R$ {service.price},00</div>
              <a href="#orcamento" className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1" style={{ color: DATA.brandColor }}>
                Orçar <ArrowRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Differentials = () => (
  <section className="py-24 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: DATA.brandColor }}>Por que somos diferentes</span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">Um padrão de qualidade único</h2>
        <div className="space-y-8">
          {[
            { icon: Shield, title: "Garantia por escrito", desc: "90 dias em todos os serviços. Problema? Voltamos sem custo." },
            { icon: Clock, title: "Pontualidade britânica", desc: "Atrasou 15 min? Você ganha 10% de desconto." },
            { icon: Zap, title: "Orçamento em minutos", desc: "Preencha o formulário e receba preço fechado no WhatsApp." },
            { icon: Award, title: "Profissionais certificados", desc: "Teste técnico, entrevista e checagem de antecedentes." },
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md" style={{ backgroundColor: DATA.brandColor }}>
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80" alt="Profissional" className="relative rounded-[2.5rem] shadow-2xl w-full object-cover aspect-square" />
      </div>
    </div>
  </section>
);

const WhyHireUs = () => (
  <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden text-white">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Por que contratar a {DATA.companyName}?</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">Sabemos que deixar alguém entrar em casa exige confiança. Por isso, investimos pesado em segurança e atendimento humanizado.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Experiência", val: "10+ Anos" }, { label: "Satisfação", val: "98%" }, { label: "Garantia", val: "90 Dias" }, { label: "Suporte", val: "Humanizado" }].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center hover:bg-white/20 transition-colors">
                <div className="text-3xl font-black mb-1" style={{ color: DATA.brandColor }}>{item.val}</div>
                <div className="text-sm text-slate-300 font-medium uppercase tracking-wide">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="como-funciona" className="py-24 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: DATA.brandColor }}>Simples e Rápido</span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Como funciona nosso atendimento</h2>
      </div>
      <div className="grid md:grid-cols-4 gap-8 relative">
        {[
          { num: "01", title: "Peça um orçamento", desc: "Descreva o problema em 30 segundos pelo formulário." },
          { num: "02", title: "Receba o preço", desc: "Orçamento fechado em minutos, sem surpresas." },
          { num: "03", title: "Agende o dia", desc: "Escolha o melhor horário. Confirmamos por SMS." },
          { num: "04", title: "Problema resolvido", desc: "Pagamento após o serviço. Garantia de 90 dias." },
        ].map((step, idx) => (
          <div key={idx} className="relative bg-slate-50 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none border border-slate-200 md:border-none text-center md:text-left">
            <div className="w-24 h-24 mx-auto md:mx-0 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-3xl font-black mb-6 shadow-sm relative z-10" style={{ color: DATA.brandColor }}>
              {step.num}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const About = () => (
  <section className="py-24 px-4 sm:px-6 bg-white">
    <div className="max-w-5xl mx-auto">
      <div className="bg-orange-50 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-full md:w-1/3 shrink-0">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <img src={`https://ui-avatars.com/api/?name=${DATA.ownerName}&background=FF7A00&color=fff&size=400`} alt={DATA.ownerName} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold text-[#FF7A00] mb-4 shadow-sm">Quem está por trás</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Olá, sou {DATA.ownerName}</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">{DATA.about}</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm"><Shield size={14}/> Certificado</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm"><MapPin size={14}/>{DATA.city}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="depoimentos" className="py-24 px-4 sm:px-6 bg-slate-900 text-white overflow-hidden relative">
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest uppercase mb-3 block text-[#FF7A00]">Depoimentos Reais</span>
        <h2 className="text-3xl sm:text-4xl font-black">Quem contrata, recomenda</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {DATA.testimonials.map((t, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
            <div className="flex text-amber-400 mb-4 gap-1">
              {[...Array(t.rating)].map((_, i) => <Star key={i} size={18} className="fill-current" />)}
            </div>
            <p className="text-slate-300 text-lg italic mb-6 leading-relaxed">"{t.text}"</p>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FFB000] flex items-center justify-center font-bold text-white text-lg">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{t.name}</div>
                <div className="text-sm text-slate-400">{t.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const QuoteForm = () => {
  const [status, setStatus] = useState('idle');
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 1500);
  };
  return (
    <section id="orcamento" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: DATA.brandColor }}>Orçamento Grátis</span>
          <h2 className="text-4xl font-black text-slate-900 mb-6">Resposta em até <br/><span style={{ color: DATA.brandColor }}>15 minutos</span></h2>
          <p className="text-lg text-slate-600 mb-8">Preencha os dados ao lado e nossa equipe técnica irá analisar sua solicitação e retornar com um preço fechado.</p>
          <div className="space-y-4">
            {["Sem taxa de visita para orçamento", "Profissionais uniformizados", "Pagamento somente após aprovação", "Nota fiscal e garantia"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check size={14} strokeWidth={3} /></div>
                <span className="font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} strokeWidth={3} /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Recebemos seu pedido!</h3>
              <p className="text-slate-600">Em instantes um especialista entrará em contato.</p>
              <button onClick={() => setStatus('idle')} className="mt-8 text-sm font-bold text-[#FF7A00] hover:underline">Enviar novo pedido</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome completo</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</label>
                  <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de serviço</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none bg-white">
                  <option value="">Selecione uma opção...</option>
                  {DATA.services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  <option value="Outro">Outro assunto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descreva o problema</label>
                <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none" placeholder="Ex: Torneira da cozinha pingando..."></textarea>
              </div>
              <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2" style={{ backgroundColor: DATA.brandColor }}>
                {status === 'loading' ? "Enviando..." : "Solicitar Orçamento Agora"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const ServiceArea = () => (
  <section className="py-24 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1">
          <span className="text-xs font-black tracking-widest uppercase mb-3 block" style={{ color: DATA.brandColor }}>Cobertura</span>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Onde atendemos?</h2>
          <p className="text-slate-600 mb-8 text-lg">Nossa equipe está espalhada por toda a região metropolitana, garantindo agilidade no deslocamento.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {DATA.serviceAreas.map((area, i) => (
              <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2">
                <MapPin size={14} className="text-[#FF7A00]" /> {area}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 h-[300px] bg-slate-200 rounded-3xl overflow-hidden relative shadow-inner">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Sao_Paulo_Metro_Area_Map.png/800px-Sao_Paulo_Metro_Area_Map.png" alt="Mapa" className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-[#FF7A00] fill-current" /> Base em {DATA.city}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 border-t border-slate-900">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: DATA.brandColor }}>{DATA.companyName.charAt(0)}</div>
          <span className="font-bold text-white text-lg">{DATA.companyName}</span>
        </div>
        <p className="text-sm leading-relaxed mb-6">Especialistas em manutenção residencial e comercial. Compromisso com a qualidade.</p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Links Rápidos</h4>
        <ul className="space-y-3 text-sm">
          <li><a href="#" className="hover:text-[#FF7A00]">Início</a></li>
          <li><a href="#servicos" className="hover:text-[#FF7A00]">Serviços</a></li>
          <li><a href="#depoimentos" className="hover:text-[#FF7A00]">Depoimentos</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Contato</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3"><Phone size={16} className="text-[#FF7A00]"/> {DATA.phone}</li>
          <li className="flex items-center gap-3"><MapPin size={16} className="text-[#FF7A00]"/> {DATA.city}, SP</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Horários</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between"><span>Seg - Sex:</span> <span className="text-white">08h às 18h</span></li>
          <li className="flex justify-between"><span>Sábado:</span> <span className="text-white">08h às 13h</span></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 text-center text-xs">
      <p>&copy; {new Date().getFullYear()} {DATA.companyName}. Todos os direitos reservados.</p>
    </div>
  </footer>
);

const WhatsAppFloat = () => (
  <a href={`https://wa.me/${DATA.whatsapp}?text=Olá! Vim através do site e gostaria de um orçamento.`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 group">
    <div className="relative">
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30 group-hover:opacity-50"></div>
      <div className="relative bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
        <MessageSquare size={32} className="fill-current" />
      </div>
    </div>
  </a>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: `Olá! 👋 Sou o assistente virtual da ${DATA.companyName}. Como posso ajudar você hoje?` }]);
  const [inputValue, setInputValue] = useState("");
  
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Entendi! Para te passar um orçamento preciso, poderia me dizer qual o tipo de serviço e seu bairro? Ou clique no botão do WhatsApp para falar com um atendente humano." }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-24 z-40 hidden sm:block">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all hover:scale-105">
          <Bot size={28} />
        </button>
      )}
      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 text-white flex items-center justify-between shrink-0" style={{ backgroundColor: DATA.brandColor }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Bot size={24} /></div>
              <div>
                <div className="font-bold text-sm">Assistente Virtual</div>
                <div className="text-xs opacity-90 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online agora</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#FF7A00]/50 outline-none" />
            <button type="submit" disabled={!inputValue.trim()} className="p-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{ backgroundColor: DATA.brandColor }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Index = () => {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ["#FF7A00", "#FFB000", "#2C2C2C"];
    const fire = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(fire);
    };
    setTimeout(fire, 500);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#FF7A00] selection:text-white">
      <Header />
      <Hero />
      <SocialProof />
      <Services />
      <Differentials />
      <WhyHireUs />
      <HowItWorks />
      <About />
      <Testimonials />
      <QuoteForm />
      <ServiceArea />
      <Footer />
      <WhatsAppFloat />
      <ChatBot />
    </div>
  );
};

export default Index;