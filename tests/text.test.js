import { describe, expect, it } from "vitest";
import { normalizeText, sanitizeText } from "../src/text.js";

describe("sanitizeText", () => {
  it.each([
    ["normalizes whitespace", normalizeText, " hello\nworld  \tfoo ", "hello　world　foo"],
    ["normalizes whitespace and encodes", sanitizeText, " hello\nworld  \tfoo ", "hello%E3%80%80world%E3%80%80foo"],
    ["returns empty string for null", sanitizeText, null, ""],
    ["returns empty string for undefined", sanitizeText, undefined, ""],
  ])("%s", (_, fn, input, expected) => {
    expect(fn(input)).toBe(expected);
  });
});
