import ax from "axios";

const timeout = Infinity; // !Testing

export const axios = ax.create({
  baseURL: "http://192.168.68.100:8084/api",
  timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
export const axiosWithNoInterceptors = ax.create({
  baseURL: "http://192.168.68.100:8084/api",
  timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
