import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NOTIFY_DEBOUNCE_MS, NOTIFY_DURATION_MS } from "../src/constants.js";

describe("notify", () => {
  let dom;
  let doc;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="notification-container"></div></body></html>');
    doc = dom.window.document;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("should create and show a toast notification", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message");

    const container = doc.getElementById("notification-container");
    const toast = container.querySelector(".toast");

    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe("Test message");

    vi.advanceTimersByTime(10);
    expect(toast.classList.contains("show")).toBe(true);
  });

  it("should hide and remove the toast after a duration", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message");
    const container = doc.getElementById("notification-container");
    const toast = container.querySelector(".toast");

    vi.advanceTimersByTime(10);
    expect(toast.classList.contains("show")).toBe(true);

    vi.advanceTimersByTime(NOTIFY_DURATION_MS);
    expect(toast.classList.contains("show")).toBe(false);

    vi.advanceTimersByTime(300);
    expect(container.querySelector(".toast")).toBeNull();
  });

  it("should debounce rapid successive calls with the same message", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message");
    notify(doc, "Test message");
    notify(doc, "Test message");

    const container = doc.getElementById("notification-container");
    const toasts = container.querySelectorAll(".toast");

    expect(toasts.length).toBe(1);
  });

  it("should show a new toast if the message is different", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message 1");
    notify(doc, "Test message 2");

    const container = doc.getElementById("notification-container");
    const toasts = container.querySelectorAll(".toast");

    expect(toasts.length).toBe(2);
  });

  it("should remove multiple toasts independently", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message 1");
    await vi.advanceTimersByTimeAsync(100);
    notify(doc, "Test message 2");

    const container = doc.getElementById("notification-container");
    expect(container.querySelectorAll(".toast").length).toBe(2);

    await vi.advanceTimersByTimeAsync(NOTIFY_DURATION_MS + 300);
    expect(container.querySelectorAll(".toast").length).toBe(0);
  });

  it("should allow the same message after the debounce period", async () => {
    const { notify } = await import("../src/notify.js");
    notify(doc, "Test message");
    const container = doc.getElementById("notification-container");
    expect(container.querySelectorAll(".toast").length).toBe(1);

    vi.advanceTimersByTime(NOTIFY_DEBOUNCE_MS);
    notify(doc, "Test message");
    expect(container.querySelectorAll(".toast").length).toBe(2);
  });

  it("should not do anything if notification container is not found", async () => {
    const { notify } = await import("../src/notify.js");
    doc.getElementById("notification-container").remove();
    notify(doc, "Test message");
    const container = doc.getElementById("notification-container");
    expect(container).toBeNull();
  });
});
