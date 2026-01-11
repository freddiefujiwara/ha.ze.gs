import { API_BASE_URL, YOUTUBE_HOSTS } from "./constants.js";

export const parseYouTubeId = (youtubeUrl) => {
  if (!youtubeUrl) {
    return "";
  }
  try {
    const parsed = new URL(youtubeUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.error(`Invalid URL: ${youtubeUrl}`);
      return "";
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.split("/")[1] || "";
    }
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) {
      console.error(`Invalid URL: ${youtubeUrl}`);
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
    console.error(`Invalid URL: ${youtubeUrl}`);
    return "";
  }
};

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  if (!videoId) {
    return null;
  }
  return `${API_BASE_URL}/youtube-play/-h/${host}/-v/40/-i/${videoId}`;
};
