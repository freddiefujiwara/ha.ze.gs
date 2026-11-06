import { describe, expect, it } from "vitest";
import { buildConfig, parseDeviceHosts } from "../src/config.js";

describe("parseDeviceHosts", () => {
  it("returns an empty map when no value is given", () => {
    expect(parseDeviceHosts(undefined)).toEqual({});
    expect(parseDeviceHosts("")).toEqual({});
  });

  it("returns an empty map for invalid JSON", () => {
    expect(parseDeviceHosts("{not json")).toEqual({});
  });

  it("returns an empty map for non-object JSON values", () => {
    expect(parseDeviceHosts("null")).toEqual({});
    expect(parseDeviceHosts("5")).toEqual({});
    expect(parseDeviceHosts("[]")).toEqual({});
  });

  it("parses a JSON object into the device host map", () => {
    expect(parseDeviceHosts('{"nest":"192.0.2.10","tv":"192.0.2.12"}')).toEqual({
      nest: "192.0.2.10",
      tv: "192.0.2.12",
    });
  });
});

describe("buildConfig", () => {
  it("builds the config from Vite environment variables", () => {
    const config = buildConfig({
      VITE_API_BASE_URL: "https://home.example",
      VITE_DEVICE_HOSTS: '{"nest":"192.0.2.10","tatami":"192.0.2.11","tv":"192.0.2.12"}',
    });
    expect(config.API_BASE_URL).toBe("https://home.example");
    expect(config.DEVICE_HOSTS).toEqual({ nest: "192.0.2.10", tatami: "192.0.2.11", tv: "192.0.2.12" });
    expect(config.VOICE_HOSTS).toEqual({ speak: "192.0.2.10", speakTatami: "192.0.2.11" });
  });

  it("falls back to empty values when the variables are not set", () => {
    const config = buildConfig({});
    expect(config.API_BASE_URL).toBe("");
    expect(config.DEVICE_HOSTS).toEqual({});
    expect(config.VOICE_HOSTS).toEqual({ speak: undefined, speakTatami: undefined });
  });
});
