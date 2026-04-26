import {
  type AuthToken,
  getCurrentUser,
  loginAPI,
  registerAPI,
  type UserProfile,
} from "@api/auth";
import { setUnauthorizedHandler } from "@api/client";
import { StorageKeys, storage } from "@lib/storage";
import { create } from "zustand";

type AuthState = {
  /** Whether we're checking for a stored session on startup */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isLogin: boolean;
  /** Current user profile */
  user: UserProfile | null;
  /** JWT access token */
  token: string | null;

  /** Restore session from persisted storage (call on app start) */
  initialize: () => Promise<void>;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Create account then auto-login */
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  /** Clear session */
  signOut: () => void;
  /** Update the cached user object (after profile edits) */
  setUser: (user: UserProfile) => void;
};

const useAuthManage = create<AuthState>((set, get) => ({
  isLoading: true,
  isLogin: false,
  user: null,
  token: null,

  initialize: async () => {
    // Wire the 401 handler so the API client can sign out without a circular import
    setUnauthorizedHandler(() => get().signOut());

    try {
      const storedToken = storage.getString(StorageKeys.ACCESS_TOKEN);
      if (!storedToken) {
        set({ isLoading: false });
        return;
      }

      set({ token: storedToken });
      const user = await getCurrentUser();
      set({ isLogin: true, user, token: storedToken, isLoading: false });
    } catch {
      storage.remove(StorageKeys.ACCESS_TOKEN);
      set({ isLogin: false, user: null, token: null, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const tokenData: AuthToken = await loginAPI(email, password);
    storage.set(StorageKeys.ACCESS_TOKEN, tokenData.access_token);
    set({ token: tokenData.access_token });

    const user = await getCurrentUser();
    set({ isLogin: true, user });
  },

  signUp: async (email, password, name) => {
    await registerAPI({ email, password, name });
    await get().signIn(email, password);
  },

  signOut: () => {
    storage.remove(StorageKeys.ACCESS_TOKEN);
    set({ isLogin: false, user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthManage;
