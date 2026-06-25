export const metadata = { title: "Painel", robots: { index: false, follow: false } };

export default function AppPanel() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 bg-slate-950 text-white">
      <div>
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#F5B301] to-orange-500 rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl">M</div>
        <h1 className="text-2xl font-black mt-5">Painel — migração para Next.js em andamento</h1>
        <p className="text-slate-400 mt-2 max-w-md mx-auto">O painel completo (login, agenda, CRM Kanban, financeiro, equipe, depoimentos, mídia, IA) está sendo portado para a nova arquitetura SSR. Próxima fatia.</p>
        <a href="/" className="inline-block mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-[#F5B301] to-orange-500 text-slate-900 font-bold">← Voltar ao site</a>
      </div>
    </div>
  );
}
