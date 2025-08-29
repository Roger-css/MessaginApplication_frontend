const chats: Chat[] = [
  {
    picture: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "John Doe",
    lastMessage: "Hey, are we still meeting later?",
    date: "2025-08-20T10:15:00Z", // today
    status: "online",
    unseenMessages: 2,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Emily Carter",
    lastMessage: "I’ll send you the files tonight.",
    date: "2025-08-18T18:45:00Z", // 2 days ago
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/76.jpg",
    name: "Michael Lee",
    lastMessage: "Thanks for your help!",
    date: "2025-07-28T08:20:00Z", // about 3 weeks ago
    status: "online",
    unseenMessages: 5,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/21.jpg",
    name: "Sophia Green",
    lastMessage: "Let’s catch up soon 🙂",
    date: "2025-03-12T22:10:00Z", // earlier this year
    status: "offline",
    unseenMessages: 1,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/15.jpg",
    name: "Daniel Smith",
    lastMessage: "Got it, thanks!",
    date: "2024-11-05T09:05:00Z", // last year
    status: "online",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/10.jpg",
    name: "Lucas Thompson",
    lastMessage: "Can you review the PR I sent?",
    date: "2025-08-19T14:35:00Z",
    status: "online",
    unseenMessages: 3,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/50.jpg",
    name: "Isabella Martinez",
    lastMessage: "That sounds great, let’s go ahead!",
    date: "2025-08-17T09:20:00Z",
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "David Nguyen",
    lastMessage: "I’ll loop you in on the email.",
    date: "2025-06-02T16:45:00Z",
    status: "online",
    unseenMessages: 4,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/18.jpg",
    name: "Olivia Brown",
    lastMessage: "Happy birthday! 🎉",
    date: "2025-01-05T07:30:00Z",
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/88.jpg",
    name: "Ethan Wilson",
    lastMessage: "Let me know when you're free.",
    date: "2024-10-14T12:00:00Z",
    status: "online",
    unseenMessages: 7,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/66.jpg",
    name: "Sophia Liu",
    lastMessage: "See you at the meeting tomorrow.",
    date: "2024-03-22T18:55:00Z",
    status: "offline",
    unseenMessages: 1,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/41.jpg",
    name: "James Parker",
    lastMessage: "Don’t forget the meeting notes.",
    date: "2025-08-15T11:25:00Z",
    status: "online",
    unseenMessages: 1,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Mia Johnson",
    lastMessage: "We should catch up sometime soon!",
    date: "2025-08-10T19:40:00Z",
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/56.jpg",
    name: "Noah Davis",
    lastMessage: "Can you call me when you’re free?",
    date: "2025-07-29T08:10:00Z",
    status: "online",
    unseenMessages: 6,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/73.jpg",
    name: "Amelia Garcia",
    lastMessage: "The documents are ready for review.",
    date: "2025-07-03T15:05:00Z",
    status: "offline",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/90.jpg",
    name: "Benjamin Clark",
    lastMessage: "That’s a great idea, let’s do it.",
    date: "2025-05-21T10:15:00Z",
    status: "online",
    unseenMessages: 2,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/35.jpg",
    name: "Charlotte Rodriguez",
    lastMessage: "Can we postpone the trip?",
    date: "2025-04-11T21:45:00Z",
    status: "offline",
    unseenMessages: 5,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/27.jpg",
    name: "William Scott",
    lastMessage: "I'll be a little late today.",
    date: "2025-02-08T06:20:00Z",
    status: "online",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/9.jpg",
    name: "Harper Evans",
    lastMessage: "Loved your last post ❤️",
    date: "2024-12-17T12:00:00Z",
    status: "offline",
    unseenMessages: 4,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/77.jpg",
    name: "Elijah Walker",
    lastMessage: "Let’s plan something for the weekend.",
    date: "2024-08-25T18:30:00Z",
    status: "online",
    unseenMessages: 0,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/40.jpg",
    name: "Ava Allen",
    lastMessage: "I’ll send the pictures later.",
    date: "2024-05-14T09:00:00Z",
    status: "offline",
    unseenMessages: 2,
  },
  {
    picture: "https://randomuser.me/api/portraits/men/5.jpg",
    name: "Henry Lewis",
    lastMessage: "Where are you right now?",
    date: "2024-02-03T23:59:00Z",
    status: "online",
    unseenMessages: 8,
  },
  {
    picture: "https://randomuser.me/api/portraits/women/62.jpg",
    name: "Ella Young",
    lastMessage: "Can’t wait to see you again 😄",
    date: "2023-11-20T14:30:00Z",
    status: "offline",
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
