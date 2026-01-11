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

  it("fetches latest status", async () => {
    const fetcher = vi.fn().mockResolvedValue({
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

  it("does nothing for null latest", () => {
    const document = window.document.implementation.createHTMLDocument("test");
    const elements = {
      AirCondition: document.createElement("div"),
    };

    updateStatusCells(null, elements);

    expect(elements.AirCondition.innerText).toBeUndefined();
  });

  it("builds status url", () => {
    expect(buildStatusUrl({ s: "status", t: "control" })).toBe(
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?s=status&t=control",
    );
  });
});
