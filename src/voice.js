import { API_BASE_URL, CAR_ARRIVAL_MESSAGE, DEVICE_HOSTS, ERROR_MESSAGES, MAX_TEXT, VOICE_HOSTS } from "./constants.js";
import { createTextUtils } from "./text.js";

export const createVoiceService = ({
  apiBaseUrl = API_BASE_URL,
  voiceHosts = VOICE_HOSTS,
  deviceHosts = DEVICE_HOSTS,
  maxText = MAX_TEXT,
  textUtils = createTextUtils(),
} = {}) => {
  const { sanitizeText, isTextTooLong } = textUtils;

  const buildVoiceUrls = (voiceText) => {
    const sanitized = sanitizeText(voiceText);
    return {
      speak: `${apiBaseUrl}/google-home-speaker-wrapper/-h/${voiceHosts.speak}/-v/60/-s/${sanitized}`,
      speakTatami: `${apiBaseUrl}/google-home-speaker-wrapper/-h/${voiceHosts.speakTatami}/-v/60/-s/${sanitized}`,
    };
  };

  const updateVoiceLinks = (voiceText, elements) => {
    if (isTextTooLong(voiceText, maxText)) {
      elements.speak.removeAttribute("data-url");
      elements.speakTatami.removeAttribute("data-url");
      return false;
    }
    const { speak, speakTatami } = buildVoiceUrls(voiceText);
    elements.speak.dataset.url = speak;
    elements.speakTatami.dataset.url = speakTatami;
    return true;
  };

  const buildCarArrivalArgs = () => [
    "google-home-speaker-wrapper",
    "-h",
    deviceHosts.nest,
    "-v",
    60,
    "-s",
    sanitizeText(CAR_ARRIVAL_MESSAGE),
  ];

  return {
    buildVoiceUrls,
    updateVoiceLinks,
    buildCarArrivalArgs,
  };
};

const defaultVoiceService = createVoiceService();

export const { buildVoiceUrls, updateVoiceLinks, buildCarArrivalArgs } = defaultVoiceService;

export const createVoiceController = ({ doc, elements, notifier, updateVoiceLinks: updateVoiceLinksFn = updateVoiceLinks } = {}) => {
  const bindInput = () => {
    elements.voicetext.addEventListener("input", () => {
      if (!updateVoiceLinksFn(elements.voicetext.value, { speak: elements.speak, speakTatami: elements.speakTatami })) {
        notifier?.reportError?.(doc, ERROR_MESSAGES.TOO_LONG, elements.voicetext.value);
      }
    });
  };
  return { bindInput };
};
