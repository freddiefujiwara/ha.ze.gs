import { API_BASE_URL, DEVICE_HOSTS, SWITCHBOT_DEVICES } from "./constants.js";

/**
 * @param {{ apiBaseUrl?: string, deviceHosts?: Record<string, string>, switchbotDevices?: Record<string, string> }} [options]
 * @returns {{
 *   apiUrl: (args: Array<string | number>) => string,
 *   resolveHost: (value: string) => string,
 *   replaceHostTokens: (args: Array<string | number>) => Array<string | number>
 * }}
 */
const createHostResolver = ({
  apiBaseUrl = API_BASE_URL,
  deviceHosts = DEVICE_HOSTS,
  switchbotDevices = SWITCHBOT_DEVICES,
} = {}) => {
  const apiUrl = (args) => `${apiBaseUrl}/${args.map(String).join("/")}`;
  const resolveHost = (value) => deviceHosts[value] ?? value;
  const resolveDevice = (value) => switchbotDevices[value] ?? value;
  // `host:<name>` tokens name LAN hosts and `device:<name>` tokens
  // name SwitchBot devices; both maps are build-time configuration so
  // no address or device id is written in this repository.
  const replaceHostTokens = (args) =>
    args.map((arg) => {
      if (typeof arg !== "string") return arg;
      if (arg.startsWith("host:")) return resolveHost(arg.slice(5));
      if (arg.startsWith("device:")) return resolveDevice(arg.slice(7));
      return arg;
    });

  return {
    apiUrl,
    resolveHost,
    replaceHostTokens,
  };
};

const defaultResolver = createHostResolver();

export const { apiUrl, resolveHost, replaceHostTokens } = defaultResolver;
