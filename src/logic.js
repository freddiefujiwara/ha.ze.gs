const API_BASE_URL = "http://a.ze.gs";
const VOICE_HOSTS = {
  speak: "192.168.1.22",
  speakTatami: "192.168.1.236",
};
const ALARM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec";
const GPT_HOOK_URL = "https://hook.us1.make.com/7zekvch82ird62gydqbu356ncnkx05z9";
const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec";
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);

const sanitizeText = (value) => encodeURIComponent(value.replace(/[\s\n\r]/g, ""));

const getRequiredElements = (doc, ids) => Object.fromEntries(ids.map((id) => [id, doc.getElementById(id)]));

const buildStatusUrl = (params = {}) => {
  const url = new URL(STATUS_SCRIPT_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export const apiUrl = (args) => `${API_BASE_URL}/${args.join("/")}`;

export const buildVoiceUrls = (voiceText) => {
  const sanitized = sanitizeText(voiceText);
  return {
    speak: `${API_BASE_URL}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speak}/-v/60/-s/${sanitized}`,
    speakTatami: `${API_BASE_URL}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speakTatami}/-v/60/-s/${sanitized}`,
  };
};

export const updateVoiceLinks = (voiceText, elements) => {
  const { speak, speakTatami } = buildVoiceUrls(voiceText);
  elements.speak.dataset.url = speak;
  elements.speakTatami.dataset.url = speakTatami;
  elements.speak.setAttribute("href", "#");
  elements.speakTatami.setAttribute("href", "#");
};

export const buildAlarmUrl = (hour, minute, text) => {
  const sanitized = sanitizeText(text);
  return `${ALARM_SCRIPT_URL}?time=${hour}:${minute}:00&text=${sanitized}`;
};

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
  } catch (error) {
    return "";
  }
};

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  return { videoId, url: `${API_BASE_URL}/youtube-play/-h/${host}/-v/40/-i/${videoId}` };
};

export const buildGptUrl = (host, prompt) => {
  const sanitized = sanitizeText(prompt);
  return `${GPT_HOOK_URL}?p=${sanitized}&i=${host}`;
};

export const parseLatestPayload = (payload) => {
  const cleaned = payload.replace(/^a&&a\(/, "").replace(/\);$/, "");
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed.pop() : null;
};

export const fetchLatestStatus = async (fetcher) => {
  const response = await fetcher(buildStatusUrl({ callback: "a" }));
  const payload = await response.text();
  return parseLatestPayload(payload);
};

export const updateStatusCells = (latest, elements) => {
  ["Datetime", "Temperature", "Humidity"].forEach((target) => {
    elements[target].innerText = latest[target];
  });
};

export const initApp = (doc, fetcher = fetch) => {
  const requiredIds = ["voicetext", "speak", "speak_tatami", "hour", "min", "alarmtext", "set"];
  const requiredElements = getRequiredElements(doc, requiredIds);

  const statusCells = getRequiredElements(doc, ["Datetime", "Temperature", "Humidity"]);

  if (Object.values(requiredElements).some((element) => !element)) {
    return null;
  }

  const { voicetext, speak, speak_tatami: speakTatami, hour, min, alarmtext, set: setButton } = requiredElements;
  const youtubeUrl = doc.getElementById("youtube_url");
  const prompt = doc.getElementById("prompt");

  voicetext.addEventListener("input", () => {
    updateVoiceLinks(voicetext.value, { speak, speakTatami });
  });

  const setAlarm = () => {
    const url = buildAlarmUrl(hour.value, min.value, alarmtext.value);
    return fetcher(url);
  };

  const youtubePlay = (host) => {
    if (!youtubeUrl) {
      return null;
    }
    const { url } = buildYouTubePlayUrl(host, youtubeUrl.value);
    return fetcher(url);
  };

  const gpt = (host) => {
    if (!prompt) {
      return null;
    }
    return fetcher(buildGptUrl(host, prompt.value));
  };

  const fetchLatest = async () => {
    if (Object.values(statusCells).some((element) => !element)) {
      return null;
    }
    const latest = await fetchLatestStatus(fetcher);
    updateStatusCells(latest, statusCells);
    return latest;
  };

  return {
    setAlarm,
    youtubePlay,
    gpt,
    fetchLatest,
    elements: {
      voicetext,
      speak,
      speakTatami,
      hour,
      min,
      alarmtext,
      setButton,
      youtubeUrl,
      prompt,
      statusCells,
    },
  };
};
