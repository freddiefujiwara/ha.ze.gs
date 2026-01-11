import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_MESSAGES, MAX_TEXT } from "../src/constants.js";
import { parseApiCommands } from "../src/logic.js";

vi.mock("../src/notify.js", () => ({
  notify: vi.fn(),
}));

describe("parseApiCommands", () => {
  it("returns empty list for missing payloads", () => {
    expect(parseApiCommands()).toEqual([]);
  });

  it("returns empty list for empty array payloads", () => {
    expect(parseApiCommands("[]")).toEqual([]);
  });

  it("logs and throws for invalid json payloads", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => parseApiCommands('["hue",]')).toThrow();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("logs and throws for non-array payloads", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => parseApiCommands('"invalid"')).toThrow(ERROR_MESSAGES.INVALID_DATA_API);
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.INVALID_DATA_API, "invalid");
    errorSpy.mockRestore();
  });
});

import { initApp } from "../src/logic.js";
import { STATUS_CELL_KEYS } from "../src/status.js";

describe("initApp", () => {
  beforeEach(async () => {
    const { notify } = await import("../src/notify.js");
    notify.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T10:20:30Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns null if a required element is missing", () => {
    const doc = {
      getElementById: (id) => (id === "voicetext" ? null : {}),
    };
    expect(initApp(doc, fetch)).toBeNull();
  });

  it("fetchLatest returns null if a status cell is missing", async () => {
    const doc = {
      getElementById: (id) => {
        if (STATUS_CELL_KEYS.includes(id)) return null;
        return {
          addEventListener: () => {},
          options: [],
          querySelector: () => true,
        };
      },
      querySelectorAll: () => [],
    };

    const instance = initApp(doc, fetch);
    expect(instance).not.toBeNull();

    const latest = await instance.fetchLatest("signal");
    expect(latest).toBeNull();
  });

  it("fetchLatest returns null if the fetched payload is invalid", async () => {
    const doc = {
      getElementById: () => ({
        addEventListener: () => {},
        options: [],
        querySelector: () => true,
      }),
      querySelectorAll: () => [],
    };

    const mockFetcher = async () => ({
      ok: true,
      text: async () => "__statusCallback&&__statusCallback({});",
    });

    const instance = initApp(doc, mockFetcher);
    const latest = await instance.fetchLatest("signal");
    expect(latest).toBeNull();
  });

  it("notifies and logs when youtube url is invalid", async () => {
    const doc = {
      getElementById: () => ({
        addEventListener: () => {},
        options: [],
        querySelector: () => true,
        value: "invalid-url",
      }),
      querySelectorAll: () => [],
    };
    const { notify } = await import("../src/notify.js");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const instance = initApp(doc, fetch);
    instance.youtubePlay("host");
    expect(notify).toHaveBeenCalledWith(doc, ERROR_MESSAGES.INVALID_URL);
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.INVALID_URL, "invalid-url");
    errorSpy.mockRestore();
  });

  it.skip("notifies and logs when alarm text is too long", async () => {
    const elements = {
      voicetext: { addEventListener: vi.fn(), value: "" },
      speak: { addEventListener: vi.fn() },
      speak_tatami: { addEventListener: vi.fn() },
      hour: { addEventListener: vi.fn(), value: "10", options: [], querySelector: () => null },
      min: { addEventListener: vi.fn(), value: "10", options: [], querySelector: () => null },
      alarmtext: { addEventListener: vi.fn(), value: "a".repeat(200) },
      set: { addEventListener: vi.fn() },
      youtube_url: { addEventListener: vi.fn(), value: "" },
      AirCondition: {},
      Date: {},
      Temperature: {},
      Humid: {},
    };
    const doc = {
      getElementById: (id) => elements[id],
      querySelectorAll: () => [],
    };
    const { notify } = await import("../src/notify.js");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const instance = initApp(doc, fetch);
    await instance.setAlarm();
    expect(notify).toHaveBeenCalledWith(doc, ERROR_MESSAGES.TOO_LONG);
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.TOO_LONG, "a".repeat(200));
    errorSpy.mockRestore();
  });
});
