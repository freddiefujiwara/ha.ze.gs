import { ALARM_SCRIPT_URL, MAX_TEXT } from "./constants.js";
import { isTextTooLong, sanitizeText } from "./text.js";

export const buildAlarmUrl = (hour, minute, text) => {
  if (isTextTooLong(text, MAX_TEXT)) {
    console.error(`Too long text : ${text}`);
    return null;
  }
  const sanitized = sanitizeText(text);
  return `${ALARM_SCRIPT_URL}?time=${hour}:${minute}:00&text=${sanitized}`;
};
