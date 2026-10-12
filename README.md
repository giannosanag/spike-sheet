# Spike Sheet

Tap-to-count volleyball stats for one player or a whole team: points, errors, time on court, +/-, who passed,
per set and per season. Works on any phone browser; add it to the home screen to use it like an app.

- App: a single `index.html` (no build step), at https://spikesheet.web.app (Firebase Hosting, project
  spike-sheet-theo). The old addresses (GitHub Pages, spike-sheet-theo.firebaseapp.com) send phones there,
  except a phone that still holds matches not saved to an account.
- Data: Firebase Firestore under `users/<uid>/`, behind Google sign-in. Rules in `firestore.rules`
  allow each account to read and write only its own data; the app's owner may read every account
  (the admin page, Player tab). A live score link (`live/<code>`) holds two team names and the score,
  readable by anyone with the link until it ends. Nothing personal is stored in this repo.
- Offline: taps are kept on the phone and upload when there is signal (`sw.js` caches the app).

## Releasing

1. Bump `APP_VERSION` in `index.html` and `CACHE` in `sw.js` to the same number.
2. Test copy first, https://spikesheet-test.web.app (same accounts and data as the app; test with a test account):
   `firebase deploy --only hosting:spikesheet-test`
3. When it works there, the app, the old Firebase address and the database rules:
   `firebase deploy --only hosting:spikesheet,hosting:spike-sheet-theo,firestore:rules`
4. Push to GitHub (the GitHub Pages address serves the same files).
