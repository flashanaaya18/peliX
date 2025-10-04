const CACHE_NAME = 'pelix-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'principal.html',
  'pelicula.html',
  'milista.html',
  'buscar.html',
  'login.html',
  'register.html',
  'category.html',
  'recientes.html',
  'populares.html',
  'perfil.html',
  'mejor_calificadas.html',
  'estilos.css',
  'renposive.css',
  'app.js',
  'main.js',
  'api.js',
  'pelicula.js',
  'milista.js',
  'buscar.js',
  'authService.js',
  'login.js',
  'category.js',
  'recientes.js',
  'populares.js',
  'mejor_calificadas.js',
  'register.js',
  'perfil.js',
  'principal.js',
  'manifest.json',
  '/peliX.png'
];

// Evento de instalación: se abre el caché y se guardan los archivos principales.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: intercepta las peticiones.
// Si el recurso está en caché, lo sirve desde ahí. Si no, lo busca en la red.
// Esta es una estrategia "Cache, falling back to Network".
self.addEventListener('fetch', event => {
  event.respondWith(
    // Solo interceptar peticiones GET que sean HTTP o HTTPS.
    // Ignorar todas las demás (ej: chrome-extension://).
    (event.request.method === 'GET' && event.request.url.startsWith('http'))
      ?
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la retornamos.
        if (response) {
          return response;
        }

        // Si no, hacemos la petición a la red.
        return fetch(event.request).then(
          networkResponse => {
            // Y guardamos una copia en el caché para la próxima vez.
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        );
      })
      // Si no se puede hacer la petición (ej: sin conexión), no hacer nada.
      .catch(() => {})
      : fetch(event.request) // Para todas las demás peticiones, solo las dejamos pasar.
  );
});