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
          <th>Device</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr class="compact">
          <td id="Living" data-label="Device">Living</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["switchbot-command", "-d", "C70C0516C0C7", "-c", "turnOn"]'>On</a>
              <a href="#" data-api='["switchbot-command", "-d", "C70C0516C0C7", "-c", "turnOff"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Dining" data-label="Device">Dining</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","13,14,15,28,29","on"]'>On</a>
              <a href="#" data-api='["hue","lights","13,14,15,28,29","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Tatami" data-label="Device">Tatami</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["switchbot-command","-d","ECCC4C8C52C3","-c","turnOn"]'>On</a>
              <a href="#" data-api='["switchbot-command","-d","ECCC4C8C52C3","-c","turnOff"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Downright" data-label="Device">Down right</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","27","on"]'>On</a>
              <a href="#" data-api='["hue","lights","27","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Downleft" data-label="Device">Down left</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","26","on"]'>On</a>
              <a href="#" data-api='["hue","lights","26","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Downback" data-label="Device">Down back</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","7","on"]'>On</a>
              <a href="#" data-api='["hue","lights","7","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Washroom" data-label="Device">Washroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","22","on"]'>On</a>
              <a href="#" data-api='["hue","lights","22","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Bathroom" data-label="Device">Bathroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","8,9","on"]'>On</a>
              <a href="#" data-api='["hue","lights","8,9","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Corridor" data-label="Device">Corridor</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","21,16","on"]'>On</a>
              <a href="#" data-api='["hue","lights","21,16","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Restroom" data-label="Device">Restroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["hue","lights","10","on"]'>On</a>
              <a href="#" data-api='["hue","lights","10","off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="VoiceChange" data-label="Device">Voice Change</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["google-home-speaker-wrapper-change-voice","openai"]'>OpenAI</a>
              <a href="#" data-api='["google-home-speaker-wrapper-change-voice","gtts"]'>GTTS</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="AC" data-label="Device">A/C</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-status-action="control">Ctrl</a>
              <a
                href="#"
                data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","28,2,1,on"]'
                data-status-action="cool"
                >Cool</a
              >
              <a
                href="#"
                data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","28,5,1,on"]'
                data-status-action="hot"
                >Hot</a
              >
              <a
                href="#"
                data-api='["switchbot-ac","-d","02-202307290753-22894539","-a","25,2,1,off"]'
                data-status-action="off"
                >Off</a
              >
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="TatamiAC" data-label="Device">Tatami A/C</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Cool"]'>Cool</a>
              <a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Hot"]'>Hot</a>
              <a href="#" data-api='["switchbot-custom","-d","03-202401251013-58699638","-c","Off"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td data-label="Device">Tool</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["switchbot-command","-d","D23403D2D43D","-c","press"]'>HeatFloor</a>
              <a
                href="#"
                data-message-key="car-arrival"
                >CarArrives</a
              >
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Fan" data-label="Device">Fan</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","turnOn"]'>On/Off</a>
              <a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","highSpeed"]'>Turbo</a>
              <a href="#" data-api='["switchbot-command","-d","03-202401251013-89002900","-c","swing"]'>Swing</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="NW" data-label="Device">Nest WiFi</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["catt","-d","host:nest","volumeup"]'>+</a>
              <a href="#" data-api='["catt","-d","host:nest","volumedown"]'>-</a>
              <a href="#" data-api='["catt","-d","host:nest","stop"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="TW" data-label="Device">Tatami WiFi</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["catt","-d","host:tatami","volumeup"]'>+</a>
              <a href="#" data-api='["catt","-d","host:tatami","volumedown"]'>-</a>
              <a href="#" data-api='["catt","-d","host:tatami","stop"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="CC" data-label="Device">TV</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["catt","-d","host:tv","volumeup"]'>+</a>
              <a href="#" data-api='["catt","-d","host:tv","volumedown"]'>-</a>
              <a href="#" data-api='["catt","-d","host:tv","stop"]'>Off</a>
            </div>
          </td>
        </tr>
        <tr>
          <td id="YouTube" data-label="Device">YouTube</td>
          <td data-label="Actions">
            <div class="control-group">
              <textarea id="youtube_url" placeholder="YouTube URL"></textarea>
              <a href="#" data-youtube-key="tv" data-youtube-vol="20">TV</a>
              <a href="#" data-youtube-key="nest">Nest Wifi</a>
              <a href="#" data-youtube-key="tatami">Tatami WiFi</a>
            </div>
          </td>
        </tr>
        <tr>
          <td id="Voice" data-label="Device">Voice</td>
          <td data-label="Actions">
            <div class="control-group">
              <textarea id="voicetext" placeholder="Voice text"></textarea>
              <a id="speak" href="#">Nest Wifi</a>
              <a id="speak_tatami" href="#">Tatami WiFi</a>
            </div>
          </td>
        </tr>
        <tr>
          <td id="Alarm" data-label="Device">Alarm</td>
          <td data-label="Actions">
            <div class="control-group">
              <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                <select id="hour"></select>
                <span>:</span>
                <select id="min"></select>
              </div>
              <textarea id="alarmtext" placeholder="Alarm text"></textarea>
              <a id="set" href="#">Set</a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <div id="notification-container" aria-live="polite"></div>
  </div>
</template>

<script setup>
</script>
