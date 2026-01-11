import { API_BASE_URL, ERROR_MESSAGES, YOUTUBE_HOSTS } from "./constants.js";

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

  const buildYouTubePlayUrl = (host, youtubeUrl) => {
    const videoId = parseYouTubeId(youtubeUrl);
    if (!videoId) {
      return null;
    }
    return `${apiBaseUrl}/youtube-play/-h/${host}/-v/40/-i/${videoId}`;
  };

  return {
    parseYouTubeId,
    buildYouTubePlayUrl,
  };
};

const defaultYouTubeService = createYouTubeService();

export const { parseYouTubeId, buildYouTubePlayUrl } = defaultYouTubeService;

export const createYouTubeController = ({
  doc,
  fetcher,
  notifier,
  elements,
  buildYouTubePlayUrl: buildYouTubePlayUrlFn = buildYouTubePlayUrl,
} = {}) => {
  const youtubePlay = (host) => {
    const { youtubeUrl } = elements;
    if (!youtubeUrl) return null;
    const playUrl = buildYouTubePlayUrlFn(host, youtubeUrl.value);
    if (!playUrl) {
      if (youtubeUrl.value) notifier?.reportError?.(doc, ERROR_MESSAGES.INVALID_URL, youtubeUrl.value);
      youtubeUrl.value = "";
      return null;
    }
    return fetcher(playUrl);
  };
  return { youtubePlay };
};
