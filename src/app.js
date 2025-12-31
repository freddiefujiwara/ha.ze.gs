import { apiUrl, buildCarArrivalArgs, buildStatusUrl, initApp, parseYouTubeId, replaceHostTokens, resolveHost } from "./logic.js";

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

  elements.setButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await setAlarm();
    elements.alarmtext.value = "";
  });

  elements.youtubeUrl.addEventListener("blur", () => {
    if (!elements.youtubeUrl.value) {
      return;
    }
    if (!parseYouTubeId(elements.youtubeUrl.value)) {
      elements.youtubeUrl.value = "";
    }
  });

  bindLinkClicks(doc, "a[data-api], a[data-fetch], a[data-status-action], a[data-message-key]", async (link) => {
    const apiArgs = link.dataset.api ? JSON.parse(link.dataset.api) : null;
    if (apiArgs) {
      await fetcher(apiUrl(replaceHostTokens(apiArgs)));
    }
    if (link.dataset.messageKey === "car-arrival") {
      await fetcher(apiUrl(buildCarArrivalArgs()));
    }
    if (link.dataset.fetch) {
      await fetcher(link.dataset.fetch);
    }
    if (link.dataset.statusAction) {
      await fetcher(buildStatusUrl({ s: "status", t: link.dataset.statusAction }));
    }
  });

  bindLinkClicks(doc, "a[data-youtube-host], a[data-youtube-key]", async (link) => {
    const host = link.dataset.youtubeHost ?? resolveHost(link.dataset.youtubeKey);
    if (!host) {
      return;
    }
    const result = await youtubePlay(host);
    if (result) {
      elements.youtubeUrl.value = "";
    }
  });

  [elements.speak, elements.speakTatami].forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      if (link.dataset.url) {
        await fetcher(link.dataset.url);
        elements.voicetext.value = "";
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
