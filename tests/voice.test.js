import { describe, expect, it } from "vitest";
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

    updateVoiceLinks("test", { speak, speakTatami });

    expect(speak.dataset.url).toContain("-s/test");
    expect(speakTatami.dataset.url).toContain("-s/test");
  });

  it("builds car arrival args", () => {
    const args = buildCarArrivalArgs();
    expect(args.join("/")).toContain("google-home-speaker-wrapper");
    expect(args.join("/")).toContain("192.168.1.22");
  });
});
