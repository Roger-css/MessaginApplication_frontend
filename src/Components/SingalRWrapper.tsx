import * as Network from "expo-network";
import { ReactNode, useEffect } from "react";
import { View } from "tamagui";
import { useSignalR } from "../Hooks/useSignalR";
const SignalRWrapper = ({ children }: { children: ReactNode }) => {
  const { reconnect, isConnected } = useSignalR();

  useEffect(() => {
    const listener = Network.addNetworkStateListener((event) => {
      event.isInternetReachable && !isConnected && reconnect();
    });
    return () => listener.remove();
  }, [reconnect, isConnected]);
  return <View height={"100%"}>{children}</View>;
};
export default SignalRWrapper;
