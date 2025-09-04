import { HubConnectionState } from "@microsoft/signalr";
import * as Network from "expo-network";
import { ReactNode, useEffect } from "react";
import { View } from "tamagui";
import { useSignalR } from "../Hooks/useSignalR";
const SignalRWrapper = ({ children }: { children: ReactNode }) => {
  const { connectionState, reconnect } = useSignalR();
  useEffect(() => {
    const listener = Network.addNetworkStateListener((networkEvent) => {
      if (
        networkEvent.isConnected &&
        connectionState === HubConnectionState.Disconnected
      ) {
        reconnect();
      }
    });
    return () => listener.remove();
  }, [connectionState, reconnect]);
  return <View height={"100%"}>{children}</View>;
};
export default SignalRWrapper;
