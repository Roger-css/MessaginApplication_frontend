const chats: Chat[] = [
  {
    picture: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "John Doe",
    lastMessage: "Hey, are we still meeting later?",
    date: "2025-08-20T10:15:00Z",
    status: "online",
    unseenMessages: 2,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Emily Carter",
    lastMessage: "I’ll send you the files tonight.",
    date: "2025-08-19T18:45:00Z",
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/76.jpg",
    name: "Michael Lee",
    lastMessage: "Thanks for your help!",
    date: "2025-08-20T08:20:00Z",
    status: "online",
    unseenMessages: 5,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/21.jpg",
    name: "Sophia Green",
    lastMessage: "Let’s catch up soon 🙂",
    date: "2025-08-18T22:10:00Z",
    status: "offline",
    unseenMessages: 1,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/15.jpg",
    name: "Daniel Smith",
    lastMessage: "Got it, thanks!",
    date: "2025-08-20T09:05:00Z",
    status: "online",
    unseenMessages: 0,
  },
];
export default chats;
export type Chat = {
  picture: string; // URL of the profile picture
  name: string; // User's name
  lastMessage: string; // Most recent message text
  date: string; // ISO date string or formatted date
  status: "online" | "offline"; // Limited to these two values
  unseenMessages: number; // Count of unread messages
};
