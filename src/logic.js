const API_BASE_URL = "http://a.ze.gs";
export const DEVICE_HOSTS = {
  nest: "192.168.1.22",
  tatami: "192.168.1.236",
  tv: "192.168.1.219",
};
const VOICE_HOSTS = { speak: DEVICE_HOSTS.nest, speakTatami: DEVICE_HOSTS.tatami };
const ALARM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec";
const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec";
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);
const CAR_ARRIVAL_MESSAGE = "チエミさん、ママさん、パパが到着しました。準備をお願いします。";
const STATUS_CALLBACK = "__statusCallback";
const STATUS_KEYS = ["Date", "Temperature", "Humid"];
const REQUIRED_IDS = ["voicetext", "speak", "speak_tatami", "hour", "min", "alarmtext", "set"];

const sanitizeText = (value) => encodeURIComponent(value.replace(/[\s\n\r]/g, ""));
const getRequiredElements = (doc, ids) => Object.fromEntries(ids.map((id) => [id, doc.getElementById(id)]));

export const buildStatusUrl = (params = {}) => `${STATUS_SCRIPT_URL}?${new URLSearchParams(params)}`;
const padTime = (value) => String(value).padStart(2, "0");
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
  } catch {
    return "";
  }
};

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  return `${API_BASE_URL}/youtube-play/-h/${host}/-v/40/-i/${videoId}`;
};

export const buildCarArrivalArgs = () => [
  "google-home-speaker-wrapper",
  "-h",
  DEVICE_HOSTS.nest,
  "-v",
  60,
  "-s",
  sanitizeText(CAR_ARRIVAL_MESSAGE),
];

export const resolveHost = (value) => DEVICE_HOSTS[value] ?? value;
export const replaceHostTokens = (args) =>
  args.map((arg) => (typeof arg === "string" && arg.startsWith("host:") ? resolveHost(arg.slice(5)) : arg));

export const parseLatestPayload = (payload) => {
  const cleaned = payload
    .replace(new RegExp(`^${STATUS_CALLBACK}&&${STATUS_CALLBACK}\\(`), "")
    .replace(/\);$/, "");
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed.pop() : null;
};

export const fetchLatestStatus = async (fetcher) => {
  const response = await fetcher(buildStatusUrl({ callback: STATUS_CALLBACK }));
  const payload = await response.text();
  return parseLatestPayload(payload);
};

const formatDateTimeLocal = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(parsed)
    .replace(",", "");
};

export const updateStatusCells = (latest, elements) => {
  STATUS_KEYS.forEach((key) => {
    const value = latest[key];
    if (key === "Date") {
      elements[key].innerText = formatDateTimeLocal(value);
      return;
    }
    elements[key].innerText = key === "Temperature" ? `${value}C` : `${value}%`;
  });
};

const setAlarmDefaults = (hourSelect, minuteSelect, now = new Date()) => {
  const setIfExists = (select, value) => {
    if (select.querySelector(`option[value="${value}"]`)) {
      select.value = value;
    }
  };
  setIfExists(hourSelect, padTime(now.getHours()));
  setIfExists(minuteSelect, padTime(now.getMinutes()));
};

export const initApp = (doc, fetcher = fetch) => {
  const requiredElements = getRequiredElements(doc, REQUIRED_IDS);
  const statusCells = getRequiredElements(doc, STATUS_KEYS);
  if (Object.values(requiredElements).some((element) => !element)) {
    return null;
  }

  const { voicetext, speak, speak_tatami: speakTatami, hour, min, alarmtext, set: setButton } = requiredElements;
  const youtubeUrl = doc.getElementById("youtube_url");

  setAlarmDefaults(hour, min);

  voicetext.addEventListener("input", () => {
    updateVoiceLinks(voicetext.value, { speak, speakTatami });
  });

  const setAlarm = () => fetcher(buildAlarmUrl(hour.value, min.value, alarmtext.value));
  const youtubePlay = (host) => {
    if (!youtubeUrl) {
      return null;
    }
    if (!parseYouTubeId(youtubeUrl.value)) {
      youtubeUrl.value = "";
      return null;
    }
    return fetcher(buildYouTubePlayUrl(host, youtubeUrl.value));
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
      statusCells,
    },
  };
};
