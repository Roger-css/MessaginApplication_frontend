export type SendSmsRequest = {
  phoneNumber: string;
  countryCode: string;
};
export type SendOtpVerificationRequest = {
  number: string;
  countryCode: string;
  sessionId: string;
  otp: number;
};
export type AuthResponse = {
  result: boolean;
  token?: string | null;
  error?: string[];
  refreshToken?: string | null;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
};
