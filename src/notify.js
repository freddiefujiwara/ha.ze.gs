import { NOTIFY_DEBOUNCE_MS, NOTIFY_DURATION_MS } from "./constants.js";

let lastMessage = "";
let debounceTimer;
let removeTimer;

const getContainer = (doc) => doc.getElementById("notification-container");

const hideToast = (element) => {
  if (!element) return;
  element.classList.remove("show");
  setTimeout(() => element.remove(), 300);
};

export const notify = (doc, message) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    lastMessage = "";
  }, NOTIFY_DEBOUNCE_MS);

  if (lastMessage === message) {
    return;
  }
  lastMessage = message;

  const container = getContainer(doc);
  if (!container) {
    return;
  }

  const toast = doc.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  // NOTE: A short delay is required for the CSS transition to work
  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => hideToast(toast), NOTIFY_DURATION_MS);
};
