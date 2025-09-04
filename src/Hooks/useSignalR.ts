import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useEffect } from "react";
import SignalRService from "../API/SignalRClient";
import { useSignalRStore } from "../Store/signalRStore";
interface UseSignalRReturn {
  connection: HubConnection | null;
  connectionState: HubConnectionState;
  isConnected: boolean;
  error: string | null;
  clearError: () => void;
  reconnect: () => Promise<void>;
}

export const useSignalR = (): UseSignalRReturn => {
  const { connection, connectionState, isConnected, error, clearError } =
    useSignalRStore();

  useEffect(() => {
    const initializeConnection = async (): Promise<void> => {
      try {
        if (!connection) {
          await SignalRService.createConnection();
          await SignalRService.startConnection();
        } else await SignalRService.startConnection();
      } catch (error) {
        console.log("Failed to initialize SignalR:", error);
      }
    };
    initializeConnection();
    return () => {
      SignalRService.stopConnection();
    };
    // ! this is a necessary thing to prevent infinite reconnection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reconnect = async (): Promise<void> => {
    try {
      await SignalRService.stopConnection();
      await SignalRService.createConnection();
      await SignalRService.startConnection();
    } catch (error) {
      console.log("Failed to reconnect:", error);
    }
  };

  return {
    connection,
    connectionState,
    isConnected,
    error,
    clearError,
    reconnect,
  };
};
