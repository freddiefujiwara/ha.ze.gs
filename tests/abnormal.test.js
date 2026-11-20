import { describe, expect, it, vi } from "vitest";
import { parseDeviceHosts } from "../src/config.js";
import { apiUrl, replaceHostTokens, resolveHost } from "../src/hosts.js";
import { parseApiCommands } from "../src/logic.js";
import { parseLatestPayload, updateStatusCells } from "../src/status.js";
import { getApiToken, setApiToken } from "../src/token.js";
import { createTextUtils, normalizeText, sanitizeText } from "../src/text.js";
import { buildVoiceUrls } from "../src/voice.js";
import { buildYouTubePlayUrl } from "../src/youtube.js";

vi.mock("../src/notify.js", () => ({
  notify: vi.fn(),
  reportError: vi.fn(),
}));

// A value JSON can produce whose toString is not callable: String(),
// template interpolation and Date construction all throw on it.
const unstringifiable = { toString: [] };

const doc = {};

const makeCells = () => {
  const document = window.document.implementation.createHTMLDocument("test");
  return {
    AirCondition: document.createElement("div"),
    Date: document.createElement("div"),
    Temperature: document.createElement("div"),
    Humid: document.createElement("div"),
  };
};

describe("text utils with deformed values", () => {
  it("reads an unstringifiable value as empty text instead of throwing", () => {
    expect(() => normalizeText(unstringifiable)).not.toThrow();
    expect(normalizeText(unstringifiable)).toBe("");
    expect(sanitizeText(unstringifiable)).toBe("");
  });

  it("keeps the length checks total over deformed values", () => {
    const utils = createTextUtils();
    expect(() => utils.isTextTooLong("x", unstringifiable)).not.toThrow();
    expect(utils.isTextTooLong(unstringifiable, "max")).toBe(false);
    expect(utils.getMaxEncodedLength(unstringifiable)).toBe(0);
  });

  it("stringifies plain scalars as before", () => {
    expect(normalizeText(42)).toBe("42");
    expect(normalizeText(true)).toBe("true");
  });

  it("builds voice urls from a deformed voice text without throwing", () => {
    const urls = buildVoiceUrls(unstringifiable);
    expect(urls.speak.endsWith("/-s/")).toBe(true);
    expect(urls.speakTatami.endsWith("/-s/")).toBe(true);
  });
});

describe("status cells with deformed latest rows", () => {
  it("blanks every reading when the latest row has no fields", () => {
    const elements = makeCells();
    updateStatusCells({}, elements);
    expect(elements.AirCondition.innerText).toBe("AirCondition");
    expect(elements.Date.innerText).toBe("");
    expect(elements.Temperature.innerText).toBe("");
    expect(elements.Humid.innerText).toBe("");
  });

  it("blanks null and boolean readings instead of printing them", () => {
    const elements = makeCells();
    updateStatusCells({ AirCondition: "cool", Date: "now", Temperature: true, Humid: null }, elements);
    expect(elements.Temperature.innerText).toBe("");
    expect(elements.Humid.innerText).toBe("");
  });

  it("blanks a NaN reading instead of printing NaNC", () => {
    const elements = makeCells();
    updateStatusCells({ AirCondition: "cool", Date: "now", Temperature: NaN, Humid: 50 }, elements);
    expect(elements.Temperature.innerText).toBe("");
    expect(elements.Humid.innerText).toBe("50%");
  });

  it("blanks a numeric date instead of inventing a 1970 date", () => {
    const elements = makeCells();
    updateStatusCells({ AirCondition: "cool", Date: 12345, Temperature: 20, Humid: "50" }, elements);
    expect(elements.Date.innerText).toBe("");
    expect(elements.Temperature.innerText).toBe("20C");
  });

  it("survives unstringifiable cell values", () => {
    const elements = makeCells();
    expect(() =>
      updateStatusCells(
        { AirCondition: unstringifiable, Date: unstringifiable, Temperature: unstringifiable, Humid: unstringifiable },
        elements,
      ),
    ).not.toThrow();
    expect(elements.AirCondition.innerText).toBe("");
    expect(elements.Date.innerText).toBe("");
    expect(elements.Temperature.innerText).toBe("");
    expect(elements.Humid.innerText).toBe("");
  });
});

describe("status payloads with deformed condition rows", () => {
  it("rejects a scalar latest row instead of fabricating an AirCondition-only status", () => {
    expect(parseLatestPayload(doc, '{"conditions":[5],"status":"on"}')).toBeNull();
  });

  it("rejects a string latest row instead of spreading its characters", () => {
    expect(parseLatestPayload(doc, '{"conditions":["abc"],"status":"on"}')).toBeNull();
  });

  it("rejects an array latest row", () => {
    expect(parseLatestPayload(doc, '{"conditions":[[1,2]],"status":"on"}')).toBeNull();
  });

  it("uses the last row even when earlier rows are deformed", () => {
    const payload = '{"conditions":[null,5,{"Date":"now","Temperature":"20"}],"status":"off"}';
    expect(parseLatestPayload(doc, payload)).toEqual({ Date: "now", Temperature: "20", AirCondition: "off" });
  });
});

describe("hosts with deformed command args", () => {
  it("reads an unstringifiable api arg as an empty segment instead of throwing", () => {
    expect(() => apiUrl(["cmd", unstringifiable])).not.toThrow();
    expect(apiUrl(["cmd", unstringifiable])).toBe("https://home.example/cmd/");
  });

  it("passes unstringifiable args through host token replacement untouched", () => {
    expect(replaceHostTokens([unstringifiable, "host:nest"])).toEqual([unstringifiable, "192.0.2.10"]);
  });

  it("does not resolve host or device names through the prototype chain", () => {
    expect(resolveHost("toString")).toBe("toString");
    expect(resolveHost("constructor")).toBe("constructor");
    expect(replaceHostTokens(["host:valueOf"])).toEqual(["valueOf"]);
    expect(replaceHostTokens(["device:toString"])).toEqual(["toString"]);
    expect(replaceHostTokens(["device:constructor"])).toEqual(["constructor"]);
  });
});

describe("youtube volume coercion", () => {
  const url = "https://youtu.be/abc123";
  it.each([
    ["boolean true", true],
    ["single-element array", [60]],
    ["null", null],
    ["empty string", ""],
    ["whitespace-only string", "  "],
  ])("falls back to the default volume for %s instead of coercing it", (_, volume) => {
    expect(buildYouTubePlayUrl("192.0.2.10", url, volume)).toBe(
      "https://home.example/youtube-play/-h/192.0.2.10/-v/40/-i/abc123",
    );
  });

  it("keeps an explicit numeric zero volume", () => {
    expect(buildYouTubePlayUrl("192.0.2.10", url, 0)).toBe(
      "https://home.example/youtube-play/-h/192.0.2.10/-v/0/-i/abc123",
    );
    expect(buildYouTubePlayUrl("192.0.2.10", url, "0")).toBe(
      "https://home.example/youtube-play/-h/192.0.2.10/-v/0/-i/abc123",
    );
  });
});

describe("config parsing with deformed values", () => {
  it.each([
    ["null", null],
    ["a number", 42],
    ["a json array", "[]"],
    ["a json string", '"str"'],
    ["an unstringifiable value", unstringifiable],
    ["broken json", "{nope"],
  ])("reads %s as an empty host map", (_, raw) => {
    expect(parseDeviceHosts(raw)).toEqual({});
  });

  it("keeps a well-formed host map", () => {
    expect(parseDeviceHosts('{"nest":"192.0.2.10"}')).toEqual({ nest: "192.0.2.10" });
  });
});

describe("data-api commands with deformed members", () => {
  it("passes null and object members through untouched", () => {
    expect(parseApiCommands('[["cmd",null]]')).toEqual([["cmd", null]]);
    expect(parseApiCommands('[["cmd",{"toString":[]}]]')).toEqual([["cmd", { toString: [] }]]);
  });

  it("keeps a batch of commands as a batch", () => {
    expect(parseApiCommands('[["a","1"],["b","2"]]')).toEqual([
      ["a", "1"],
      ["b", "2"],
    ]);
  });
});

describe("token storage with deformed values", () => {
  it("refuses an unstringifiable token without throwing", () => {
    const storage = { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() };
    expect(setApiToken(unstringifiable, storage)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("reads the token as unset when storage throws", () => {
    const storage = {
      getItem: () => {
        throw new Error("denied");
      },
    };
    expect(getApiToken(storage)).toBeNull();
  });
});
