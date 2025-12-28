import { apiUrl, initApp } from "./logic.js";

export const start = (doc = document, fetcher = fetch) => {
  const instance = initApp(doc, fetcher);
  if (!instance) {
    return null;
  }

  const { setAlarm, youtubePlay, gpt, fetchLatest, elements } = instance;

  const bindLinkClicks = (selector, handler) => {
    doc.querySelectorAll(selector).forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        handler(link);
      });
    });
  };

  elements.setButton.addEventListener("click", (event) => {
    event.preventDefault();
    setAlarm();
  });

  bindLinkClicks("a[data-api], a[data-fetch]", (link) => {
    const apiArgs = link.dataset.api ? JSON.parse(link.dataset.api) : null;
    if (apiArgs) {
      fetcher(apiUrl(apiArgs));
    }
    if (link.dataset.fetch) {
      fetcher(link.dataset.fetch);
    }
  });

  bindLinkClicks("a[data-youtube-host]", (link) => {
    const host = link.dataset.youtubeHost;
    if (host) {
      youtubePlay(host);
    }
  });

  bindLinkClicks("a[data-gpt-host]", (link) => {
    const host = link.dataset.gptHost;
    if (host) {
      gpt(host);
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
