# AI & developer context — expo-boilerplate

This file is the **single overview** of architecture and conventions for agents and humans working in this repo. Product-specific `README.md` covers setup, rename, and Firebase file placement in more detail.

## Auth

- **Backend:** [FastAPI Users](https://fastapi-users.github.io/fastapi-users/) style API: `POST` login/register, `GET /api/v1/users/me` with **JWT** bearer auth.
- **Client:** Access token in **MMKV** (`@lib/storage`, `StorageKeys.ACCESS_TOKEN`). **Zustand** store: `@stores/auth.zustand` (`useAuthManage`) holds session, `initialize()` on app start, `signOut` on 401.
- **HTTP:** `@api/client` `apiClient` injects `Authorization: Bearer <token>` for all requests except `noAuth: true`.
- There is **no** Better Auth in this app path; the contract is **JWT to FastAPI** (or a compatible Hono stack).

## Folder layout (current)

| Area | Path | Notes |
|------|------|--------|
| Routes (expo-router) | `src/app/` | File-based screens and layouts. |
| UI | `src/components/` | Shared components, providers, forms. |
| Hooks | `src/hooks/` | e.g. `usePermission`, `useNotifications`, query/network helpers. |
| API | `src/api/` | `client.ts`, `auth.ts`, `profile.ts`, `push.ts`, feature modules. |
| App libraries | `src/lib/` | `react-query.tsx`, `storage.ts`, `notifications.ts`, `firebase.ts` — not “React components”. |
| State | `src/stores/` | Zustand (auth, etc.). |
| Config | `src/config/` | `api.ts` (base URL from `expo.extra`), env-shaped constants. |
| i18n | `src/i18n` | import `@i18n` first in root layout (side effects). |

**Removed / do not reintroduce:** `src/services/`, `src/screens/` (legacy Cashory layout). New code uses **`api/`** + **`lib/`** + `app` routes.

## Provider tree (root)

In `src/app/_layout.tsx` (simplified, outermost first):

1. `ReactQueryProvider` (`@lib/react-query`) — **outermost** so the whole app shares TanStack Query.
2. `AppProvider` — HeroUI, theme, onboarding, RevenueCat, keyboard, **push + permission** bootstrap (`PushNotificationsInit`).
3. `AppLayout` — auth gate, `Stack` with `Stack.Protected` for auth vs tabs.

## Forms

**TanStack Form + Zod** only. `FormInput` / `FormButton` in `@components/form/` use the field API. **No** React Hook Form in this project.

## Permissions

- Packages: `react-native-permission-handler` (UX/state machine) + `react-native-permissions` (native engine). Config via Expo plugin in `app.json` and iOS `setup_permissions` / Android manifest as per upstream docs.
- **Hooks** (`@hooks/usePermission.ts`): `useCameraPermission`, `useNotificationPermission` — built on `usePermissionHandler` with the **object** config and `Permissions` from `react-native-permission-handler/rnp`. Web uses a **noop** engine; notifications on native can use `createRNPEngine({ normalizeAndroid: true })` for `POST_NOTIFICATIONS` quirks.
- **Bootstrap:** `PushNotificationsInit` in `AppProvider` calls `useNotificationPermission()` and passes the result to `useNotifications(permission)` so there is a **single** permission state machine (do not double-mount the hook).

## Notifications

- **Remote:** FCM via `@react-native-firebase/messaging`. Foreground: `messaging().onMessage` → local display with **react-native-notify-kit** (`src/lib/notifications.ts`: channels + `displayLocalNotification`).
- **Hook:** `useNotifications(permission)` — registers channels, subscribes to `onMessage` when permission is **granted**, syncs FCM `getToken` to the backend when **signed in** + **granted**; iOS uses `registerDeviceForRemoteMessages()` before `getToken`. **Web:** no-ops.
- **Backend:** `POST /api/v1/users/me/push-token` with JSON `{ "token": "<fcm>" }` — **204** on success. Implemented in **fastapi-boilerplate-backend** and **bun-hono-backend-boiplerplate**. Token is **not** returned on `GET /users/me` (treat as secret).
- **iOS:** APNs key in Firebase, Xcode capabilities **Push Notifications** + **Background Modes → Remote notifications**, then dev build (not Expo Go). See `README.md` for plist / `google-services` placement.

## Firebase (`src/lib/firebase.ts`)

- **`initFirebase()`** at module load in `_layout` (after `@i18n`): Crashlytics collection **off in `__DEV__`**, on iOS/Android only.
- **Crashlytics:** `logError(error, context?)`, **Performance:** `traceHttpRequest(url, method)` (returns metric; caller stops after response) — **web** gets a no-op metric.
- **Analytics:** `track.screen`, `track.event`, `track.login`, `track.signUp` — no-op on **web**.
- **Config files:** per-app `GoogleService-Info.plist` and `google-services.json` after Firebase Console setup (not committed in the generic boilerplate). See `README.md`.

## Metro

- `metro.config.js`: **`wrapWithReanimatedMetroConfig(withUniwindConfig(...))`** — Reanimated 4.2+ symbolicator **outside** Uniwind (not `withReanimatedConfig`).

## Native / dev builds

Firebase, MMKV, push, and some permission flows require a **development build** (`expo run:ios` / `expo run:android` or EAS), **not** Expo Go. See `README.md` for details.

## Related docs

- `docs/cashory-alignment-plan.md` — historical migration plan from the Cashory app layout.
- `README.md` — install, `rename-app`, Firebase files, EAS, scripts.
