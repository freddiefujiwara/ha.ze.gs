import { buildAlarmUrl, createAlarmController } from "./alarm.js";
import { DEVICE_HOSTS, ERROR_MESSAGES } from "./constants.js";
import { apiUrl, replaceHostTokens, resolveHost } from "./hosts.js";
import { reportError } from "./notify.js";
import {
  STATUS_CELL_KEYS,
  buildStatusUrl,
  createStatusController,
  fetchLatestStatus,
  parseLatestPayload,
  updateStatusCells,
} from "./status.js";
import { buildCarArrivalArgs, buildVoiceUrls, createVoiceController, updateVoiceLinks } from "./voice.js";
import { buildYouTubePlayUrl, createYouTubeController, parseYouTubeId } from "./youtube.js";

const REQUIRED_IDS = ["voicetext", "speak", "speak_tatami", "hour", "min", "alarmtext", "set"];
const getRequiredElements = (doc, ids) => Object.fromEntries(ids.map((id) => [id, doc.getElementById(id)]));

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

const createAppState = (doc) => {
  const requiredElements = getRequiredElements(doc, REQUIRED_IDS);
  const statusCells = getRequiredElements(doc, STATUS_CELL_KEYS);
  const missingRequired = Object.values(requiredElements).some((element) => !element);
  const missingStatus = Object.values(statusCells).some((element) => !element);
  const { voicetext, speak, speak_tatami: speakTatami, hour, min, alarmtext, set: setButton } = requiredElements;
  const youtubeUrl = doc.getElementById("youtube_url");
  return {
    hasRequired: !missingRequired,
    hasStatus: !missingStatus,
    requiredElements,
    statusCells,
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


export const initApp = (doc, fetcher = fetch) => {
  const state = createAppState(doc);
  if (!state.hasRequired) return null;

  const notifier = { reportError };
  const alarmController = createAlarmController({ doc, fetcher, notifier, elements: state.elements });
  const voiceController = createVoiceController({ doc, elements: state.elements, notifier });
  const youtubeController = createYouTubeController({ doc, fetcher, notifier, elements: state.elements });
  const statusController = createStatusController({
    doc,
    fetcher,
    statusCells: state.statusCells,
    hasStatus: state.hasStatus,
  });

  alarmController.setDefaults();
  voiceController.bindInput();

  return {
    setAlarm: alarmController.setAlarm,
    youtubePlay: youtubeController.youtubePlay,
    fetchLatest: statusController.fetchLatest,
    elements: state.elements,
  };
};
