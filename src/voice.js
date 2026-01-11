import { API_BASE_URL, CAR_ARRIVAL_MESSAGE, DEVICE_HOSTS, MAX_VOICE_TEXT, VOICE_HOSTS } from "./constants.js";
import { isTextTooLong, sanitizeText } from "./text.js";

export const buildVoiceUrls = (voiceText) => {
  const sanitized = sanitizeText(voiceText);
  return {
    speak: `${API_BASE_URL}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speak}/-v/60/-s/${sanitized}`,
    speakTatami: `${API_BASE_URL}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speakTatami}/-v/60/-s/${sanitized}`,
  };
};

export const updateVoiceLinks = (voiceText, elements) => {
  if (isTextTooLong(voiceText, MAX_VOICE_TEXT)) {
    console.error(`Too long text : ${voiceText}`);
    elements.speak.removeAttribute("data-url");
    elements.speakTatami.removeAttribute("data-url");
    return false;
  }
  const { speak, speakTatami } = buildVoiceUrls(voiceText);
  elements.speak.dataset.url = speak;
  elements.speakTatami.dataset.url = speakTatami;
  return true;
};

export const buildCarArrivalArgs = () => [
  "google-home-speaker-wrapper",
  "-h",
  DEVICE_HOSTS.nest,
  "-v",
  60,
  "-s",
  sanitizeText(CAR_ARRIVAL_MESSAGE),
];
