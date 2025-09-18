import { HubConnectionState } from "@microsoft/signalr";
import * as Network from "expo-network";
import { useEffect } from "react";

import { useReceiveMessage } from "../Feature/Home/hooks/useReceiveMessage";
import { useSignalR } from "../Hooks/useSignalR";
export const useSignalRWrapper = () => {
  const { connectionState, reconnect } = useSignalR();
  useReceiveMessage();

  useEffect(() => {
    let reconnectInterval: number;
    let reconnectAttempts = 0;
    const maxInterval = 30000; // Cap at 30 seconds
    const baseInterval = 5000; // Start at 5 seconds, not 1 second

    const startReconnectLoop = () => {
      // Clear any existing interval
      if (reconnectInterval) clearInterval(reconnectInterval);

      reconnectInterval = setInterval(async () => {
        if (connectionState === HubConnectionState.Disconnected) {
          try {
            console.log(`Reconnect attempt #${reconnectAttempts + 1}`);
            await reconnect();

            // If successful, clear the interval
            if (reconnectInterval) {
              clearInterval(reconnectInterval);
              reconnectAttempts = 0;
            }
          } catch {
            console.log("error in reconnect attempt");

            reconnectAttempts++;

            // Implement exponential backoff by recreating interval with longer delay
            const nextInterval = Math.min(
              baseInterval * Math.pow(1.5, Math.floor(reconnectAttempts / 3)),
              maxInterval
            );

            clearInterval(reconnectInterval);
            setTimeout(startReconnectLoop, nextInterval - baseInterval);

            console.log(
              `Reconnect failed, next attempt in ${nextInterval / 1000}s`
            );
          }
        }
      }, baseInterval);
    };

    // Start reconnect loop when disconnected
    if (connectionState === HubConnectionState.Disconnected) {
      startReconnectLoop();
    }

    // Handle network state changes for immediate retry
    const networkListener = Network.addNetworkStateListener((networkEvent) => {
      if (
        networkEvent.isConnected &&
        connectionState === HubConnectionState.Disconnected
      ) {
        // Clear current interval and try immediately on network recovery
        if (reconnectInterval) clearInterval(reconnectInterval);
        reconnect().catch(() => {
          // If immediate retry fails, restart the interval
          startReconnectLoop();
        });
      }
    });

    return () => {
      networkListener.remove();
      if (reconnectInterval) clearInterval(reconnectInterval);
    };
  }, [connectionState, reconnect]);
};
