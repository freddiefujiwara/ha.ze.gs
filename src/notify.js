import { NOTIFY_DEBOUNCE_MS, NOTIFY_DURATION_MS } from "./constants.js";

const DEFAULT_OPTIONS = {
  containerId: "notification-container",
  debounceMs: NOTIFY_DEBOUNCE_MS,
  durationMs: NOTIFY_DURATION_MS,
  showDelayMs: 10,
  transitionMs: 300,
};

const notifierCache = new WeakMap();
const normalizeMessage = (message) => String(message ?? "");
const getContainer = (doc, containerId) => doc?.getElementById?.(containerId) ?? null;

export const createNotifier = (doc, options = {}) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  let lastMessage = "";
  let debounceTimer;
  const reset = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastMessage = "";
    }, settings.debounceMs);
  };
  const hide = (toast) => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), settings.transitionMs);
  };
  const notify = (message) => {
    reset();
    const text = normalizeMessage(message);
    if (lastMessage === text) return;
    lastMessage = text;
    const container = getContainer(doc, settings.containerId);
    if (!container || container.isConnected === false) return;
    const toast = doc.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), settings.showDelayMs);
    setTimeout(() => hide(toast), settings.durationMs);
  };
  return { notify };
};

export const notify = (doc, message) => {
  if (!doc) return;
  let notifier = notifierCache.get(doc);
  if (!notifier) {
    notifier = createNotifier(doc);
    notifierCache.set(doc, notifier);
  }
  notifier.notify(message);
};

export const reportError = (doc, message, details) => {
  if (details === undefined) {
    console.error(message);
  } else {
    console.error(message, details);
  }
  notify(doc, message);
};
