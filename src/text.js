export const normalizeText = (value) => String(value ?? "").replace(/\s+/g, "　").trim();
export const sanitizeText = (value) => encodeURIComponent(normalizeText(value));
