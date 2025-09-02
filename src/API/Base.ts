import ax from "axios";
// value is in milliseconds so 10_000 is 10 seconds
const timeout = Infinity; // !Testing
const ip = process.env.EXPO_PUBLIC_API_URL;
const port = "8084";
export const axios = ax.create({
  baseURL: `${ip}:${port}/api`,
  timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
