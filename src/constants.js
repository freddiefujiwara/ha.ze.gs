export const DATA_API_DELAY_MS = 200;
export const NOTIFY_DEBOUNCE_MS = 2 * 1000;
export const NOTIFY_DURATION_MS = 5 * 1000;
export const STATUS_INTERVAL_MS = 10 * 60 * 1000;
export const STATUS_BACKOFF_MS = 60 * 1000;
export const MAX_TEXT =
  "１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３4";

export const ALARM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec";

export const API_BASE_URL = "http://a.ze.gs";

export const DEVICE_HOSTS = {
  nest: "192.168.1.22",
  tatami: "192.168.1.236",
  tv: "192.168.1.219",
};

export const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec";
export const STATUS_CALLBACK = "__statusCallback";
export const STATUS_KEYS = ["AirCondition", "Date", "Temperature", "Humid"];

export const VOICE_HOSTS = { speak: DEVICE_HOSTS.nest, speakTatami: DEVICE_HOSTS.tatami };
export const CAR_ARRIVAL_MESSAGE = "チエミさん、ママさん、パパが到着しました。準備をお願いします。";

export const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);

export const ERROR_MESSAGES = {
  FETCH_STATUS: "Failed to fetch latest status",
  EXEC_COMMANDS: "Failed to execute data-api commands",
  SEND_VOICE: "Failed to send voice command",
  PARSE_DATA_API: "Failed to parse data-api payload",
  INVALID_DATA_API: "Invalid data-api payload",
  MISSING_CONDITIONS: "Missing status conditions",
  FETCH_PAYLOAD: "Failed to fetch status payload",
  INVALID_URL: "Invalid URL",
  TOO_LONG: "Too long text",
};
