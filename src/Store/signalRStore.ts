// types/signalr.types.ts
import { HubConnection, HubConnectionState } from "@microsoft/signalr";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface SignalRState {
  connection: HubConnection | null;
  connectionState: HubConnectionState;
  isConnected: boolean;
  error: string | null;
}

export interface SignalRActions {
  setConnection: (connection: HubConnection | null) => void;
  setConnectionState: (state: HubConnectionState) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type SignalRStore = SignalRState & SignalRActions;

const signalRStore = (set: any): SignalRStore => ({
  connection: null,
  connectionState: HubConnectionState.Disconnected,
  isConnected: false,
  error: null,

  setConnection: (connection: HubConnection | null) => set({ connection }),
  setConnectionState: (state: HubConnectionState) =>
    set({
      connectionState: state,
      isConnected: state === "Connected",
    }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
});

export const useSignalRStore = create<SignalRStore>()(
  devtools(signalRStore, { name: "signalr-store" })
);
