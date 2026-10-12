const CACHE = 'spike-sheet-v44';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  ...['archivo-latin', 'archivo-latin-ext', 'roboto-condensed-latin', 'roboto-condensed-latin-ext', 'roboto-condensed-greek', 'roboto-condensed-greek-ext'].map(f => 'fonts/' + f + '.woff2')];
// The sign-in and sync code (same version as V in index.html). Saved at install, so the first open
// after an update also works without signal. Best effort: a miss here must not stop the install.
const FB = 'https://www.gstatic.com/firebasejs/10.14.1/';
const LIBS = ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => FB + f);
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL).then(() => Promise.all(LIBS.map(u => c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google's sign-in pages (/__/auth/) and Firebase's own files are never touched: a saved or substituted copy breaks the sign-in
  if (url.pathname.startsWith('/__/')) return;
  const same = url.origin === location.origin;
  const staticLib = url.host === 'www.gstatic.com';
  if (same){
    // newest copy from the internet, but never wait more than 2.5 s for it on a weak court-side signal:
    // then the saved copy opens and the download keeps going in the background for next time
    // no-cache: always ask GitHub whether the page changed (a tiny 304 when it has not), so an update
    // reaches the phone on the next open instead of up to 10 minutes later
    // only a good page replaces the saved one: a one-off GitHub error must never become the offline copy
    const net = fetch(req, {cache: 'no-cache'}).then(r => { if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; });
    const saved = () => caches.match(req).then(r => r || caches.match('./'));
    const slow = new Promise(res => setTimeout(res, 2500)).then(saved).then(r => r || net);
    // a GitHub error page is never shown when a saved copy exists
    e.respondWith(Promise.race([net.then(r => r.ok ? r : saved().then(c => c || r)).catch(saved), slow]));
    e.waitUntil(net.catch(() => {}));
  } else if (staticLib){
    // only a good copy is kept: a failed download would otherwise be served from here until the next version
    // (ignoreVary: the copy saved at install was asked for by the worker, not by the page's <link>)
    e.respondWith(caches.match(req, {ignoreVary: true}).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque'){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
