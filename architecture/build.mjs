// Writes the README's static images from arch.js: docs/media/architecture-{dark,light}.svg and banner-{dark,light}.svg.
// Run: node architecture/build.mjs
import fs from "node:fs";
import { renderSVG, PALETTES } from "./arch.js";

const out = new URL("../docs/media/", import.meta.url);
for (const [name, p] of Object.entries(PALETTES)) {
  fs.writeFileSync(new URL(`architecture-${name}.svg`, out), renderSVG(p));
  fs.writeFileSync(new URL(`banner-${name}.svg`, out), banner(p, name));
}

function banner(p, name) {
  const W = 1280, H = 360, dark = name === "dark";
  const glowA = dark ? "#3291ff" : "#0070f3", glowB = dark ? "#2bd576" : "#0f9d58";
  const font = "Geist, Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
  const mono = "'Geist Mono', 'SF Mono', Menlo, Consolas, monospace";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${font}" role="img" aria-label="RouteMem: the verified, cost-aware LLM gateway">
<defs>
  <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${p.grid}" stroke-width="1"/></pattern>
  <radialGradient id="fade" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${p.bg}" stop-opacity="0"/><stop offset="1" stop-color="${p.bg}"/></radialGradient>
  <linearGradient id="tri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${glowA}"/><stop offset="1" stop-color="${glowB}"/></linearGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="${p.bg}"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#fade)"/>
<ellipse cx="640" cy="120" rx="170" ry="60" fill="url(#tri)" opacity="${dark ? 0.35 : 0.18}" filter="url(#blur)"/>
<path d="M640 58 L686 140 L594 140 Z" fill="${p.text}"/>
<text x="640" y="218" text-anchor="middle" font-size="64" font-weight="700" letter-spacing="-3" fill="${p.text}">RouteMem</text>
<text x="640" y="262" text-anchor="middle" font-size="22" fill="${p.muted}" letter-spacing="-0.3">The verified, cost-aware LLM gateway</text>
<text x="640" y="312" text-anchor="middle" font-family="${mono}" font-size="14" fill="${p.muted}" letter-spacing="0.5">OpenAI-compatible  ·  local-first routing  ·  agreement cascade  ·  caches  ·  memory</text>
</svg>`;
}
console.log("wrote", fs.readdirSync(out).filter((f) => f.endsWith(".svg")));
