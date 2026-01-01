import { describe, expect, it } from "vitest";
import { buildAlarmUrl } from "../src/alarm.js";

describe("alarm", () => {
  it("builds alarm url", () => {
    expect(buildAlarmUrl("07", "30", "wake up")).toBe(
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=07:30:00&text=wakeup",
    );
  });
});
