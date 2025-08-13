// import * as Application from "expo-application";
// import * as Crypto from "expo-crypto";
// import * as Device from "expo-device";
// import * as Localization from "expo-localization";
// import { useEffect, useState } from "react";
// import { Dimensions, Platform } from "react-native";

// !Important this file is used to generate a unique device fingerprint
// !but its not yet utilized properly in the application
// TODO: before uncommenting, ensure all dependencies are installed and configured correctly

// interface DeviceInfo {
//   fingerprint: string;
//   description: string;
//   platform: string;
//   appVersion: string | null;
// }

// interface FingerprintHookResult {
//   fingerprint: string | null;
//   loading: boolean;
//   error: Error | null;
// }

// interface RefreshTokenRequest {
//   refresh_token: string;
//   device_fingerprint: string;
//   device_description: string;
//   platform: string;
//   app_version: string | null;
// }

// class DeviceFingerprint {
//   private static _cachedFingerprint: string | null = null;

//   static async generate(): Promise<string> {
//     try {
//       const components = await this.gatherComponents();
//       const fingerprint = await this.hashComponents(components);
//       return fingerprint;
//     } catch (error) {
//       console.warn("Failed to generate device fingerprint:", error);
//       // Return a fallback fingerprint
//       return this.generateFallbackFingerprint();
//     }
//   }

//   private static async gatherComponents(): Promise<string[]> {
//     const { width, height } = Dimensions.get("screen");

//     const components: string[] = [
//       // Platform info
//       Platform.OS,
//       Platform.Version?.toString() || "unknown",

//       // Device info (Updated based on latest Expo Device API)
//       Device.brand || "unknown",
//       Device.manufacturer || "unknown",
//       Device.modelName || "unknown",
//       Device.osName || "unknown",
//       Device.osVersion || "unknown",
//       Device.platformApiLevel?.toString() || "unknown",
//       Device.deviceType?.toString() || "unknown",

//       // Screen info
//       `${width}x${height}`,

//       // Localization (Updated properties)
//       Localization.getLocales()?.[0]?.languageTag || "unknown",
//       Localization.getCalendars()?.[0]?.timeZone || "unknown",
//       Localization.getCalendars()?.[0]?.calendar || "unknown",

//       // App info
//       Application.applicationName || "unknown",
//       Application.nativeApplicationVersion || "unknown",
//       Application.nativeBuildVersion || "unknown",
//     ];

//     // Add platform-specific components
//     if (Platform.OS === "android") {
//       components.push(
//         Device.totalMemory?.toString() || "unknown",
//         Device.osBuildId || "unknown",
//         Device.productName || "unknown",
//         Device.supportedCpuArchitectures?.join(",") || "unknown"
//       );
//     }

//     if (Platform.OS === "ios") {
//       components.push(
//         Device.totalMemory?.toString() || "unknown",
//         Device.osBuildId || "unknown",
//         Device.modelId || "unknown",
//         Device.supportedCpuArchitectures?.join(",") || "unknown"
//       );
//     }

//     return components.filter(
//       (component): component is string =>
//         component !== null && component !== undefined && component !== "unknown"
//     );
//   }

//   private static async hashComponents(components: string[]): Promise<string> {
//     const componentString = components.join("|");

//     // Use Expo Crypto for proper hashing
//     const hash = await Crypto.digestStringAsync(
//       Crypto.CryptoDigestAlgorithm.SHA256,
//       componentString,
//       { encoding: Crypto.CryptoEncoding.HEX }
//     );

//     // Take first 32 characters for manageable size
//     return hash.substring(0, 32);
//   }

//   private static generateFallbackFingerprint(): string {
//     // Simple fallback when APIs fail
//     const { width, height } = Dimensions.get("screen");
//     const timestamp = Date.now().toString().slice(-6); // Last 6 digits for uniqueness

//     const fallbackComponents = [
//       Platform.OS,
//       Platform.Version?.toString() || "unknown",
//       `${width}x${height}`,
//       timestamp,
//     ];

//     // Simple hash as fallback (without crypto)
//     const componentString = fallbackComponents.join("|");
//     let hash = 0;
//     for (let i = 0; i < componentString.length; i++) {
//       const char = componentString.charCodeAt(i);
//       hash = (hash << 5) - hash + char;
//       hash = hash & hash; // Convert to 32-bit integer
//     }

//     return Math.abs(hash).toString(16).padStart(8, "0").substring(0, 32);
//   }

//   static async getCachedFingerprint(): Promise<string> {
//     if (!this._cachedFingerprint) {
//       this._cachedFingerprint = await this.generate();
//     }
//     return this._cachedFingerprint;
//   }

//   // Clear cache (useful for testing or when app resumes)
//   static clearCache(): void {
//     this._cachedFingerprint = null;
//   }

//   // Get a readable description of the device (for UI)
//   static async getDeviceDescription(): Promise<string> {
//     try {
//       const brand = Device.brand || "Unknown";
//       const model = Device.modelName || "Device";
//       const os = `${Device.osName || Platform.OS} ${
//         Device.osVersion || Platform.Version
//       }`;

//       return `${brand} ${model} (${os})`;
//     } catch {
//       return `${Platform.OS} Device`;
//     }
//   }

//   // Get basic device info for session naming
//   static getBasicDeviceInfo(): string {
//     const { width, height } = Dimensions.get("screen");
//     const isTablet = Math.min(width, height) >= 768;

//     let deviceType = "Device";
//     if (Platform.OS === "ios") {
//       deviceType = isTablet ? "iPad" : "iPhone";
//     } else if (Platform.OS === "android") {
//       deviceType = isTablet ? "Android Tablet" : "Android Phone";
//     } else if (Platform.OS === "web") {
//       deviceType = "Web Browser";
//     }

//     return deviceType;
//   }

//   // Get complete device info
//   static async getDeviceInfo(): Promise<DeviceInfo> {
//     const fingerprint = await this.getCachedFingerprint();
//     const description = await this.getDeviceDescription();

//     return {
//       fingerprint,
//       description,
//       platform: Platform.OS,
//       appVersion: Application.nativeApplicationVersion,
//     };
//   }

//   // Debug method to see all components
//   static async debugComponents(): Promise<string[]> {
//     try {
//       const components = await this.gatherComponents();
//       console.log("Device Fingerprint Components:", components);
//       return components;
//     } catch (error) {
//       console.error("Error gathering components:", error);
//       return [];
//     }
//   }
// }

// export default DeviceFingerprint;

// // Utility functions with proper TypeScript types

// export const generateFingerprint = async (): Promise<string | null> => {
//   try {
//     const fingerprint = await DeviceFingerprint.generate();
//     console.log("Device fingerprint:", fingerprint);
//     return fingerprint;
//   } catch (error) {
//     console.error("Error generating fingerprint:", error);
//     return null;
//   }
// };

// export const getCachedFingerprint = async (): Promise<string | null> => {
//   try {
//     return await DeviceFingerprint.getCachedFingerprint();
//   } catch (error) {
//     console.error("Error getting cached fingerprint:", error);
//     return null;
//   }
// };

// export const refreshTokenWithFingerprint = async (
//   refreshToken: string
// ): Promise<any> => {
//   try {
//     const deviceInfo = await DeviceFingerprint.getDeviceInfo();

//     if (!deviceInfo.fingerprint) {
//       throw new Error("Could not generate device fingerprint");
//     }

//     const requestBody: RefreshTokenRequest = {
//       refresh_token: refreshToken,
//       device_fingerprint: deviceInfo.fingerprint,
//       device_description: deviceInfo.description,
//       platform: deviceInfo.platform,
//       app_version: deviceInfo.appVersion,
//     };

//     const response = await fetch("/auth/refresh", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//     throw error;
//   }
// };

// // Custom hook with proper TypeScript types
// export const useDeviceFingerprint = (): FingerprintHookResult => {
//   const [fingerprint, setFingerprint] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const loadFingerprint = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const fp = await DeviceFingerprint.getCachedFingerprint();
//         setFingerprint(fp);
//         setError(null);
//       } catch (err) {
//         const error =
//           err instanceof Error ? err : new Error("Unknown error occurred");
//         setError(error);
//         console.error("Error loading device fingerprint:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadFingerprint();
//   }, []);

//   return { fingerprint, loading, error };
// };

// // Additional utility types for better type safety
// export type DeviceOS = typeof Platform.OS;
// export interface SessionInfo {
//   deviceFingerprint: DeviceFingerprint;
//   deviceDescription: string;
//   platform: DeviceOS;
//   appVersion: string | null;
//   userAgent?: string;
//   ipAddress?: string;
// }

// // Helper function to create session info
// export const createSessionInfo = async (): Promise<SessionInfo> => {
//   const deviceInfo = await DeviceFingerprint.getDeviceInfo();

//   return {
//     deviceFingerprint: deviceInfo.fingerprint,
//     deviceDescription: deviceInfo.description,
//     platform: deviceInfo.platform as DeviceOS,
//     appVersion: deviceInfo.appVersion,
//   };
// };

// // Type guard for checking if fingerprint is valid
// export const isValidFingerprint = (
//   fingerprint: string | null
// ): fingerprint is string => {
//   return typeof fingerprint === "string" && fingerprint.length > 0;
// };

// // Constants for fingerprint validation
// export const FINGERPRINT_CONFIG = {
//   MIN_LENGTH: 8,
//   MAX_LENGTH: 64,
//   CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
// } as const;
