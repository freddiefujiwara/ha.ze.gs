import { describe, expect, it, vi } from "vitest";
import { applyHtmlTransforms, rewriteLinksForNoJs } from "../src/build-utils.js";

describe("rewriteLinksForNoJs", () => {
  it("rewrites data-api links to a.ze.gs hrefs", () => {
    const html = `<a href="#" data-api='["hue","lights","off"]'>Off</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="http://a.ze.gs/hue/lights/off?url=http://ha.ze.gs"');
  });

  it("uses the first data-api command when multiple are provided", () => {
    const html = `<a href="#" data-api='[["hue","lights","off"],["hue","lights","10","off"]]'>Off</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="http://a.ze.gs/hue/lights/off?url=http://ha.ze.gs"');
  });

  it("keeps status-action links unchanged because they are not a.ze.gs", () => {
    const html = `<a href="#" data-status-action="control">Status</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="#"');
  });

  it("rewrites car arrival links to a.ze.gs hrefs", () => {
    const html = `<a href="#" data-message-key="car-arrival">Car</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain("http://a.ze.gs/google-home-speaker-wrapper/");
    expect(result).toContain("?url=http://ha.ze.gs");
  });

  it("keeps non-a.ze.gs links unchanged", () => {
    const html = `<a href="#" data-fetch="http://example.com/test">Fetch</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="#"');
    expect(result).toContain('data-fetch="http://example.com/test"');
  });

  it("appends the source url to a.ze.gs data-fetch links", () => {
    const html = `<a href="#" data-fetch="http://a.ze.gs/path?mode=on">Fetch</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="http://a.ze.gs/path?mode=on&url=http://ha.ze.gs"');
  });

  it("avoids adding duplicate source url parameters", () => {
    const html = `<a href="#" data-fetch="http://a.ze.gs/path?url=http://ha.ze.gs">Fetch</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="http://a.ze.gs/path?url=http://ha.ze.gs"');
  });

  it("keeps invalid data-api payloads unchanged", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const html = `<a href="#" data-api='["hue",]'>Broken</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="#"');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("keeps links without hrefs unchanged", () => {
    const html = `<a>No Href</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toBe(html);
  });
});

describe("applyHtmlTransforms", () => {
  it("applies transforms in order", () => {
    const html = "<p>hello</p>";
    const upper = (value) => value.toUpperCase();
    const addBang = (value) => `${value}!`;
    const result = applyHtmlTransforms(html, [upper, addBang]);
    expect(result).toBe("<P>HELLO</P>!");
  });
});
