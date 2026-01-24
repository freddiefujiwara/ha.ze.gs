export const buildOptions = (length) =>
  Array.from({ length }, (_, index) => {
    const value = String(index).padStart(2, "0");
    return `<option value="${value}">${value}</option>`;
  }).join("");

export const hourOptions = buildOptions(24);
export const minOptions = buildOptions(60);

export const buildAppDocument = ({ extraHtml = "", includeYoutubeLink = true } = {}) => {
  const document = window.document.implementation.createHTMLDocument("test");
  const youtubeLink = includeYoutubeLink ? `<a href="#" data-youtube-host="192.168.1.22">YT</a>` : "";
  document.body.innerHTML = `
    <textarea id="voicetext"></textarea>
    <a id="speak" href="#">Nest Wifi</a>
    <a id="speak_tatami" href="#">Tatami</a>
    <select id="hour">${hourOptions}</select>
    <select id="min">${minOptions}</select>
    <textarea id="alarmtext"></textarea>
    <a id="set" href="#">Set</a>
    <textarea id="youtube_url"></textarea>
    <div id="AirCondition"></div>
    <div id="Date"></div>
    <div id="Temperature"></div>
    <div id="Humid"></div>
    ${youtubeLink}
    ${extraHtml}
  `;
  return document;
};

export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
