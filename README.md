# Expo Boilerplate

Full-stack React Native boilerplate with **FastAPI backend** integration, **HeroUI Native**, **Uniwind** (Tailwind CSS v4), onboarding flow, and optional in-app purchases. Includes **React Native Firebase** (Crashlytics, etc.), **expo-notifications**, and **react-native-permissions** via config plugins (native code after prebuild).

## Expo Go vs development builds (and Firebase / permissions)

**Expo Go** is a generic app you install from the store. It ships with one fixed set of **precompiled native modules**. It does *not* include this project’s custom native stack (for example **@react-native-firebase/***, **react-native-mmkv**-level native parts, and whatever your `app.json` plugins add after prebuild). Anything that is not in the Expo Go client binary simply cannot run there.

**What actually works** for this boilerplate is a **development build** (a custom app binary that includes *your* native code):

- **Local:** `npx expo prebuild` then `npx expo run:ios` / `npx expo run:android` (or open the `ios` / `android` projects in Xcode / Android Studio).
- **EAS:** `eas build` with a profile that produces an internal/development or production build with your `app.json` and native projects.

In short: **Expo + Firebase (and the permission plugins here) = Expo (prebuild) + native project + `google-services` / iOS plist files + install that build** — not Expo Go.

[Expo: Using Firebase](https://docs.expo.dev/guides/using-firebase/) describes the same idea: add config files, use development builds, and use plugins such as `@react-native-firebase/app` after prebuild.

## Firebase: `google-services.json` and `GoogleService-Info.plist`

This repo is a **base for multiple products**. After you clone and rename the app, wire Firebase so Analytics / Crashlytics / Messaging match **your** bundle ID and package name.

### 1. Create apps in the Firebase console

- Create a project (or use an existing one).
- Add an **iOS** app: use the **same** `bundleIdentifier` as `expo.ios.bundleIdentifier` in `app.json` (e.g. `com.yourco.yourapp`).
- Add an **Android** app: use the **same** value as `expo.android.package` in `app.json` (e.g. `com.yourco.yourapp` — Android `applicationId` must not use hyphens the way a typical iOS bundle can; align with your `app.json`).

### 2. Download config files

| Platform | File | Where it belongs after prebuild |
|----------|------|---------------------------------|
| Android | `google-services.json` | `android/app/google-services.json` (create `android` with `npx expo prebuild` if needed) |
| iOS | `GoogleService-Info.plist` | `ios/YourApp/GoogleService-Info.plist` (path follows your Xcode project; prebuild usually places it under the main app target folder) |

The `@react-native-firebase/app` Expo plugin looks for these during native builds. If you add or change them, a clean prebuild is safest: `npx expo prebuild --clean`.

### 3. `src/config/firebase.ts` (reference only)

`src/config/firebase.ts` documents the usual paths. After each clone or rename, the important part is: **the IDs in Firebase must match `app.json`**, not the filename of this file.

### 4. Reuse on every new project

1. Clone this repo, run **`bun run rename-app`** (see below).
2. Register new iOS + Android apps in Firebase with the **new** bundle ID / package.
3. Download **new** `google-services.json` and `GoogleService-Info.plist` into the **prebuild** `android` / `ios` trees.
4. `npx expo prebuild --clean` and run on a device or simulator with your **development build**.

---

## Rebrand after clone (`scripts/rename-app.ts`)

Set display name, Expo slug, URL scheme, and iOS / Android application IDs. This updates **`app.json`** and **`package.json` only** (so it stays safe and repeatable).

```bash
bun run rename-app -- --name "My Product" --slug my-product --ios com.acme.myproduct --android com.acme.myproduct
```

- **`--name`** — Label under the icon (user-visible).
- **`--slug`** — `expo.slug` and npm `name` in `package.json` (kebab-case).
- **`--scheme`** — Optional deep-link scheme; default: slug with hyphens removed.
- **`--ios`** — iOS `bundleIdentifier` (e.g. `com.company.app`).
- **`--android`** — Android `package` / `applicationId`. If omitted, the script derives it from the iOS id by **removing hyphens in each segment** (same idea as Expo’s Android defaults).

**If you already have `ios/` and `android/`** from an old prebuild, delete them and regenerate, or the old bundle id / application id can remain embedded:

```bash
rm -rf ios android
npx expo prebuild --clean
```

Then add your Firebase config files to the new native projects and build again.

```bash
bun run rename-app -- --help
```

---

## Features

- **Expo Router** — File-based routing with `Stack.Protected` auth guards
- **FastAPI** — JWT auth (login, signup, forgot-password), auto-token management
- **HeroUI Native** — UI components
- **Uniwind** — Tailwind CSS v4 for React Native
- **Onboarding** — Multi-step flow with MMKV persistence
- **RevenueCat** — Paywall and subscriptions (optional)
- **Firebase** — App, Crashlytics, optional Analytics/Perf/Messaging (native build)
- **Permissions** — `expo-notifications` + `react-native-permissions` (native build)
- **CLI scaffolder** — Interactive new project / feature selection
- **TypeScript** — Strict mode, path aliases
- **TanStack Form** — `useForm` + `form.Field` (no react-hook-form)
- **Zustand** — Auth, chat, profile
- **Zod** — Schemas passed to `validators.onSubmit` (standard schema with Zod 4)

## App architecture

Separation follows a **feature-friendly** layout: routing in `app/`, **API and side effects** in `api/` + `stores/` + `lib/`, **UI** under `components/`.

| Layer | Role |
|-------|------|
| **`src/app/`** | Expo Router screens only (auth, tabs, profile, onboarding). No duplicate `screens/` tree. |
| **`src/api/`** | Typed HTTP: `client.ts` (JWT, 401), `auth.ts`, `profile.ts`, `ai.ts`, `query-keys.ts`. |
| **`src/stores/`** | Zustand: session (`auth`), AI chat, profile updates synced with `api`. |
| **`src/lib/`** | Infrastructure: `react-query.tsx` (`ReactQueryProvider` — **mounted in `app/_layout.tsx` outermost**), `storage.ts` (MMKV), `streamClient.ts`, `firebase.ts`, `notifications.ts`. |
| **`src/components/`** | Reusable UI; **`components/form/`** wraps HeroUI with **TanStack Form** field API. |
| **`src/hooks/`** | Cross-cutting hooks (e.g. TanStack Query profile helper, online/focus). |
| **`src/config/`** | `api.ts`, `revenuecat.ts`, `firebase.ts` (path hints for native config files). |
| **`src/contexts/`** | React context: onboarding, RevenueCat. |

### Forms (TanStack Form + Zod)

- Use **`useForm`** from `@tanstack/react-form` with **`validators: { onSubmit: yourZodSchema }`**. Zod 4 is used as a **standard schema**; no extra adapter package is required.
- Render fields with **`<form.Field name="...">{(field) => <FormInput field={field} ... />}</form.Field>`**.
- **`FormInput`** takes a TanStack **`field`** (`AnyFieldApi`) and binds `value` / `onChangeText` / `onBlur` and shows field errors.
- **`FormButton`** takes the **`form` instance** and wires `handleSubmit` + `isSubmitting` to the shared `ActionButton`.

There is no **`react-hook-form`** dependency and no `useAppForm` / `createFormHook` indirection; screens own their `useForm` instance.

## Project structure

```
├── src/
│   ├── app/                     # Expo Router (all screen UI for routes lives here)
│   ├── components/
│   │   ├── form/                # FormInput, FormButton (TanStack Form)
│   │   ├── common/
│   │   ├── chat/
│   │   ├── onboarding/
│   │   └── providers/           # Theme, gesture/keyboard, RevenueCat, onboarding, HeroUI
│   ├── contexts/              # onboarding, revenuecat
│   ├── hooks/                 # useProfileQuery, useOnlineManager, useAppFocusRefetch, …
│   ├── lib/                   # react-query, storage, streamClient, firebase, notifications
│   ├── api/                   # client, auth, profile, ai, query-keys
│   ├── stores/                # zustand: auth, chat, profile
│   ├── config/                # api, revenuecat, firebase (paths)
│   ├── i18n/
│   ├── types/
│   └── utils/
├── scripts/
│   └── rename-app.ts
├── cli/
├── docs/
├── app.json
└── package.json
```

## Quick start

### Using the CLI (scaffold a copy)

```bash
cd cli && npm install && npm run build
node dist/index.js my-app
```

The CLI can prompt for project name, bundle id, package manager, and feature toggles.

### Manual: clone, rename, prebuild

```bash
git clone <repo-url> my-app
cd my-app
bun install
bun run rename-app -- --name "My App" --slug my-app --ios com.me.myapp --android com.me.myapp
# Add google-services.json / GoogleService-Info.plist after prebuild, then:
npx expo prebuild --clean
npx expo run:ios
# or: npx expo run:android
```

### API URL

Set your backend in `app.json`:

```json
"extra": {
  "apiBaseUrl": "http://localhost:8000"
}
```

## Authentication

The app uses a **FastAPI** backend with `fastapi-users` JWT:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/jwt/login` | POST | Login (form: `username`, `password`) |
| `/api/v1/auth/register` | POST | Register (JSON) |
| `/api/v1/auth/forgot-password` | POST | Reset request |
| `/api/v1/users/me` | GET | Current user |

- JWT in MMKV; session restored on launch; 401 triggers sign-out

## Styling (Uniwind)

```tsx
<View className="flex-1 bg-background">
  <Text className="text-2xl font-bold">Hello</Text>
</View>
```

## Testing

```bash
bun test
# or: bun test --coverage
```

- `src/api/__tests__/client.test.ts` — API client
- `src/api/__tests__/auth.test.ts` — Auth API
- `cli/src/__tests__/*.test.ts` — CLI (requires dev deps in `cli/` for some suites)

## CLI scaffolder

```bash
cd cli
npm install && npm run build
node dist/index.js [project-name] [--default] [--yes]
```

## Configuration

| Item | Location |
|------|----------|
| API URL | `app.json` → `expo.extra.apiBaseUrl` |
| RevenueCat | `src/config/revenuecat.ts` |
| Firebase file paths (reference) | `src/config/firebase.ts` |
| Path aliases | `tsconfig.json` → `paths` (`@api`, `@lib`, `@stores`, …) |

## Learn more

- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Firebase in Expo](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)
- [HeroUI Native](https://heroui.com/)
- [Uniwind](https://www.npmjs.com/package/uniwind)
- [FastAPI](https://fastapi.tiangolo.com/)
- [RevenueCat](https://www.revenuecat.com/docs/)

## License

MIT.
