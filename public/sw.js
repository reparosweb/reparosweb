// Service worker mínimo — habilita instalação como app (PWA) sem cache agressivo
// (network-first em navegação para nunca servir conteúdo desatualizado)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/")));
  }
});
