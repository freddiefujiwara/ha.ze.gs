const API_BASE_URL = "http://a.ze.gs";
export const DEVICE_HOSTS = {
  nest: "192.168.1.22",
  tatami: "192.168.1.236",
  tv: "192.168.1.219",
};

export const apiUrl = (args) => `${API_BASE_URL}/${args.join("/")}`;
export const resolveHost = (value) => DEVICE_HOSTS[value] ?? value;
export const replaceHostTokens = (args) =>
  args.map((arg) => (typeof arg === "string" && arg.startsWith("host:") ? resolveHost(arg.slice(5)) : arg));

export const API_BASE_URL_VALUE = API_BASE_URL;
