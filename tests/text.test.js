import { describe, expect, it } from "vitest";
import { sanitizeText } from "../src/text.js";

describe("sanitizeText", () => {
  it("normalizes whitespace and encodes", () => {
    expect(sanitizeText(" hello\nworld  \tfoo ")).toBe("hello%E3%80%80world%E3%80%80foo");
  });

  it("returns empty string for non-string values", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
  });
});
