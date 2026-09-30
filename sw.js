const CACHE = 'spike-sheet-v4';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  const staticLib = url.host === 'www.gstatic.com' || url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (same){
    // newest copy from the internet, but never wait more than 2.5 s for it on a weak court-side signal:
    // then the saved copy opens and the download keeps going in the background for next time
    const net = fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; });
    const saved = () => caches.match(req).then(r => r || caches.match('./'));
    const slow = new Promise(res => setTimeout(res, 2500)).then(saved).then(r => r || net);
    e.respondWith(Promise.race([net.catch(saved), slow]));
    e.waitUntil(net.catch(() => {}));
  } else if (staticLib){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
  }
});
