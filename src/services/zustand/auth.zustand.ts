import { create } from "zustand";
import {
  loginAPI,
  registerAPI,
  getCurrentUser,
  type AuthToken,
  type UserProfile,
} from "@services/api/auth";
import { storage, StorageKeys } from "@utils/storage";

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
};

const useAuthManage = create<AuthState>((set, get) => ({
  isLoading: true,
  isLogin: false,
  user: null,
  token: null,

  initialize: async () => {
    try {
      const storedToken = storage.getString(StorageKeys.ACCESS_TOKEN);
      if (!storedToken) {
        set({ isLoading: false });
        return;
      }

      // Token exists – try to fetch user profile to verify it's still valid
      set({ token: storedToken });
      const user = await getCurrentUser();
      set({ isLogin: true, user, token: storedToken, isLoading: false });
    } catch {
      // Token expired or invalid - clear everything
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
    // Auto-login after registration
    await get().signIn(email, password);
  },

  signOut: () => {
    storage.remove(StorageKeys.ACCESS_TOKEN);
    set({ isLogin: false, user: null, token: null });
  },
}));

export default useAuthManage;
