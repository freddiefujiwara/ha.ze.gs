# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the static app: `index.html`, `styles.css`, and ES module files (`app.js`, `logic.js`, and feature helpers like `status.js`, `voice.js`).
- `tests/` contains Vitest unit tests named `*.test.js`, generally mirroring the modules in `src/`.
- `build.js` assembles a single-file deployable page by inlining CSS/JS into `dist/index.html`.
- `.github/workflows/` defines CI and deploy steps.

## Build, Test, and Development Commands
- `npm test`: runs Vitest in CI mode with coverage enabled (see `vitest.config.js`).
- `npm run build`: generates `dist/index.html` by inlining assets and applying no-JS link transforms.
- There is no dev server; open `src/index.html` directly for quick local checks.

## Coding Style & Naming Conventions
- ES modules only (`"type": "module"`); use `import`/`export` and keep modules small and focused.
- Follow existing formatting: 2-space indentation, semicolons, and double-quoted strings.
- File naming is lower-case with hyphens where needed (`build-utils.js`, `youtube.js`).

## Testing Guidelines
- Framework: Vitest with `jsdom` environment.
- Coverage is enforced at 100% for lines, branches, statements, and functions.
- New behavior should include or update `tests/*.test.js` with descriptive test names.

## Commit & Pull Request Guidelines
- Commit subjects are short and imperative; both conventional prefixes (`feat:`, `refactor:`) and plain summaries are used—match the existing tone.
- PRs should include a concise description, test results (`npm test`), and screenshots for UI changes.
- Ensure `npm run build` succeeds before merging; CI also builds and deploys `dist/` to GitHub Pages.
