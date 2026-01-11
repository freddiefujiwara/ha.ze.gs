import { buildAlarmUrl } from "./alarm.js";
import { DEVICE_HOSTS, ERROR_MESSAGES } from "./constants.js";
import { apiUrl, replaceHostTokens, resolveHost } from "./hosts.js";
import { notify } from "./notify.js";
import { STATUS_CELL_KEYS, buildStatusUrl, fetchLatestStatus, parseLatestPayload, updateStatusCells } from "./status.js";
import { buildCarArrivalArgs, buildVoiceUrls, updateVoiceLinks } from "./voice.js";
import { buildYouTubePlayUrl, parseYouTubeId } from "./youtube.js";

const REQUIRED_IDS = ["voicetext", "speak", "speak_tatami", "hour", "min", "alarmtext", "set"];

const getRequiredElements = (doc, ids) => Object.fromEntries(ids.map((id) => [id, doc.getElementById(id)]));
const padTime = (value) => String(value).padStart(2, "0");
const buildTimeOptions = (count) =>
  Array.from({ length: count }, (_, index) => {
    const value = padTime(index);
    return `<option value="${value}">${value}</option>`;
  }).join("");

const parseApiCommands = (value) => {
  if (!value) return [];
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    console.error(ERROR_MESSAGES.PARSE_DATA_API, error);
    throw error;
  }
  if (!Array.isArray(parsed)) {
    const error = new Error(ERROR_MESSAGES.INVALID_DATA_API);
    console.error(error.message, parsed);
    throw error;
  }
  if (!parsed.length) return [];
  return parsed.every(Array.isArray) ? parsed : [parsed];
};

export {
  apiUrl,
  buildAlarmUrl,
  buildCarArrivalArgs,
  buildVoiceUrls,
  buildStatusUrl,
  buildYouTubePlayUrl,
  fetchLatestStatus,
  parseApiCommands,
  parseLatestPayload,
  parseYouTubeId,
  replaceHostTokens,
  resolveHost,
  updateStatusCells,
  updateVoiceLinks,
  DEVICE_HOSTS,
};

const setAlarmDefaults = (hourSelect, minuteSelect, now = new Date()) => {
  if (!hourSelect.options.length) {
    hourSelect.innerHTML = buildTimeOptions(24);
  }
  if (!minuteSelect.options.length) {
    minuteSelect.innerHTML = buildTimeOptions(60);
  }
  const setIfExists = (select, value) => {
    if (select.querySelector(`option[value="${value}"]`)) {
      select.value = value;
    }
  };
  setIfExists(hourSelect, padTime(now.getHours()));
  setIfExists(minuteSelect, padTime(now.getMinutes()));
};

export const initApp = (doc, fetcher = fetch) => {
  const requiredElements = getRequiredElements(doc, REQUIRED_IDS);
  const statusCells = getRequiredElements(doc, STATUS_CELL_KEYS);
  if (Object.values(requiredElements).some((element) => !element)) {
    return null;
  }

  const { voicetext, speak, speak_tatami: speakTatami, hour, min, alarmtext, set: setButton } = requiredElements;
  const youtubeUrl = doc.getElementById("youtube_url");

  setAlarmDefaults(hour, min);

  voicetext.addEventListener("input", () => {
    const ok = updateVoiceLinks(voicetext.value, { speak, speakTatami });
    if (!ok) {
      notify(doc, ERROR_MESSAGES.TOO_LONG);
    }
  });

  const setAlarm = async () => {
    const alarmUrl = buildAlarmUrl(hour.value, min.value, alarmtext.value);
    if (!alarmUrl) {
      notify(doc, ERROR_MESSAGES.TOO_LONG);
      return false;
    }
    await fetcher(alarmUrl);
    return true;
  };
  const youtubePlay = (host) => {
    if (!youtubeUrl) {
      return null;
    }
    const playUrl = buildYouTubePlayUrl(host, youtubeUrl.value);
    if (!playUrl) {
      if (youtubeUrl.value) {
        notify(doc, ERROR_MESSAGES.INVALID_URL);
      }
      youtubeUrl.value = "";
      return null;
    }
    return fetcher(playUrl);
  };

  const fetchLatest = async (signal) => {
    if (Object.values(statusCells).some((element) => !element)) {
      return null;
    }
    const latest = await fetchLatestStatus(doc, fetcher, { signal });
    if (!latest) {
      return null;
    }
    updateStatusCells(latest, statusCells);
    return latest;
  };

  return {
    setAlarm,
    youtubePlay,
    fetchLatest,
    elements: {
      voicetext,
      speak,
      speakTatami,
      hour,
      min,
      alarmtext,
      setButton,
      youtubeUrl,
      statusCells,
    },
  };
};
