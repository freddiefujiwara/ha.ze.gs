# ha.ze.gs

This is a small web page to control home devices and show simple status values.

## What it does
- Shows a control table for lights, air conditioner, speakers, and tools.
- Lets you send voice text to speakers.
- Plays YouTube on a selected device.
- Sends a short prompt to a webhook.
- Sets an alarm time with a message.
- Shows the latest date/time, temperature, and humidity.

## Files
- `src/index.html`: the page layout (table UI).
- `src/styles.css`: the page styles.
- `src/app.js`: wires the DOM and exposes browser globals.
- `src/logic.js`: app glue that re-exports the modules used by `app.js`.
- `src/alarm.js`: alarm URL builder.
- `src/hosts.js`: API base URL + host resolution helpers.
- `src/status.js`: status polling/parsing and status cell updates.
- `src/text.js`: shared text sanitization.
- `src/voice.js`: voice URL builders and link updates.
- `src/youtube.js`: YouTube URL parsing and playback URL builder.
- `src/build-utils.js`: build-time HTML transforms (no-JS link rewriting).
- `build.js`: creates a single-file `dist/index.html` with inlined CSS/JS.

## Development
Install dependencies and run tests:

```bash
npm install
npm test
```

## Build
Create a single HTML file with inlined CSS and JS:

```bash
npm run build
```

The output is written to `dist/index.html`.

### No-JS behavior
During build, links with `data-*` attributes are converted to real `http://a.ze.gs/...` URLs
in `dist/index.html` so text-only/no-JS browsers can use them. When JavaScript runs,
all anchor `href`s are reset to `#` and handled via event listeners.

## Deploy
GitHub Actions runs tests and builds the site, then deploys `dist/` to GitHub Pages.
