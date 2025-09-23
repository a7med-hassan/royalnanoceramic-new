// Custom Service Worker to handle Navigation Preload properly
self.addEventListener('install', event => {
  console.log('Custom Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Custom Service Worker activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      // Enable navigation preload
      return self.registration.navigationPreload.enable();
    })
  );
});

self.addEventListener('fetch', event => {
  // Handle navigation requests with proper preload handling
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Wait for preload response
        const preloadResponse = await event.preloadResponse;
        
        if (preloadResponse) {
          console.log('Using preload response for navigation');
          return preloadResponse;
        }

        // Fallback to network request
        console.log('Preload not available, fetching from network');
        return await fetch(event.request);
      } catch (error) {
        console.log('Navigation request failed:', error);
        
        // Try to serve from cache
        const cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Return offline page if available
        return caches.match('/offline.html') || new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })());
  }
  
  // Handle other requests normally
  else if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Cache successful image responses
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open('images-cache').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
    );
  }
});

// Handle background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline form submissions when connection is restored
  console.log('Background sync triggered');
}
