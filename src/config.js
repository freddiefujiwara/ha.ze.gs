// ha frontend configuration.
//
// API_BASE_URL and DEVICE_HOSTS are NOT written in this repository.
// They name the home server and the LAN addresses of the home devices,
// so they are provided at build time from GitHub Secrets through Vite
// environment variables:
//   VITE_API_BASE_URL  the home server base URL
//   VITE_DEVICE_HOSTS  the device host map as a JSON string,
//                      e.g. {"nest":"...","tatami":"...","tv":"..."}
// For local development, put the same variables in .env.local
// (git-ignored). Tests use dummy values from .env.test.

export function parseDeviceHosts(raw) {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function buildConfig(env = import.meta.env) {
  const deviceHosts = parseDeviceHosts(env.VITE_DEVICE_HOSTS);
  return {
    API_BASE_URL: env.VITE_API_BASE_URL || "",
    DEVICE_HOSTS: deviceHosts,
    VOICE_HOSTS: { speak: deviceHosts.nest, speakTatami: deviceHosts.tatami },
  };
}

export const CONFIG = buildConfig();
