import { MessageType } from "./message";

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
  photoUrl?: string;
  unreadCount: number;
  lastMessage?: LastMessage;
  status: string;
};
export type UnInitializedContact = {
  userId: string;
  name: string;
  photoUrl?: string;
  unreadCount: number;
  lastMessage?: LastMessage;
  status: string;
};
