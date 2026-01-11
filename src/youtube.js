import { API_BASE_URL, ERROR_MESSAGES, YOUTUBE_HOSTS } from "./constants.js";

export const parseYouTubeId = (youtubeUrl) => {
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
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) {
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

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  if (!videoId) {
    return null;
  }
  return `${API_BASE_URL}/youtube-play/-h/${host}/-v/40/-i/${videoId}`;
};
