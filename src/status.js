const STATUS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec";
const STATUS_CALLBACK = "__statusCallback";
const STATUS_KEYS = ["Date", "Temperature", "Humid"];

export const buildStatusUrl = (params = {}) => `${STATUS_SCRIPT_URL}?${new URLSearchParams(params)}`;

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

export const STATUS_CELL_KEYS = STATUS_KEYS;
