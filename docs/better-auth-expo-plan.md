# Plan: Better Auth on Expo (with this boilerplate)

This document is a **migration and architecture plan** for adopting [Better Auth](https://www.better-auth.com/) in the **expo-boilerplate** app. It does not change code by itself; use it to sequence work and pick a backend strategy.

## Current state (expo-boilerplate)

- **Client:** JWT in **MMKV** (`@lib/storage`), session in **Zustand** (`@stores/auth.zustand`), HTTP via `@api/client` (Bearer on each request).
- **Backend assumed in docs:** **FastAPI Users**-style API (`/api/v1/auth/jwt/login`, `/api/v1/users/me`, etc.).
- **Not installed:** `better-auth`, `@better-auth/expo` (see `package.json`).

Sticking with the above is **valid** and matches many mobile + FastAPI stacks. Better Auth is an **optional** path if you want its session model, plugins, and the official [Expo client](https://github.com/better-auth/better-auth/tree/main/packages/expo).

## What Better Auth needs on the client (Expo)

Per the [Better Auth Expo package](https://github.com/better-auth/better-auth/tree/main/packages/expo):

1. Install **`better-auth`**, **`@better-auth/expo`**, and **`expo-secure-store`** (already a dependency in this project).
2. On the **server:** Better Auth instance with the **`expo()`** [server plugin](https://github.com/better-auth/better-auth/tree/main/packages/expo#configure-the-better-auth-backend) and `trustedOrigins` including your app’s **URL scheme** (e.g. `myapp://`).
3. In the app: `createAuthClient` from `better-auth/react` (or the pattern in the Expo README) with the **`expoClient`** plugin — **scheme**, **storage** (`expo-secure-store`), **storagePrefix**, and **`baseURL`** pointing at the **Better Auth base URL** (the server that exposes Better Auth routes).

The Expo app does **not** talk “FastAPI Users JSON login” the same way as today; it follows Better Auth’s **session/cookie/secure** flows as implemented by the client + server. Any **API calls to your own REST** (e.g. FastAPI) would still need a **valid session or token** that your API understands.

## Backend options (choose one)

### A. Bun + Hono (bun-hono-backend-boiplerplate) — *native* Better Auth

The repo already depends on **`better-auth`** and has `src/lib/auth.ts` with `betterAuth({ ... drizzleAdapter ... })`, but the **Hono app does not yet mount** the Better Auth HTTP handler in a way that exposes the full Better Auth API to clients.

**Plan for A:**

1. Mount Better Auth on Hono (see Better Auth **Hono** / framework integration in their docs) so routes like `/api/auth/*` (or the path your `baseURL` expects) are served by **`auth.handler`**.
2. Add the **`expo()`** server plugin and configure **`trustedOrigins`** / `baseURL` / secrets to match your Expo **scheme** and production URLs.
3. Run DB migrations for Better Auth tables if not already applied (`@better-auth/cli` or Drizzle, per their docs).
4. Point **`baseURL` in the Expo `authClient`**** at this server (e.g. `https://api.example.com`).

**Pros:** One stack, official Expo client, full Better Auth feature set.  
**Cons:** You must complete the **server wiring**; existing custom Hono auth routes may need to be merged or replaced carefully.

### B. FastAPI (fastapi-boilerplate-backend) — *compat* layer, not a Node Better Auth server

`docs/AUTH-SPECIFICATION.md` in the FastAPI repo describes a **custom compatibility layer** so a **browser-oriented** Better Auth **client** can talk to **FastAPI Users** — *not* a second Node process running the real Better Auth server.

**Plan for B:**

1. Re-read `docs/AUTH-SPECIFICATION.md` and list every route and cookie/session behavior it implements.
2. Compare with what **`@better-auth/expo`** actually calls (mobile may differ from web: storage, deep links, no browser cookies in the same way).
3. **Spike:** minimal Expo app or integration test: sign-in + session with **`authClient` + `expoClient`** against your deployed FastAPI compat API.
4. If gaps exist, either extend the FastAPI compat layer or **abandon B** in favor of **A** for mobile.

**Pros:** Keep FastAPI as the only backend if compat proves sufficient.  
**Cons:** **No guarantee** the Expo client works without code changes; may be **higher risk** than A.

### C. Two services

Better Auth on **Node/Bun** (dedicated `baseURL`) for auth only, and **FastAPI** for business APIs, with tokens or service-to-service trust between them. More moving parts; only if you have a clear split.

## Proposed migration phases (Expo app)

Order can be adjusted; do **not** ship half-migrated production auth.

1. **Decide backend path** (A, B, or C) and document the **single `baseURL`** the app will use for Better Auth.
2. **Backend ready:** Expose a working Better Auth (or proven compat) endpoint set; test with **curl** or the Better Auth **web** client first.
3. **Expo dependencies:** add `better-auth` and `@better-auth/expo` (use **bun** in this project: `bun add better-auth @better-auth/expo`).
4. **New auth module:** e.g. `src/lib/auth-client.ts` (or `src/lib/better-auth.ts`) exporting `createAuthClient` + `expoClient` as in the [Expo README](https://github.com/better-auth/better-auth/tree/main/packages/expo), reading **`baseURL`** from `expo-constants` / `app.json` `extra` if desired.
5. **Replace call sites:** Login / register / logout screens move from `loginAPI` / `registerAPI` to **`authClient.signIn` / `signUp` / `signOut`** (or the documented API). **Remove or bypass** duplicate token storage in MMKV for the same purpose if the client manages session storage.
6. **Zustand / `apiClient`:** Either (i) feed `apiClient` a token/session from `authClient` after each sign-in, or (ii) use whatever cookie/session header pattern your FastAPI or Hono API expects. **Unify 401** handling with one code path.
7. **Regressions:** Re-test **RevenueCat user id**, **push token** registration, and **onboarding** flows so they run **after** session is valid.
8. **Docs:** Update `README.md` and `docs/ai-context.md` to say “Better Auth + Expo” when migration is done.

## Risks and checks

- **Expo Go vs dev build:** Native modules and secure store already push you toward **dev builds**; Better Auth does not change that.
- **Scheme:** `app.json` / `expo.scheme` must match `expoClient` and server `trustedOrigins`.
- **CORS / origins:** Server must trust your mobile scheme and any web dev URLs you use.
- **Do not** mix old JWT-in-MMKV and new session flows for the same user without a clear cutover.

## References

- [Better Auth – Expo package (GitHub)](https://github.com/better-auth/better-auth/tree/main/packages/expo) — install, server `expo()` plugin, `expoClient` example.
- [Better Auth – Expo integration (site docs)](https://www.better-auth.com/docs/integrations/expo) — if available, prefer the current official URL.
- FastAPI: `fastapi-boilerplate-backend/docs/AUTH-SPECIFICATION.md` (compat layer scope).
- In-repo context: `docs/ai-context.md` (current JWT architecture).

## Summary

| Question | Answer |
|----------|--------|
| **Can Expo use Better Auth?** | **Yes** — via `better-auth` + `@better-auth/expo` and a **proper** Better Auth (or proven compat) backend. |
| **Does this repo use it today?** | **No** — still JWT + MMKV + Zustand. |
| **Fastest path to “real” Better Auth?** | **Wire Better Auth on Bun/Hono (option A)**, then add the Expo client. |
| **Keep only FastAPI?** | **Option B** — possible only after **verifying** the compat API against **`@better-auth/expo`**. |

When this plan is executed and stable, set **`docs/ai-context.md`** and **`README.md`** to describe Better Auth as the source of truth for session and link to this file for history.
