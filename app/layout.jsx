import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });

export const metadata = {
  metadataBase: new URL("https://reparosweb.vercel.app"),
  title: {
    default: "Marido de Aluguel — Site, agenda e CRM para profissionais de reparos",
    template: "%s | Marido de Aluguel",
  },
  description:
    "Tenha seu próprio site profissional, agenda online, CRM e gestão financeira. A plataforma premium para eletricistas, encanadores, pintores e profissionais de reparos e manutenção.",
  keywords: ["marido de aluguel", "site para eletricista", "agenda online", "CRM reparos", "encanador", "pintor", "reparos e manutenção"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://reparosweb.vercel.app",
    siteName: "Marido de Aluguel",
    title: "Marido de Aluguel — Seu site que vende por você",
    description: "Site profissional, agenda online, CRM e financeiro para profissionais de reparos. 15 dias grátis.",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Marido de Aluguel" }],
  },
  twitter: { card: "summary_large_image", title: "Marido de Aluguel", description: "Seu site que vende por você." },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: "#0F172A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
