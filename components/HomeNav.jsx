"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#F5B301] to-orange-500 rounded-xl flex items-center justify-center text-slate-900 font-black shadow-lg">M</div>
          <div><div className="font-black leading-tight">Marido de Aluguel</div><div className="text-[10px] text-slate-400 leading-tight tracking-wide">PLATAFORMA PREMIUM</div></div>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#recursos" className="hover:text-[#F5B301]">Recursos</a>
          <a href="#precos" className="hover:text-[#F5B301]">Preços</a>
          <a href="#faq" className="hover:text-[#F5B301]">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app" className="hidden sm:inline text-sm font-semibold text-slate-200 px-3 py-2 hover:text-white">Entrar</Link>
          <Link href="/app" className="text-sm px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5B301] to-orange-500 text-slate-900 font-bold">Teste grátis</Link>
          <button className="md:hidden p-2 text-slate-200" onClick={() => setOpen(!open)} aria-label="menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 py-3 flex flex-col gap-3 text-sm text-slate-200">
          <a href="#recursos" onClick={() => setOpen(false)}>Recursos</a>
          <a href="#precos" onClick={() => setOpen(false)}>Preços</a>
          <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
          <Link href="/app" onClick={() => setOpen(false)} className="text-[#F5B301] font-bold">Entrar</Link>
        </div>
      )}
    </header>
  );
}
