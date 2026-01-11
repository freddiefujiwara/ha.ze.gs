import { API_BASE_URL_VALUE, DEVICE_HOSTS } from "./hosts.js";
import { sanitizeText } from "./text.js";

const VOICE_HOSTS = { speak: DEVICE_HOSTS.nest, speakTatami: DEVICE_HOSTS.tatami };
const CAR_ARRIVAL_MESSAGE = "チエミさん、ママさん、パパが到着しました。準備をお願いします。";
export const MAX_VOICE_TEXT =
  "１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３4";
const MAX_ENCODED_LENGTH = encodeURIComponent(MAX_VOICE_TEXT).length;
const isVoiceTextTooLong = (voiceText) => sanitizeText(voiceText).length > MAX_ENCODED_LENGTH;

export const buildVoiceUrls = (voiceText) => {
  const sanitized = sanitizeText(voiceText);
  return {
    speak: `${API_BASE_URL_VALUE}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speak}/-v/60/-s/${sanitized}`,
    speakTatami: `${API_BASE_URL_VALUE}/google-home-speaker-wrapper/-h/${VOICE_HOSTS.speakTatami}/-v/60/-s/${sanitized}`,
  };
};

export const updateVoiceLinks = (voiceText, elements) => {
  if (isVoiceTextTooLong(voiceText)) {
    console.error(`Too long text : ${voiceText}`);
    return false;
  }
  const { speak, speakTatami } = buildVoiceUrls(voiceText);
  elements.speak.dataset.url = speak;
  elements.speakTatami.dataset.url = speakTatami;
  elements.speak.setAttribute("href", "#");
  elements.speakTatami.setAttribute("href", "#");
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
