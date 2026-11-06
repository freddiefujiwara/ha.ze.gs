import { API_BASE_URL } from "./constants.js";

// The home command API token lives only in this browser's storage. It
// is never written in this repository and never sent anywhere else:
// withApiToken attaches it as the X-Api-Token header on requests to
// API_BASE_URL only and passes every other request through untouched
// (the status script on script.google.com must not receive it).

export const TOKEN_STORAGE_KEY = "home-api-token";
export const TOKEN_HEADER = "X-Api-Token";

/**
 * @param {Storage} [storage] defaults to the browser localStorage
 * @returns {string | null} the stored token, or null when unset or
 *   storage is unavailable
 */
export const getApiToken = (storage) => {
  try {
    const store = storage ?? globalThis.localStorage;
    return store.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

/**
 * Stores the token (trimmed). An empty value removes the stored token.
 * @param {unknown} value
 * @param {Storage} [storage] defaults to the browser localStorage
 * @returns {boolean} whether storage was updated
 */
export const setApiToken = (value, storage) => {
  try {
    const store = storage ?? globalThis.localStorage;
    const token = String(value ?? "").trim();
    if (token) {
      store.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      store.removeItem(TOKEN_STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Wraps a fetch implementation so requests to the home command API
 * carry the stored token. When no header applies, the wrapped fetcher
 * is called with exactly the original arguments.
 * @param {typeof fetch} fetcher
 * @param {{ apiBaseUrl?: string, storage?: Storage }} [options]
 * @returns {typeof fetch}
 */
export const withApiToken = (fetcher, { apiBaseUrl = API_BASE_URL, storage } = {}) => {
  return (url, options) => {
    const token = getApiToken(storage);
    if (!token || typeof url !== "string" || !apiBaseUrl || !url.startsWith(apiBaseUrl)) {
      return options === undefined ? fetcher(url) : fetcher(url, options);
    }
    return fetcher(url, { ...options, headers: { ...options?.headers, [TOKEN_HEADER]: token } });
  };
};

/**
 * Wires the API token settings row (input#api_token, a#api_token_save,
 * span#api_token_state) when the page has one. Saving an empty value
 * clears the stored token.
 * @param {Document} doc
 * @param {{ storage?: Storage }} [options]
 * @returns {boolean} whether the settings row was found and wired
 */
export const bindTokenSettings = (doc, { storage } = {}) => {
  const input = doc.getElementById("api_token");
  const save = doc.getElementById("api_token_save");
  const state = doc.getElementById("api_token_state");
  if (!input || !save || !state) return false;
  const render = () => {
    state.textContent = getApiToken(storage) ? "Saved" : "Not set";
  };
  render();
  save.addEventListener("click", (event) => {
    event.preventDefault();
    setApiToken(input.value, storage);
    input.value = "";
    render();
  });
  return true;
};
