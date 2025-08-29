import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const FormatChatDate = (date: string | Date): string => {
  const now = dayjs();
  const messageDate = dayjs(date);

  if (now.diff(messageDate, "minute") < 60) {
    // less than 1 hour → "48 minutes ago"
    return messageDate.fromNow();
  }

  if (now.isSame(messageDate, "day")) {
    // same day → "Today, 10:32 AM"
    return messageDate.format("HH:mm");
  }

  if (now.diff(messageDate, "day") === 1) {
    // yesterday
    return "Yesterday";
  }

  if (now.isSame(messageDate, "week")) {
    // same week → show weekday (Mon, Tue...)
    return messageDate.format("dddd");
  }
  // current year → show month and day
  if (now.diff(messageDate, "year") === 0) {
    return messageDate.format("MMM D");
  } // older → show date
  return messageDate.format("MM DD, YYYY");
};
