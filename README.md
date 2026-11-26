# Kudazo Fitness

English-first, offline-capable personal fitness PWA at https://fitnessapp.kudazo.nl.

## Run locally

Requires Python 3; no application dependencies or build step.

```
python3 -m http.server 8080
```

Open http://localhost:8080. Tests require Node 22+: `npm test`.

## Features

- Upper/Lower sample adapted from the owner's uploaded workout plan; editable empty Push/Pull/Legs template.
- Workout plan/day editor and exercise library, custom exercises, alternative exercises, rep ranges, unilateral and timed prescriptions, weight conventions, instructions and YouTube links.
- Workout sessions with reorder/do later, partial exercise replacement, set logging, previous results, rest timer, resume and completion history.
- IndexedDB device storage with validated JSON backup export/import. No account, backend or cloud synchronization.
- Standalone install manifest, home-screen icons and offline service-worker cache.
- UI strings in `locales/en.json`; user-authored plan/exercise names are independent of interface language.

## Deployment

GitHub Pages: main branch, repository root. Preserve CNAME `fitnessapp.kudazo.nl`.
Bump the service-worker cache name whenever changing deployed assets. Updates activate after existing app tabs close; do not force reload during an active workout.

## Data and limits

Data stays within the browser origin and device. Export regularly; clearing site data removes it. Cloud sync and TV casting are not implemented. Timer timestamps survive navigation/reopening, but sound/background execution is not guaranteed when the phone locks. YouTube requires internet. Workouts and sets save after changes; the app does not fetch or upload videos. Only one app tab should edit workouts at a time.
