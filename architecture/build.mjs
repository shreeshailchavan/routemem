// Writes the README's static images from arch.js: docs/media/architecture-{dark,light}.svg and banner-{dark,light}.svg.
// GitHub shows README images through <img>, which cannot load web fonts, so Geist and Geist Mono (SIL OFL 1.1,
// licence in docs/media/fonts/) are embedded in each SVG.
// Run: node architecture/build.mjs   (fonts from the `geist` npm package: GEIST_DIR=…/node_modules/geist)
import fs from "node:fs";
import { renderSVG, PALETTES, MARK } from "./arch.js";

const out = new URL("../docs/media/", import.meta.url);
const dir = process.env.GEIST_DIR || new URL("../../fonts/node_modules/geist", import.meta.url).pathname;
const face = (family, file, weight) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${fs.readFileSync(`${dir}/dist/fonts/${file}`).toString("base64")}) format('woff2');}`;
const fontCss = [
  face("Geist", "geist-sans/Geist-Regular.woff2", 400),
  face("Geist", "geist-sans/Geist-SemiBold.woff2", 600),
  face("Geist", "geist-sans/Geist-Bold.woff2", 700),
  face("Geist Mono", "geist-mono/GeistMono-Regular.woff2", 400),
].join("");
fs.mkdirSync(new URL("fonts/", out), { recursive: true });
fs.copyFileSync(`${dir}/LICENSE.TXT`, new URL("fonts/Geist-OFL-LICENSE.txt", out));

for (const [name, p] of Object.entries(PALETTES)) {
  fs.writeFileSync(new URL(`architecture-${name}.svg`, out), renderSVG(p, { fontCss }));
  fs.writeFileSync(new URL(`banner-${name}.svg`, out), banner(p, name));
}

function banner(p, name) {
  const W = 1280, H = 380, dark = name === "dark";
  const mono = "'Geist Mono', monospace";
  // Vercel-style hero: square grid fading out from the centre, a soft glow behind the mark, tight bold type.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Geist, sans-serif" role="img" aria-label="RouteMem: the verified, cost-aware LLM gateway">
<defs>
  <style>${fontCss}</style>
  <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.3" fill="${p.grid}"/></pattern>
  <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
  <radialGradient id="fade" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="${p.bg}" stop-opacity="0"/><stop offset=".85" stop-color="${p.bg}"/></radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#8b5cf6" stop-opacity="${dark ? 0.42 : 0.22}"/><stop offset="1" stop-color="${p.bg}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${p.bg}"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#fade)"/>
<ellipse cx="640" cy="110" rx="300" ry="150" fill="url(#glow)"/>
<rect x="604" y="64" width="72" height="72" rx="20" fill="url(#tile)"/>
<g transform="translate(616 76) scale(2)" color="#ffffff">${MARK}</g>
<text x="640" y="226" text-anchor="middle" font-size="66" font-weight="650" letter-spacing="-2.2" fill="${p.text}">RouteMem</text>
<text x="640" y="270" text-anchor="middle" font-size="22" font-weight="400" letter-spacing="-0.3" fill="${p.muted}">The verified, cost-aware LLM gateway</text>
<g font-family="${mono}" font-size="13" fill="${p.muted}">
  <rect x="404" y="302" width="472" height="34" rx="17" fill="${p.node}" stroke="${dark ? "#3b2a73" : "#d9ccfb"}"/>
  <text x="640" y="324" text-anchor="middle" fill="${p.text}">model: "routemem-auto"<tspan fill="${p.muted}">  ·  OpenAI-compatible</tspan></text>
</g>
</svg>`;
}
console.log("wrote", fs.readdirSync(out).filter((f) => f.endsWith(".svg")).map((f) => `${f} ${Math.round(fs.statSync(new URL(f, out)).size / 1024)} KB`));
