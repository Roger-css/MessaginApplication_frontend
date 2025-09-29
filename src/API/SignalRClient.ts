import { axios } from "@/src/API/Base";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { AxiosError } from "axios";
import { Toast } from "toastify-react-native";
import { useAuthStore } from "../Store/authStore";
import { useSignalRStore } from "../Store/signalRStore";
import { AuthResponse, RefreshTokenRequest } from "../Types/auth";

class SignalRService {
  private isRefreshingToken = false;
  private tokenRefreshPromise: Promise<string> | null = null;

  private async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshingToken && this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.isRefreshingToken = true;
    this.tokenRefreshPromise = this.performTokenRefresh() as Promise<string>;

    try {
      const newToken = await this.tokenRefreshPromise;
      return newToken;
    } finally {
      this.isRefreshingToken = false;
      this.tokenRefreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | undefined> {
    const { accessToken, refreshToken, setAuth, logout } =
      useAuthStore.getState();

    if (!refreshToken || !accessToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post<AuthResponse>("/auth/refresh", {
        refreshToken,
        accessToken,
      } as RefreshTokenRequest);

      const {
        refreshToken: newRefreshToken,
        token,
        result,
        error,
        expirationTime,
      } = response.data;

      if (result && token && newRefreshToken) {
        setAuth({
          access: token,
          refresh: newRefreshToken,
          expiredAt: expirationTime,
        });
        return token;
      }
      if (error) {
        throw new Error(error.join(", "));
      }
    } catch (error) {
      console.log(`performTokenRefresh`);
      if ((error as AxiosError)?.status === 401) {
        logout();
        Toast.error("Your session expired, need to login again");
      }
    }
  }

  private async getValidAccessToken(): Promise<string> {
    const { accessToken, refreshToken, expiredAt } = useAuthStore.getState();

    // If no tokens available, return empty string
    if (!accessToken || !refreshToken || !expiredAt) {
      throw new Error("No tokens available");
    }

    if (new Date(expiredAt).getTime() - Date.now() < 5 * 1000) {
      // Token has expired, refresh it
      const newToken = await this.refreshAccessToken();
      return newToken;
    }
    return accessToken;
  }

  async createConnection(): Promise<HubConnection> {
    const hubUrl = `${process.env.EXPO_PUBLIC_API_URL}:8084/chatHub`;
    if (!hubUrl) {
      throw new Error("SignalR Hub URL not found in environment variables");
    }

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => {
          try {
            return await this.getValidAccessToken();
          } catch {
            console.log("Failed to get access token for SignalR");
            return "";
          }
        },
        timeout: Infinity, //! Testing
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    // Set up connection state handlers
    connection.onclose((error?: Error) => {
      useSignalRStore
        .getState()
        .setConnectionState(HubConnectionState.Disconnected);
      useSignalRStore.getState().setError(error?.message || null);
    });

    connection.onreconnecting(() => {
      useSignalRStore
        .getState()
        .setConnectionState(HubConnectionState.Reconnecting);
    });

    connection.onreconnected(() => {
      useSignalRStore
        .getState()
        .setConnectionState(HubConnectionState.Connected);
      useSignalRStore.getState().setError(null);
    });

    useSignalRStore.getState().setConnection(connection);
    return connection;
  }

  async startConnection(): Promise<void> {
    const { connection, setConnectionState, setError } =
      useSignalRStore.getState();

    if (!connection) {
      throw new Error("Connection not initialized");
    }

    try {
      setConnectionState(HubConnectionState.Connecting);
      await connection.start();
      setConnectionState(HubConnectionState.Connected);
    } catch (error) {
      setConnectionState(HubConnectionState.Disconnected);
      setError(error instanceof Error ? error.message : "Unknown error");
      console.log("Error starting connection");
    }
  }

  async stopConnection(): Promise<void> {
    const { connection, setConnectionState, setConnection } =
      useSignalRStore.getState();

    if (connection) {
      try {
        await connection.stop();
        setConnection(null);
        setConnectionState(HubConnectionState.Disconnected);
      } catch {
        console.log("Error stopping connection");
      }
    }
  }

  getConnection(): HubConnection | null {
    return useSignalRStore.getState().connection;
  }
}

export default new SignalRService();
