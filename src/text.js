export const sanitizeText = (value) => encodeURIComponent(value.replace(/\s+/g, "　").trim());
