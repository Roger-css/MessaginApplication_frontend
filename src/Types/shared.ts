export type HubResponse<T> = {
  success: boolean;
  data: T;
  error: string;
  errorCode: string;
  timestamp: string;
};
