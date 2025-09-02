export type SendMessageRequest = {
  conversationId?: string;
  clientId: string; // Guid -> string
  senderId: string;
  text?: string;
  media?: File[];
  replyToMessageId?: string;
  receiverId?: string;
};
export type ReceivedMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  replyToMessageId?: string;
  text?: string;
  type: MessageType;
  media: MediaItem[];
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
