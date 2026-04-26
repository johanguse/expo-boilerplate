import {
  deleteAvatarAPI,
  type UpdateProfilePayload,
  updateProfileAPI,
  uploadAvatarAPI,
} from "@api/profile";
import { create } from "zustand";
import useAuthManage from "./auth.zustand";

type ProfileState = {
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  error: string | null;

  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  uploadAvatar: (fileUri: string) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  clearError: () => void;
};

const useProfileStore = create<ProfileState>((set) => ({
  isUpdating: false,
  isUploadingAvatar: false,
  error: null,

  updateProfile: async (payload) => {
    set({ isUpdating: true, error: null });
    try {
      const updated = await updateProfileAPI(payload);
      // Sync the updated user back into the auth store
      useAuthManage.getState().setUser(updated);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail?: string }).detail)
          : err instanceof Error
            ? err.message
            : "Failed to update profile";
      set({ error: message });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  uploadAvatar: async (fileUri) => {
    set({ isUploadingAvatar: true, error: null });
    try {
      const result = await uploadAvatarAPI(fileUri);
      const currentUser = useAuthManage.getState().user;
      if (currentUser) {
        useAuthManage.getState().setUser({
          ...currentUser,
          avatar_url: result.avatar_url,
        });
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail?: string }).detail)
          : err instanceof Error
            ? err.message
            : "Failed to upload avatar";
      set({ error: message });
      throw err;
    } finally {
      set({ isUploadingAvatar: false });
    }
  },

  deleteAvatar: async () => {
    set({ isUploadingAvatar: true, error: null });
    try {
      await deleteAvatarAPI();
      const currentUser = useAuthManage.getState().user;
      if (currentUser) {
        useAuthManage.getState().setUser({
          ...currentUser,
          avatar_url: null,
        });
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail?: string }).detail)
          : err instanceof Error
            ? err.message
            : "Failed to delete avatar";
      set({ error: message });
      throw err;
    } finally {
      set({ isUploadingAvatar: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProfileStore;
