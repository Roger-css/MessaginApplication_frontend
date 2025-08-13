import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

type User = {
  id: string;
  name?: string;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  refreshToken: string | null;
  isHydrated: boolean;
};
type AuthActions = {
  setAuth: (payload: {
    accessToken: string | null;
    refreshToken: string | null;
  }) => void;
  logout: () => Promise<void>;

  setHydrated: (v: boolean) => void;
};

// SecureStore adapter for Zustand's createJSONStorage
const secureStoreAdapter: StateStorage = {
  getItem: async (name: string) => {
    const v = await SecureStore.getItemAsync(name);
    return v ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      refreshToken: null,

      setAuth: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken });
      },

      logout: async () => {
        try {
          // TODO: create the revoke or logout endpoint
          // const rt = get().refreshToken;
          // if (rt) {
          //   await axios.post("/auth/revoke", { refreshToken: rt });
          // }
        } catch (e) {
          console.warn("logout: revoke request failed", e);
        } finally {
          set({ accessToken: null, refreshToken: null, user: null });
          /**  ensure SecureStore key is removed (persist should already do this,
           **  but remove explicitly to be safe) */
          await SecureStore.deleteItemAsync("auth-storage");
        }
      },
      isHydrated: false,
      setHydrated: (v: boolean) => set({ isHydrated: v }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStoreAdapter),
      /**
       * Persist only refreshToken
       * partialize receives the entire state and returns what's persisted.
       */
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    }
  )
);
