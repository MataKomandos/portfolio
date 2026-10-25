// Buduje cala strone do jednego pliku dist/index.html (React, CSS i skrypt sa wewnatrz).
// Uzycie: npm run build   (albo npm run watch, zeby przebudowywac po kazdej zmianie w src/)
import { build } from 'esbuild';
import { cpSync, existsSync, readFileSync, writeFileSync, mkdirSync, watch } from 'node:fs';

const TITLE = 'Mateusz Sobczak Portfolio';
const DESCRIPTION = 'Portfolio Mateusza Sobczaka: student informatyki, Firmware Validation Engineer w SII. Projekty w Javie, Pythonie i SQL.';
// Adres strony po wrzuceniu na hosting, np. 'https://matakomandos.github.io/'. Bez niego LinkedIn i Messenger
// nie pokaza miniaturki (og:image musi byc pelnym adresem).
const SITE_URL = '';
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#08050f"/>' +
  '<path d="M16 4 28 16 16 28 4 16Z" fill="#fcee0a"/><path d="M16 10 22 16 16 22 10 16Z" fill="#08050f"/></svg>'
);
// Licznik odwiedzin GoatCounter (bez ciasteczek). Zaloz darmowe konto na goatcounter.com
// i wpisz tu nazwe licznika, np. 'matsobczak' dla matsobczak.goatcounter.com. Pusty = licznik wylaczony.
const GOATCOUNTER = '';
const ANALYTICS = GOATCOUNTER
  ? `<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
  : '';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const META = [
  `<link rel="icon" href="${FAVICON}">`,
  '<meta property="og:type" content="website">',
  `<meta property="og:title" content="${esc(TITLE)}">`,
  `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
  ...(SITE_URL ? [`<meta property="og:url" content="${SITE_URL}">`, `<meta property="og:image" content="${SITE_URL}og.png">`, '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">'] : []),
  '<meta name="twitter:card" content="summary_large_image">',
].join('\n');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">';

async function run() {
  const result = await build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'warning',
  });
  const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const css = readFileSync('src/styles.css', 'utf8');

  const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#08050f">
<meta name="description" content="${DESCRIPTION}">
<title>${TITLE}</title>
${META}
${FONTS}
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
${ANALYTICS}
</body>
</html>
`;

  // Wersja do publikacji jako artefakt: bez znacznikow html/head/body (dodaje je platforma).
  const artifact = `<title>${TITLE}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${FONTS}
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`;

  mkdirSync('dist', { recursive: true });
  // public/: pliki kopiowane obok strony (CV, zrzuty ekranu projektow, og.png)
  if (existsSync('public')) cpSync('public', 'dist', { recursive: true });
  writeFileSync('dist/index.html', standalone);
  writeFileSync('dist/artifact.html', artifact);
  console.log(`dist/index.html  ${(standalone.length / 1024).toFixed(0)} KB`);
}

await run();
if (process.argv.includes('--watch')) {
  let timer;
  watch('src', { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => run().catch((e) => console.error(e.message)), 80);
  });
  console.log('Obserwuje src/ ...');
}
