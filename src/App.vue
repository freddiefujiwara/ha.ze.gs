<template>
  <div class="layout">
    <header class="header">
      <h1>ha.ze.gs</h1>
      <div class="header-actions">
        <div class="header-buttons">
          <a
            href="#"
            data-api='[["hue","lights","off"],["switchbot-command","-d","C70C0516C0C7","-c","turnOff"],["switchbot-command","-d","ECCC4C8C52C3","-c","turnOff"],["switchbot-ac","-d","02-202307290753-22894539","-a","25,2,1,off"],["switchbot-custom","-d","03-202401251013-58699638","-c","Off"]]'
            data-status-action="control"
            class="btn-pill"
            >Go Out</a
          >
        </div>
      </div>
    </header>

    <div class="card-grid">
      <article class="card">
        <h2>Status</h2>
        <p id="AirCondition">AirCondition</p>
      </article>
      <article class="card">
        <h2>Date</h2>
        <p id="Date">&nbsp;</p>
      </article>
      <article class="card">
        <h2>Temperature</h2>
        <p id="Temperature">&nbsp;</p>
      </article>
      <article class="card">
        <h2>Humidity</h2>
        <p id="Humid">&nbsp;</p>
      </article>
    </div>

    <div class="table-wrap">
    <table class="stack-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Action 1</th>
          <th>Action 2</th>
          <th>Action 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="Living" data-label="Item">Living</td>
          <td data-label="Action 1"><a href="#" data-api='["switchbot-command", "-d", "C70C0516C0C7", "-c", "turnOn"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["switchbot-command", "-d", "C70C0516C0C7", "-c", "turnOff"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Dining" data-label="Item">Dining</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","13,14,15,28,29","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","13,14,15,28,29","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Tatami" data-label="Item">Tatami</td>
          <td data-label="Action 1"><a href="#" data-api='["switchbot-command","-d","ECCC4C8C52C3","-c","turnOn"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["switchbot-command","-d","ECCC4C8C52C3","-c","turnOff"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Downright" data-label="Item">Down right</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","27","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","27","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Downleft" data-label="Item">Down left</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","26","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","26","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Downback" data-label="Item">Down back</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","7","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","7","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Washroom" data-label="Item">Washroom</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","22","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","22","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Bathroom" data-label="Item">Bathroom</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","8,9","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","8,9","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Corridor" data-label="Item">Corridor</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","21,16","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","21,16","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="Restroom" data-label="Item">Restroom</td>
          <td data-label="Action 1"><a href="#" data-api='["hue","lights","10","on"]'>On</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3"><a href="#" data-api='["hue","lights","10","off"]'>Off</a></td>
        </tr>
        <tr>
          <td id="VoiceChange" data-label="Item">Voice Change</td>
          <td data-label="Action 1">
            <a href="#" data-api='["google-home-speaker-wrapper-change-voice","openai"]'>OpenAI</a>
          </td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3">
            <a href="#" data-api='["google-home-speaker-wrapper-change-voice","gtts"]'>GTTS</a>
          </td>
        </tr>
        <tr>
          <td id="AC" data-label="Item">
            <a href="#" data-status-action="control">A/C</a>
          </td>
          <td data-label="Action 1">
            <a
              href="#"
              data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","28,2,1,on"]'
              data-status-action="cool"
              >Cool</a
            >
          </td>
          <td data-label="Action 2">
            <a
              href="#"
              data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","28,5,1,on"]'
              data-status-action="hot"
              >Hot</a
            >
          </td>
          <td data-label="Action 3">
            <a
              href="#"
              data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","25,2,1,off"]'
              data-status-action="off"
              >Off</a
            >
          </td>
        </tr>
        <tr>
          <td id="TatamiAC" data-label="Item">Tatami A/C</td>
          <td data-label="Action 1"><a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Cool"]'>Cool</a></td>
          <td data-label="Action 2"><a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Hot"]'>Hot</a></td>
          <td data-label="Action 3"><a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Off"]'>Off</a></td>
        </tr>
        <tr>
          <td data-label="Item">Tool</td>
          <td data-label="Action 1"><a href="#" data-api='["switchbot-command","-d","D23403D2D43D","-c","press"]'>HeatFloor</a></td>
          <td data-label="Action 2">&nbsp;</td>
          <td data-label="Action 3">
            <a
              href="#"
              data-message-key="car-arrival"
              >CarArrives</a
            >
          </td>
        </tr>
        <tr>
          <td id="Fan" data-label="Item">Fan</td>
          <td data-label="Action 1"><a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","turnOn"]'>On/Off</a></td>
          <td data-label="Action 2"><a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","highSpeed"]'>Turbo</a></td>
          <td data-label="Action 3"><a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","swing"]'>Swing</a></td>
        </tr>
        <tr>
          <td id="NW" data-label="Item">Nest WiFi</td>
          <td data-label="Action 1"><a href="#" data-api='["catt","-d","host:nest","volumeup"]'>+</a></td>
          <td data-label="Action 2"><a href="#" data-api='["catt","-d","host:nest","volumedown"]'>-</a></td>
          <td data-label="Action 3"><a href="#" data-api='["catt","-d","host:nest","stop"]'>Off</a></td>
        </tr>
        <tr>
          <td id="TW" data-label="Item">Tatami WiFi</td>
          <td data-label="Action 1"><a href="#" data-api='["catt","-d","host:tatami","volumeup"]'>+</a></td>
          <td data-label="Action 2"><a href="#" data-api='["catt","-d","host:tatami","volumedown"]'>-</a></td>
          <td data-label="Action 3"><a href="#" data-api='["catt","-d","host:tatami","stop"]'>Off</a></td>
        </tr>
        <tr>
          <td id="CC" data-label="Item">TV</td>
          <td data-label="Action 1"><a href="#" data-api='["catt","-d","host:tv","volumeup"]'>+</a></td>
          <td data-label="Action 2"><a href="#" data-api='["catt","-d","host:tv","volumedown"]'>-</a></td>
          <td data-label="Action 3"><a href="#" data-api='["catt","-d","host:tv","stop"]'>Off</a></td>
        </tr>
        <tr>
          <td id="YouTube" data-label="Item"><a href="#" data-youtube-key="tv" data-youtube-vol="20">YouTube</a></td>
          <td data-label="Action 1"><textarea id="youtube_url"></textarea></td>
          <td data-label="Action 2"><a href="#" data-youtube-key="nest">Nest Wifi</a></td>
          <td data-label="Action 3"><a href="#" data-youtube-key="tatami">Tatami WiFi</a></td>
        </tr>
        <tr>
          <td id="Voice" data-label="Item">Voice</td>
          <td data-label="Action 1"><textarea id="voicetext"></textarea></td>
          <td data-label="Action 2"><a id="speak" href="#">Nest Wifi</a></td>
          <td data-label="Action 3"><a id="speak_tatami" href="#">Tatami WiFi</a></td>
        </tr>
        <tr>
          <td id="Alarm" data-label="Item">Alarm</td>
          <td data-label="Action 1">
            <div style="display: flex; align-items: center; gap: 4px;">
              <select id="hour"></select>
              <span>:</span>
              <select id="min"></select>
            </div>
          </td>
          <td data-label="Action 2"><textarea id="alarmtext"></textarea></td>
          <td data-label="Action 3"><a id="set" href="#">Set</a></td>
        </tr>
      </tbody>
    </table>
    </div>

    <div id="notification-container" aria-live="polite"></div>
  </div>
</template>

<script setup>
</script>
