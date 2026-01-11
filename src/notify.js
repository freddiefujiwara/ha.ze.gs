import { NOTIFY_DEBOUNCE_MS, NOTIFY_DURATION_MS } from "./constants.js";

let lastMessage = "";
let debounceTimer;

export const notify = (doc, message) => {
  const hideToast = (element) => {
    element.classList.remove("show");
    setTimeout(() => element.remove(), 300);
  };

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    lastMessage = "";
  }, NOTIFY_DEBOUNCE_MS);

  if (lastMessage === message) {
    return;
  }
  lastMessage = message;

  const container = doc.getElementById("notification-container");
  if (!container) {
    return;
  }

  const toast = doc.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => hideToast(toast), NOTIFY_DURATION_MS);
};
