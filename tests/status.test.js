import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_MESSAGES } from "../src/constants.js";
import { buildStatusUrl, fetchLatestStatus, parseLatestPayload, updateStatusCells } from "../src/status.js";

vi.mock("../src/notify.js", () => ({
  notify: vi.fn(),
  reportError: vi.fn((doc, message, details) => {
    if (details === undefined) {
      console.error(message);
    } else {
      console.error(message, details);
    }
  }),
}));

describe("status", () => {
  let doc;
  beforeEach(() => {
    doc = {};
  });
  it("parses latest payload", () => {
    const payload =
      "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"},{\"Temperature\":\"20\",\"Humid\":\"50\"}],\"status\":\"cool\"});";
    expect(parseLatestPayload(doc, payload)).toEqual({
      Temperature: "20",
      Humid: "50",
      AirCondition: "cool",
    });
  });

  it("returns null for non-array payloads", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "__statusCallback&&__statusCallback({\"conditions\":{\"Date\":\"now\"}});";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.MISSING_CONDITIONS, {
      hasConditions: false,
      length: null,
    });
    errorSpy.mockRestore();
  });

  it("returns null for missing conditions", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "__statusCallback&&__statusCallback({\"Date\":\"now\"});";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.MISSING_CONDITIONS, {
      hasConditions: false,
      length: null,
    });
    errorSpy.mockRestore();
  });

  it("logs when conditions are empty", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "__statusCallback&&__statusCallback({\"conditions\":[]});";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.MISSING_CONDITIONS, {
      hasConditions: true,
      length: 0,
    });
    errorSpy.mockRestore();
  });

  it("keeps latest data when status missing", () => {
    const payload = "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}]});";
    expect(parseLatestPayload(doc, payload)).toEqual({ Date: "now" });
  });

  it("parses raw json payloads", () => {
    const payload = "{\"conditions\":[{\"Date\":\"now\"}],\"status\":\"on\"}";
    expect(parseLatestPayload(doc, payload)).toEqual({ Date: "now", AirCondition: "on" });
  });

  it("parses jsonp payloads", () => {
    const payload = "__statusCallback({\"conditions\":[{\"Date\":\"now\"}],\"status\":\"on\"});";
    expect(parseLatestPayload(doc, payload)).toEqual({ Date: "now", AirCondition: "on" });
  });

  it("handles raw json arrays", () => {
    const payload = "[{\"Date\":\"now\"}]";
    expect(parseLatestPayload(doc, payload)).toBeNull();
  });

  it("returns null when latest is empty", () => {
    const payload = "__statusCallback&&__statusCallback({\"conditions\":[null]});";
    expect(parseLatestPayload(doc, payload)).toBeNull();
  });

  it("returns null for invalid json", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "__statusCallback&&__statusCallback(invalid);";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("returns null for empty payload", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(parseLatestPayload(doc, "")).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("returns null for html payload", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "<html><body>bad gateway</body></html>";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("returns null for garbage payload", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "%%%$$$not-json%%%";
    expect(parseLatestPayload(doc, payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("logs a preview when invalid json is long", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longPayload = "__statusCallback&&__statusCallback(" + "x".repeat(300) + ");";

    expect(parseLatestPayload(doc, longPayload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();

    const [, details] = errorSpy.mock.calls[0];
    expect(details.cleanedPreview.length).toBeGreaterThan(0);
    expect(details.cleanedPreview.endsWith("…")).toBe(true);
    expect(details.cleanedLength).toBeGreaterThan(details.cleanedPreview.length);

    errorSpy.mockRestore();
  });

  it("fetches latest status", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi
        .fn()
        .mockResolvedValue("__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}],\"status\":\"on\"});"),
    });

    await expect(fetchLatestStatus(doc, fetcher)).resolves.toEqual({ Date: "now", AirCondition: "on" });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?callback=__statusCallback",
    );
  });

  it("logs when status fetch fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      text: vi
        .fn()
        .mockResolvedValue("__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}]});"),
    });

    await expect(fetchLatestStatus(doc, fetcher)).resolves.toEqual({ Date: "now" });
    expect(errorSpy).toHaveBeenCalledWith(ERROR_MESSAGES.FETCH_PAYLOAD, {
      status: 500,
      statusText: "Server Error",
      preview: "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}]});",
    });
    errorSpy.mockRestore();
  });

  it("reports when status fetch fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      text: vi.fn().mockResolvedValue(""),
    });
    const { reportError } = await import("../src/notify.js");

    await fetchLatestStatus(doc, fetcher);

    expect(reportError).toHaveBeenCalledWith(doc, ERROR_MESSAGES.FETCH_PAYLOAD, {
      status: 500,
      statusText: "Server Error",
      preview: "",
    });
    errorSpy.mockRestore();
  });

  it("updates status cells", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells(
      { AirCondition: "cool", Date: "2025-12-31T10:08:47.000Z", Temperature: "20", Humid: "50" },
      elements,
    );

    expect(elements.AirCondition.innerText).toBe("cool");
    expect(elements.Date.innerText).toMatch(/[A-Za-z]{3} \d{1,2} \d{2}:\d{2}/);
    expect(elements.Temperature.innerText).toBe("20C");
    expect(elements.Humid.innerText).toBe("50%");
  });

  it("uses the default AirCondition label when missing", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells({ AirCondition: null, Date: "now", Temperature: "20", Humid: "50" }, elements);

    expect(elements.AirCondition.innerText).toBe("AirCondition");
  });

  it("ignores invalid update inputs", () => {
    expect(() => updateStatusCells(null, {})).not.toThrow();
  });

  it("builds a status url", () => {
    expect(buildStatusUrl({ key: "value" })).toBe(
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?key=value",
    );
  });
});
