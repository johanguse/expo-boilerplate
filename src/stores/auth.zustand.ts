import {
  type AuthSession,
  getCurrentUser,
  loginAPI,
  logoutAPI,
  refreshTokenAPI,
  registerAPI,
  type UserProfile,
} from "@api/auth";
import { setRefreshHandler, setUnauthorizedHandler } from "@api/client";
import { StorageKeys, storage } from "@lib/storage";
import { create } from "zustand";

type AuthState = {
  /** Whether we're checking for a stored session on startup */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isLogin: boolean;
  /** Current user profile */
  user: UserProfile | null;
  /** Short-lived (15m) JWT access token */
  token: string | null;

  /** Restore session from persisted storage (call on app start) */
  initialize: () => Promise<void>;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<void>;
  /**
   * Create an account. Resolves `{ needsVerification: true }` when the backend
   * requires email confirmation before issuing a session — the user is *not*
   * signed in in that case.
   */
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ needsVerification: boolean }>;
  /** Clear session */
  signOut: () => void;
  /** Update the cached user object (after profile edits) */
  setUser: (user: UserProfile) => void;
};

function persistTokens(session: {
  accessToken: string | null;
  refreshToken: string | null;
}): void {
  if (session.accessToken) {
    storage.set(StorageKeys.ACCESS_TOKEN, session.accessToken);
  }
  if (session.refreshToken) {
    storage.set(StorageKeys.REFRESH_TOKEN, session.refreshToken);
  }
}

function clearTokens(): void {
  storage.remove(StorageKeys.ACCESS_TOKEN);
  storage.remove(StorageKeys.REFRESH_TOKEN);
}

const useAuthManage = create<AuthState>((set, get) => ({
  isLoading: true,
  isLogin: false,
  user: null,
  token: null,

  initialize: async () => {
    // Wire the session callbacks so the API client can refresh or sign out
    // without importing this store (which would be circular).
    setUnauthorizedHandler(() => get().signOut());
    setRefreshHandler(async () => {
      const refreshToken = storage.getString(StorageKeys.REFRESH_TOKEN);
      if (!refreshToken) return false;
      try {
        const tokens = await refreshTokenAPI(refreshToken);
        if (!tokens.accessToken) return false;
        persistTokens(tokens);
        set({ token: tokens.accessToken });
        return true;
      } catch {
        return false;
      }
    });

    try {
      const storedToken = storage.getString(StorageKeys.ACCESS_TOKEN);
      if (!storedToken) {
        set({ isLoading: false });
        return;
      }

      set({ token: storedToken });
      // A 401 here is handled by the client: it refreshes and replays once,
      // and only throws if the refresh token is gone or rejected too.
      const user = await getCurrentUser();
      set({ isLogin: true, user, isLoading: false });
    } catch {
      clearTokens();
      set({ isLogin: false, user: null, token: null, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const session: AuthSession = await loginAPI(email, password);
    persistTokens(session);
    set({ isLogin: true, user: session.user, token: session.accessToken });
  },

  signUp: async (email, password, name) => {
    const session = await registerAPI({ email, password, name });

    // With email verification enabled the backend registers the account but
    // withholds tokens until the address is confirmed.
    if (!session.accessToken) {
      return { needsVerification: true };
    }

    persistTokens(session);
    set({ isLogin: true, user: session.user, token: session.accessToken });
    return { needsVerification: false };
  },

  signOut: () => {
    // Best-effort server-side revoke; the local session is cleared regardless.
    // Order matters: the request reads the token from storage synchronously, so
    // it must be started before `clearTokens()`.
    if (storage.getString(StorageKeys.ACCESS_TOKEN)) {
      void logoutAPI().catch(() => {});
    }
    clearTokens();
    set({ isLogin: false, user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthManage;
