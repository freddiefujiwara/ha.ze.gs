import { API_BASE_URL_VALUE } from "./hosts.js";

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);

export const parseYouTubeId = (youtubeUrl) => {
  try {
    const parsed = new URL(youtubeUrl);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.split("/")[1] || "";
    }
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) {
      return "";
    }

    const handlers = [
      {
        match: () => parsed.pathname === "/watch",
        getId: () => parsed.searchParams.get("v") || "",
      },
      {
        match: () => parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/shorts/"),
        getId: () => parsed.pathname.split("/")[2] || "",
      },
    ];

    const handler = handlers.find(({ match }) => match());
    return handler ? handler.getId() : "";
  } catch {
    return "";
  }
};

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  return `${API_BASE_URL_VALUE}/youtube-play/-h/${host}/-v/40/-i/${videoId}`;
};
