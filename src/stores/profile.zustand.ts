import { getErrorMessage } from "@api/client";
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
      set({ error: getErrorMessage(err, "Failed to update profile") });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  uploadAvatar: async (fileUri) => {
    set({ isUploadingAvatar: true, error: null });
    try {
      // The endpoint returns the whole updated user, so there's no second round
      // trip to pick up the new avatar URL.
      const updated = await uploadAvatarAPI(fileUri);
      useAuthManage.getState().setUser(updated);
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to upload avatar") });
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
        useAuthManage.getState().setUser({ ...currentUser, image: null });
      }
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to delete avatar") });
      throw err;
    } finally {
      set({ isUploadingAvatar: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProfileStore;
