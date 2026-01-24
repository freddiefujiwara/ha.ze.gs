import { describe, expect, it } from "vitest";
import { MAX_TEXT } from "../src/constants.js";
import { buildAlarmUrl } from "../src/alarm.js";

describe("alarm", () => {
  it.each([
    [
      "builds alarm url",
      () => buildAlarmUrl("07", "30", "wake up"),
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=07:30:00&text=wake%E3%80%80up",
    ],
    ["returns null when text is too long", () => buildAlarmUrl("07", "30", `${MAX_TEXT}a`), null],
  ])("%s", (_, fn, expected) => {
    expect(fn()).toBe(expected);
  });
});
