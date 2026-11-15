import { describe, expect, it } from "vitest";
import { apiUrl, replaceHostTokens, resolveHost } from "../src/hosts.js";

describe("hosts", () => {
  it.each([
    ["builds api url", () => apiUrl(["hue", "lights", "off"]), "https://home.example/hue/lights/off"],
    ["resolves host aliases", () => resolveHost("nest"), "192.0.2.10"],
    ["returns host when not aliased", () => resolveHost("192.0.2.99"), "192.0.2.99"],
  ])("%s", (_, fn, expected) => {
    expect(fn()).toBe(expected);
  });

  it("replaces host tokens in api args", () => {
    const args = ["catt", "-d", "host:tv", "stop", 1];
    expect(replaceHostTokens(args)).toEqual(["catt", "-d", "192.0.2.12", "stop", 1]);
  });

  it("replaces device tokens in api args", () => {
    const args = ["switchbot-command", "-d", "device:living", "-c", "turnOn", 1];
    expect(replaceHostTokens(args)).toEqual(["switchbot-command", "-d", "LIVINGID", "-c", "turnOn", 1]);
  });

  it("falls back to the device name when the device is not configured", () => {
    expect(replaceHostTokens(["device:unknown"])).toEqual(["unknown"]);
  });

  it("leaves plain args untouched", () => {
    expect(replaceHostTokens(["switchbot-command", "-c", "turnOff"])).toEqual([
      "switchbot-command",
      "-c",
      "turnOff",
    ]);
  });
});
