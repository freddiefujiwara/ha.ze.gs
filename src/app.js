import { DATA_API_DELAY_MS, STATUS_BACKOFF_MS, STATUS_INTERVAL_MS } from "./constants.js";
import {
  apiUrl,
  buildCarArrivalArgs,
  buildStatusUrl,
  initApp,
  parseApiCommands,
  parseYouTubeId,
  replaceHostTokens,
  resolveHost,
} from "./logic.js";

export const bindLinkClicks = (doc, selector, handler) => {
  doc.querySelectorAll(selector).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      handler(link);
    });
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const scheduleLatestFetch = (fetchLatest, { onSchedule } = {}) => {
  let timerId;
  let controller;
  const schedule = (delayMs) => ((timerId = setTimeout(run, delayMs)), onSchedule?.(delayMs));
  const nextDelay = (error) =>
    error?.name === "AbortError" ? STATUS_INTERVAL_MS : STATUS_INTERVAL_MS + STATUS_BACKOFF_MS;
  const run = async () => {
    controller?.abort();
    controller = new AbortController();
    try {
      await fetchLatest(controller.signal);
      schedule(STATUS_INTERVAL_MS);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Failed to fetch latest status", error);
      }
      schedule(nextDelay(error));
    }
  };
  run();
  return () => clearTimeout(timerId);
};

export const wireEvents = (doc, fetcher, instance) => {
  const { setAlarm, youtubePlay, elements } = instance;

  elements.setButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await setAlarm();
    elements.alarmtext.value = "";
  });

  elements.youtubeUrl.addEventListener("blur", () => {
    if (elements.youtubeUrl.value && !parseYouTubeId(elements.youtubeUrl.value)) {
      elements.youtubeUrl.value = "";
    }
  });

  bindLinkClicks(doc, "a[data-api], a[data-fetch], a[data-status-action], a[data-message-key]", async (link) => {
    if (link.dataset.api) {
      try {
        const apiCommands = parseApiCommands(link.dataset.api);
        for (let index = 0; index < apiCommands.length; index += 1) {
          await fetcher(apiUrl(replaceHostTokens(apiCommands[index])));
          if (DATA_API_DELAY_MS > 0 && index < apiCommands.length - 1) {
            await delay(DATA_API_DELAY_MS);
          }
        }
      } catch (error) {
        console.error("Failed to execute data-api commands", error);
        return;
      }
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
      }
      elements.voicetext.value = "";
    });
  });
};

export const start = (doc = document, fetcher = fetch) => {
  const instance = initApp(doc, fetcher);
  if (!instance) {
    return null;
  }

  const { fetchLatest } = instance;
  doc.querySelectorAll("a").forEach((link) => link.setAttribute("href", "#"));
  scheduleLatestFetch(fetchLatest);
  wireEvents(doc, fetcher, instance);

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
