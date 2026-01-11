import { MAX_ALARM_TEXT } from "./constants.js";
import { isTextTooLong, sanitizeText } from "./text.js";

const ALARM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec";

export const buildAlarmUrl = (hour, minute, text) => {
  if (isTextTooLong(text, MAX_ALARM_TEXT)) {
    console.error(`Too long text : ${text}`);
    return null;
  }
  const sanitized = sanitizeText(text);
  return `${ALARM_SCRIPT_URL}?time=${hour}:${minute}:00&text=${sanitized}`;
};
