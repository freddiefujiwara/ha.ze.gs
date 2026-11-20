import { ERROR_MESSAGES, STATUS_CALLBACK, STATUS_KEYS, STATUS_SCRIPT_URL, STATUS_TOKEN } from "./constants.js";
import { reportError } from "./notify.js";

/**
 * @param {{
 *   statusScriptUrl?: string,
 *   statusCallback?: string,
 *   statusKeys?: Array<string>,
 *   reportError?: (doc: Document, message: string, details?: unknown) => void
 * }} [options]
 * @returns {{
 *   buildStatusUrl: (params?: Record<string, string>) => string,
 *   parseLatestPayload: (doc: Document, payload: string) => Record<string, unknown> | null,
 *   fetchLatestStatus: (doc: Document, fetcher: typeof fetch, options?: { signal?: AbortSignal }) => Promise<Record<string, unknown> | null>,
 *   updateStatusCells: (latest: Record<string, unknown>, elements: Record<string, HTMLElement>) => void,
 *   statusCellKeys: Array<string>
 * }}
 */
const createStatusService = ({
  statusScriptUrl = STATUS_SCRIPT_URL,
  statusCallback = STATUS_CALLBACK,
  statusKeys = STATUS_KEYS,
  statusToken = STATUS_TOKEN,
  reportError: reportErrorFn = reportError,
} = {}) => {
  // Writes (s=status) change the sheet the air-condition automation
  // acts on, so they carry the shared token the GAS endpoint requires.
  // Reads (the JSONP status fetch) stay token-free.
  const buildStatusUrl = (params = {}) => {
    const withToken =
      params.s === "status" && statusToken ? { ...params, token: statusToken } : params;
    return `${statusScriptUrl}?${new URLSearchParams(withToken)}`;
  };

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
      // A deformed last row (scalar, string, array) is no status at all;
      // spreading it would fabricate readings from its characters/keys.
      if (!latest || typeof latest !== "object" || Array.isArray(latest)) return null;
      return status === undefined ? latest : { ...latest, AirCondition: status };
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
    // Only strings carry a date here; a number would silently format as
    // a 1970 date and an unstringifiable value would throw in Date.
    if (typeof value !== "string") return "";
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

  // Cell values arrive from the conditions sheet; anything that is not
  // a string or a finite number is not a reading and renders blank
  // instead of "undefinedC", "null%" or "trueC".
  const cellText = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
  };

  const updateStatusCells = (latest, elements) => {
    if (!latest || typeof latest !== "object") return;
    statusKeys.forEach((key) => {
      const value = latest[key];
      if (key === "AirCondition") return void (elements[key].innerText = value == null ? "AirCondition" : cellText(value));
      if (key === "Date") return void (elements[key].innerText = formatDateTimeLocal(value));
      const text = cellText(value);
      elements[key].innerText = text === "" ? "" : key === "Temperature" ? `${text}C` : `${text}%`;
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

export { createStatusService };
export const { buildStatusUrl, parseLatestPayload, fetchLatestStatus, updateStatusCells } = defaultStatusService;

/**
 * @param {{
 *   doc: Document,
 *   fetcher: typeof fetch,
 *   statusCells: Record<string, HTMLElement>,
 *   hasStatus?: boolean,
 *   statusService?: ReturnType<typeof createStatusService>
 * }} params
 */
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
