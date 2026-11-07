<template>
  <div class="layout">
    <header class="header">
      <h1>ha.ze.gs</h1>
      <div class="header-actions">
        <div class="header-buttons">
          <a
            href="#"
            data-api='[["dirigera-command","off","all"],["switchbot-command","-d","C70C0516C0C7","-c","turnOff"],["switchbot-command","-d","ECCC4C8C52C3","-c","turnOff"],["switchbot-ac","-d","02-202307290753-22894539","-a","25,2,1,off"],["switchbot-custom","-d","03-202401251013-58699638","-c","Off"]]'
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
              <a href="#" data-api='["dirigera-command","on","dining"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","dining"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="dining" aria-label="Dining brightness" />
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
          <td id="Down" data-label="Device">Down</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","down"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","down"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="down" aria-label="Down brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Downback" data-label="Device">Down back</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","downback"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","downback"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="downback" aria-label="Down back brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Kitchen" data-label="Device">Kitchen</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","kitchen"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","kitchen"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="kitchen" aria-label="Kitchen brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Kids" data-label="Device">Kids</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","kids"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","kids"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="kids" aria-label="Kids brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Washroom" data-label="Device">Washroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","washroom"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","washroom"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="washroom" aria-label="Washroom brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Bathroom" data-label="Device">Bathroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","bathroom"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","bathroom"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="bathroom" aria-label="Bathroom brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Corridor" data-label="Device">Corridor</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","corridor"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","corridor"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="corridor" aria-label="Corridor brightness" />
            </div>
          </td>
        </tr>
        <tr class="compact">
          <td id="Restroom" data-label="Device">Restroom</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="#" data-api='["dirigera-command","on","restroom"]'>On</a>
              <a href="#" data-api='["dirigera-command","off","restroom"]'>Off</a>
              <input type="range" min="1" max="100" value="100" data-level-target="restroom" aria-label="Restroom brightness" />
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
              <a href="#" data-api='[["switchbot-command","-d","B0E9FEBB35D7","-c","turnOn"],["switchbot-command","-d","B0E9FEBB35D7","-c","setWindSpeed","-p","11"]]'>S</a>
              <a href="#" data-api='[["switchbot-command","-d","B0E9FEBB35D7","-c","turnOn"],["switchbot-command","-d","B0E9FEBB35D7","-c","setWindSpeed","-p","50"]]'>M</a>
              <a href="#" data-api='[["switchbot-command","-d","B0E9FEBB35D7","-c","turnOn"],["switchbot-command","-d","B0E9FEBB35D7","-c","setWindSpeed","-p","100"]]'>L</a>
              <a href="#" data-api='["switchbot-command","-d","B0E9FEBB35D7","-c","turnOff"]'>Off</a>
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
        <tr class="compact">
          <td id="Alarm" data-label="Device">Alarm</td>
          <td data-label="Actions">
            <div class="control-group">
              <a href="https://freddiefujiwara.com/alarm/" target="_blank" rel="noopener" data-external>freddiefujiwara.com/alarm</a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <div class="token-settings">
      <label for="api_token">API Token</label>
      <input id="api_token" type="password" autocomplete="off" placeholder="API token" />
      <a href="#" id="api_token_save">Save</a>
      <span id="api_token_state"></span>
    </div>

    <div id="notification-container" aria-live="polite"></div>
  </div>
</template>

<script setup>
</script>
