import { apiUrl, initApp } from "./logic.js";

export const start = (doc = document, fetcher = fetch) => {
  const instance = initApp(doc, fetcher);
  if (!instance) {
    return null;
  }

  const { setAlarm, youtubePlay, gpt, fetchLatest, elements } = instance;

  elements.setButton.addEventListener("click", (event) => {
    event.preventDefault();
    setAlarm();
  });

  if (elements.youtubeUrl) {
    doc.querySelectorAll("a[href^=\"javascript:youtubePlay\"]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const host = link.getAttribute("href")?.match(/youtubePlay\('(.+)'\)/)?.[1];
        if (host) {
          youtubePlay(host);
        }
      });
    });
  }

  if (elements.prompt) {
    doc.querySelectorAll("a[href^=\"javascript:gpt\"]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const host = link.getAttribute("href")?.match(/gpt\('(.+)'\)/)?.[1];
        if (host) {
          gpt(host);
        }
      });
    });
  }

  fetchLatest();

  return instance;
};

if (typeof window !== "undefined") {
  const instance = start(document, fetch);

  window.api = (args) => {
    fetch(apiUrl(args));
  };

  window.setAlarm = () => instance?.setAlarm();
  window.youtubePlay = (host) => instance?.youtubePlay(host);
  window.gpt = (host) => instance?.gpt(host);
}
