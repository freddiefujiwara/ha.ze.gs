import { describe, expect, it } from "vitest";
import { apiUrl, replaceHostTokens, resolveHost } from "../src/hosts.js";

describe("hosts", () => {
  it("builds api url", () => {
    expect(apiUrl(["hue", "lights", "off"])).toBe("http://a.ze.gs/hue/lights/off");
  });

  it("resolves host aliases", () => {
    expect(resolveHost("nest")).toBe("192.168.1.22");
    expect(resolveHost("192.168.1.99")).toBe("192.168.1.99");
  });

  it("replaces host tokens in api args", () => {
    const args = ["catt", "-d", "host:tv", "stop", 1];
    expect(replaceHostTokens(args)).toEqual(["catt", "-d", "192.168.1.219", "stop", 1]);
  });
});
