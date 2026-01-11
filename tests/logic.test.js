import { describe, expect, it, vi } from "vitest";
import { ERROR_MESSAGES } from "../src/constants.js";
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
    expect(() => parseApiCommands('"invalid"')).toThrow("Invalid data-api payload");
    expect(errorSpy).toHaveBeenCalledWith("Invalid data-api payload", "invalid");
    errorSpy.mockRestore();
  });

});

import { initApp } from "../src/logic.js";
import { STATUS_CELL_KEYS } from "../src/status.js";

describe("initApp", () => {
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
});
