# Kudazo Fitness

English-first personal fitness PWA at https://fitnessapp.kudazo.nl.

## Run locally

No build step is required. Run `npm run dev` (Node 22+) or `python3 -m http.server 8080`.
Tests: `npm test`. Microsoft sign-in is registered for the production root URI only. Additional localhost redirect URIs must be explicitly registered before local live-account testing.

## Features

- Upper/Lower example adapted from the owner's uploaded workout plan; editable empty Push/Pull/Legs template.
- Workout plan/day editor, exercise library, alternatives, rep ranges, unilateral/timed prescriptions, load conventions, notes and YouTube links.
- Focused workout mode: select an exercise, then use its set inputs and rest timer without general navigation. Exercise options contain alternatives, video, notes and prior results.
- Workout reordering, replacement after partially completed sets, resume, completion history and per-exercise history.
- IndexedDB device storage with validated backup export/import and three automatic pre-sync recovery backups.
- Microsoft personal-account sign-in via MSAL Browser and delegated OneDrive app-folder access.
- Offline PWA manifest/cache and remembered Microsoft session where permitted by Microsoft's session policy.
- English UI strings in `locales/en.json`, independent of user-authored names/notes.

## Microsoft registration

Public client ID: `d1835dac-96e0-4789-adfc-4d3f318ff087`.
Personal accounts only; authority `https://login.microsoftonline.com/consumers`.
SPA redirect URI: `https://fitnessapp.kudazo.nl/`.
Delegated Microsoft Graph permissions: `Files.ReadWrite.AppFolder`, `User.Read`.
There is no client secret. The Microsoft SDK manages sign-in and its token cache. Tokens/passwords are excluded from exported backups and sync files. MSAL 4.30.0 is vendored from its official npm package; see `vendor/README.md` and the MIT license. Its redirect flow supports the existing root redirect URI without a v5 redirect-bridge migration.

## OneDrive sync

Each browser installation has a random device ID. Changes to plans, exercises and completed history are stored as records with causal version vectors and deletion tombstones. Each upload uses a separate app-folder filename `fitness-sync-{deviceId}-{sequence}.json`. Different devices never write the same filename. A retry of a completed upload is recognized from the folder listing. Previous revisions are retained for recovery; they consume OneDrive storage and are not currently pruned.

On each sync the app reads the latest revision per device. Independent changes merge automatically. Concurrent edits to the same record, including edit versus deletion, require explicit user choices. The choices become a new causal revision. Completed workouts from different devices retain their own IDs and are merged. Whole plans are conflict units: concurrent edits to different days in the same plan also need a choice.

Fresh unedited default templates yield to existing cloud data. Existing edits are retained and may trigger a conflict choice. A different Microsoft account cannot sync over an already bound local dataset. Active workouts and sound settings remain device-local; an active workout syncs only after completion. Incoming sync waits while a workout or editor is open. Browser Web Locks prevent concurrent writers from separate tabs on supported browsers.

Device writes are atomic for app data and sync metadata. Network/auth failures retain local edits; Reconnect Microsoft can renew consent/session. Cloud snapshots can also be restored via Import backup (as new local changes). Exported backups exclude sync metadata, device identities and tokens.

## Deployment & updates

GitHub Pages: main branch, repository root. Preserve CNAME `fitnessapp.kudazo.nl`.
Bump the service-worker BUILD, all asset version queries and its precache list together. Online navigation refreshes the app shell, while versioned modules keep a release consistent. Updates show a reload button and save the active workout before reloading.

## Limits

GitHub Pages app code is public; Microsoft login protects access to each user's OneDrive data, not the source files. Browser data is not encrypted by this app. Keep backups before clearing site storage. Microsoft may require occasional reauthentication. Live Microsoft/OneDrive consent and phone behavior must be confirmed using the owner's account; automated tests use synthetic fixtures and never contact Microsoft with test tokens. YouTube requires internet. Timer sound is not guaranteed while a device is locked. TV casting is not implemented.
