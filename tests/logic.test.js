import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiUrl,
  buildAlarmUrl,
  buildVoiceUrls,
  buildYouTubePlayUrl,
  fetchLatestStatus,
  initApp,
  parseLatestPayload,
  parseYouTubeId,
  updateStatusCells,
  updateVoiceLinks,
} from "../src/logic.js";

const buildDocument = () => {
  const document = window.document.implementation.createHTMLDocument("test");
  document.body.innerHTML = `
    <textarea id="voicetext"></textarea>
    <a id="speak" href="#">Nest Wifi</a>
    <a id="speak_tatami" href="#">Tatami</a>
    <select id="hour"><option value="08" selected>08</option></select>
    <select id="min"><option value="15" selected>15</option></select>
    <textarea id="alarmtext"></textarea>
    <a id="set" href="#">Set</a>
    <textarea id="youtube_url"></textarea>
    <div id="Date"></div>
    <div id="Temperature"></div>
    <div id="Humid"></div>
    <a href="#" data-youtube-host="192.168.1.22">YT</a>
  `;
  return document;
};

describe("utility builders", () => {
  it("builds api url", () => {
    expect(apiUrl(["hue", "lights", "off"])).toBe("http://a.ze.gs/hue/lights/off");
  });

  it("builds voice urls", () => {
    const urls = buildVoiceUrls("hello world\n");
    expect(urls.speak).toContain("http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.22");
    expect(urls.speak).toContain("-s/helloworld");
    expect(urls.speakTatami).toContain("http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.236");
  });

  it("updates voice links", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const speak = document.createElement("a");
    const speakTatami = document.createElement("a");

    updateVoiceLinks("test", { speak, speakTatami });

    expect(speak.dataset.url).toContain("-s/test");
    expect(speakTatami.dataset.url).toContain("-s/test");
  });

  it("builds alarm url", () => {
    expect(buildAlarmUrl("07", "30", "wake up")).toBe(
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=07:30:00&text=wakeup",
    );
  });

  it("parses youtube id by url form", () => {
    expect(parseYouTubeId("https://youtu.be/abc123")).toBe("abc123");
    expect(parseYouTubeId("https://youtu.be/")).toBe("");
    expect(parseYouTubeId("https://www.youtube.com/watch?v=xyz987")).toBe("xyz987");
    expect(parseYouTubeId("https://www.youtube.com/watch")).toBe("");
    expect(parseYouTubeId("https://music.youtube.com/watch?v=qwe456&feature=share")).toBe("qwe456");
    expect(parseYouTubeId("https://www.youtube.com/live/liveid?feature=share")).toBe("liveid");
    expect(parseYouTubeId("https://www.youtube.com/live/")).toBe("");
    expect(parseYouTubeId("https://www.youtube.com/playlist?list=abc")).toBe("");
    expect(parseYouTubeId("https://example.com/watch?v=abc")).toBe("");
    expect(parseYouTubeId("invalid")).toBe("");
  });

  it("builds youtube play url", () => {
    expect(buildYouTubePlayUrl("192.168.1.22", "https://youtu.be/abc123")).toBe(
      "http://a.ze.gs/youtube-play/-h/192.168.1.22/-v/40/-i/abc123",
    );
  });
});

describe("payload parsing", () => {
  it("parses latest payload", () => {
    const payload = "a&&a([{\"Date\":\"now\"},{\"Temperature\":\"20\",\"Humid\":\"50\"}]);";
    expect(parseLatestPayload(payload)).toEqual({ Temperature: "20", Humid: "50" });
  });

  it("returns null for non-array payloads", () => {
    const payload = "a&&a({\"Date\":\"now\"});";
    expect(parseLatestPayload(payload)).toBeNull();
  });

  it("fetches latest status", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue("a&&a([{\"Date\":\"now\"}]);"),
    });

    await expect(fetchLatestStatus(fetcher)).resolves.toEqual({ Date: "now" });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec?callback=a",
    );
  });

  it("updates status cells", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells({ Date: "2025-12-31T10:08:47.000Z", Temperature: "20", Humid: "50" }, elements);

    expect(elements.Date.innerText).toMatch(/[A-Za-z]{3} \d{1,2} \d{2}:\d{2}/);
    expect(elements.Temperature.innerText).toBe("20");
    expect(elements.Humid.innerText).toBe("50");
  });

  it("keeps date value when invalid", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells({ Date: "not-a-date", Temperature: "20", Humid: "50" }, elements);

    expect(elements.Date.innerText).toBe("not-a-date");
  });
});

describe("app wiring", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("a&&a([{\"Date\":\"now\"}]);") });
  });

  it("initializes and wires inputs", async () => {
    const document = buildDocument();
    const instance = initApp(document, fetcher);

    expect(instance).not.toBeNull();

    document.getElementById("voicetext").value = "hello";
    document.getElementById("voicetext").dispatchEvent(new Event("input"));

    expect(document.getElementById("speak").dataset.url).toContain("-s/hello");

    document.getElementById("alarmtext").value = "wake";
    await instance.setAlarm();
    expect(fetcher).toHaveBeenCalledWith(
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=08:15:00&text=wake",
    );

    document.getElementById("youtube_url").value = "https://youtu.be/abc123";
    await instance.youtubePlay("192.168.1.22");
    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/youtube-play/-h/192.168.1.22/-v/40/-i/abc123");

    const latest = await instance.fetchLatest();
    expect(latest).toEqual({ Date: "now" });
    expect(document.getElementById("Date").innerText).toBe("now");
  });

  it("handles missing optional fields", () => {
    const document = buildDocument();
    document.getElementById("youtube_url").remove();
    const instance = initApp(document, fetcher);

    expect(instance.youtubePlay("192.168.1.22")).toBeNull();
  });

  it("skips latest fetch when status cells missing", async () => {
    const document = buildDocument();
    document.getElementById("Date").remove();
    const instance = initApp(document, fetcher);

    await expect(instance.fetchLatest()).resolves.toBeNull();
  });

  it("returns null when required nodes missing", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    expect(initApp(document, fetcher)).toBeNull();
  });
});

describe("app bootstrap", () => {
  it("wires anchors and buttons in start", async () => {
    vi.resetModules();
    const document = buildDocument();
    const fetcher = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("a&&a([{\"Date\":\"now\"}]);") });

    vi.stubGlobal("fetch", fetcher);

    const { start } = await import("../src/app.js");
    const instance = start(document, fetcher);

    document.getElementById("alarmtext").value = "wake";
    document.getElementById("set").dispatchEvent(new Event("click"));

    document.getElementById("youtube_url").value = "https://youtu.be/xyz";
    document.querySelector("a[data-youtube-host]").dispatchEvent(new Event("click"));

    document.getElementById("speak").dataset.url = "http://example.com/speak";
    document.getElementById("speak").dispatchEvent(new Event("click"));

    document.getElementById("speak_tatami").dataset.url = "http://example.com/tatami";
    document.getElementById("speak_tatami").dispatchEvent(new Event("click"));

    expect(instance).not.toBeNull();
    expect(fetcher).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("handles api/fetch links and window api helper", async () => {
    vi.resetModules();
    const document = window.document;
    document.body.innerHTML = `
      <textarea id="voicetext"></textarea>
      <a id="speak" href="#">Nest Wifi</a>
      <a id="speak_tatami" href="#">Tatami</a>
      <select id="hour"><option value="08" selected>08</option></select>
      <select id="min"><option value="15" selected>15</option></select>
      <textarea id="alarmtext"></textarea>
      <a id="set" href="#">Set</a>
      <textarea id="youtube_url"></textarea>
      <div id="Date"></div>
      <div id="Temperature"></div>
      <div id="Humid"></div>
      <a href="#" data-api='["hue","lights","off"]'>API</a>
      <a href="#" data-fetch="http://example.com/fetch">Fetch</a>
      <a href="#" data-youtube-host="">NoHost</a>
    `;

    const fetcher = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("a&&a([{\"Date\":\"now\"}]);") });

    vi.stubGlobal("fetch", fetcher);
    await import("../src/app.js");

    document.querySelector("a[data-api]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-fetch]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-youtube-host]").dispatchEvent(new Event("click"));

    window.api(["hue", "lights", "on"]);
    window.setAlarm();
    window.youtubePlay("192.168.1.22");

    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/hue/lights/off");
    expect(fetcher).toHaveBeenCalledWith("http://example.com/fetch");
    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/hue/lights/on");

    vi.unstubAllGlobals();
  });
});
