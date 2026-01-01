export const sanitizeText = (value) => encodeURIComponent(value.replace(/[\s\n\r]/g, ""));
