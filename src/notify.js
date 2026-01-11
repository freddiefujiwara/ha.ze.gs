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

const resolveContainer = (doc, containerId) => {
  if (!doc?.getElementById) {
    return null;
  }
  const container = doc.getElementById(containerId);
  if (!container) {
    return null;
  }
  return container.isConnected === false ? null : container;
};

const createToast = (doc, message) => {
  const toast = doc.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  return toast;
};

export const createNotifier = (doc, options = {}) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  let lastMessage = "";
  let debounceTimer;

  const scheduleDebounceReset = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastMessage = "";
    }, settings.debounceMs);
  };

  const removeToast = (toast) => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), settings.transitionMs);
  };

  const notify = (message) => {
    scheduleDebounceReset();
    const normalizedMessage = normalizeMessage(message);
    if (lastMessage === normalizedMessage) {
      return;
    }
    lastMessage = normalizedMessage;

    const container = resolveContainer(doc, settings.containerId);
    if (!container) {
      return;
    }

    const toast = createToast(doc, normalizedMessage);
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), settings.showDelayMs);
    setTimeout(() => removeToast(toast), settings.durationMs);
  };

  return { notify };
};

export const notify = (doc, message) => {
  if (!doc) {
    return;
  }
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
