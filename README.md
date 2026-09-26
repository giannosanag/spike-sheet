# Spike Sheet

Tap-to-count volleyball stats for one player: points, errors, time on court, +/-, who passed,
per set and per season. Works on any phone browser; add it to the home screen to use it like an app.

- App: a single `index.html` (no build step), hosted on GitHub Pages.
- Data: Firebase Firestore under `users/<uid>/`, behind Google sign-in. Rules in `firestore.rules`
  allow each account to read and write only its own data. Nothing personal is stored in this repo.
- Offline: taps are kept on the phone and upload when there is signal (`sw.js` caches the app).
