import { API_BASE_URL, DEVICE_HOSTS } from "./constants.js";

export const createHostResolver = ({ apiBaseUrl = API_BASE_URL, deviceHosts = DEVICE_HOSTS } = {}) => {
  const apiUrl = (args) => `${apiBaseUrl}/${args.map(String).join("/")}`;
  const resolveHost = (value) => deviceHosts[value] ?? value;
  const replaceHostTokens = (args) =>
    args.map((arg) => (typeof arg === "string" && arg.startsWith("host:") ? resolveHost(arg.slice(5)) : arg));

  return {
    apiUrl,
    resolveHost,
    replaceHostTokens,
  };
};

const defaultResolver = createHostResolver();

export const { apiUrl, resolveHost, replaceHostTokens } = defaultResolver;
