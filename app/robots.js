export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app"] },
    sitemap: "https://reparosweb.vercel.app/sitemap.xml",
    host: "https://reparosweb.vercel.app",
  };
}
