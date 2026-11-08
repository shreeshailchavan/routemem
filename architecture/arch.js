// RouteMem architecture: one source for the interactive page (index.html) and the README's static SVGs
// (build.mjs). Geometry is in SVG user units of a 1200 × 660 canvas.

export const W = 1290, H = 660;

export const columns = [
  { x: 24, label: "CLIENT" },
  { x: 220, label: "EDGE" },
  { x: 450, label: "REQUEST PIPELINE" },
  { x: 760, label: "DECIDE" },
  { x: 1050, label: "MODELS" },
];

// kind: pipe (gateway stage), decide, local, cloud, state, ops, client
export const nodes = [
  { id: "client", x: 24, y: 250, w: 156, title: "Client", sub: "OpenAI SDK · curl · /chat", kind: "client",
    what: "Any OpenAI-compatible client. Send model \"routemem-auto\" and RouteMem picks the model; name a model to pin it. Every response carries routemem_metadata: the model that answered, why, cost, GPU seconds and per-stage timings.",
    facts: ["POST /v1/chat/completions (streaming)", "Jobs API for async, retried requests", "Chat UI at /chat, console at /console"] },
  { id: "caddy", x: 220, y: 190, w: 180, title: "Caddy HTTPS", sub: "TLS on a fixed Elastic IP", kind: "pipe",
    what: "Terminates HTTPS in front of two uvicorn workers. A fixed Elastic IP keeps the address stable across stop/start of the dev-mode control plane.",
    facts: ["t4g.xlarge control plane (arm64)", "Security groups: 443 public, SSH from one admin IP, GPU port from the gateway only"] },
  { id: "auth", x: 220, y: 300, w: 180, title: "Auth & limits", sub: "key · RPM · tokens · budget", kind: "pipe",
    what: "Bearer key checked in constant time; its SHA-256 is the owner that scopes caches, memory, jobs and decisions. Per-key rate limit and daily token quota, plus a monthly cloud budget that falls back to a local model when reached.",
    facts: ["RATE_LIMIT_RPM 120 by default", "429 on limit, with the reason", "Budget cap applies to cloud spend only"] },
  { id: "exact", x: 450, y: 40, w: 210, title: "Exact cache", sub: "Redis · hash of prompt + params", kind: "pipe", ms: "≈1 ms",
    what: "SHA-256 over scope, generation parameters, system prompt, context and prompt. A hit returns the stored answer immediately at zero model cost.",
    facts: ["24 h TTL", "Scoped per key by default", "cache_mode=bypass skips both caches (used by benchmarks)"] },
  { id: "semantic", x: 450, y: 118, w: 210, title: "Semantic cache", sub: "Qdrant · cosine ≥ 0.85 + guards", kind: "pipe", ms: "≈65 ms",
    what: "bge-small embedding searched in Qdrant. A hit must also keep the same numbers, negations and ordered key terms, so \"2 + 3\" never returns the answer to \"2 + 4\". A hit is promoted to the exact cache.",
    facts: ["Threshold 0.85", "Filtered by scope, params and age", "The embedding is reused by the profiler"] },
  { id: "compress", x: 450, y: 196, w: 210, title: "Compress", sub: "LLMLingua-2 on long context", kind: "pipe",
    what: "Old history and very long prompts are compressed; the question itself is kept verbatim. Short prompts pass through untouched.",
    facts: ["Measured: −46% tokens, −3.0 F1 (not significant) on HotpotQA", "Only above 1,500 prompt tokens"] },
  { id: "memory", x: 450, y: 274, w: 210, title: "Memory", sub: "SQLite + Zep · ≤ 6 facts", kind: "pipe", ms: "≈1 ms",
    what: "With a session_id, the most relevant earlier turns are recalled (local SQLite always, Zep Cloud if it answers in time) and passed to the model as a data block. A slow Zep is paused for 5 minutes after 2 misses.",
    facts: ["Ranked by similarity, newest turn always kept", "GET / DELETE /v1/memory/{session}", "Was 270–300 ms per request before the timeout and pause"] },
  { id: "profile", x: 450, y: 352, w: 210, title: "Profile", sub: "intent 94.0% · difficulty", kind: "pipe",
    what: "A learned classifier on the query embedding picks the intent (simple, code, reasoning, expert); difficulty comes from rules. Intent selects the task, the default system prompt and the output cap.",
    facts: ["94.0% on held-out prompts vs 61.4% for keyword rules", "Reuses the semantic-cache embedding: no extra model call"] },
  { id: "route", x: 450, y: 430, w: 210, title: "Route", sub: "policy in config/models.yaml", kind: "pipe",
    what: "Explicit model if named; budget fallback if the cap is reached; otherwise task routing. Questions with a checkable final answer go to the agreement cascade.",
    facts: ["simple, code → nemotron-3.5-bolt", "math, knowledge → gpt-oss:20b", "Unknown model names are rejected, never guessed"] },
  { id: "cascade", x: 760, y: 150, w: 210, title: "Agreement cascade", sub: "two local models in parallel", kind: "decide",
    what: "For multiple-choice and numeric questions, both local models answer at once with an explicit final answer. Agreement returns the local answer; disagreement escalates to the cloud. 5% of agreements are re-checked in the background for unbiased labels.",
    facts: ["89.6% vs 90.1% for the cloud model alone", "84% answered locally, 16% escalated", "Agreed answers right 92.6% of the time"] },
  { id: "executor", x: 760, y: 370, w: 210, title: "Executor", sub: "fallbacks · hedging · breaker", kind: "decide",
    what: "Runs one model with its ordered fallback chain and optional hedging. An answer never mixes two models. A GPU connect fails after 3 s and opens a 60 s circuit breaker, so later requests skip the GPU instead of waiting.",
    facts: ["~135 s → ~1.5–2 s per request while the GPU is down", "Empty answers count as failures", "Every failed attempt is listed in fallback_reason"] },
  { id: "local", x: 1050, y: 60, w: 210, title: "Local GPU worker", sub: "g5 A10G · bolt + gpt-oss:20b", kind: "local", ms: "≈2–4 s",
    what: "g5.xlarge (A10G 24 GB) running Ollama with both cascade models resident (~21 GB), models on NVMe. Stops itself when idle; the gateway wakes it on demand.",
    facts: ["vLLM 456.6 vs Ollama 173.5 tok/s at 16 concurrent", "Answers cost GPU time, not API spend", "~$1.01/h only while running"] },
  { id: "cloud", x: 1050, y: 260, w: 210, title: "Cloud models", sub: "Groq qwen3.8-27b · gpt-oss-120b", kind: "cloud",
    what: "Escalation and fallback targets: Groq qwen3.8-27b first, then gpt-oss-120b; Gemini and others by name. Each has its own fallback list and price in the registry.",
    facts: ["Escalation for cascade disagreements", "Fallback when the GPU is down", "Cost reported per response"] },
  { id: "replica", x: 1050, y: 440, w: 210, title: "GPU replica", sub: "another zone when one is full", kind: "local", dashed: true,
    what: "If no GPU type has capacity in the worker's zone, the gateway launches a replica from the worker's image in the first zone that has capacity, serves from it, and terminates it when the primary returns or after an hour unused.",
    facts: ["Types tried in order: g5.xlarge, then g6.xlarge", "Redis lock: one launch across gateway processes", "Least-privilege IAM: launch only from the template"] },
  { id: "redis", x: 24, y: 572, w: 180, title: "Redis", sub: "caches · limits · jobs · log", kind: "state",
    what: "Exact cache, rate-limit and token counters, monthly spend, the durable job queue (Streams with retries and reclaim) and the decision log.", facts: ["Backed up to S3 every 6 h"] },
  { id: "qdrant", x: 222, y: 572, w: 160, title: "Qdrant", sub: "semantic cache", kind: "state",
    what: "Vector store for the semantic cache: prompt, answer, scope, params and age per entry.", facts: ["Filtered by scope and age at lookup"] },
  { id: "store", x: 400, y: 572, w: 180, title: "SQLite + Zep", sub: "per-key memory", kind: "state",
    what: "Session facts in local SQLite, optionally mirrored to a Zep Cloud graph. Namespaced by key and session; deleting a session also clears its cached answers.", facts: ["Stateless without session_id"] },
  { id: "learn", x: 598, y: 572, w: 210, title: "Learning loop", sub: "decisions · audits · feedback", kind: "ops",
    what: "Every decision is logged without prompt text. Cascade outcomes, 5% audits and client feedback become labels; a retrained escalator is promoted only if its out-of-fold gain has a 95% CI above zero.", facts: ["POST /v1/feedback", "Offline gate in CI, live gate before deploys (85–87%)"] },
  { id: "waker", x: 826, y: 572, w: 200, title: "GPU waker", sub: "start · type fallback · zones", kind: "ops",
    what: "Starts the stopped GPU worker on the first failed local attempt, tries instance types in preference order, then launches a replica in another zone. Checks every 30 s which worker is serving.", facts: ["One attempt per cooldown", "Breaker resets as soon as a worker is up"] },
  { id: "ops", x: 1044, y: 572, w: 216, title: "Ops", sub: "idle stop · backups · OTel", kind: "ops",
    what: "CloudWatch alarms stop idle instances, state is archived to S3, Prometheus and OpenTelemetry expose per-stage latency, and Terraform describes the deployment.", facts: ["Dev mode: up / down / status / cost / deploy", "Runs on free credits"] },
];

// Edges: [id, from, to, label?, style?]. Pipeline column edges run vertically.
export const edges = [
  ["e-client-caddy", "client", "caddy"],
  ["e-caddy-auth", "caddy", "auth", null, "down"],
  ["e-auth-exact", "auth", "exact"],
  ["e-exact-semantic", "exact", "semantic", "miss", "down"],
  ["e-semantic-compress", "semantic", "compress", "miss", "down"],
  ["e-compress-memory", "compress", "memory", null, "down"],
  ["e-memory-profile", "memory", "profile", null, "down"],
  ["e-profile-route", "profile", "route", null, "down"],
  ["e-route-cascade", "route", "cascade", "checkable answer"],
  ["e-route-executor", "route", "executor", "everything else"],
  ["e-cascade-local", "cascade", "local", "both answer"],
  ["e-cascade-cloud", "cascade", "cloud", "disagree", "dashed"],
  ["e-executor-local", "executor", "local"],
  ["e-executor-cloud", "executor", "cloud", "fallback", "dashed"],
  ["e-local-replica", "local", "replica", null, "dashed-side"],
];

// Scenarios: each step lights nodes/edges and explains what happens. `back` = answer returned to the client.
export const scenarios = [
  { id: "exact", name: "Exact cache hit", total: "≈1 ms · $0", steps: [
    { on: ["client", "e-client-caddy", "caddy"], text: "Request arrives over HTTPS." },
    { on: ["e-caddy-auth", "auth"], text: "Key checked; rate limit and daily tokens counted." },
    { on: ["e-auth-exact", "exact"], text: "Same prompt and parameters seen in the last 24 h: hit.", tone: "ok" },
    { on: ["client"], back: "exact", text: "Stored answer returned in about a millisecond. No model runs.", tone: "ok" } ] },
  { id: "semantic", name: "Semantic cache hit", total: "≈65 ms · $0", steps: [
    { on: ["client", "e-client-caddy", "caddy", "e-caddy-auth", "auth"], text: "Request authenticated." },
    { on: ["e-auth-exact", "exact"], text: "Exact cache: miss (the wording differs).", tone: "miss" },
    { on: ["e-exact-semantic", "semantic"], text: "Embedding is 0.93 similar to a cached question with the same numbers and key terms: hit.", tone: "ok" },
    { on: ["client"], back: "semantic", text: "Cached answer returned and promoted to the exact cache.", tone: "ok" } ] },
  { id: "agree", name: "Cascade agrees", total: "≈2–4 s · $0 cloud", steps: [
    { on: ["client", "e-client-caddy", "caddy", "e-caddy-auth", "auth", "e-auth-exact", "exact"], text: "\"Priya buys 6 muffins at $3.50 and 8 cookies at $1.25. Total?\" Exact cache: miss.", tone: "miss" },
    { on: ["e-exact-semantic", "semantic", "e-semantic-compress", "compress", "e-compress-memory", "memory"], text: "Semantic cache: miss. Short prompt, no compression. Session memory recalled in ~1 ms." },
    { on: ["e-memory-profile", "profile", "e-profile-route", "route"], text: "Intent: complex reasoning → task math. It has numbers, so the answer is checkable." },
    { on: ["e-route-cascade", "cascade", "e-cascade-local", "local"], text: "Both local models answer in parallel: bolt says 31, gpt-oss says 31." },
    { on: ["cascade"], text: "Explicit answers agree. 1 in 20 agreements is re-checked by the cloud in the background.", tone: "ok" },
    { on: ["client"], back: "cascade", text: "Verified local answer returned: GPU time only, no API spend.", tone: "ok" } ] },
  { id: "disagree", name: "Cascade disagrees", total: "≈4–7 s · cents", steps: [
    { on: ["client", "e-client-caddy", "caddy", "e-caddy-auth", "auth", "e-auth-exact", "exact", "e-exact-semantic", "semantic"], text: "Multiple-choice question; both caches miss.", tone: "miss" },
    { on: ["e-semantic-compress", "compress", "e-compress-memory", "memory", "e-memory-profile", "profile", "e-profile-route", "route"], text: "Profiled as knowledge; options A–J make it checkable." },
    { on: ["e-route-cascade", "cascade", "e-cascade-local", "local"], text: "bolt answers C, gpt-oss answers B.", tone: "warn" },
    { on: ["e-cascade-cloud", "cloud"], text: "Disagreement: escalate to Groq qwen3.8-27b (then gpt-oss-120b if it fails).", tone: "warn" },
    { on: ["client"], back: "cloud", text: "Cloud answer returned; usage and cost cover every call the cascade made." } ] },
  { id: "gpudown", name: "GPU is stopped", total: "≈1.5–2 s", steps: [
    { on: ["client", "e-client-caddy", "caddy", "e-caddy-auth", "auth", "e-auth-exact", "exact", "e-exact-semantic", "semantic", "e-semantic-compress", "compress", "e-compress-memory", "memory", "e-memory-profile", "profile", "e-profile-route", "route"], text: "A coding question routes to the local model bolt." },
    { on: ["e-route-executor", "executor", "e-executor-local", "local"], text: "The GPU worker is stopped (idle alarm). Connect fails after 3 s, not 180 s.", tone: "bad" },
    { on: ["executor", "waker"], text: "Circuit breaker opens for 60 s; the GPU waker starts the worker in the background.", tone: "warn" },
    { on: ["e-executor-cloud", "cloud"], text: "Next in the fallback chain: Groq gpt-oss-20b answers.", tone: "warn" },
    { on: ["client"], back: "cloud", text: "Answered in ~1.5–2 s (was ~135 s). Traffic returns to the GPU once it is warm.", tone: "ok" } ] },
  { id: "zonefull", name: "GPU zone is full", total: "minutes, in background", steps: [
    { on: ["waker", "local"], text: "Waker starts the worker as g5.xlarge: InsufficientInstanceCapacity.", tone: "bad" },
    { on: ["waker", "local"], text: "Tries g6.xlarge in the same zone: no capacity either.", tone: "bad" },
    { on: ["waker", "e-local-replica", "replica"], text: "Launches a replica from the worker's image in the next zone that has capacity (Redis lock: only one).", tone: "warn" },
    { on: ["replica", "executor"], text: "Every 30 s the gateway checks which worker is up and points local traffic at the replica.", tone: "ok" },
    { on: ["replica"], text: "When the primary is back, or after an hour unused, the replica is terminated." } ] },
];

export const KIND_DOT = { client: "muted", pipe: "muted", decide: "blue", local: "green", cloud: "amber", state: "muted", ops: "muted" };

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
export const NODE_H = 58;

export function edgePath([, from, to, , style]) {
  const a = byId[from], b = byId[to];
  if (style === "down") {
    const x = a.x + a.w / 2;
    return `M${x},${a.y + NODE_H} L${x},${b.y}`;
  }
  if (style === "dashed-side") {
    const x = a.x + a.w, y1 = a.y + NODE_H / 2, y2 = b.y + NODE_H / 2;
    return `M${x},${y1} C${x + 26},${y1 + 60} ${x + 26},${y2 - 60} ${x},${y2}`;
  }
  const x1 = a.x + a.w, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
  const dx = Math.max(40, (x2 - x1) / 2);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

export function labelPos(e) {
  const [, from, to, , style] = e;
  const a = byId[from], b = byId[to];
  if (style === "down") return [a.x + a.w / 2 + 8, (a.y + NODE_H + b.y) / 2 + 4, "start"];
  const x1 = a.x + a.w, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
  // Point at t = 0.5 of the cubic edgePath draws (control points share y with their ends).
  return [(x1 + x2) / 2, (y1 + y2) / 2 + 4, "middle"];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// p: palette (colours or CSS var() strings). interactive adds ids/classes for the page.
export function renderSVG(p, { interactive = false, fontCss = "", font = "Geist, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif", mono = "'Geist Mono', 'SF Mono', Menlo, Consolas, monospace" } = {}) {
  const dot = { muted: p.dotMuted, blue: p.blue, green: p.green, amber: p.amber };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${font}" role="img" aria-label="RouteMem architecture">`;
  s += `<defs>${fontCss ? `<style>${fontCss}</style>` : ""}<pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.1" fill="${p.grid}"/></pattern>`;
  s += `<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" stroke="${p.edge}" stroke-width="1.6"/></marker>`;
  if (interactive) s += `<marker id="arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" stroke="${p.active}" stroke-width="1.8"/></marker>`;
  s += `</defs>`;
  s += `<rect width="${W}" height="${H}" fill="${p.bg}"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`;
  for (const c of columns) s += `<text x="${c.x}" y="24" font-family="${mono}" font-size="10.5" letter-spacing="1.2" fill="${p.muted}">${c.label}</text>`;
  // Gateway boundary and the state/ops band
  s += `<rect x="206" y="10" width="784" height="502" rx="14" fill="none" stroke="${p.frame}" stroke-dasharray="4 5"/>`;
  s += `<text x="222" y="503" font-family="${mono}" font-size="10.5" letter-spacing="1.2" fill="${p.muted}">GATEWAY · FastAPI · t4g.xlarge</text>`;
  s += `<text x="30" y="560" font-family="${mono}" font-size="10.5" letter-spacing="1.2" fill="${p.muted}">SHARED STATE &amp; OPERATIONS</text>`;
  for (const e of edges) {
    const [id, , , label, style] = e;
    const dashed = style === "dashed" || style === "dashed-side";
    s += `<path ${interactive ? `id="${id}" class="edge"` : ""} d="${edgePath(e)}" fill="none" stroke="${p.edge}" stroke-width="1.4"${dashed ? ' stroke-dasharray="5 5"' : ""} marker-end="url(#arrow)"/>`;
    if (label) {
      const [lx, ly, anchor] = labelPos(e);
      s += `<text ${interactive ? `data-for="${id}" class="elabel"` : ""} x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="${mono}" font-size="10" fill="${p.muted}" stroke="${p.halo}" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${esc(label)}</text>`;
    }
  }
  for (const n of nodes) {
    const tag = interactive ? `id="n-${n.id}" class="node" tabindex="0" role="button" aria-label="${esc(n.title)}"` : "";
    s += `<g ${tag}>`;
    s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${NODE_H}" rx="12" fill="${p.node}" stroke="${n.kind === "decide" ? p.blueStroke : p.stroke}" stroke-width="1"${n.dashed ? ' stroke-dasharray="5 4"' : ""}/>`;
    s += `<circle cx="${n.x + 16}" cy="${n.y + 21}" r="3.5" fill="${dot[KIND_DOT[n.kind]]}"/>`;
    s += `<text x="${n.x + 27}" y="${n.y + 25}" font-size="13.5" font-weight="600" letter-spacing="-0.15" fill="${p.text}">${esc(n.title)}</text>`;
    if (n.ms) s += `<text x="${n.x + n.w - 12}" y="${n.y + 25}" text-anchor="end" font-family="${mono}" font-size="10" fill="${p.muted}">${esc(n.ms)}</text>`;
    s += `<text x="${n.x + 16}" y="${n.y + 44}" font-size="11.2" fill="${p.muted}">${esc(n.sub)}</text>`;
    s += `</g>`;
  }
  // Legend
  const lg = [["green", "local GPU"], ["amber", "cloud"], ["blue", "verification"]];
  let lx = 760;
  s += `<g font-size="11" fill="${p.muted}">`;
  for (const [c, t] of lg) { s += `<circle cx="${lx}" cy="531" r="3.5" fill="${dot[c]}"/><text x="${lx + 9}" y="535">${t}</text>`; lx += 92; }
  s += `<path d="M${lx + 4},531 l26,0" stroke="${p.edge}" stroke-dasharray="5 5"/><text x="${lx + 36}" y="535">conditional</text></g>`;
  return s + `</svg>`;
}

// Geist design-system greys (Vercel's open design tokens); RouteMem uses its own mark, not Vercel's logo.
// RouteMem palette: cool near-black / off-white greys with the app's violet as the accent.
export const PALETTES = {
  dark: { bg: "#0b0b0f", halo: "#0b0b0f", grid: "#1d1d26", node: "#111116", stroke: "#26262f", frame: "#22222b", text: "#ededf2", muted: "#9d9dab",
          edge: "#45455a", dotMuted: "#7a7a8c", blue: "#a78bfa", blueStroke: "#5b3fb8", green: "#5fd08a", amber: "#ffb224", active: "#c4b5fd" },
  light: { bg: "#fbfbfd", halo: "#fbfbfd", grid: "#e4e4ee", node: "#ffffff", stroke: "#e3e3ec", frame: "#e6e6ef", text: "#15151c", muted: "#62627a",
           edge: "#c2c2d2", dotMuted: "#a3a3b8", blue: "#7c3aed", blueStroke: "#c4b5fd", green: "#2f8f4e", amber: "#c26a00", active: "#6d28d9" },
};

// RouteMem's mark: a route between two nodes (24 × 24 box).
export const MARK = `<path d="M4 18c4 0 4-12 8-12s4 12 8 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="4" cy="18" r="2.2" fill="currentColor"/><circle cx="20" cy="18" r="2.2" fill="currentColor"/>`;
