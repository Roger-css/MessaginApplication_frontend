import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import {
  conversations,
  InsertMessage,
  InsertUser,
  messages,
  users,
} from "./Schema/V1";

import { Message, MessageStatus, MessageType } from "@/src/Types/message";
import { UserInfo, UserStatus } from "@/src/Types/user";
import { Conversation } from "../Store/chatStoreDb";
import { LastMessage } from "../Types/contacts";

export let db: ReturnType<typeof drizzle> | null = null;
export const setDbConnection = (dbConnection: ReturnType<typeof drizzle>) => {
  db = dbConnection;
};
export class ChatService {
  // User operations
  static async upsertUser(userData: UserInfo): Promise<void> {
    const insertData: InsertUser = {
      id: userData.id,
      number: userData.number || null,
      name: userData.name,
      userName: userData.userName || null,
      bio: userData.bio || null,
      pictureUrl: userData.picture ? `file_${userData.id}_${Date.now()}` : null,
      lastSeen: userData.lastSeen.toISOString(),
      status: userData.status,
    };

    await db
      ?.insert(users)
      .values(insertData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          number: insertData.number,
          name: insertData.name,
          userName: insertData.userName,
          bio: insertData.bio,
          pictureUrl: insertData.pictureUrl,
          lastSeen: insertData.lastSeen,
          status: insertData.status,
        },
      });
  }

  static async getUser(userId: string): Promise<UserInfo | null> {
    if (db === null) throw new Error("db not initialized");
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      number: user.number || undefined,
      name: user.name,
      userName: user.userName || undefined,
      bio: user.bio || undefined,
      picture: undefined, // Handle File reconstruction if needed
      lastSeen: new Date(user.lastSeen),
      status: user.status as UserStatus,
    };
  }

  static async getUsersByIds(userIds: string[]): Promise<UserInfo[]> {
    if (db === null) throw new Error("db not initialized");

    if (userIds.length === 0) return [];

    const result = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    return result.map((user) => ({
      id: user.id,
      number: user.number || undefined,
      name: user.name,
      userName: user.userName || undefined,
      bio: user.bio || undefined,
      picture: undefined,
      lastSeen: new Date(user.lastSeen),
      status: user.status as UserStatus,
    }));
  }

  // Conversation operations
  static async upsertConversation(
    convData: Omit<Conversation, "lastMessage" | "messages">
  ): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    await db
      .insert(conversations)
      .values(convData)
      .onConflictDoUpdate({
        target: conversations.id,
        set: {
          photoUrl: convData.photoUrl,
          name: convData.name,
          status: convData.status,
          unreadCount: convData.unreadCount,
        },
      });
  }

  static async getConversations(): Promise<Conversation[]> {
    if (db === null) throw new Error("db not initialized");

    // Get all conversations
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.id)); // You might want to add a lastUpdated field later

    const result: Conversation[] = [];

    for (const conv of allConversations) {
      // Get last message
      const lastMessageInConversation = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      const lastMessage: LastMessage = {
        createdAt: lastMessageInConversation[0].createdAt,
        senderId: lastMessageInConversation[0].senderId,
        text: lastMessageInConversation[0].text ?? undefined,
        type:
          lastMessageInConversation[0].text !== null
            ? MessageType.Text
            : MessageType.Media,
      };
      const convToBePushed: Conversation = {
        ...conv,
        lastMessage: lastMessage,
        messages: [],
      };
      result.push(convToBePushed);
    }

    // Sort by last message time
    result.sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    return result;
  }

  static async getConversation(
    conversationId: string
  ): Promise<Conversation | null> {
    if (db === null) throw new Error("db not initialized");

    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) return null;

    // Get participants from message senders
    const participantIds = await db
      .selectDistinct({ senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    const participants = await ChatService.getUsersByIds(
      participantIds.map((p) => p.senderId)
    );

    const conv = conversation[0];
    return {
      id: conv.id,
      participants: participants.map((e) => e.id),
      messages: [], // Load separately
      photoUrl: conv.photoUrl,
      name: conv.name,
      status: conv.status,
      unreadCount: conv.unreadCount,
    };
  }

  // Message operations
  static async addMessage(messageData: Message): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    try {
      const insertData: InsertMessage = {
        clientId: messageData.clientId!,
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        text: messageData.text || null,
        mediaItems: messageData.media
          ? JSON.stringify(messageData.media)
          : null,
        replyToMessageId: messageData.replyToMessageId || null,
        status: messageData.status,
        createdAt: messageData.createdAt,
      };

      await db.insert(messages).values(insertData);
    } catch (error) {
      console.log("error occurred in inserting message", error);
      throw error;
    }
  }

  static async updateMessage(
    clientId: string,
    updates: Partial<Message>
  ): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    const updateData: Partial<InsertMessage> = {};

    if (updates.id !== undefined) updateData.id = updates.id;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.media !== undefined)
      updateData.mediaItems = JSON.stringify(updates.media);

    if (Object.keys(updateData).length > 0) {
      await db
        .update(messages)
        .set(updateData)
        .where(eq(messages.clientId, clientId));
    }
  }

  static async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    if (db === null) throw new Error("db not initialized");

    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map((msg) => ({
      id: msg.id || undefined,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.text || undefined,
      media: msg.mediaItems ? JSON.parse(msg.mediaItems) : undefined,
      replyToMessageId: msg.replyToMessageId || undefined,
      status: msg.status as MessageStatus,
      clientId: msg.clientId,
      createdAt: msg.createdAt,
    }));
  }

  // Add a user to conversation (by ensuring they have at least one message)
  static async addUserToConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    // Since you're using the many-to-many relation directly, we'll just ensure the user exists
    // The relationship is implied through messages
    const user = await ChatService.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // You could add a system message or just ensure the conversation exists
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
  }

  // Update unread count
  static async updateUnreadCount(
    conversationId: string,
    count: number
  ): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    await db
      .update(conversations)
      .set({ unreadCount: count })
      .where(eq(conversations.id, conversationId));
  }

  static async markMessagesAsRead(conversationId: string): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    // Mark messages from others as read for this user
    await db
      .update(messages)
      .set({ status: MessageStatus.Read })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.status, MessageStatus.Delivered)
        )
      );

    await ChatService.updateUnreadCount(conversationId, 0);
  }

  // Search messages
  static async searchMessages(
    query: string,
    conversationId?: string
  ): Promise<Message[]> {
    if (db === null) throw new Error("db not initialized");

    let whereCondition = or(
      like(messages.text, `%${query}%`),
      like(messages.mediaItems, `%${query}%`)
    );

    if (conversationId) {
      whereCondition = and(
        whereCondition,
        eq(messages.conversationId, conversationId)
      );
    }

    const result = await db
      .select()
      .from(messages)
      .where(whereCondition)
      .orderBy(desc(messages.createdAt))
      .limit(100);

    return result.map((msg) => ({
      id: msg.id || undefined,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.text || undefined,
      media: msg.mediaItems ? JSON.parse(msg.mediaItems) : undefined,
      replyToMessageId: msg.replyToMessageId || undefined,
      status: msg.status as MessageStatus,
      clientId: msg.clientId,
      createdAt: msg.createdAt,
    }));
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    if (db === null) throw new Error("db not initialized");

    await db.delete(messages);
    await db.delete(conversations);
    await db.delete(users);
  }

  // Get conversation participants (from message senders)
  static async getConversationParticipants(
    conversationId: string
  ): Promise<UserInfo[]> {
    if (db === null) throw new Error("db not initialized");

    const participantIds = await db
      .selectDistinct({ senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return ChatService.getUsersByIds(participantIds.map((p) => p.senderId));
  }

  // Check if message exists by clientId
  static async messageExists(clientId: string): Promise<boolean> {
    if (db === null) throw new Error("db not initialized");

    const result = await db
      .select({ clientId: messages.clientId })
      .from(messages)
      .where(eq(messages.clientId, clientId))
      .limit(1);

    return result.length > 0;
  }

  // Get message by clientId
  static async getMessageByClientId(clientId: string): Promise<Message | null> {
    if (db === null) throw new Error("db not initialized");

    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.clientId, clientId))
      .limit(1);

    if (result.length === 0) return null;

    const msg = result[0];
    return {
      id: msg.id || undefined,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.text || undefined,
      media: msg.mediaItems ? JSON.parse(msg.mediaItems) : undefined,
      replyToMessageId: msg.replyToMessageId || undefined,
      status: msg.status as MessageStatus,
      clientId: msg.clientId,
      createdAt: msg.createdAt,
    };
  }
}
