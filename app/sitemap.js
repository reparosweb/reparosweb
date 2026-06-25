import { getSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 3600;

export default async function sitemap() {
  const base = "https://reparosweb.vercel.app";
  let tenants = [];
  try {
    const s = getSupabaseServer();
    const { data } = await s.from("public_tenants").select("slug, created_at");
    tenants = data || [];
  } catch {}
  const pro = tenants.map((t) => ({ url: `${base}/${t.slug}`, lastModified: t.created_at ? new Date(t.created_at) : new Date(), changeFrequency: "weekly", priority: 0.8 }));
  return [{ url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, ...pro];
}
