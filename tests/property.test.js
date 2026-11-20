import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";
import { parseDeviceHosts } from "../src/config.js";
import { apiUrl, replaceHostTokens, resolveHost } from "../src/hosts.js";
import { parseApiCommands } from "../src/logic.js";
import { parseLatestPayload, updateStatusCells } from "../src/status.js";
import { createTextUtils } from "../src/text.js";
import { buildYouTubePlayUrl, parseYouTubeId } from "../src/youtube.js";

vi.mock("../src/notify.js", () => ({
  notify: vi.fn(),
  reportError: vi.fn(),
}));

// A value JSON can produce whose toString is not callable.
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

// Strings as they can arrive from the DOM / JSON: grapheme units only,
// because lone surrogates cannot be percent-encoded (encodeURIComponent
// itself rejects them) and cannot appear in a parsed JSON payload.
const text = fc.string({ unit: "grapheme" });
const jsonValue = fc.jsonValue();

describe("text utils properties", () => {
  const utils = createTextUtils();

  it("normalizeText never throws and is idempotent over arbitrary values", () => {
    fc.assert(
      fc.property(fc.oneof(fc.anything(), fc.constant(unstringifiable)), (value) => {
        const once = utils.normalizeText(value);
        expect(typeof once).toBe("string");
        expect(utils.normalizeText(once)).toBe(once);
      }),
      { numRuns: 100 },
    );
  });

  it("sanitizeText round-trips through decodeURIComponent back to normalizeText", () => {
    fc.assert(
      fc.property(text, (value) => {
        expect(decodeURIComponent(utils.sanitizeText(value))).toBe(utils.normalizeText(value));
      }),
      { numRuns: 100 },
    );
  });

  it("the length helpers agree with sanitizeText and never throw", () => {
    fc.assert(
      fc.property(text, text, (value, maxText) => {
        expect(utils.getMaxEncodedLength(maxText)).toBe(utils.sanitizeText(maxText).length);
        expect(utils.isTextTooLong(value, maxText)).toBe(
          utils.sanitizeText(value).length > utils.sanitizeText(maxText).length,
        );
      }),
      { numRuns: 100 },
    );
  });
});

describe("hosts properties", () => {
  it("apiUrl joins string and number segments verbatim", () => {
    fc.assert(
      fc.property(fc.array(fc.oneof(text, fc.integer())), (args) => {
        expect(apiUrl(args)).toBe(`https://home.example/${args.map(String).join("/")}`);
      }),
      { numRuns: 100 },
    );
  });

  it("apiUrl never throws on JSON-shaped args", () => {
    fc.assert(
      fc.property(fc.array(fc.oneof(jsonValue, fc.constant(unstringifiable))), (args) => {
        expect(typeof apiUrl(args)).toBe("string");
      }),
      { numRuns: 100 },
    );
  });

  it("replaceHostTokens preserves the arg list shape and never throws", () => {
    fc.assert(
      fc.property(fc.array(fc.oneof(text, fc.integer(), fc.constant(unstringifiable))), (args) => {
        const replaced = replaceHostTokens(args);
        expect(replaced).toHaveLength(args.length);
        replaced.forEach((arg, index) => {
          if (typeof args[index] !== "string" || !/^(host|device):/.test(args[index])) {
            expect(arg).toEqual(args[index]);
          }
        });
      }),
      { numRuns: 100 },
    );
  });

  it("resolveHost always returns a string for string input", () => {
    fc.assert(
      fc.property(text, (value) => {
        expect(typeof resolveHost(value)).toBe("string");
      }),
      { numRuns: 100 },
    );
  });
});

describe("status properties", () => {
  it("parseLatestPayload never throws on arbitrary text and only returns null or a plain object", () => {
    fc.assert(
      fc.property(text, (payload) => {
        const latest = parseLatestPayload(doc, payload);
        expect(latest === null || (typeof latest === "object" && !Array.isArray(latest))).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("parseLatestPayload never throws on generated JSON payloads", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const latest = parseLatestPayload(doc, JSON.stringify(value));
        expect(latest === null || (typeof latest === "object" && !Array.isArray(latest))).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("a generated well-formed payload round-trips its last row", () => {
    const row = fc.record({
      Date: text,
      Temperature: fc.oneof(fc.integer(), text),
      Humid: fc.oneof(fc.integer(), text),
    });
    fc.assert(
      fc.property(fc.array(row, { minLength: 1 }), (rows) => {
        const latest = parseLatestPayload(doc, JSON.stringify({ conditions: rows }));
        expect(latest).toEqual(rows[rows.length - 1]);
      }),
      { numRuns: 100 },
    );
  });

  it("updateStatusCells never throws and only writes strings, whatever the row holds", () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.constantFrom("AirCondition", "Date", "Temperature", "Humid"),
          fc.oneof(fc.anything(), fc.constant(unstringifiable)),
        ),
        (latest) => {
          const elements = makeCells();
          updateStatusCells(latest, elements);
          Object.values(elements).forEach((cell) => {
            expect(typeof cell.innerText).toBe("string");
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("youtube properties", () => {
  it("parseYouTubeId never throws and only returns null or a non-empty string", () => {
    fc.assert(
      fc.property(fc.oneof(text, fc.anything()), (value) => {
        const id = parseYouTubeId(value);
        expect(id === null || (typeof id === "string" && id.length > 0)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("buildYouTubePlayUrl only emits volumes within 0..100", () => {
    const volume = fc.oneof(fc.integer(), fc.double(), text, fc.constant(undefined), fc.constant(null), fc.boolean());
    fc.assert(
      fc.property(text, volume, (youtubeUrl, vol) => {
        const playUrl = buildYouTubePlayUrl("192.0.2.10", youtubeUrl, vol);
        if (playUrl === null) return;
        const match = playUrl.match(/\/-v\/([^/]+)\//);
        expect(match).not.toBeNull();
        const parsed = Number(match[1]);
        expect(Number.isFinite(parsed)).toBe(true);
        expect(parsed).toBeGreaterThanOrEqual(0);
        expect(parsed).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 },
    );
  });
});

describe("data-api command properties", () => {
  it("parseApiCommands either throws its documented errors or returns an array of arrays", () => {
    fc.assert(
      fc.property(text, (payload) => {
        let commands;
        try {
          commands = parseApiCommands(payload);
        } catch {
          return; // invalid payloads throw by contract; the caller reports them
        }
        expect(Array.isArray(commands)).toBe(true);
        commands.forEach((command) => expect(Array.isArray(command)).toBe(true));
      }),
      { numRuns: 100 },
    );
  });
});

describe("config properties", () => {
  it("parseDeviceHosts never throws and only returns a plain object", () => {
    fc.assert(
      fc.property(fc.oneof(text, fc.anything()), (raw) => {
        const parsed = parseDeviceHosts(raw);
        expect(typeof parsed).toBe("object");
        expect(parsed).not.toBeNull();
        expect(Array.isArray(parsed)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
