const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec";
const STATUS_CALLBACK = "__statusCallback";
const STATUS_KEYS = ["AirCondition", "Date", "Temperature", "Humid"];

export const buildStatusUrl = (params = {}) => `${STATUS_SCRIPT_URL}?${new URLSearchParams(params)}`;

export const parseLatestPayload = (payload) => {
  const trimmed = payload.trim();
  const stripped = trimmed
    .replace(new RegExp(`^${STATUS_CALLBACK}(?:&&${STATUS_CALLBACK})?\\(`), "")
    .replace(/\);?\s*$/, "");
  const cleaned = /^[{[]/.test(trimmed)
    ? trimmed
    : stripped.trim();
  try {
    const { conditions, status } = JSON.parse(cleaned);
    if (!Array.isArray(conditions) || !conditions.length) {
      console.error("Missing status conditions", {
        hasConditions: Array.isArray(conditions),
        length: Array.isArray(conditions) ? conditions.length : null,
      });
      return null;
    }
    const latest = conditions.pop();
    return latest ? (status === undefined ? latest : { ...latest, AirCondition: status }) : null;
  } catch (error) {
    const cleanedPreview = cleaned.length > 200 ? `${cleaned.slice(0, 200)}…` : cleaned;
    console.error("Failed to parse status payload", {
      cleanedPreview,
      cleanedLength: cleaned.length,
      error,
    });
    return null;
  }
};

export const fetchLatestStatus = async (fetcher, { signal } = {}) => {
  const url = buildStatusUrl({ callback: STATUS_CALLBACK });
  const response = await (signal ? fetcher(url, { signal }) : fetcher(url));
  const payload = await response.text();
  if (!response.ok) {
    console.error("Failed to fetch status payload", {
      status: response.status,
      statusText: response.statusText,
      preview: payload.slice(0, 200),
    });
  }
  return parseLatestPayload(payload);
};

const formatDateTimeLocal = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
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
  if (!latest || typeof latest !== "object") return;
  STATUS_KEYS.forEach((key) => {
    const value = latest[key];
    if (key === "AirCondition") {
      elements[key].innerText = value == null ? "AirCondition" : String(value);
      return;
    }
    if (key === "Date") {
      elements[key].innerText = formatDateTimeLocal(value);
      return;
    }
    elements[key].innerText = key === "Temperature" ? `${value}C` : `${value}%`;
  });
};

export const STATUS_CELL_KEYS = STATUS_KEYS;
