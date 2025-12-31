import { apiUrl, buildCarArrivalArgs, buildStatusUrl, initApp } from "./logic.js";

export const bindLinkClicks = (doc, selector, handler) => {
  doc.querySelectorAll(selector).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      handler(link);
    });
  });
};

export const wireEvents = (doc, fetcher, instance) => {
  const { setAlarm, youtubePlay, elements } = instance;

  elements.setButton.addEventListener("click", (event) => {
    event.preventDefault();
    setAlarm();
  });

  bindLinkClicks(doc, "a[data-api], a[data-fetch], a[data-status-action], a[data-message-key]", (link) => {
    const apiArgs = link.dataset.api ? JSON.parse(link.dataset.api) : null;
    if (apiArgs) {
      fetcher(apiUrl(apiArgs));
    }
    if (link.dataset.messageKey === "car-arrival") {
      fetcher(apiUrl(buildCarArrivalArgs()));
    }
    if (link.dataset.fetch) {
      fetcher(link.dataset.fetch);
    }
    if (link.dataset.statusAction) {
      fetcher(buildStatusUrl({ s: "status", t: link.dataset.statusAction }));
    }
  });

  bindLinkClicks(doc, "a[data-youtube-host]", (link) => {
    const host = link.dataset.youtubeHost;
    if (host) {
      youtubePlay(host);
    }
  });

  [elements.speak, elements.speakTatami].forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (link.dataset.url) {
        fetcher(link.dataset.url);
      }
    });
  });
};

export const start = (doc = document, fetcher = fetch) => {
  const instance = initApp(doc, fetcher);
  if (!instance) {
    return null;
  }

  const { fetchLatest } = instance;

  wireEvents(doc, fetcher, instance);
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
}
