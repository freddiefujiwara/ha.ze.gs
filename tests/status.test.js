import { describe, expect, it, vi } from "vitest";
import { buildStatusUrl, fetchLatestStatus, parseLatestPayload, updateStatusCells } from "../src/status.js";

describe("status", () => {
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
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?callback=__statusCallback",
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

  it("builds status url", () => {
    expect(buildStatusUrl({ s: "status", t: "control" })).toBe(
      "https://script.google.com/macros/s/AKfycbz61Wl_rfwYOuZ0z2z9qeegnIsanQeu6oI3Q3K5gX66Hgroaoz2z466ck9xMSvBfHpwUQ/exec?s=status&t=control",
    );
  });
});
