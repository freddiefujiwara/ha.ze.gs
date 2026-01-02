import { describe, expect, it } from "vitest";
import { applyHtmlTransforms, rewriteLinksForNoJs } from "../src/build-utils.js";

describe("rewriteLinksForNoJs", () => {
  it("rewrites data-api links to a.ze.gs hrefs", () => {
    const html = `<a href="#" data-api='["hue","lights","off"]'>Off</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="http://a.ze.gs/hue/lights/off"');
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
  });

  it("keeps non-a.ze.gs links unchanged", () => {
    const html = `<a href="#" data-fetch="http://example.com/test">Fetch</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="#"');
    expect(result).toContain('data-fetch="http://example.com/test"');
  });

  it("keeps invalid data-api payloads unchanged", () => {
    const html = `<a href="#" data-api='["hue",]'>Broken</a>`;
    const result = rewriteLinksForNoJs(html);
    expect(result).toContain('href="#"');
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
