import { MessageType } from "./message";
import { UserStatus } from "./user";

export type LastMessage = {
  text?: string;
  senderId?: string;
  senderName?: string;
  type: MessageType;
  createdAt: string;
};

export type UserContact = {
  conversationId: string;
  name: string;
  photoUrl: string | null;
  unreadCount: number;
  lastMessage?: LastMessage;
  status: UserStatus;
};
export type UnInitializedContact = {
  userId: string;
  name: string;
  photoUrl?: string;
  unreadCount: number;
  lastMessage?: LastMessage;
  status: UserStatus;
};
