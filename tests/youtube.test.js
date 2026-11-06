import { describe, expect, it } from "vitest";
import { buildYouTubePlayUrl, parseYouTubeId } from "../src/youtube.js";

describe("youtube", () => {
  it.each([
    ["short url", "https://youtu.be/abc123", "abc123"],
    ["short url missing id", "https://youtu.be/", null],
    ["watch url", "https://www.youtube.com/watch?v=xyz987", "xyz987"],
    ["watch url missing id", "https://www.youtube.com/watch", null],
    ["music url", "https://music.youtube.com/watch?v=qwe456&feature=share", "qwe456"],
    ["live url", "https://www.youtube.com/live/liveid?feature=share", "liveid"],
    ["live url missing id", "https://www.youtube.com/live/", null],
    ["playlist url", "https://www.youtube.com/playlist?list=abc", null],
    ["non-youtube host", "https://example.com/watch?v=abc", null],
    ["invalid url", "invalid", null],
    ["view-source", "view-source:http://home.example/", null],
  ])("parses youtube id: %s", (_, value, expected) => {
    expect(parseYouTubeId(value)).toBe(expected);
  });

  it.each([
    [
      "default volume",
      () => buildYouTubePlayUrl("192.0.2.10", "https://youtu.be/abc123"),
      "https://home.example/youtube-play/-h/192.0.2.10/-v/40/-i/abc123",
    ],
    [
      "explicit volume",
      () => buildYouTubePlayUrl("192.0.2.10", "https://youtu.be/abc123", "20"),
      "https://home.example/youtube-play/-h/192.0.2.10/-v/20/-i/abc123",
    ],
    [
      "low invalid volume",
      () => buildYouTubePlayUrl("192.0.2.10", "https://youtu.be/abc123", "-1"),
      "https://home.example/youtube-play/-h/192.0.2.10/-v/40/-i/abc123",
    ],
    [
      "high invalid volume",
      () => buildYouTubePlayUrl("192.0.2.10", "https://youtu.be/abc123", "101"),
      "https://home.example/youtube-play/-h/192.0.2.10/-v/40/-i/abc123",
    ],
    ["invalid youtube url", () => buildYouTubePlayUrl("192.0.2.10", "https://example.com/watch?v=abc"), null],
  ])("builds youtube play url: %s", (_, fn, expected) => {
    expect(fn()).toBe(expected);
  });
});
