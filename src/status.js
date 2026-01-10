const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec";
const STATUS_CALLBACK = "__statusCallback";
const STATUS_KEYS = ["AirCondition", "Date", "Temperature", "Humid"];

export const buildStatusUrl = (params = {}) => `${STATUS_SCRIPT_URL}?${new URLSearchParams(params)}`;

export const parseLatestPayload = (payload) => {
  const cleaned = payload
    .replace(new RegExp(`^${STATUS_CALLBACK}&&${STATUS_CALLBACK}\\(`), "")
    .replace(/\);$/, "");
  const parsed = JSON.parse(cleaned);
  const latest = Array.isArray(parsed?.conditions) ? parsed.conditions.pop() : null;
  if (!latest) {
    return null;
  }
  const statusEntry = Array.isArray(parsed?.status) ? parsed.status.pop() : null;
  if (Array.isArray(statusEntry)) {
    latest.AirCondition = statusEntry.pop();
  }
  return latest;
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
    if (key === "AirCondition") {
      elements[key].innerText = value ?? "";
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
