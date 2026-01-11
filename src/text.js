export const sanitizeText = (value) =>
  encodeURIComponent(String(value ?? "").replace(/\s+/g, "　").trim());
