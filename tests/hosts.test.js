import { describe, expect, it } from "vitest";
import { apiUrl, replaceHostTokens, resolveHost } from "../src/hosts.js";

describe("hosts", () => {
  it.each([
    ["builds api url", () => apiUrl(["hue", "lights", "off"]), "http://a.ze.gs/hue/lights/off"],
    ["resolves host aliases", () => resolveHost("nest"), "192.168.1.22"],
    ["returns host when not aliased", () => resolveHost("192.168.1.99"), "192.168.1.99"],
  ])("%s", (_, fn, expected) => {
    expect(fn()).toBe(expected);
  });

  it("replaces host tokens in api args", () => {
    const args = ["catt", "-d", "host:tv", "stop", 1];
    expect(replaceHostTokens(args)).toEqual(["catt", "-d", "192.168.1.219", "stop", 1]);
  });
});
