import ax from "axios";
// value is in milliseconds so 10_000 is 10 seconds
const timeout = Infinity; // !Testing
const ip = "192.168.68.101";
const port = "8084";
export const axios = ax.create({
  baseURL: `http://${ip}:${port}/api`,
  timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
