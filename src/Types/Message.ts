export type SendMessageRequest = {
  conversationId?: string;
  clientId: string; // Guid -> string
  senderId: string;
  text?: string;
  media?: File[];
  replyToMessageId?: string;
  receiverId?: string;
};
export type BaseMessage = {
  senderId: string;
  text?: string;
  media?: MediaItem[];
  replyToMessageId?: string;
  createdAt: string;
};

export type AddMessageLocally = BaseMessage & {
  id?: string;
  conversationId: string;
  status: MessageStatus.Pending;
  clientId?: string;
};

export type PendingMessage = BaseMessage & {
  receiverId: string;
  clientId?: string;
};

export type Message = BaseMessage & {
  id?: string;
  conversationId: string;
  status: MessageStatus;
  clientId?: string;
};

export type ReceivedMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  type: MessageType;
  media: MediaItem[];
  replyToMessageId?: string;
  createdAt: string;
};

export type MediaItem = {
  type: MediaType;
  url: string;
};

export enum MessageType {
  Text,
  Media,
  System,
}
export enum MediaType {
  Image,
  Video,
  File,
  Audio,
  VoiceMessage,
}
export enum MessageStatus {
  Pending,
  Sent,
  Delivered,
  Read,
  Failed,
}
