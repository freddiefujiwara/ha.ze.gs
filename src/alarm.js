import { MAX_ALARM_TEXT } from "./constants.js";
import { normalizeText, sanitizeText } from "./text.js";

const ALARM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec";

const MAX_ENCODED_LENGTH = encodeURIComponent(MAX_ALARM_TEXT).length;
const isAlarmTextTooLong = (alarmText) =>
  encodeURIComponent(normalizeText(alarmText)).length > MAX_ENCODED_LENGTH;

export const buildAlarmUrl = (hour, minute, text) => {
  if (isAlarmTextTooLong(text)) {
    console.error(`Too long text : ${text}`);
    return null;
  }
  const sanitized = sanitizeText(text);
  return `${ALARM_SCRIPT_URL}?time=${hour}:${minute}:00&text=${sanitized}`;
};
