import { API_BASE_URL, DEVICE_HOSTS } from "./constants.js";

export const apiUrl = (args) => `${API_BASE_URL}/${args.join("/")}`;
export const resolveHost = (value) => DEVICE_HOSTS[value] ?? value;
export const replaceHostTokens = (args) =>
  args.map((arg) => (typeof arg === "string" && arg.startsWith("host:") ? resolveHost(arg.slice(5)) : arg));
