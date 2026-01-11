import { describe, expect, it, vi } from "vitest";
import { buildYouTubePlayUrl, parseYouTubeId } from "../src/youtube.js";

describe("youtube", () => {
  it("parses youtube id by url form", () => {
    expect(parseYouTubeId("https://youtu.be/abc123")).toBe("abc123");
    expect(parseYouTubeId("https://youtu.be/")).toBeNull();
    expect(parseYouTubeId("https://www.youtube.com/watch?v=xyz987")).toBe("xyz987");
    expect(parseYouTubeId("https://www.youtube.com/watch")).toBeNull();
    expect(parseYouTubeId("https://music.youtube.com/watch?v=qwe456&feature=share")).toBe("qwe456");
    expect(parseYouTubeId("https://www.youtube.com/live/liveid?feature=share")).toBe("liveid");
    expect(parseYouTubeId("https://www.youtube.com/live/")).toBeNull();
    expect(parseYouTubeId("https://www.youtube.com/playlist?list=abc")).toBeNull();
    expect(parseYouTubeId("https://example.com/watch?v=abc")).toBeNull();
    expect(parseYouTubeId("invalid")).toBeNull();
    expect(parseYouTubeId("view-source:http://ha.ze.gs/")).toBeNull();
  });

  it("builds youtube play url", () => {
    expect(buildYouTubePlayUrl("192.168.1.22", "https://youtu.be/abc123")).toBe(
      "http://a.ze.gs/youtube-play/-h/192.168.1.22/-v/40/-i/abc123",
    );
    expect(buildYouTubePlayUrl("192.168.1.22", "https://example.com/watch?v=abc")).toBeNull();
  });
});
