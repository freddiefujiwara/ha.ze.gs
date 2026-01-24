import { NOTIFY_DEBOUNCE_MS, NOTIFY_DURATION_MS } from "./constants.js";

const DEFAULT_OPTIONS = {
  containerId: "notification-container",
  debounceMs: NOTIFY_DEBOUNCE_MS,
  durationMs: NOTIFY_DURATION_MS,
  showDelayMs: 10,
  transitionMs: 300,
};

const cache = new WeakMap();
const messageText = (message) => String(message ?? "");

/**
 * @param {Document} doc
 * @param {{
 *   containerId?: string,
 *   debounceMs?: number,
 *   durationMs?: number,
 *   showDelayMs?: number,
 *   transitionMs?: number
 * }} [options]
 * @returns {{ notify: (message: unknown) => void }}
 */
export const createNotifier = (doc, options = {}) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  let lastMessage = "";
  let timer;
  const notify = (message) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      lastMessage = "";
    }, settings.debounceMs);
    const text = messageText(message);
    if (text === lastMessage) return;
    lastMessage = text;
    const container = doc?.getElementById?.(settings.containerId);
    if (!container || container.isConnected === false) return;
    const toast = doc.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), settings.showDelayMs);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), settings.transitionMs);
    }, settings.durationMs);
  };
  return { notify };
};

/**
 * @param {Document} doc
 * @param {unknown} message
 */
export const notify = (doc, message) => {
  if (!doc) return;
  const notifier = cache.get(doc) ?? createNotifier(doc);
  cache.set(doc, notifier);
  notifier.notify(message);
};

/**
 * @param {Document} doc
 * @param {string} message
 * @param {unknown} [details]
 */
export const reportError = (doc, message, details) => {
  details === undefined ? console.error(message) : console.error(message, details);
  notify(doc, message);
};
