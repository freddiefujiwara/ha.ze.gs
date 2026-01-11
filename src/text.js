export const createTextUtils = () => {
  const normalizeText = (value) => String(value ?? "").replace(/\s+/g, "　").trim();
  const sanitizeText = (value) => encodeURIComponent(normalizeText(value));
  const getMaxEncodedLength = (maxText) => encodeURIComponent(normalizeText(maxText)).length;
  const isTextTooLong = (value, maxText) =>
    encodeURIComponent(normalizeText(value)).length > getMaxEncodedLength(maxText);

  return {
    normalizeText,
    sanitizeText,
    getMaxEncodedLength,
    isTextTooLong,
  };
};

const defaultTextUtils = createTextUtils();

export const { normalizeText, sanitizeText, getMaxEncodedLength, isTextTooLong } = defaultTextUtils;
