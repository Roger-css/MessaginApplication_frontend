import { MessageType } from "./Message";

export type LastMessage = {
  text?: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  createdAt: string;
};

export type UserContact = {
  id: string;
  name: string;
  photoUrl?: string;
  lastMessage?: LastMessage;
};
