import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiUrl,
  buildAlarmUrl,
  buildCarArrivalArgs,
  buildStatusUrl,
  buildVoiceUrls,
  buildYouTubePlayUrl,
  replaceHostTokens,
  resolveHost,
  fetchLatestStatus,
  initApp,
  parseLatestPayload,
  parseYouTubeId,
  updateStatusCells,
  updateVoiceLinks,
} from "../src/logic.js";

const buildOptions = (length) =>
  Array.from({ length }, (_, index) => {
    const value = String(index).padStart(2, "0");
    return `<option value="${value}">${value}</option>`;
  }).join("");

const hourOptions = buildOptions(24);
const minOptions = buildOptions(60);

const buildDocument = () => {
  const document = window.document.implementation.createHTMLDocument("test");
  document.body.innerHTML = `
    <textarea id="voicetext"></textarea>
    <a id="speak" href="#">Nest Wifi</a>
    <a id="speak_tatami" href="#">Tatami</a>
    <select id="hour">${hourOptions}</select>
    <select id="min">${minOptions}</select>
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

  it("resolves host aliases", () => {
    expect(resolveHost("nest")).toBe("192.168.1.22");
    expect(resolveHost("192.168.1.99")).toBe("192.168.1.99");
  });

  it("replaces host tokens in api args", () => {
    const args = ["catt", "-d", "host:tv", "stop", 1];
    expect(replaceHostTokens(args)).toEqual(["catt", "-d", "192.168.1.219", "stop", 1]);
  });
});

describe("payload parsing", () => {
  it("parses latest payload", () => {
    const payload = "__statusCallback&&__statusCallback([{\"Date\":\"now\"},{\"Temperature\":\"20\",\"Humid\":\"50\"}]);";
    expect(parseLatestPayload(payload)).toEqual({ Temperature: "20", Humid: "50" });
  });

  it("returns null for non-array payloads", () => {
    const payload = "__statusCallback&&__statusCallback({\"Date\":\"now\"});";
    expect(parseLatestPayload(payload)).toBeNull();
  });

  it("fetches latest status", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue("__statusCallback&&__statusCallback([{\"Date\":\"now\"}]);"),
    });

    await expect(fetchLatestStatus(fetcher)).resolves.toEqual({ Date: "now" });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec?callback=__statusCallback",
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
    expect(elements.Temperature.innerText).toBe("20C");
    expect(elements.Humid.innerText).toBe("50%");
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
    expect(elements.Temperature.innerText).toBe("20C");
    expect(elements.Humid.innerText).toBe("50%");
  });
});

describe("app wiring", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue("__statusCallback&&__statusCallback([{\"Date\":\"now\"}]);"),
    });
  });

  it("initializes and wires inputs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T10:20:00Z"));
    const document = buildDocument();
    const instance = initApp(document, fetcher);

    expect(instance).not.toBeNull();

    document.getElementById("voicetext").value = "hello";
    document.getElementById("voicetext").dispatchEvent(new Event("input"));

    expect(document.getElementById("speak").dataset.url).toContain("-s/hello");

    document.getElementById("hour").value = "08";
    document.getElementById("min").value = "15";
    document.getElementById("alarmtext").value = "wake";
    await instance.setAlarm();
    expect(fetcher).toHaveBeenCalledWith(
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=08:15:00&text=wake",
    );

    document.getElementById("youtube_url").value = "https://youtu.be/abc123";
    await instance.youtubePlay("192.168.1.22");
    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/youtube-play/-h/192.168.1.22/-v/40/-i/abc123");

    const callsBeforeInvalid = fetcher.mock.calls.length;
    document.getElementById("youtube_url").value = "https://example.com/video";
    expect(instance.youtubePlay("192.168.1.22")).toBeNull();
    expect(document.getElementById("youtube_url").value).toBe("");
    expect(fetcher.mock.calls).toHaveLength(callsBeforeInvalid);

    const latest = await instance.fetchLatest();
    expect(latest).toEqual({ Date: "now" });
    expect(document.getElementById("Date").innerText).toBe("now");

    vi.useRealTimers();
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

  it("defaults alarm selectors to local time", () => {
    vi.useFakeTimers();
    const now = new Date("2025-12-31T10:20:00Z");
    vi.setSystemTime(now);
    const document = buildDocument();

    initApp(document, fetcher);

    const expectedHour = String(now.getHours()).padStart(2, "0");
    const expectedMinute = String(now.getMinutes()).padStart(2, "0");
    expect(document.getElementById("hour").value).toBe(expectedHour);
    expect(document.getElementById("min").value).toBe(expectedMinute);

    vi.useRealTimers();
  });
});

describe("app bootstrap", () => {
  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("wires anchors and buttons in start", async () => {
    vi.resetModules();
    const document = buildDocument();
    const fetcher = vi
      .fn()
      .mockResolvedValue({ text: vi.fn().mockResolvedValue("__statusCallback&&__statusCallback([{\"Date\":\"now\"}]);") });

    vi.stubGlobal("fetch", fetcher);

    const { start } = await import("../src/app.js");
    const instance = start(document, fetcher);

    document.getElementById("alarmtext").value = "wake";
    document.getElementById("set").dispatchEvent(new Event("click"));
    await flushPromises();
    expect(document.getElementById("alarmtext").value).toBe("");

    document.getElementById("youtube_url").value = "https://youtu.be/xyz";
    document.querySelector("a[data-youtube-host]").dispatchEvent(new Event("click"));

    document.getElementById("voicetext").value = "hello";
    document.getElementById("speak").dataset.url = "http://example.com/speak";
    document.getElementById("speak").dispatchEvent(new Event("click"));
    await flushPromises();
    expect(document.getElementById("voicetext").value).toBe("");

    document.getElementById("speak_tatami").dataset.url = "http://example.com/tatami";
    document.getElementById("speak_tatami").dispatchEvent(new Event("click"));
    await flushPromises();

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
      <select id="hour">${hourOptions}</select>
      <select id="min">${minOptions}</select>
      <textarea id="alarmtext"></textarea>
      <a id="set" href="#">Set</a>
      <textarea id="youtube_url"></textarea>
      <div id="Date"></div>
      <div id="Temperature"></div>
      <div id="Humid"></div>
      <a href="#" data-api='["hue","lights","off"]'>API</a>
      <a href="#" data-message-key="car-arrival">CarArrives</a>
      <a href="#" data-fetch="http://example.com/fetch">Fetch</a>
      <a href="#" data-status-action="control">Status</a>
      <a href="#" data-youtube-host="">NoHost</a>
      <a href="#" data-youtube-key="nest">YoutubeKey</a>
    `;

    const fetcher = vi
      .fn()
      .mockResolvedValue({ text: vi.fn().mockResolvedValue("__statusCallback&&__statusCallback([{\"Date\":\"now\"}]);") });

    vi.stubGlobal("fetch", fetcher);
    await import("../src/app.js");

    document.querySelector("a[data-api]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-message-key]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-fetch]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-status-action]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-youtube-host]").dispatchEvent(new Event("click"));
    document.querySelector("a[data-youtube-key]").dispatchEvent(new Event("click"));
    await flushPromises();

    window.api(["hue", "lights", "on"]);
    window.setAlarm();
    window.youtubePlay("192.168.1.22");

    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/hue/lights/off");
    expect(fetcher).toHaveBeenCalledWith(apiUrl(buildCarArrivalArgs()));
    expect(fetcher).toHaveBeenCalledWith("http://example.com/fetch");
    expect(fetcher).toHaveBeenCalledWith("http://a.ze.gs/hue/lights/on");
    expect(fetcher).toHaveBeenCalledWith(buildStatusUrl({ s: "status", t: "control" }));
    expect(document.getElementById("youtube_url").value).toBe("");

    vi.unstubAllGlobals();
  });
});
