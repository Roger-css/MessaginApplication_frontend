import { create } from "zustand";

type SessionState = {
  number: string | null;
  countryCode: string | null;
  sessionId: string | null;
};

type SessionActions = {
  setState: (obj: Partial<SessionState>) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState & SessionActions>(
  (set, get) => ({
    countryCode: null,
    number: null,
    sessionId: null,

    setState: (partials) => {
      set((state) => ({ ...state, ...partials }));
    },

    clear: () => set({ countryCode: null, number: null, sessionId: null }),
  })
);
