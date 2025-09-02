import { ReactNode } from "react";
import { View } from "tamagui";
import { useSignalR } from "../Hooks/useSignalR";

const SignalRWrapper = ({ children }: { children: ReactNode }) => {
  useSignalR();
  return <View height={"100%"}>{children}</View>;
};

export default SignalRWrapper;
