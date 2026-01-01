import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { apiUrl, buildCarArrivalArgs, buildStatusUrl, replaceHostTokens } from "./src/logic.js";

const rootDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(rootDir, "src");
const distDir = join(rootDir, "dist");

const stripExports = (code) => code.replace(/\bexport\s+(const|function|class)\s+/g, "$1 ");

const stripAppImport = (code) =>
  code.replace(/\s*import\s+\{[^}]*\}\s+from\s+"\.\/logic\.js";\s*/g, "");

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

const parseDataAttribute = (attrs, name) => {
  const match = attrs.match(new RegExp(`${name}=(["'])(.*?)\\1`, "i"));
  return match ? match[2] : null;
};

const rewriteLinksForNoJs = (html) =>
  html.replace(/<a([^>]*?)>/gi, (tag, attrs) => {
    const hrefMatch = attrs.match(/\shref=(["'])(.*?)\1/i);
    if (!hrefMatch) {
      return tag;
    }

    const dataApi = parseDataAttribute(attrs, "data-api");
    const dataFetch = parseDataAttribute(attrs, "data-fetch");
    const dataStatusAction = parseDataAttribute(attrs, "data-status-action");
    const dataMessageKey = parseDataAttribute(attrs, "data-message-key");

    let href = null;

    if (dataApi) {
      try {
        const args = replaceHostTokens(JSON.parse(dataApi));
        href = apiUrl(args);
      } catch (error) {
        href = null;
      }
    } else if (dataMessageKey === "car-arrival") {
      href = apiUrl(buildCarArrivalArgs());
    } else if (dataStatusAction) {
      href = buildStatusUrl({ s: "status", t: dataStatusAction });
    } else if (dataFetch) {
      href = dataFetch;
    }

    if (!href || !href.startsWith("http://a.ze.gs/")) {
      return tag;
    }

    return tag.replace(hrefMatch[0], ` href="${href}"`);
  });

const build = async () => {
  const [html, css, logic, app] = await Promise.all([
    readFile(join(srcDir, "index.html"), "utf8"),
    readFile(join(srcDir, "styles.css"), "utf8"),
    readFile(join(srcDir, "logic.js"), "utf8"),
    readFile(join(srcDir, "app.js"), "utf8"),
  ]);

  const logicScript = stripExports(logic).trim();
  const appScript = stripExports(stripAppImport(app)).trim();
  const bundle = `${logicScript}\n\n${appScript}`;
  const noJsHtml = rewriteLinksForNoJs(html);
  const inlined = inlineAssets(noJsHtml, { css: css.trim(), script: bundle });

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await writeFile(join(distDir, "index.html"), inlined);
};

build();
