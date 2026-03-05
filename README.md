# Expo Boilerplate 🚀

Full-stack React Native boilerplate with **FastAPI backend** integration, **HeroUI Native**, **Uniwind** (Tailwind CSS v4), onboarding flow, and in-app purchases.

## ✨ Features

- **Expo Router** — File-based routing with `Stack.Protected` auth guards
- **FastAPI Integration** — JWT auth (login, signup, forgot-password), auto-token management
- **HeroUI Native** — Premium UI component library
- **Uniwind** — Tailwind CSS v4 for React Native
- **Onboarding Flow** — Multi-step onboarding with MMKV persistence
- **RevenueCat** — Paywall & subscription management (optional)
- **CLI Scaffolder** — Interactive tool to create new projects with feature selection
- **TypeScript** — Strict mode, path aliases
- **Zustand** — State management with real API integration
- **Zod** — Form validation on auth screens

## 📁 Project Structure

```
├── src/
│   ├── app/                     # Expo Router pages
│   │   ├── (auth)/              # Auth screens (login, signup, forgot-password)
│   │   ├── (tabs)/              # Tab screens (home, explore, profile)
│   │   └── onboarding/          # Onboarding flow (welcome, setup)
│   ├── components/
│   │   ├── common/              # Shared components (Icons, ActionButton)
│   │   ├── form/                # Form components (FormInput, FormButton)
│   │   ├── onboarding/          # Onboarding UI (StepHeader, OnboardingButton)
│   │   └── providers/           # App-level providers
│   ├── config/
│   │   ├── api.ts               # API base URL configuration
│   │   └── revenuecat.ts        # RevenueCat API keys
│   ├── contexts/
│   │   ├── onboarding-context.tsx  # Onboarding state (MMKV)
│   │   └── revenuecat-context.tsx  # RevenueCat purchases
│   ├── screens/
│   │   ├── auth/                # Login, Signup, ForgotPassword screens
│   │   └── tabs/                # Home, Explore, Profile screens
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts        # HTTP client with JWT auto-injection
│   │   │   └── auth.ts          # Auth API calls (login, register, etc.)
│   │   └── zustand/
│   │       └── auth.zustand.ts  # Auth state + session persistence
│   └── utils/
│       └── storage.ts           # MMKV storage wrapper
├── cli/                         # CLI scaffolder (see below)
├── docs/                        # Documentation
├── app.json                     # Expo config (apiBaseUrl in extra)
└── jest.config.js               # Test configuration
```

## 🚀 Quick Start

### Using the CLI (Recommended)

```bash
cd cli && npm install && npm run build
node dist/index.js my-app
```

The CLI will guide you through project name, bundle ID, package manager, and feature selection.

### Manual Setup

1. **Clone & install**

   ```bash
   git clone <repo-url> my-app
   cd my-app
   yarn install
   ```

2. **Configure the API**

   Update `app.json` → `expo.extra.apiBaseUrl` with your FastAPI backend URL:

   ```json
   "extra": {
     "apiBaseUrl": "http://localhost:8000"
   }
   ```

3. **Build & run**

   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

## 🔐 Authentication

The app connects to a **FastAPI** backend using `fastapi-users` JWT authentication:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/jwt/login` | POST | Login (form-urlencoded: `username`, `password`) |
| `/api/v1/auth/register` | POST | Register (JSON: `email`, `password`, `name`) |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/users/me` | GET | Get current user profile |

- JWT tokens are persisted to MMKV storage
- Session is automatically restored on app start
- 401 responses trigger automatic logout

## 🎨 Styling

Uses **Uniwind** (Tailwind CSS v4) for styling:

```tsx
<View className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500">
  <Text className="text-white text-2xl font-bold">Hello World</Text>
</View>
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage
```

**Test suites:**
- `src/services/api/__tests__/client.test.ts` — API client (JWT, errors, methods)
- `src/services/api/__tests__/auth.test.ts` — Auth API (login, register, forgot-password)
- `cli/src/__tests__/tokens.test.ts` — CLI token generation
- `cli/src/__tests__/feature-toggles.test.ts` — CLI feature configurations

## 🛠️ CLI Scaffolder

Interactive CLI to create new projects from this boilerplate:

```bash
cd cli
npm install && npm run build
node dist/index.js [project-name] [--default] [--yes]
```

**Prompts:**
- **Project name** — Your app's folder and display name
- **Bundle identifier** — e.g., `com.company.myapp`
- **Package manager** — npm, pnpm, yarn, or bun
- **Features** — Choose integrations:
  - API Backend (FastAPI auth + API client)
  - Onboarding Flow (multi-step with persistence)
  - RevenueCat (in-app purchases & paywall)

## ⚙️ Configuration

| Config | Location | Purpose |
|--------|----------|---------|
| API URL | `app.json > expo.extra.apiBaseUrl` | Backend server address |
| RevenueCat | `src/config/revenuecat.ts` | iOS/Android API keys |
| Path aliases | `tsconfig.json > paths` | `@components`, `@services`, `@config`, etc. |

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [HeroUI Native](https://heroui.com/)
- [Uniwind](https://www.npmjs.com/package/uniwind)
- [FastAPI](https://fastapi.tiangolo.com/)
- [RevenueCat](https://www.revenuecat.com/docs/)

## 📄 License

This project is open source and available under the MIT License.
