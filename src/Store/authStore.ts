import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  setAuth: (payload: { access: string | null; refresh: string | null }) => void;
  logout: () => Promise<void>;

  setHydrated: (v: boolean) => void;
};
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      refreshToken: null,

      setAuth: ({ access, refresh }) => {
        set({ accessToken: access, refreshToken: refresh });
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
          await deleteItemAsync("auth-storage");
        }
      },
      isHydrated: false,
      setHydrated: (v: boolean) => set({ isHydrated: v }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem,
        removeItem: deleteItemAsync,
        setItem,
      })),

      /**
        Persist only refreshToken
        partialize receives the entire state and returns what's persisted.
       */
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        accessToken: state.accessToken,
      }),

      /*
        this method runs when the app is started to fetch all the stored
        data into the zustand managed state
      */
      onRehydrateStorage: () => (st) => {
        st?.setHydrated(true);
      },
    }
  )
);
