import { API_BASE_URL, ERROR_MESSAGES, YOUTUBE_HOSTS } from "./constants.js";

/**
 * @param {{ apiBaseUrl?: string, youtubeHosts?: Set<string> }} [options]
 * @returns {{
 *   parseYouTubeId: (youtubeUrl: string) => string | null,
 *   buildYouTubePlayUrl: (host: string, youtubeUrl: string, volume?: string | number) => string | null
 * }}
 */
export const createYouTubeService = ({ apiBaseUrl = API_BASE_URL, youtubeHosts = YOUTUBE_HOSTS } = {}) => {
  const parseYouTubeId = (youtubeUrl) => {
    if (!youtubeUrl) {
      return null;
    }
    try {
      const parsed = new URL(youtubeUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      if (parsed.hostname === "youtu.be") {
        return parsed.pathname.split("/")[1] || null;
      }
      if (!youtubeHosts.has(parsed.hostname)) {
        return null;
      }

      const handlers = [
        {
          match: () => parsed.pathname === "/watch",
          getId: () => parsed.searchParams.get("v") || null,
        },
        {
          match: () => parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/shorts/"),
          getId: () => parsed.pathname.split("/")[2] || null,
        },
      ];

      const handler = handlers.find(({ match }) => match());
      return handler ? handler.getId() : null;
    } catch {
      return null;
    }
  };

  const buildYouTubePlayUrl = (host, youtubeUrl, volume) => {
    const videoId = parseYouTubeId(youtubeUrl);
    if (!videoId) {
      return null;
    }
    const volumeNumber = Number(volume);
    const resolvedVolume =
      Number.isFinite(volumeNumber) && volumeNumber >= 0 && volumeNumber <= 100 ? volumeNumber : 40;
    return `${apiBaseUrl}/youtube-play/-h/${host}/-v/${resolvedVolume}/-i/${videoId}`;
  };

  return {
    parseYouTubeId,
    buildYouTubePlayUrl,
  };
};

const defaultYouTubeService = createYouTubeService();

export const { parseYouTubeId, buildYouTubePlayUrl } = defaultYouTubeService;

/**
 * @param {{
 *   doc: Document,
 *   fetcher: typeof fetch,
 *   notifier?: { reportError?: (doc: Document, message: string, details?: unknown) => void },
 *   elements: { youtubeUrl?: HTMLInputElement },
 *   buildYouTubePlayUrl?: (host: string, youtubeUrl: string, volume?: string | number) => string | null
 * }} params
 */
export const createYouTubeController = ({
  doc,
  fetcher,
  notifier,
  elements,
  buildYouTubePlayUrl: buildYouTubePlayUrlFn = buildYouTubePlayUrl,
} = {}) => {
  const youtubePlay = (host, volume) => {
    const { youtubeUrl } = elements;
    if (!youtubeUrl) return null;
    const playUrl = buildYouTubePlayUrlFn(host, youtubeUrl.value, volume);
    if (!playUrl) {
      if (youtubeUrl.value) notifier?.reportError?.(doc, ERROR_MESSAGES.INVALID_URL, youtubeUrl.value);
      youtubeUrl.value = "";
      return null;
    }
    return fetcher(playUrl);
  };
  return { youtubePlay };
};
