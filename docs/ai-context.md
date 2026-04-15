# AI Context — Expo Boilerplate

> This file provides context for AI coding assistants working on this project.

## Project Overview

Full-stack React Native boilerplate using:
- **Expo SDK 55** with Expo Router (file-based routing)
- **FastAPI** backend (or Bun/Hono alternative) with JWT authentication
- **HeroUI Native** component library + **Uniwind** (Tailwind CSS v4)
- **Zustand** state management with **MMKV** persistence
- **RevenueCat** for in-app purchases (optional)
- **AI Chat** via streaming SSE from OpenRouter/Claude

## Architecture

### Auth Flow
```
App Start → authStore.initialize()
  → setUnauthorizedHandler(signOut)    ← auto-logout on 401
  → check MMKV for token → fetch /users/me
  ├─ Token valid → isLogin=true → show (tabs)
  ├─ Token invalid → clear token → isLogin=false → show (auth)
  └─ No token → isLogin=false → show (auth)
```

### Chat Flow
```
User sends message → chatStore.sendMessage(text)
  → append userMessage + empty assistantMessage to state
  → streamChat(history) → streamFetch("/chat/stream", …)
  → async generator yields plain-text chunks
  → each chunk appended to assistantMessage content in real-time
  → isStreaming=false when done
```

### Onboarding Flow
```
App Start → check MMKV for ONBOARDING_DONE
  ├─ Not done → /onboarding → [Welcome → Setup] → mark done → (auth)
  └─ Done → auth check
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
| `src/services/api/client.ts` | HTTP client — auto-injects JWT, 401 → signOut callback |
| `src/services/streamClient.ts` | SSE streaming via fetch + ReadableStream |
| `src/services/api/auth.ts` | Auth API calls (login, register, forgot password, me) |
| `src/services/api/profile.ts` | Profile PATCH + avatar upload/delete |
| `src/services/api/ai.ts` | `streamChat()` wrapper for `/chat/stream` |
| `src/services/zustand/auth.zustand.ts` | Auth state — signIn, signUp, signOut, initialize, setUser |
| `src/services/zustand/chat.zustand.ts` | Chat state — messages, isStreaming, sendMessage, clearHistory |
| `src/services/zustand/profile.zustand.ts` | Profile update + avatar state |
| `src/utils/storage.ts` | MMKV wrapper — token, onboarding, theme, chat persistence |
| `src/config/api.ts` | API base URL from `app.json > expo.extra.apiBaseUrl` |
| `src/contexts/onboarding-context.tsx` | Onboarding state (MMKV) |
| `src/contexts/revenuecat-context.tsx` | RevenueCat provider (graceful no-key fallback) |
| `src/app/_layout.tsx` | Root layout — auth init, onboarding redirect, route guards |

## Route Structure

```
app/
├── _layout.tsx                ← root stack (onboarding / auth / tabs / profile)
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── (tabs)/
│   ├── index.tsx              ← Home
│   ├── chat.tsx               ← AI Chat
│   ├── profile.tsx            ← Profile
│   └── settings.tsx           ← Settings
├── onboarding/
│   ├── index.tsx              ← Welcome slide
│   └── setup.tsx              ← Stack features slide
└── profile/
    └── edit.tsx               ← Edit Profile (modal-style)
```

## API Endpoints

### Authentication (FastAPI defaults)
| Method | Endpoint | Content-Type | Notes |
|--------|----------|--------------|-------|
| POST | `/api/v1/auth/jwt/login` | `application/x-www-form-urlencoded` | `username` field = email |
| POST | `/api/v1/auth/register` | JSON | `{ email, password, name? }` |
| POST | `/api/v1/auth/forgot-password` | JSON | `{ email }` |
| GET  | `/api/v1/users/me` | — | Bearer token |
| PATCH | `/api/v1/users/me` | JSON | Profile fields |
| POST | `/api/v1/users/profile/image` | multipart | Avatar upload |
| DELETE | `/api/v1/users/profile/image` | — | Delete avatar |
| POST | `/api/v1/chat/stream` | JSON | `{ messages: [{role, content}] }` → text/plain stream |

### Hono Login Difference
Hono's `/auth/jwt/login` accepts JSON `{ email, password }` (not form-encoded).
Update `loginAPI` in `auth.ts` when using the Hono backend.

## Conventions

- **Path aliases**: `@components/`, `@services/`, `@config/`, `@utils/`, `@contexts/`, `@screens/`, `@hooks/`
- **Styling**: Uniwind className (Tailwind CSS v4 syntax)
- **Components**: HeroUI Native (import from `heroui-native/button`, etc.)
- **Forms**: `@tanstack/react-form` + Zod validation
- **State**: Zustand stores in `src/services/zustand/`
- **Storage**: MMKV via `src/utils/storage.ts` (not AsyncStorage)
- **Streaming**: `streamFetch()` from `src/services/streamClient.ts` (requires RN new arch)

## Common Gotchas

1. **Login form-encoded**: FastAPI login uses `username` field (email value) with `application/x-www-form-urlencoded`.
2. **MMKV requires native rebuild**: After first install, run `expo prebuild --clean && expo run:ios`.
3. **RevenueCat skips init if no API key** — won't crash in dev; logs a warning.
4. **Streaming requires new arch**: `newArchEnabled: true` in app.json (already set).
5. **401 auto-logout**: Any 401 response triggers `signOut()` via the `setUnauthorizedHandler` callback registered in `authStore.initialize()`.
6. **CLI has its own node_modules**: Run `npm install` inside `cli/` separately.
