# ha.ze.gs

This is a small web app for home control.
It uses Vue 3 and Vite.
Build output is one file: `dist/index.html`.

## Tech stack
- Vue 3 (Composition API)
- Vite
- vite-plugin-singlefile
- Vitest with jsdom
- JavaScript (no TypeScript)

## Main files
- `index.html`: Vite entry
- `src/main.js`: starts Vue
- `src/App.vue`: UI template
- `src/*.js`: app logic modules
- `src/styles.css`: styles
- `vite.config.js`: Vite config
- `tests/*.test.js`: unit tests

## Install
```bash
npm install
```

## Test
```bash
npm test
```

## Build
```bash
npm run build
```

Output:
- `dist/index.html` (CSS and JS are inlined)

## Migration steps
1. Move old HTML UI from `src/index.html` to `src/App.vue`.
2. Keep existing DOM logic in `src/*.js`.
3. Mount Vue from `src/main.js`.
4. Run build with `vite build`.
5. Keep all old `id` and `data-*` attributes for compatibility.

## Notes
- If you use images/files, inline them if you want one true single HTML file.
- Avoid dynamic imports for single-file output.
- External API URLs are not inlined.

## Deploy
CI should run:
- `npm test`
- `npm run build`

Then deploy `dist/`.
