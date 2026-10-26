const CACHE_NAME = 'renk-kirlugu-pwa-v1';
const ASSETS = [
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// Yükleme aşamasında dosyaları önbelleğe al
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Çevrimdışı Cache-First Stratejisi
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});