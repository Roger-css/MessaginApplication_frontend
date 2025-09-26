CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`photoUrl` text,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`participants` text NOT NULL,
	`unreadCount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`clientId` text PRIMARY KEY NOT NULL,
	`id` text,
	`conversationId` text NOT NULL,
	`senderId` text NOT NULL,
	`text` text,
	`mediaItems` text,
	`replyToMessageId` text,
	`status` integer DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_messages_conversation_created` ON `messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_messages_client_id` ON `messages` (`clientId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text,
	`name` text NOT NULL,
	`userName` text,
	`bio` text,
	`pictureUrl` text,
	`lastSeen` text NOT NULL,
	`status` text DEFAULT 'Offline' NOT NULL
);
