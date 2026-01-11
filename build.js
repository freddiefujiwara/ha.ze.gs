import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyHtmlTransforms, rewriteLinksForNoJs } from "./src/build-utils.js";

const rootDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(rootDir, "src");
const distDir = join(rootDir, "dist");

const stripExports = (code) =>
  code
    .replace(/\bexport\s+(const|function|class)\s+/g, "$1 ")
    .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, "");
const stripImports = (code) => code.replace(/\s*import\s+[^;]+;\s*/g, "");

const inlineAssets = (html, { css, script }) => {
  let output = html.replace(
    /<link\s+rel="stylesheet"\s+href="\.\/styles\.css"\s*\/>/i,
    `<style>${css}</style>`,
  );

  output = output.replace(
    /<script\s+type="module"\s+src="\.\/app\.js"\s*><\/script>/i,
    `<script>${script}</script>`,
  );

  return output;
};

const build = async () => {
  const [html, css, text, constants, hosts, notify, alarm, status, voice, youtube, logic, app] = await Promise.all([
    readFile(join(srcDir, "index.html"), "utf8"),
    readFile(join(srcDir, "styles.css"), "utf8"),
    readFile(join(srcDir, "text.js"), "utf8"),
    readFile(join(srcDir, "constants.js"), "utf8"),
    readFile(join(srcDir, "hosts.js"), "utf8"),
    readFile(join(srcDir, "notify.js"), "utf8"),
    readFile(join(srcDir, "alarm.js"), "utf8"),
    readFile(join(srcDir, "status.js"), "utf8"),
    readFile(join(srcDir, "voice.js"), "utf8"),
    readFile(join(srcDir, "youtube.js"), "utf8"),
    readFile(join(srcDir, "logic.js"), "utf8"),
    readFile(join(srcDir, "app.js"), "utf8"),
  ]);

  const modules = [text, constants, hosts, notify, alarm, status, voice, youtube, logic, app];
  const bundle = modules.map((code) => stripExports(stripImports(code)).trim()).join("\n\n");
  const noJsHtml = applyHtmlTransforms(html, [rewriteLinksForNoJs]);
  const inlined = inlineAssets(noJsHtml, { css: css.trim(), script: bundle });

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await writeFile(join(distDir, "index.html"), inlined);
};

export { build as main };

build();
