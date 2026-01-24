import fs from "fs";
import { describe, expect, it, vi } from "vitest";
import { appendSourceUrl, applyHtmlTransforms, rewriteLinksForNoJs } from "../src/build-utils.js";

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
  it.each([
    [
      "returns the original href when url is already included",
      "http://a.ze.gs/path?url=http://ha.ze.gs",
      "http://a.ze.gs/path?url=http://ha.ze.gs",
    ],
    ["appends the source url when no query string is present", "http://a.ze.gs/path", "http://a.ze.gs/path?url=http://ha.ze.gs"],
    [
      "appends the source url using ampersand when a query exists",
      "http://a.ze.gs/path?mode=on",
      "http://a.ze.gs/path?mode=on&url=http://ha.ze.gs",
    ],
  ])("%s", (_, href, expected) => {
    expect(appendSourceUrl(href)).toBe(expected);
  });

  it("applies transforms in order", () => {
    const html = "<p>hello</p>";
    const upper = (value) => value.toUpperCase();
    const addBang = (value) => `${value}!`;
    const result = applyHtmlTransforms(html, [upper, addBang]);
    expect(result).toBe("<P>HELLO</P>!");
  });
});

import { main } from "../build.js";

vi.mock("fs", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    default: {
      ...original.default,
      promises: {
        ...original.default.promises,
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
      },
    },
  };
});

describe("build", () => {
  it.skip("includes notify.js in the build", async () => {
    const readFile = fs.promises.readFile;
    readFile.mockImplementation((path) =>
      String(path).endsWith(".js") ? Promise.resolve(`// ${basename(path)}`) : Promise.resolve("")
    );

    await main();

    const writeFile = fs.promises.writeFile;
    expect(writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("// notify.js"),
      undefined
    );
  });
});
