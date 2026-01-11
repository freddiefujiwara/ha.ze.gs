import { describe, expect, it, vi } from "vitest";
import { MAX_ALARM_TEXT } from "../src/constants.js";
import { buildAlarmUrl } from "../src/alarm.js";

describe("alarm", () => {
  it("builds alarm url", () => {
    expect(buildAlarmUrl("07", "30", "wake up")).toBe(
      "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=07:30:00&text=wake%E3%80%80up",
    );
  });

  it("returns null and logs when alarm text is too long", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const tooLong = `${MAX_ALARM_TEXT}a`;
    expect(buildAlarmUrl("07", "30", tooLong)).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(`Too long text : ${tooLong}`);
    errorSpy.mockRestore();
  });
});
