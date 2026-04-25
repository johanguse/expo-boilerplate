# Cashory Alignment Plan

Upgrade expo-boilerplate to match cashory's architecture and add production-grade native capabilities.

**Reference app**: https://github.com/FullStack-Flow/cashory/tree/main/apps/native  
**Backend**: `fastapi-boilerplate-backend` — FastAPI Users + JWT (HS256/RS256), access token 30min, refresh 7 days

---

## Goals

- Adopt cashory's **folder structure** (`lib/`, flat `contexts/`, no `screens/`, no `services/`)
- Use **`@tanstack/react-form`** exclusively — remove `react-hook-form`
- Add **Permissions** via `react-native-permission-handler` (state-machine wrapper)
- Add **Notifications** via `react-native-notify-kit` (maintained Notifee fork) + Firebase Messaging
- Add **Firebase**: Crashlytics, Performance Monitoring, Analytics
- Keep our packages: `react-native-modern-shimmer`, `react-native-nano-icons`, MMKV, RevenueCat, i18n, Zustand

> **No better-auth**: Backend is FastAPI Users with JWT. Auth stays as-is (Zustand + MMKV token).  
> **Keep zustand**: Still needed for auth, chat, profile state.

---

## Phase 1 — Dependencies

### Add

```bash
# Permissions
bun add react-native-permission-handler react-native-permissions

# Notifications (local) — maintained Notifee fork (New Arch only)
bun add react-native-notify-kit

# Firebase suite (install individually, @react-native-firebase/app is the base)
bun add @react-native-firebase/app
bun add @react-native-firebase/crashlytics
bun add @react-native-firebase/perf
bun add @react-native-firebase/analytics
bun add @react-native-firebase/messaging   # push notifications from server

# Extras from cashory
bun add date-fns
npx expo install expo-notifications        # for Expo push token / APNs bridge
npx expo install expo-secure-store         # useful for secure token storage later
```

### Remove

```bash
bun remove react-hook-form
```

> `zustand` stays — used for auth, chat, profile state with the FastAPI JWT backend.

### Update `app.json` plugins

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-notifications",
  ["expo-splash-screen", { ... }],
  ["react-native-nano-icons", { ... }],
  "@react-native-firebase/app",
  "@react-native-firebase/crashlytics",
  [
    "react-native-permissions",
    {
      "iosPermissions": ["Notifications", "Camera", "PhotoLibrary", "Microphone"]
    }
  ]
]
```

---

## Phase 2 — Folder Restructure

### Target structure (mirrors cashory, keeps `src/` prefix)

```
src/
├── app/                        # Expo Router — unchanged shape
│   ├── _layout.tsx             # UPDATE: cleaner provider tree
│   ├── (auth)/
│   │   ├── login.tsx           # REWRITE: TanStack Form
│   │   ├── signup.tsx          # REWRITE: TanStack Form
│   │   └── forgot-password.tsx # REWRITE: TanStack Form
│   ├── (tabs)/
│   ├── onboarding/
│   └── profile/
│       └── edit.tsx            # REWRITE: TanStack Form
│
├── components/
│   ├── chat/
│   ├── common/
│   ├── form/                   # REWRITE: FormInput/FormButton for TanStack Form API
│   ├── onboarding/
│   └── providers/
│       └── index.tsx           # UPDATE: extract ReactQueryProvider from here
│
├── contexts/                   # KEEP — onboarding-context, revenuecat-context
│
├── hooks/                      # KEEP + ADD notification/permission hooks
│   ├── useAppFocusRefetch.ts
│   ├── useRefreshOnFocus.ts
│   ├── useOnlineManager.ts
│   ├── usePermission.ts        # NEW: wraps react-native-permission-handler
│   └── useNotifications.ts     # NEW: push token registration, notify-kit setup
│
├── lib/                        # NEW — cashory pattern for infrastructure
│   ├── react-query.tsx         # MOVE from src/services/query/queryClient.ts
│   ├── firebase.ts             # NEW: Firebase app init + Crashlytics setup
│   ├── notifications.ts        # NEW: react-native-notify-kit channel config
│   └── storage.ts              # MOVE from src/utils/storage.ts
│
├── api/                        # RENAME from src/services/api/
│   ├── client.ts               # KEEP: JWT Bearer injection, 401 → signOut
│   ├── auth.ts                 # KEEP: login, register, forgotPassword, me
│   ├── profile.ts              # KEEP: profile PATCH + avatar
│   └── query-keys.ts           # MOVE from src/services/query/keys.ts
│
├── types/                      # KEEP
├── i18n/                       # KEEP
├── config/
│   ├── revenuecat.ts           # KEEP
│   └── firebase.ts             # NEW: google-services.json / GoogleService-Info.plist paths
│
└── utils/
    └── helper.ts               # KEEP
```

### Folders to DELETE after migration

| Delete | Reason |
|--------|--------|
| `src/services/` | Split into `src/lib/` + `src/api/` |
| `src/screens/` | All screen logic lives in `src/app/` — screens/ is a duplicate |

---

## Phase 3 — TanStack Form Migration

Replace all `react-hook-form` usage with `@tanstack/react-form` + Zod.

### Updated form component API

**`src/components/form/FormInput.tsx`** — rewrite to accept TanStack field props:

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";

type Props = {
  field: AnyFieldApi;
  label: string;
  // ... other TextInput props
};

export function FormInput({ field, label, ...rest }: Props) {
  return (
    <>
      <TextInput
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        {...rest}
      />
      {field.state.meta.errors.map((e) => (
        <Text key={e}>{e}</Text>
      ))}
    </>
  );
}
```

### Zod + TanStack Form pattern

```ts
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: {
    onSubmit: loginSchema,
  },
  onSubmit: async ({ value }) => {
    await authStore.signIn(value.email, value.password);
  },
});
```

### Screens to migrate

| Screen | Status |
|--------|--------|
| `(auth)/login.tsx` | Replace `useForm` (rhf) |
| `(auth)/signup.tsx` | Replace `useForm` (rhf) |
| `(auth)/forgot-password.tsx` | Replace `useForm` (rhf) |
| `profile/edit.tsx` | Replace `useForm` (rhf) |

---

## Phase 4 — React Query Provider (cashory pattern)

Create `src/lib/react-query.tsx` as an exported provider component:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Wire into `src/app/_layout.tsx` as the outermost provider (matching cashory). **Current wiring:** `RootLayout` returns `ReactQueryProvider` → `AppProvider` (gesture, keyboard, RevenueCat, onboarding, HeroUI, theme) → `AppLayout` / `<Stack />`.

```
ReactQueryProvider        ← _layout.tsx
  AppProvider            ← components/providers (no QueryClient here)
    GestureHandlerRootView
      KeyboardProvider
        RevenueCatProvider
          OnboardingProvider
            HeroUINativeProvider
              ThemeProvider
                <Stack />  ← AppLayout
```

---

## Phase 5 — Permissions

### Package

`react-native-permission-handler` — a state-machine wrapper over `react-native-permissions`. It handles the full permission lifecycle: pre-prompt → request → granted / blocked / denied with 12 distinct states. NOT a replacement for the underlying engine; both must be installed.

### Hook: `src/hooks/usePermission.ts`

Use `usePermissionHandler` with a **config object** and cross-platform `Permissions` from
`react-native-permission-handler/rnp` (not the raw `react-native-permissions` map, which
does not expose a stable iOS `NOTIFICATIONS` constant in all library versions). Web uses
`createNoopEngine` so hooks do not require native RNP. Notifications on Android use
`createRNPEngine({ normalizeAndroid: true })` for POST_NOTIFICATIONS edge cases.

```ts
import { usePermissionHandler } from "react-native-permission-handler";
import { createRNPEngine, Permissions } from "react-native-permission-handler/rnp";
import { createNoopEngine } from "react-native-permission-handler/noop";
import { Platform } from "react-native";

const webEngine = createNoopEngine("unavailable");
const notificationEngine = createRNPEngine({ normalizeAndroid: true });

export function useCameraPermission(options = {}) {
  return usePermissionHandler({
    permission: Permissions.CAMERA,
    autoCheck: true,
    ...options,
    engine: Platform.OS === "web" ? webEngine : options.engine,
  });
}

export function useNotificationPermission(options = {}) {
  return usePermissionHandler({
    permission: Permissions.NOTIFICATIONS,
    autoCheck: true,
    recheckOnForeground: true,
    ...options,
    engine: Platform.OS === "web" ? webEngine : (options.engine ?? notificationEngine),
  });
}
```

### Declarative usage (PermissionGate)

```tsx
import { PermissionGate } from "react-native-permission-handler";

<PermissionGate
  permission={PERMISSIONS.IOS.CAMERA}
  renderGranted={() => <Camera />}
  renderDenied={() => <RequestCameraAccess />}
/>
```

### iOS Privacy Manifest

`react-native-permissions` requires declaring usage descriptions in `Info.plist` (auto-handled via the expo plugin when you list `iosPermissions` in `app.json`).

---

## Phase 6 — Notifications

### Architecture

```
Push flow (remote):
  Server → FCM/APNs → @react-native-firebase/messaging (receive) → react-native-notify-kit (display)

Local flow:
  App code → react-native-notify-kit (schedule/display)
```

### `src/lib/notifications.ts` — channel setup

```ts
import notifee, { AndroidImportance } from "react-native-notify-kit";

export async function setupNotificationChannels() {
  // Android requires channels
  await notifee.createChannel({
    id: "default",
    name: "General",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "alerts",
    name: "Alerts",
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
}

export async function displayLocalNotification(title: string, body: string) {
  await notifee.displayNotification({
    title,
    body,
    android: { channelId: "default", pressAction: { id: "default" } },
  });
}
```

### `src/hooks/useNotifications.ts`

```ts
import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import notifee from "react-native-notify-kit";
import { setupNotificationChannels, displayLocalNotification } from "@lib/notifications";

export function useNotifications() {
  useEffect(() => {
    setupNotificationChannels();

    // Request FCM token and send to backend
    messaging().getToken().then((token) => {
      // POST token to /api/v1/users/me/push-token (add this endpoint to FastAPI)
    });

    // Foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      await displayLocalNotification(
        remoteMessage.notification?.title ?? "",
        remoteMessage.notification?.body ?? ""
      );
    });

    return unsubscribe;
  }, []);
}
```

Call `useNotifications()` inside the root providers component after permission is granted.

### iOS: APNs + Xcode setup

Firebase Messaging on iOS requires:
1. APNs auth key or certificate in Firebase Console
2. Background Modes capability: "Remote notifications"
3. Push Notifications capability
These are configured in Xcode after `expo prebuild`.

---

## Phase 7 — Firebase (Crashlytics, Performance, Analytics)

### `src/lib/firebase.ts` — initialization + Crashlytics

```ts
import crashlytics from "@react-native-firebase/crashlytics";
import perf from "@react-native-firebase/perf";

export function initFirebase() {
  // Enable Crashlytics collection (disable in dev)
  crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
}

export function logError(error: Error, context?: Record<string, string>) {
  if (context) {
    Object.entries(context).forEach(([k, v]) => crashlytics().setAttribute(k, v));
  }
  crashlytics().recordError(error);
}

export async function traceHttpRequest(url: string, method: string) {
  const metric = await perf().newHttpMetric(url, method as any);
  await metric.start();
  return metric; // caller calls metric.stop() after response
}
```

Call `initFirebase()` at the top of `src/app/_layout.tsx` (before providers).

### Analytics

```ts
import analytics from "@react-native-firebase/analytics";

export const track = {
  screen: (screenName: string) =>
    analytics().logScreenView({ screen_name: screenName, screen_class: screenName }),
  event: (name: string, params?: Record<string, any>) =>
    analytics().logEvent(name, params),
  login: (method: string) => analytics().logLogin({ method }),
  signUp: (method: string) => analytics().logSignUp({ method }),
};
```

### Native setup (after packages installed)

1. Create a Firebase project at https://console.firebase.google.com
2. Add iOS app (bundle ID from `app.json`) → download `GoogleService-Info.plist` → place in `ios/`
3. Add Android app (package from `app.json`) → download `google-services.json` → place in `android/app/`
4. Run `expo prebuild --clean` + native build (Firebase SDKs are native, not Expo Go compatible)
5. Enable Crashlytics in Firebase Console
6. The `@react-native-firebase/app` expo plugin auto-links native SDKs

---

## Phase 8 — tsconfig Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@assets/*": ["./assets/*"],
      "@types/*": ["./src/types/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@lib/*": ["./src/lib/*"],
      "@api/*": ["./src/api/*"],
      "@contexts/*": ["./src/contexts/*"],
      "@config/*": ["./src/config/*"],
      "@i18n": ["./src/i18n"],
      "@i18n/*": ["./src/i18n/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

Remove stale aliases: `@services/*`, `@screens/*`, `@query/*`.

---

## Phase 9 — metro.config.js

Add `wrapWithReanimatedMetroConfig` from `react-native-reanimated/metro-config` (reanimated
4.2+ — wraps symbolicator; there is no `withReanimatedConfig` in this version). Outermost
wrapper is Reanimated, inner is Uniwind (same as cashory’s nesting intent):

```js
const { getDefaultConfig } = require("expo/metro-config");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

module.exports = wrapWithReanimatedMetroConfig(
  withUniwindConfig(config, { cssEntryFile: "./global.css" /* + dtsFile, etc. */ })
);
```

---

## Phase 10 — Backend: Push Token Endpoint

Add to `fastapi-boilerplate-backend`:

```python
# src/auth/routes.py (or users.py)
@router.post("/users/me/push-token")
async def update_push_token(
    token: str,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    user.push_token = token  # add push_token column to User model
    await db.commit()
```

This lets the server target individual devices for push notifications via FCM.

---

## Phase 11 — Documentation Update

`docs/ai-context.md` is the canonical AI/developer overview: auth (JWT, Zustand, MMKV, `apiClient`), folder map (no `services/` / `screens/`), provider order, TanStack Form + Zod, Permissions, Notifications, Firebase, Metro, dev builds vs Expo Go, and push-token backends.

---

## Execution TODO

### Phase 1 — Dependencies
- [x] `bun add react-native-permission-handler react-native-permissions`
- [x] `bun add react-native-notify-kit`
- [x] `bun add @react-native-firebase/app @react-native-firebase/crashlytics @react-native-firebase/perf @react-native-firebase/analytics @react-native-firebase/messaging`
- [x] `bun add date-fns`
- [x] `npx expo install expo-notifications expo-secure-store`
- [x] `bun remove react-hook-form` (no RHF in project; stack uses TanStack Form only)
- [x] Update `app.json` plugins (secure-store, notifications, firebase/app, firebase/crashlytics, react-native-permissions with iosPermissions)

### Phase 2 — Folder Restructure
- [x] Create `src/lib/` with `react-query.tsx`, `firebase.ts`, `notifications.ts`, `storage.ts`
- [x] Create `src/api/` — move/update files from `src/services/api/`
- [x] Move `src/services/query/keys.ts` → `src/api/query-keys.ts`
- [x] Move `src/utils/storage.ts` → `src/lib/storage.ts`
- [x] Delete `src/services/`
- [x] Delete `src/screens/`

### Phase 3 — TanStack Form
- [x] Rewrite `src/components/form/FormInput.tsx` for TanStack Form field API
- [x] Rewrite `src/components/form/FormButton.tsx`
- [x] Migrate `(auth)/login.tsx`
- [x] Migrate `(auth)/signup.tsx`
- [x] Migrate `(auth)/forgot-password.tsx`
- [x] Migrate `profile/edit.tsx` (and `profile/change-password.tsx` — same pattern)

### Phase 4 — React Query Provider
- [x] Create `src/lib/react-query.tsx` with `ReactQueryProvider`
- [x] Update `src/app/_layout.tsx` provider tree (outermost: `ReactQueryProvider` → `AppProvider` → `AppLayout` / `Stack`)

### Phase 5 — Permissions
- [x] Create `src/hooks/usePermission.ts`
- [x] Wire `useNotificationPermission()` into notification setup flow

### Phase 6 — Notifications
- [x] Create `src/lib/notifications.ts` (channel setup, displayLocalNotification)
- [x] Create `src/hooks/useNotifications.ts` (FCM token, foreground handler)
- [x] Wire `useNotifications()` into root providers
- [x] Document APNs/Xcode steps in ai-context.md

### Phase 7 — Firebase
- [x] Create `src/lib/firebase.ts` (initFirebase, logError, traceHttpRequest)
- [x] Create `analytics` helpers in `src/lib/firebase.ts`
- [x] Call `initFirebase()` in `_layout.tsx`
- [ ] Add `google-services.json` + `GoogleService-Info.plist` (from Firebase Console — per-project; not committed in boilerplate)

### Phase 8 — tsconfig
- [x] Update `tsconfig.json` paths (`@/`, `@lib/*`, `@api/*`, `@stores/*`, etc.)

### Phase 9 — metro.config.js
- [x] Add `wrapWithReanimatedMetroConfig` (reanimated 4.2+ metro symbolicator)

### Phase 10 — Backend
- [x] Add `push_token` column to User model in `fastapi-boilerplate-backend` + Alembic merge migration `merge_add_push_token`
- [x] Add `POST /api/v1/users/me/push-token` (JSON `{ "token": "..." }`, `204 No Content`) in FastAPI
- [x] Add `push_token` on `users` in `bun-hono-backend-boiplerplate` (Drizzle `0001_*` migration) + `POST /api/v1/users/me/push-token` (`204`)

### Phase 11 — Docs
- [x] Rewrite `docs/ai-context.md`

---

## What We Keep (Unchanged)

| Package | Why |
|---------|-----|
| `zustand` | Auth, chat, profile state — JWT backend doesn't change this |
| `react-native-modern-shimmer` | Loading UX |
| `react-native-nano-icons` | Icon system with Expo plugin |
| `react-native-mmkv` | Token, onboarding, theme, chat persistence |
| `expo-localization` + `i18next` | i18n — boilerplate differentiator |
| `react-native-purchases` | RevenueCat (optional) |
| `@legendapp/list` | Optimised list rendering |
| `@gorhom/bottom-sheet` | Bottom sheets |
| `heroui-native` | UI component library |
| `uniwind` | Tailwind CSS v4 |

---

## Notes

- **Firebase needs native build**: Not Expo Go compatible. Always test Firebase features via `expo run:ios` / `expo run:android` or a dev client.
- **react-native-notify-kit is New Arch only**: Already fine — `newArchEnabled: true` in `app.json`.
- **react-native-permission-handler peer dep**: It wraps `react-native-permissions`. Both packages are required.
- **FCM token → backend**: The `push_token` endpoint needs to be added to `fastapi-boilerplate-backend` (Phase 10).
- **Crashlytics in dev**: `setCrashlyticsCollectionEnabled(!__DEV__)` prevents dev noise in the Firebase Console.
- **`expo-secure-store`**: Added now for future use (OAuth tokens, sensitive preferences) even if not immediately critical.
- **Zod v4**: Already installed. TanStack Form uses `@tanstack/zod-form-adapter` for Zod integration — add if needed.
