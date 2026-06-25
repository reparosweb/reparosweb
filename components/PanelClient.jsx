"use client";
import dynamic from "next/dynamic";

// Painel é 100% client-side (SPA) — sem SSR (não precisa de SEO, é área logada)
const Panel = dynamic(() => import("./Panel"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Carregando painel...</div>
  ),
});

export default function PanelClient() {
  return <Panel />;
}
