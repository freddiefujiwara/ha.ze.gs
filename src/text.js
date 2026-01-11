export const normalizeText = (value) => String(value ?? "").replace(/\s+/g, "　").trim();
export const sanitizeText = (value) => encodeURIComponent(normalizeText(value));
export const getMaxEncodedLength = (maxText) => encodeURIComponent(normalizeText(maxText)).length;
export const isTextTooLong = (value, maxText) =>
  encodeURIComponent(normalizeText(value)).length > getMaxEncodedLength(maxText);
