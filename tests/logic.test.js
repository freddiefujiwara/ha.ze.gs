import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiUrl,
  buildAlarmUrl,
  buildGptUrl,
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
    <textarea id="prompt"></textarea>
    <div id="Datetime"></div>
    <div id="Temperature"></div>
    <div id="Humidity"></div>
    <a href="#" data-youtube-host="192.168.1.22">YT</a>
    <a href="#" data-gpt-host="192.168.1.236">GPT</a>
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
    expect(parseYouTubeId("https://www.youtube.com/watch?v=xyz987")).toBe("xyz987");
    expect(parseYouTubeId("https://music.youtube.com/watch?v=qwe456&feature=share")).toBe("qwe456");
    expect(parseYouTubeId("https://www.youtube.com/live/liveid?feature=share")).toBe("liveid");
    expect(parseYouTubeId("invalid")).toBe("");
  });

  it("builds youtube play url", () => {
    expect(buildYouTubePlayUrl("192.168.1.22", "https://youtu.be/abc123")).toEqual({
      videoId: "abc123",
      url: "http://a.ze.gs/youtube-play/-h/192.168.1.22/-v/40/-i/abc123",
    });
  });

  it("builds gpt url", () => {
    expect(buildGptUrl("192.168.1.22", "hello world\n")).toBe(
      "https://hook.us1.make.com/7zekvch82ird62gydqbu356ncnkx05z9?p=helloworld&i=192.168.1.22",
    );
  });
});

describe("payload parsing", () => {
  it("parses latest payload", () => {
    const payload = "a&&a([{\"Datetime\":\"now\"},{\"Temperature\":\"20\",\"Humidity\":\"50\"}]);";
    expect(parseLatestPayload(payload)).toEqual({ Temperature: "20", Humidity: "50" });
  });

  it("fetches latest status", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue("a&&a([{\"Datetime\":\"now\"}]);"),
    });

    await expect(fetchLatestStatus(fetcher)).resolves.toEqual({ Datetime: "now" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("updates status cells", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      Datetime: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humidity: document.createElement("div"),
    };

    updateStatusCells({ Datetime: "t", Temperature: "20", Humidity: "50" }, elements);

    expect(elements.Datetime.innerText).toBe("t");
    expect(elements.Temperature.innerText).toBe("20");
    expect(elements.Humidity.innerText).toBe("50");
  });
});

describe("app wiring", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("a&&a([{\"Datetime\":\"now\"}]);") });
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

    document.getElementById("prompt").value = "hello world";
    await instance.gpt("192.168.1.236");
    expect(fetcher).toHaveBeenCalledWith(
      "https://hook.us1.make.com/7zekvch82ird62gydqbu356ncnkx05z9?p=helloworld&i=192.168.1.236",
    );

    const latest = await instance.fetchLatest();
    expect(latest).toEqual({ Datetime: "now" });
    expect(document.getElementById("Datetime").innerText).toBe("now");
  });

  it("handles missing optional fields", () => {
    const document = buildDocument();
    document.getElementById("youtube_url").remove();
    document.getElementById("prompt").remove();
    const instance = initApp(document, fetcher);

    expect(instance.youtubePlay("192.168.1.22")).toBeNull();
    expect(instance.gpt("192.168.1.22")).toBeNull();
  });

  it("skips latest fetch when status cells missing", async () => {
    const document = buildDocument();
    document.getElementById("Datetime").remove();
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
    const fetcher = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("a&&a([{\"Datetime\":\"now\"}]);") });

    vi.stubGlobal("fetch", fetcher);

    const { start } = await import("../src/app.js");
    const instance = start(document, fetcher);

    document.getElementById("alarmtext").value = "wake";
    document.getElementById("set").dispatchEvent(new Event("click"));

    document.getElementById("youtube_url").value = "https://youtu.be/xyz";
    document.querySelector("a[data-youtube-host]").dispatchEvent(new Event("click"));

    document.getElementById("prompt").value = "hi";
    document.querySelector("a[data-gpt-host]").dispatchEvent(new Event("click"));

    expect(instance).not.toBeNull();
    expect(fetcher).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
