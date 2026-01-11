import { ALARM_SCRIPT_URL, ERROR_MESSAGES, MAX_TEXT } from "./constants.js";
import { isTextTooLong, sanitizeText } from "./text.js";

export const buildAlarmUrl = (hour, minute, text) => {
  if (isTextTooLong(text, MAX_TEXT)) {
    return null;
  }
  const sanitized = sanitizeText(text);
  return `${ALARM_SCRIPT_URL}?time=${hour}:${minute}:00&text=${sanitized}`;
};

const padTime = (value) => String(value).padStart(2, "0");
const buildTimeOptions = (count) =>
  Array.from({ length: count }, (_, index) => {
    const value = padTime(index);
    return `<option value="${value}">${value}</option>`;
  }).join("");

export const setAlarmDefaults = (hourSelect, minuteSelect, now = new Date()) => {
  if (!hourSelect.options.length) hourSelect.innerHTML = buildTimeOptions(24);
  if (!minuteSelect.options.length) minuteSelect.innerHTML = buildTimeOptions(60);
  const setIfExists = (select, value) => select.querySelector(`option[value="${value}"]`) && (select.value = value);
  setIfExists(hourSelect, padTime(now.getHours()));
  setIfExists(minuteSelect, padTime(now.getMinutes()));
};

export const createAlarmController = ({
  doc,
  fetcher,
  notifier,
  elements,
  buildAlarmUrl: buildAlarmUrlFn = buildAlarmUrl,
} = {}) => {
  const setDefaults = () => setAlarmDefaults(elements.hour, elements.min);
  const setAlarm = async () => {
    const alarmUrl = buildAlarmUrlFn(elements.hour.value, elements.min.value, elements.alarmtext.value);
    if (!alarmUrl) {
      notifier?.reportError?.(doc, ERROR_MESSAGES.TOO_LONG, elements.alarmtext.value);
      return false;
    }
    await fetcher(alarmUrl);
    return true;
  };
  return { setDefaults, setAlarm };
};
