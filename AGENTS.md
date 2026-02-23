# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the Vue app: `App.vue`, `styles.css`, and ES module files (`app.js`, `logic.js`, and feature helpers like `status.js`, `voice.js`).
- `tests/` contains Vitest unit tests named `*.test.js`, generally mirroring the modules in `src/`.
- `index.html` (root) is the entry point for Vite.
- `.github/workflows/` defines CI and deploy steps.

## Build, Test, and Development Commands
- `npm run dev`: starts the Vite development server.
- `npm test`: runs Vitest in CI mode with coverage enabled (see `vitest.config.js`).
- `npm run build`: generates a single-file `dist/index.html` using Vite and `vite-plugin-singlefile`.

## Coding Style & Naming Conventions
- ES modules only (`"type": "module"`); use `import`/`export` and keep modules small and focused.
- Follow existing formatting: 2-space indentation, semicolons, and double-quoted strings.
- File naming is lower-case with hyphens where needed (`constants.js`, `youtube.js`).

## Testing Guidelines
- Framework: Vitest with `jsdom` environment.
- Coverage is enforced at 100% for lines, branches, statements, and functions.
- New behavior should include or update `tests/*.test.js` with descriptive test names.

## Commit & Pull Request Guidelines
- Commit subjects are short and imperative; both conventional prefixes (`feat:`, `refactor:`) and plain summaries are used—match the existing tone.
- PRs should include a concise description, test results (`npm test`), and screenshots for UI changes.
- Ensure `npm run build` succeeds before merging; CI also builds and deploys `dist/` to GitHub Pages.
