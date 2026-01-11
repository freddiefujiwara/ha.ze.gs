import { ERROR_MESSAGES, STATUS_CALLBACK, STATUS_KEYS, STATUS_SCRIPT_URL } from "./constants.js";
import { reportError } from "./notify.js";

export const buildStatusUrl = (params = {}) => `${STATUS_SCRIPT_URL}?${new URLSearchParams(params)}`;

const stripStatusCallback = (value) =>
  value
    .replace(new RegExp(`^${STATUS_CALLBACK}(?:&&${STATUS_CALLBACK})?\\(`), "")
    .replace(/\);?\s*$/, "");

const normalizePayload = (payload) => {
  const trimmed = payload.trim();
  if (!trimmed) {
    return "";
  }
  if (/^[{[]/.test(trimmed)) {
    return trimmed;
  }
  return stripStatusCallback(trimmed).trim();
};

const parseConditions = (doc, payload) => {
  try {
    const { conditions, status } = JSON.parse(payload);
    if (!Array.isArray(conditions) || !conditions.length) {
      reportError(doc, ERROR_MESSAGES.MISSING_CONDITIONS, {
        hasConditions: Array.isArray(conditions),
        length: Array.isArray(conditions) ? conditions.length : null,
      });
      return null;
    }
    const latest = conditions.at(-1);
    return latest ? (status === undefined ? latest : { ...latest, AirCondition: status }) : null;
  } catch (error) {
    const cleanedPreview = payload.length > 200 ? `${payload.slice(0, 200)}…` : payload;
    reportError(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
      cleanedPreview,
      cleanedLength: payload.length,
      error,
    });
    return null;
  }
};

export const parseLatestPayload = (doc, payload) => {
  const cleaned = normalizePayload(payload);
  if (!cleaned) {
    reportError(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
      cleanedPreview: "",
      cleanedLength: 0,
      error: new Error("Empty payload"),
    });
    return null;
  }
  return parseConditions(doc, cleaned);
};

export const fetchLatestStatus = async (doc, fetcher, { signal } = {}) => {
  const url = buildStatusUrl({ callback: STATUS_CALLBACK });
  const response = await (signal ? fetcher(url, { signal }) : fetcher(url));
  const payload = await response.text();
  if (!response.ok) {
    reportError(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
      status: response.status,
      statusText: response.statusText,
      preview: payload.slice(0, 200),
    });
  }
  return parseLatestPayload(doc, payload);
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
