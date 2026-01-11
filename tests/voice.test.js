import { describe, expect, it, vi } from "vitest";
import { ERROR_MESSAGES, MAX_TEXT } from "../src/constants.js";
import { buildCarArrivalArgs, buildVoiceUrls, updateVoiceLinks } from "../src/voice.js";

const buildDocument = () => window.document.implementation.createHTMLDocument("test");

describe("voice", () => {
  it("builds voice urls", () => {
    const urls = buildVoiceUrls("hello world\n");
    expect(urls.speak).toContain("http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.22");
    expect(urls.speak).toContain("-s/hello%E3%80%80world");
    expect(urls.speakTatami).toContain("http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.236");
  });

  it("updates voice links", () => {
    const document = buildDocument();
    const speak = document.createElement("a");
    const speakTatami = document.createElement("a");

    const updated = updateVoiceLinks("test", { speak, speakTatami });

    expect(updated).toBe(true);
    expect(speak.dataset.url).toContain("-s/test");
    expect(speakTatami.dataset.url).toContain("-s/test");
  });

  it("returns false when text is too long", () => {
    const document = buildDocument();
    const speak = document.createElement("a");
    const speakTatami = document.createElement("a");
    const tooLong = `${MAX_TEXT}１`;

    const updated = updateVoiceLinks(tooLong, { speak, speakTatami });

    expect(updated).toBe(false);
    expect(speak.dataset.url).toBeUndefined();
    expect(speakTatami.dataset.url).toBeUndefined();
    expect(speak.getAttribute("href")).toBeNull();
    expect(speakTatami.getAttribute("href")).toBeNull();
  });

  it("builds car arrival args", () => {
    const args = buildCarArrivalArgs();
    expect(args.join("/")).toContain("google-home-speaker-wrapper");
    expect(args.join("/")).toContain("192.168.1.22");
  });

  it("clears previous voice urls when text is too long", () => {
    const document = buildDocument();
    const speak = document.createElement("a");
    const speakTatami = document.createElement("a");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const tooLong = `${MAX_TEXT}１`;

    updateVoiceLinks("ok", { speak, speakTatami });

    const updated = updateVoiceLinks(tooLong, { speak, speakTatami });

    expect(updated).toBe(false);
    expect(speak.dataset.url).toBeUndefined();
    expect(speakTatami.dataset.url).toBeUndefined();

    errorSpy.mockRestore();
  });
});
