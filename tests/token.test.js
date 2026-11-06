import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TOKEN_HEADER,
  TOKEN_STORAGE_KEY,
  bindTokenSettings,
  getApiToken,
  setApiToken,
  withApiToken,
} from "../src/token.js";

const BASE = "https://home.example";

const createStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key) => (map.has(key) ? map.get(key) : null)),
    setItem: vi.fn((key, value) => map.set(key, String(value))),
    removeItem: vi.fn((key) => map.delete(key)),
  };
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("getApiToken / setApiToken", () => {
  it("returns null when nothing is stored", () => {
    expect(getApiToken(createStorage())).toBeNull();
  });

  it("returns null when the stored value is empty", () => {
    expect(getApiToken(createStorage({ [TOKEN_STORAGE_KEY]: "" }))).toBeNull();
  });

  it("stores a trimmed token and reads it back", () => {
    const storage = createStorage();
    expect(setApiToken("  abc123  ", storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, "abc123");
    expect(getApiToken(storage)).toBe("abc123");
  });

  it("removes the token when set to an empty value", () => {
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "abc123" });
    expect(setApiToken("   ", storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(getApiToken(storage)).toBeNull();
  });

  it("treats a null value as empty", () => {
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "abc123" });
    expect(setApiToken(null, storage)).toBe(true);
    expect(getApiToken(storage)).toBeNull();
  });

  it("uses localStorage by default", () => {
    expect(setApiToken("default-token")).toBe(true);
    expect(getApiToken()).toBe("default-token");
  });

  it("returns null / false when storage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);
    try {
      expect(getApiToken()).toBeNull();
      expect(setApiToken("abc")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("survives a storage that throws", () => {
    const broken = {
      getItem: vi.fn(() => {
        throw new Error("denied");
      }),
      setItem: vi.fn(() => {
        throw new Error("denied");
      }),
      removeItem: vi.fn(() => {
        throw new Error("denied");
      }),
    };
    expect(getApiToken(broken)).toBeNull();
    expect(setApiToken("abc", broken)).toBe(false);
    expect(setApiToken("", broken)).toBe(false);
  });
});

describe("withApiToken", () => {
  it("adds the token header to home API requests without options", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "secret" });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: BASE, storage });
    await wrapped(`${BASE}/hue/lights/off`);
    expect(fetcher).toHaveBeenCalledWith(`${BASE}/hue/lights/off`, {
      headers: { [TOKEN_HEADER]: "secret" },
    });
  });

  it("merges the token header with existing options", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "secret" });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: BASE, storage });
    const signal = { aborted: false };
    await wrapped(`${BASE}/x`, { signal, headers: { "X-Other": "1" } });
    expect(fetcher).toHaveBeenCalledWith(`${BASE}/x`, {
      signal,
      headers: { "X-Other": "1", [TOKEN_HEADER]: "secret" },
    });
    await wrapped(`${BASE}/y`, { method: "POST" });
    expect(fetcher).toHaveBeenCalledWith(`${BASE}/y`, {
      method: "POST",
      headers: { [TOKEN_HEADER]: "secret" },
    });
  });

  it("passes other URLs through untouched", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "secret" });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: BASE, storage });
    await wrapped("https://script.google.com/macros/s/x/exec?callback=cb");
    expect(fetcher).toHaveBeenCalledWith("https://script.google.com/macros/s/x/exec?callback=cb");
    await wrapped("https://script.google.com/x", { method: "GET" });
    expect(fetcher).toHaveBeenCalledWith("https://script.google.com/x", { method: "GET" });
  });

  it("passes requests through when no token is stored", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: BASE, storage: createStorage() });
    await wrapped(`${BASE}/hue/lights/off`);
    expect(fetcher).toHaveBeenCalledWith(`${BASE}/hue/lights/off`);
  });

  it("passes non-string URLs through untouched", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "secret" });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: BASE, storage });
    const request = { url: `${BASE}/x` };
    await wrapped(request);
    expect(fetcher).toHaveBeenCalledWith(request);
  });

  it("passes everything through when the base URL is empty", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "secret" });
    const wrapped = withApiToken(fetcher, { apiBaseUrl: "", storage });
    await wrapped(`${BASE}/x`);
    expect(fetcher).toHaveBeenCalledWith(`${BASE}/x`);
  });

  it("uses the configured base URL and localStorage by default", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    setApiToken("default-token");
    const wrapped = withApiToken(fetcher);
    await wrapped("https://home.example/hue/lights/off");
    expect(fetcher).toHaveBeenCalledWith("https://home.example/hue/lights/off", {
      headers: { [TOKEN_HEADER]: "default-token" },
    });
  });
});

describe("bindTokenSettings", () => {
  const buildDoc = (html) => {
    const doc = window.document.implementation.createHTMLDocument("test");
    doc.body.innerHTML = html;
    return doc;
  };
  const FULL_HTML = `<input id="api_token" type="password" /><a href="#" id="api_token_save">Save</a><span id="api_token_state"></span>`;

  it("returns false when the elements are missing", () => {
    expect(bindTokenSettings(buildDoc(""), { storage: createStorage() })).toBe(false);
    expect(bindTokenSettings(buildDoc(`<input id="api_token" />`), { storage: createStorage() })).toBe(false);
    expect(
      bindTokenSettings(buildDoc(`<input id="api_token" /><a href="#" id="api_token_save">Save</a>`), {
        storage: createStorage(),
      }),
    ).toBe(false);
  });

  it("shows Not set and saves a token on click", () => {
    const storage = createStorage();
    const doc = buildDoc(FULL_HTML);
    expect(bindTokenSettings(doc, { storage })).toBe(true);
    expect(doc.getElementById("api_token_state").textContent).toBe("Not set");
    const input = doc.getElementById("api_token");
    input.value = "  new-token ";
    doc.getElementById("api_token_save").dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
    expect(getApiToken(storage)).toBe("new-token");
    expect(input.value).toBe("");
    expect(doc.getElementById("api_token_state").textContent).toBe("Saved");
  });

  it("shows Saved when a token exists and clears it on an empty save", () => {
    const storage = createStorage({ [TOKEN_STORAGE_KEY]: "existing" });
    const doc = buildDoc(FULL_HTML);
    expect(bindTokenSettings(doc, { storage })).toBe(true);
    expect(doc.getElementById("api_token_state").textContent).toBe("Saved");
    doc.getElementById("api_token_save").dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
    expect(getApiToken(storage)).toBeNull();
    expect(doc.getElementById("api_token_state").textContent).toBe("Not set");
  });

  it("binds with the default storage", () => {
    const doc = buildDoc(FULL_HTML);
    expect(bindTokenSettings(doc)).toBe(true);
    expect(doc.getElementById("api_token_state").textContent).toBe("Not set");
  });
});
