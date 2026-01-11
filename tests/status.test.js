import { describe, expect, it, vi } from "vitest";
import { buildStatusUrl, fetchLatestStatus, parseLatestPayload, updateStatusCells } from "../src/status.js";

describe("status", () => {
  it("parses latest payload", () => {
    const payload =
      "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"},{\"Temperature\":\"20\",\"Humid\":\"50\"}],\"status\":\"cool\"});";
    expect(parseLatestPayload(payload)).toEqual({
      Temperature: "20",
      Humid: "50",
      AirCondition: "cool",
    });
  });

  it("returns null for non-array payloads", () => {
    const payload = "__statusCallback&&__statusCallback({\"conditions\":{\"Date\":\"now\"}});";
    expect(parseLatestPayload(payload)).toBeNull();
  });

  it("returns null for missing conditions", () => {
    const payload = "__statusCallback&&__statusCallback({\"Date\":\"now\"});";
    expect(parseLatestPayload(payload)).toBeNull();
  });

  it("keeps latest data when status missing", () => {
    const payload = "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}]});";
    expect(parseLatestPayload(payload)).toEqual({ Date: "now" });
  });

  it("parses raw json payloads", () => {
    const payload = "{\"conditions\":[{\"Date\":\"now\"}],\"status\":\"on\"}";
    expect(parseLatestPayload(payload)).toEqual({ Date: "now", AirCondition: "on" });
  });

  it("handles raw json arrays", () => {
    const payload = "[{\"Date\":\"now\"}]";
    expect(parseLatestPayload(payload)).toBeNull();
  });

  it("returns null for invalid json", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = "__statusCallback&&__statusCallback(invalid);";
    expect(parseLatestPayload(payload)).toBeNull();
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("logs a preview when invalid json is long", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longPayload = "__statusCallback&&__statusCallback(" + "x".repeat(300) + ");";

    expect(parseLatestPayload(longPayload)).toBeNull();
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

    await expect(fetchLatestStatus(fetcher)).resolves.toEqual({ Date: "now", AirCondition: "on" });
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

    await expect(fetchLatestStatus(fetcher)).resolves.toEqual({ Date: "now" });
    expect(errorSpy).toHaveBeenCalledWith("Failed to fetch status payload", {
      status: 500,
      statusText: "Server Error",
      preview: "__statusCallback&&__statusCallback({\"conditions\":[{\"Date\":\"now\"}]});",
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

  it("keeps date value when invalid", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells({ AirCondition: "auto", Date: "not-a-date", Temperature: "20", Humid: "50" }, elements);

    expect(elements.AirCondition.innerText).toBe("auto");
    expect(elements.Date.innerText).toBe("not-a-date");
    expect(elements.Temperature.innerText).toBe("20C");
    expect(elements.Humid.innerText).toBe("50%");
  });

  it("uses empty string for missing air condition", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    updateStatusCells({ Date: "now", Temperature: "20", Humid: "50" }, elements);

    expect(elements.AirCondition.innerText).toBe("AirCondition");
  });

  it("no-ops when latest is missing or invalid", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
      Date: document.createElement("div"),
      Temperature: document.createElement("div"),
      Humid: document.createElement("div"),
    };

    expect(() => updateStatusCells(null, elements)).not.toThrow();
    expect(() => updateStatusCells("invalid", elements)).not.toThrow();
  });

  it("builds status url", () => {
    expect(buildStatusUrl({ s: "status", t: "control" })).toBe(
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?s=status&t=control",
    );
  });
});
