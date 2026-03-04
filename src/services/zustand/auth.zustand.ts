import { create } from "zustand";

type AuthProviderActions = {
  isLogin: boolean;
  signIn: (data?: any) => void;
  signUp: (data?: any) => void;
  signOut: () => void;
};

const useAuthManage = create<AuthProviderActions>((set) => ({
  isLogin: false,
  signIn: (data) => {
    set({ isLogin: true });
  },
  signUp: (data) => {
    set({ isLogin: true });
  },
  signOut: () => {
    set({ isLogin: false });
  },
}));

export default useAuthManage;
