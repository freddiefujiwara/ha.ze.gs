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
- `src/styles.css`: the original page styles.
- `src/logic.js`: the main browser logic (split from inline script).
- `src/app.js`: wires the DOM and exposes browser globals.
- `build.js`: creates a single-file `dist/index.html`.

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

## Deploy
GitHub Actions runs tests and builds the site, then deploys `dist/` to GitHub Pages.
