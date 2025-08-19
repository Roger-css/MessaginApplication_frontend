export type CreateProfileRequest = {
  [key: string]: string | File | undefined;
  sessionId: string;
  number: string;
  countryCode: string;
  name: string;
  userName?: string;
  bio?: string;
  picture?: File;
};
