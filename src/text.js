/**
 * @returns {{
 *   normalizeText: (value: unknown) => string,
 *   sanitizeText: (value: unknown) => string,
 *   getMaxEncodedLength: (maxText: unknown) => number,
 *   isTextTooLong: (value: unknown, maxText: unknown) => boolean
 * }}
 */
export const createTextUtils = () => {
  // Values whose toString is not callable (producible via JSON) make
  // String() throw; they read as empty text instead.
  const toText = (value) => {
    try {
      return String(value ?? "");
    } catch {
      return "";
    }
  };
  const normalizeText = (value) => toText(value).replace(/\s+/g, "　").trim();
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

export const { normalizeText, sanitizeText } = defaultTextUtils;
