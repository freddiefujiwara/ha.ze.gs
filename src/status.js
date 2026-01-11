import { ERROR_MESSAGES, STATUS_CALLBACK, STATUS_KEYS, STATUS_SCRIPT_URL } from "./constants.js";
import { reportError } from "./notify.js";

export const createStatusService = ({
  statusScriptUrl = STATUS_SCRIPT_URL,
  statusCallback = STATUS_CALLBACK,
  statusKeys = STATUS_KEYS,
  reportError: reportErrorFn = reportError,
} = {}) => {
  const buildStatusUrl = (params = {}) => `${statusScriptUrl}?${new URLSearchParams(params)}`;

  const stripStatusCallback = (value) =>
    value
      .replace(new RegExp(`^${statusCallback}(?:&&${statusCallback})?\\(`), "")
      .replace(/\);?\s*$/, "");

  const normalizePayload = (payload) => {
    const trimmed = payload.trim();
    if (!trimmed) return "";
    return /^[{[]/.test(trimmed) ? trimmed : stripStatusCallback(trimmed).trim();
  };

  const parseConditions = (doc, payload) => {
    try {
      const { conditions, status } = JSON.parse(payload);
      if (!Array.isArray(conditions) || !conditions.length) {
        reportErrorFn(doc, ERROR_MESSAGES.MISSING_CONDITIONS, {
          hasConditions: Array.isArray(conditions),
          length: Array.isArray(conditions) ? conditions.length : null,
        });
        return null;
      }
      const latest = conditions.at(-1);
      return latest ? (status === undefined ? latest : { ...latest, AirCondition: status }) : null;
    } catch (error) {
      reportErrorFn(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
        cleanedPreview: payload.length > 200 ? `${payload.slice(0, 200)}…` : payload,
        cleanedLength: payload.length,
        error,
      });
      return null;
    }
  };

  const parseLatestPayload = (doc, payload) => {
    const cleaned = normalizePayload(payload);
    if (!cleaned) {
      reportErrorFn(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
        cleanedPreview: "",
        cleanedLength: 0,
        error: new Error("Empty payload"),
      });
      return null;
    }
    return parseConditions(doc, cleaned);
  };

  const fetchLatestStatus = async (doc, fetcher, { signal } = {}) => {
    const url = buildStatusUrl({ callback: statusCallback });
    const response = await (signal ? fetcher(url, { signal }) : fetcher(url));
    const payload = await response.text();
    if (!response.ok) {
      reportErrorFn(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
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

  const updateStatusCells = (latest, elements) => {
    if (!latest || typeof latest !== "object") return;
    statusKeys.forEach((key) => {
      const value = latest[key];
      if (key === "AirCondition") return void (elements[key].innerText = value == null ? "AirCondition" : String(value));
      if (key === "Date") return void (elements[key].innerText = formatDateTimeLocal(value));
      elements[key].innerText = key === "Temperature" ? `${value}C` : `${value}%`;
    });
  };

  return {
    buildStatusUrl,
    parseLatestPayload,
    fetchLatestStatus,
    updateStatusCells,
    statusCellKeys: statusKeys,
  };
};

const defaultStatusService = createStatusService();

export const { buildStatusUrl, parseLatestPayload, fetchLatestStatus, updateStatusCells } = defaultStatusService;

export const createStatusController = ({
  doc,
  fetcher,
  statusCells,
  hasStatus = true,
  statusService = defaultStatusService,
} = {}) => {
  const fetchLatest = async (signal) => {
    if (!hasStatus) return null;
    const latest = await statusService.fetchLatestStatus(doc, fetcher, { signal });
    if (!latest) return null;
    statusService.updateStatusCells(latest, statusCells);
    return latest;
  };
  return { fetchLatest };
};

export const STATUS_CELL_KEYS = STATUS_KEYS;
