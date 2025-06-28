// Service Worker para TikTop Hooks

const CACHE_NAME = 'tiktophooks-v1';
const STATIC_CACHE = 'tiktophooks-static-v1';
const DYNAMIC_CACHE = 'tiktophooks-dynamic-v1';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/variables.css',
  '/assets/css/reset.css',
  '/assets/css/animations.css',
  '/assets/css/components.css',
  '/assets/js/config.js',
  '/assets/js/utils.js',
  '/assets/js/auth.js',
  '/assets/js/videoManager.js',
  '/assets/js/main.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cache estático aberto');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Arquivos em cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Erro ao instalar cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia de cache para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Cache para recursos estáticos
    if (isStaticResource(request)) {
      event.respondWith(cacheFirst(request));
    }
    // Cache para API calls
    else if (isApiRequest(request)) {
      event.respondWith(networkFirst(request));
    }
    // Cache para páginas HTML
    else if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirst(request));
    }
    // Cache para outros recursos
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Verificar se é recurso estático
function isStaticResource(request) {
  const staticPatterns = [
    /\.css$/,
    /\.js$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.woff$/,
    /\.woff2$/,
    /\.ttf$/,
    /\.eot$/
  ];
  
  return staticPatterns.some(pattern => pattern.test(request.url));
}

// Verificar se é requisição de API
function isApiRequest(request) {
  return request.url.includes('webhook') || 
         request.url.includes('api') ||
         request.url.includes('n8n');
}

// Estratégia: Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Erro em cacheFirst:', error);
    return new Response('Erro de rede', { status: 503 });
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Rede falhou, tentando cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response('Conteúdo não disponível offline', { status: 503 });
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignorar erros de rede para esta estratégia
  });
  
  return cachedResponse || fetchPromise;
}

// Background Sync para requisições offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Implementar sincronização em background
    console.log('Sincronizando dados em background...');
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Novo vídeo viral disponível!',
      icon: 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png',
      badge: 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Vídeo',
          icon: 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'TikTop Hooks', options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Limpeza de cache periódica
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const date = response.headers.get('date');
      
      if (date && new Date(date).getTime() < oneWeekAgo) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Erro na limpeza de cache:', error);
  }
} 