const CACHE_NAME = 'drummond-confort-v1.4.8';
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar peticiones a la API de Supabase y extensiones de Chrome
  if (
    event.request.method !== 'GET' || 
    url.href.includes('supabase.co') || 
    url.href.includes('chrome-extension') ||
    url.pathname.includes('/@vite/')
  ) {
    return; // Deja que el navegador maneje la petición normalmente sin interceptar
  }

  // Estrategia: Network First para evitar bloqueos de cache en actualizaciones
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        // Si no hay respuesta en caché, devuelve un error formal en lugar de undefined
        return response || Response.error();
      });
    })
  );
});
