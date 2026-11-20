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
  // Args come from JSON payloads, where a value's toString may not be
  // callable; such a segment reads as empty instead of throwing.
  const toSegment = (arg) => {
    try {
      return String(arg);
    } catch {
      return "";
    }
  };
  const apiUrl = (args) => `${apiBaseUrl}/${args.map(toSegment).join("/")}`;
  // Own-property lookups only: a plain map access would resolve names
  // like "toString" or "constructor" through the prototype chain and
  // hand back a function instead of the name itself.
  const resolveHost = (value) => (Object.hasOwn(deviceHosts, value) ? deviceHosts[value] : value);
  const resolveDevice = (value) => (Object.hasOwn(switchbotDevices, value) ? switchbotDevices[value] : value);
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
