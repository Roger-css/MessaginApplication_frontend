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
export type UserInfo = {
  id: string;
  number?: string; // ? For Testing
  name: string;
  userName?: string;
  bio?: string;
  picture?: File;
  lastSeen: Date;
  status: UserStatus;
};
export enum UserStatus {
  Online = "Online",
  Offline = "Offline",
}
