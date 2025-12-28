export const apiUrl = (args) => `http://a.ze.gs/${args.join("/")}`;

export const buildVoiceUrls = (voiceText) => {
  const sanitized = encodeURIComponent(voiceText.replace(/[\s\n\r]/g, ""));
  return {
    speak: `http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.22/-v/60/-s/${sanitized}`,
    speakTatami: `http://a.ze.gs/google-home-speaker-wrapper/-h/192.168.1.236/-v/60/-s/${sanitized}`,
  };
};

export const updateVoiceLinks = (voiceText, elements) => {
  const { speak, speakTatami } = buildVoiceUrls(voiceText);
  elements.speak.dataset.url = speak;
  elements.speakTatami.dataset.url = speakTatami;
  elements.speak.setAttribute("href", "#");
  elements.speakTatami.setAttribute("href", "#");
};

export const buildAlarmUrl = (hour, minute, text) => {
  const sanitized = encodeURIComponent(text.replace(/[\s\n\r]/g, ""));
  return `https://script.google.com/macros/s/AKfycbyGtgeNC_rHFxPvSj7XjO5GdM6awoqlxJ7PDmfcadghjZshQ8Y/exec?time=${hour}:${minute}:00&text=${sanitized}`;
};

export const parseYouTubeId = (youtubeUrl) => {
  if (youtubeUrl.match(/^https:\/\/youtu.be\//)) {
    return youtubeUrl.split("/")[3];
  }

  if (youtubeUrl.match(/^https:\/\/(music|www|m).youtube.com\/watch\?v=/)) {
    const videoId = youtubeUrl.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    return ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;
  }

  if (youtubeUrl.match(/^https:\/\/(www\.)?youtube.com\/(live|shorts)\//)) {
    return youtubeUrl.split("/")[4].split("?")[0];
  }

  return "";
};

export const buildYouTubePlayUrl = (host, youtubeUrl) => {
  const videoId = parseYouTubeId(youtubeUrl);
  return { videoId, url: `http://a.ze.gs/youtube-play/-h/${host}/-v/40/-i/${videoId}` };
};

export const buildGptUrl = (host, prompt) => {
  const sanitized = encodeURIComponent(prompt.replace(/[\s\n\r]/g, ""));
  return `https://hook.us1.make.com/7zekvch82ird62gydqbu356ncnkx05z9?p=${sanitized}&i=${host}`;
};

export const parseLatestPayload = (payload) => {
  const cleaned = payload.replace(/^a&&a\(/, "").replace(/\);$/, "");
  return JSON.parse(cleaned).pop();
};

export const fetchLatestStatus = async (fetcher) => {
  const response = await fetcher(
    "https://script.google.com/macros/s/AKfycbyedXl6ic-uZR0LDrWgpw9madWl0374RNxz7EIB1m4wMnYsVZnT3rfVt4OQ8tDb1R8YOQ/exec?callback=a",
  );
  const payload = await response.text();
  return parseLatestPayload(payload);
};

export const updateStatusCells = (latest, elements) => {
  ["Datetime", "Temperature", "Humidity"].forEach((target) => {
    elements[target].innerText = latest[target];
  });
};

export const initApp = (doc, fetcher = fetch) => {
  const voicetext = doc.getElementById("voicetext");
  const speak = doc.getElementById("speak");
  const speakTatami = doc.getElementById("speak_tatami");
  const hour = doc.getElementById("hour");
  const min = doc.getElementById("min");
  const alarmtext = doc.getElementById("alarmtext");
  const setButton = doc.getElementById("set");
  const youtubeUrl = doc.getElementById("youtube_url");
  const prompt = doc.getElementById("prompt");

  const statusCells = {
    Datetime: doc.getElementById("Datetime"),
    Temperature: doc.getElementById("Temperature"),
    Humidity: doc.getElementById("Humidity"),
  };

  if (!voicetext || !speak || !speakTatami || !hour || !min || !alarmtext || !setButton) {
    return null;
  }

  voicetext.addEventListener("input", () => {
    updateVoiceLinks(voicetext.value, { speak, speakTatami });
  });

  const setAlarm = () => {
    const url = buildAlarmUrl(hour.value, min.value, alarmtext.value);
    return fetcher(url);
  };

  const youtubePlay = (host) => {
    if (!youtubeUrl) {
      return null;
    }
    const { url } = buildYouTubePlayUrl(host, youtubeUrl.value);
    return fetcher(url);
  };

  const gpt = (host) => {
    if (!prompt) {
      return null;
    }
    return fetcher(buildGptUrl(host, prompt.value));
  };

  const fetchLatest = async () => {
    if (!statusCells.Datetime || !statusCells.Temperature || !statusCells.Humidity) {
      return null;
    }
    const latest = await fetchLatestStatus(fetcher);
    updateStatusCells(latest, statusCells);
    return latest;
  };

  return {
    setAlarm,
    youtubePlay,
    gpt,
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
      prompt,
      statusCells,
    },
  };
};

export const _sleep = (sec, cb) => {
  let id = 0;
  const wait = () => {
    if (sec-- <= 0 && typeof cb === "function") {
      cb();
      return;
    }
    if (id > 0) {
      clearTimeout(id);
    }
    id = setTimeout(wait, 1000);
  };
  id = setTimeout(wait, 0);
  return () => clearTimeout(id);
};
