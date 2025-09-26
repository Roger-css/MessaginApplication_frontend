import { MessageStatus } from "@/src/Types/message";
import { UserStatus } from "@/src/Types/user";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Drizzle Tables
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  number: text("number"),
  name: text("name").notNull(),
  userName: text("userName"),
  bio: text("bio"),
  pictureUrl: text("pictureUrl"), // File stored as URL/path
  lastSeen: text("lastSeen").notNull(), // ISO string
  status: text("status")
    .notNull()
    .$type<UserStatus>()
    .default(UserStatus.Offline),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  photoUrl: text("photoUrl"),
  name: text("name").notNull(),
  status: text("status").$type<UserStatus>().notNull(),
  participants: text("participants").$type<string[]>().notNull(),
  unreadCount: integer("unreadCount").notNull().default(0),
});

export const messages = sqliteTable(
  "messages",
  {
    clientId: text("clientId").primaryKey(),
    id: text("id"),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("senderId")
      .notNull()
      .references(() => users.id),
    text: text("text"),
    mediaItems: text("mediaItems"), // JSON string of MediaItem[]
    replyToMessageId: text("replyToMessageId"),
    status: integer("status")
      .notNull()
      .$type<MessageStatus>()
      .default(MessageStatus.Pending),
    createdAt: text("createdAt").notNull(), // ISO string
  },
  (table) => [
    index("idx_messages_conversation_created").on(
      table.conversationId,
      table.createdAt
    ),
    index("idx_messages_client_id").on(table.clientId),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
  users: many(users),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Helper types for database operations
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type SelectConversation = typeof conversations.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
