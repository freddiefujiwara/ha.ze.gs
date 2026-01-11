import { buildAlarmUrl } from "./alarm.js";
import { apiUrl, DEVICE_HOSTS, replaceHostTokens, resolveHost } from "./hosts.js";
import { STATUS_CELL_KEYS, buildStatusUrl, fetchLatestStatus, parseLatestPayload, updateStatusCells } from "./status.js";
import { buildCarArrivalArgs, buildVoiceUrls, updateVoiceLinks } from "./voice.js";
import { buildYouTubePlayUrl, parseYouTubeId } from "./youtube.js";

const REQUIRED_IDS = ["voicetext", "speak", "speak_tatami", "hour", "min", "alarmtext", "set"];

const getRequiredElements = (doc, ids) => Object.fromEntries(ids.map((id) => [id, doc.getElementById(id)]));
const padTime = (value) => String(value).padStart(2, "0");

const parseApiCommands = (value) => {
  if (!value) return [];
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse data-api payload", error);
    throw error;
  }
  if (!Array.isArray(parsed)) {
    const error = new Error("Invalid data-api payload");
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
    updateVoiceLinks(voicetext.value, { speak, speakTatami });
  });

  const setAlarm = () => fetcher(buildAlarmUrl(hour.value, min.value, alarmtext.value));
  const youtubePlay = (host) => {
    if (!youtubeUrl) {
      return null;
    }
    if (!parseYouTubeId(youtubeUrl.value)) {
      youtubeUrl.value = "";
      return null;
    }
    return fetcher(buildYouTubePlayUrl(host, youtubeUrl.value));
  };

  const fetchLatest = async () => {
    if (Object.values(statusCells).some((element) => !element)) {
      return null;
    }
    const latest = await fetchLatestStatus(fetcher);
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
