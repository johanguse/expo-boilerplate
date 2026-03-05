# AI Context — Expo Boilerplate

> This file provides context for AI coding assistants working on this project.

## Project Overview

Full-stack React Native boilerplate using:
- **Expo SDK 53** with Expo Router (file-based routing)
- **FastAPI** backend with `fastapi-users` JWT authentication
- **HeroUI Native** component library + **Uniwind** (Tailwind CSS v4)
- **Zustand** state management with **MMKV** persistence
- **RevenueCat** for in-app purchases (optional)

## Architecture

### Auth Flow
```
App Start → initialize() → check MMKV for token → fetch /users/me
  ├─ Token valid → isLogin=true → show (tabs)
  ├─ Token invalid → clear token → isLogin=false → show (auth)
  └─ No token → isLogin=false → show (auth)
```

### Onboarding Flow
```
App Start → check MMKV for ONBOARDING_DONE
  ├─ Not done → redirect to /onboarding → [Welcome → Setup] → mark done → show paywall (if not pro) → redirect to auth
  └─ Done → proceed to auth check
```

### Provider Tree
```
GestureHandlerRootView
  └─ KeyboardProvider
      └─ RevenueCatProvider
          └─ OnboardingProvider
              └─ HeroUINativeProvider
                  └─ ThemeProviderComponent
                      └─ App
```

## Key Files

| File | Purpose |
|------|---------|
| `src/services/api/client.ts` | HTTP client — auto-injects JWT, handles errors |
| `src/services/api/auth.ts` | Auth API calls to FastAPI backend |
| `src/services/zustand/auth.zustand.ts` | Auth state — signIn, signUp, signOut, initialize |
| `src/utils/storage.ts` | MMKV wrapper — token + onboarding persistence |
| `src/config/api.ts` | API base URL from `app.json > expo.extra.apiBaseUrl` |
| `src/contexts/onboarding-context.tsx` | Onboarding state provider (MMKV) |
| `src/contexts/revenuecat-context.tsx` | RevenueCat provider (graceful no-key fallback) |
| `src/app/_layout.tsx` | Root layout — auth init, onboarding redirect, route guards |

## API Integration

The FastAPI backend uses `fastapi-users` with JWT auth:

- **Login**: `POST /api/v1/auth/jwt/login` — `application/x-www-form-urlencoded` with `username` (email) + `password`
- **Register**: `POST /api/v1/auth/register` — JSON `{ email, password, name? }`
- **Forgot Password**: `POST /api/v1/auth/forgot-password` — JSON `{ email }`
- **Current User**: `GET /api/v1/users/me` — Bearer token auth

## CLI Scaffolder

Located in `cli/` with its own `package.json` and `tsconfig.json`:
- Separate Node.js package (ESM)
- Uses Commander.js + @inquirer/prompts
- Feature toggles remove files/deps/providers when features are deselected
- Tokens replace project name, bundle ID, scheme in generated project

## Conventions

- **Path aliases**: `@components/`, `@services/`, `@config/`, `@utils/`, `@contexts/`, `@screens/`, `@hooks/`
- **Styling**: Uniwind className (Tailwind CSS v4 syntax)
- **Components**: HeroUI Native (import from `heroui-native/button`, etc.)
- **Forms**: `@tanstack/react-form` + Zod validation
- **State**: Zustand stores in `src/services/zustand/`
- **Storage**: MMKV via `src/utils/storage.ts` (not AsyncStorage)

## Testing

- **Framework**: Jest + ts-jest
- **Config**: `jest.config.js` with path alias mapping
- **Location**: `__tests__/` directories alongside source files
- **Run**: `yarn test`

## Common Gotchas

1. **Login endpoint expects `username` not `email`** — This is a fastapi-users convention. The API client sends email as the `username` field in form-urlencoded format.
2. **MMKV requires native rebuild** — After first install, run `npx expo prebuild --clean && npx expo run:ios`.
3. **RevenueCat skips init if no API key** — Won't crash in dev; just logs a warning.
4. **CLI has its own node_modules** — Run `npm install` inside `cli/` separately.
5. **Root tsconfig excludes `cli/`** — The CLI has its own tsconfig.json.
