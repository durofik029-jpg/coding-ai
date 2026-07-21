#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/downloads/coding-ai

# Backup dulu
cp -r src/views src/views_backup_$(date +%s) 2>/dev/null || true

cat > src/views/layout.ts << 'ENDOFLAYOUT'
export function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · Coding AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0a;
    --panel: #0d0d0d;
    --card: #111;
    --border: #00ff411a;
    --neon: #00ff41;
    --neon-dim: #009933;
    --text: #c0c0c0;
    --muted: #666;
    --green: #00ff41;
    --red: #ff3333;
    --amber: #ffb300;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Fira Code', monospace;
    line-height: 1.5;
    min-height: 100vh;
    position: relative;
  }
  #matrix-canvas {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: -1; opacity: 0.07; pointer-events: none;
  }
  h1, h2, h3, .btn, .badge, .label, code, pre {
    font-family: 'Fira Code', monospace;
  }
  a { color: var(--neon); text-decoration: none; }
  a:hover { text-shadow: 0 0 5px var(--neon); }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; }
  header.top {
    border-bottom: 1px solid var(--border);
    padding: 18px 0;
    backdrop-filter: blur(4px);
    background: rgba(10,10,10,0.8);
  }
  header.top .wrap { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: 1px; color: var(--neon); }
  .brand .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 8px var(--neon); }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: var(--neon); border: 1px solid var(--neon);
    padding: 11px 18px; border-radius: 4px; font-weight: 600; font-size: 14px;
    cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;
    transition: all 0.2s;
  }
  .btn:hover { background: var(--neon); color: #000; box-shadow: 0 0 12px var(--neon); }
  .btn.ghost {
    border-color: var(--muted); color: var(--muted);
  }
  .btn.ghost:hover { border-color: var(--neon); color: var(--neon); background: transparent; box-shadow: none; }
  .btn.danger { border-color: var(--red); color: var(--red); }
  .btn.danger:hover { background: var(--red); color: #000; }
  .btn:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid var(--neon); outline-offset: 2px; }

  .terminal {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(0,255,0,0.05);
  }
  .terminal .bar {
    display: flex; gap: 7px; padding: 10px 14px; border-bottom: 1px solid var(--border);
    background: #050505;
  }
  .terminal .bar span { width: 10px; height: 10px; border-radius: 50%; background: #333; }
  .terminal .body { padding: 18px 20px; font-size: 13.5px; color: #a0ffa0; }
  .terminal .body .muted-line { color: var(--muted); }
  .terminal .body .prompt { color: var(--neon); }
  .cursor { display: inline-block; width: 8px; height: 15px; background: var(--neon); animation: blink 1s steps(1) infinite; vertical-align: -2px; }
  @keyframes blink { 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }

  .label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--neon); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 20px; box-shadow: 0 0 8px rgba(0,255,0,0.03); }
  .grid { display: grid; gap: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--border); color: var(--text); }
  th { color: var(--neon); font-weight: 500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; border: 1px solid var(--border); color: var(--muted); }
  .badge.active { color: var(--neon); border-color: var(--neon); }
  .badge.revoked { color: var(--red); border-color: var(--red); }
  footer { color: var(--muted); font-size: 12.5px; padding: 40px 0; text-align: center; border-top: 1px solid var(--border); margin-top: 60px; }
  input[type=text], textarea {
    background: var(--panel); border: 1px solid var(--border); color: var(--neon);
    padding: 10px 12px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 14px;
    outline: none;
  }
  input[type=text]:focus, textarea:focus { border-color: var(--neon); box-shadow: 0 0 6px var(--neon); }

  .shield-badge {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--border);
    padding: 6px 10px; border-radius: 20px; font-family: 'Fira Code', monospace;
  }
  .shield-badge svg { flex-shrink: 0; }

  /* ---------- Layout chat AI ---------- */
  .chat-shell { display: flex; height: 100vh; height: 100dvh; overflow: hidden; }

  .sidebar {
    width: 268px; flex-shrink: 0; background: var(--panel); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 14px; gap: 14px;
    transition: transform 0.2s ease; z-index: 10;
  }
  .sidebar-top { display: flex; align-items: center; justify-content: space-between; }
  .new-chat-btn {
    display: flex; align-items: center; gap: 8px; width: 100%;
    background: transparent; color: var(--neon); border: 1px solid var(--neon); border-radius: 4px;
    padding: 11px 12px; font-weight: 600; font-size: 13.5px; cursor: pointer; font-family: 'Fira Code', monospace;
    text-transform: uppercase;
  }
  .new-chat-btn:hover { background: var(--neon); color: #000; box-shadow: 0 0 10px var(--neon); }
  .quick-cats { display: flex; flex-direction: column; gap: 6px; }
  .quick-cat {
    display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 4px;
    color: var(--text); font-size: 13px; cursor: pointer; border: 1px solid transparent;
    background: transparent;
  }
  .quick-cat:hover { background: var(--card); border-color: var(--neon); color: var(--neon); }
  .sidebar-section-label { font-size: 11px; color: var(--neon); text-transform: uppercase; letter-spacing: 1px; margin: 6px 0 2px; font-family: 'Fira Code', monospace; }
  .conv-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; margin: 0 -6px; padding: 0 6px; }
  .conv-item {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 9px 10px; border-radius: 4px; cursor: pointer; font-size: 13.5px;
    color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    border: 1px solid transparent;
  }
  .conv-item:hover { background: var(--card); border-color: var(--border); }
  .conv-item.active { background: var(--card); border-color: var(--neon); color: var(--neon); }
  .conv-item .del-btn { opacity: 0; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; flex-shrink: 0; }
  .conv-item:hover .del-btn { opacity: 1; }
  .sidebar-footer { border-top: 1px solid var(--border); padding-top: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--muted); }
  .sidebar-footer a { color: var(--muted); }
  .sidebar-footer a:hover { color: var(--neon); }

  .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .chat-topbar { display: none; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .menu-toggle { background: none; border: 1px solid var(--border); border-radius: 4px; color: var(--text); padding: 6px 10px; cursor: pointer; }

  .messages { flex: 1; overflow-y: auto; padding: 24px 16px 8px; }
  .messages-inner { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
  .empty-state { max-width: 640px; margin: 10vh auto 0; text-align: center; color: var(--muted); }
  .empty-state h2 { color: var(--neon); font-size: 22px; margin-bottom: 8px; text-shadow: 0 0 5px var(--neon); }
  .starter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 22px; text-align: left; }
  .starter-card { background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 13px; cursor: pointer; font-size: 13px; }
  .starter-card:hover { border-color: var(--neon); box-shadow: 0 0 8px rgba(0,255,0,0.15); }
  .starter-card b { display: block; color: var(--neon); margin-bottom: 3px; font-size: 13.5px; }
  .starter-card span { color: var(--muted); }

  .msg-row { display: flex; gap: 12px; align-items: flex-start; }
  .msg-row.user { flex-direction: row-reverse; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'Fira Code', monospace; }
  .avatar.ai { background: #003300; color: var(--neon); border: 1px solid var(--neon); }
  .avatar.me { background: #111; border: 1px solid var(--border); color: var(--text); }
  .bubble { max-width: 78%; padding: 11px 14px; border-radius: 4px; font-size: 14.5px; line-height: 1.55; white-space: pre-wrap; word-wrap: break-word; }
  .msg-row.assistant .bubble { background: #0a0a0a; border: 1px solid var(--neon); border-left: 2px solid var(--neon); }
  .msg-row.user .bubble { background: #0a0a0a; border: 1px solid var(--border); border-right: 2px solid var(--muted); }
  .bubble img { max-width: 100%; border-radius: 4px; margin-top: 6px; display: block; border: 1px solid var(--border); }
  .typing-dots span { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--neon); margin-right: 3px; animation: blink 1.2s infinite; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; } .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  .composer-wrap { padding: 12px 16px 18px; }
  .composer { max-width: 760px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 8px 10px; }
  .image-preview { display: flex; align-items: center; gap: 8px; padding: 6px 6px 10px; border-bottom: 1px solid var(--border); }
  .image-preview img { width: 46px; height: 46px; object-fit: cover; border-radius: 4px; border: 1px solid var(--neon); }
  .image-preview button { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px; }
  .composer-row { display: flex; align-items: flex-end; gap: 8px; }
  .icon-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 8px; border-radius: 4px; display: flex; }
  .icon-btn:hover { background: var(--panel); color: var(--neon); }
  #composerInput {
    flex: 1; background: transparent; border: none; color: var(--neon); resize: none;
    font-family: 'Fira Code', monospace; font-size: 14.5px; padding: 8px 4px; max-height: 160px; outline: none; caret-color: var(--neon);
  }
  .send-btn { background: transparent; border: 1px solid var(--neon); color: var(--neon); width: 34px; height: 34px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .send-btn:hover { background: var(--neon); color: #000; }
  .send-btn:disabled { opacity: 0.3; cursor: default; }
  .composer-hint { text-align: center; font-size: 11px; color: var(--muted); margin-top: 8px; }

  @media (max-width: 820px) {
    .sidebar { position: fixed; height: 100%; transform: translateX(-100%); box-shadow: 20px 0 40px rgba(0,0,0,0.5); }
    .sidebar.open { transform: translateX(0); }
    .chat-topbar { display: flex; }
    .bubble { max-width: 88%; }
  }
</style>
</head>
<body>
<canvas id="matrix-canvas"></canvas>
${body}
<footer>Coding AI &middot; jalan di Cloudflare Workers, ditulis buat dipanggil dari Termux</footer>
<script>
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, columns;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / 14);
  }
  let drops = [];
  resize();
  for (let i = 0; i < columns; i++) drops[i] = Math.random() * height;
  function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px "Fira Code", monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 14, drops[i] * 14);
      if (drops[i] * 14 > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 33);
  window.addEventListener('resize', resize);
</script>
</body>
</html>`;
}
ENDOFLAYOUT

cat > src/views/landing.ts << 'ENDOFLANDING'
import { renderPage } from "./layout";

function cloudflareBadge(): string {
  return `<span class="shield-badge">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4Z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
    Diamankan oleh Cloudflare
  </span>`;
}

export function renderLanding(appName: string): string {
  const body = `
<header class="top">
  <div class="wrap">
    <div class="brand"><span class="dot"></span> ${appName}</div>
    <a class="btn" href="/auth/google">Masuk dengan Google</a>
  </div>
</header>

<section class="wrap" style="padding: 80px 0 24px; text-align: center;">
  <div style="margin-bottom: 18px;">${cloudflareBadge()}</div>
  <h1 style="font-size: 38px; line-height: 1.25; margin: 0 auto 16px; max-width: 700px; color: var(--neon); text-shadow: 0 0 10px var(--neon);">
    > ./coding-ai --help
  </h1>
  <p style="color: var(--muted); max-width: 520px; margin: 0 auto 30px; font-size: 15px;">
    Terminal AI pribadi buat ngerjain PR, coding, sampai edit foto. Login pake Google, langsung nyala.
  </p>
  <a class="btn" href="/auth/google" style="padding: 13px 24px; font-size: 15px;">Mulai dengan Google</a>
</section>

<section class="wrap" style="padding: 40px 0 60px;">
  <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
    <div class="card">
      <p class="label">PR &amp; Sekolah</p>
      <p>Bantu kerjain tugas, jelasin materi pelajaran, sampai review jawaban kamu.</p>
    </div>
    <div class="card">
      <p class="label">Coding</p>
      <p>Debug error, jelasin kode, atau bikinin skrip dari nol.</p>
    </div>
    <div class="card">
      <p class="label">Foto</p>
      <p>Kirim foto buat ditanyain, atau minta diedit langsung di chat.</p>
    </div>
    <div class="card">
      <p class="label">Aman</p>
      <p>Login lewat Google, tidak ada password yang perlu kamu kelola sendiri.</p>
    </div>
  </div>
</section>
`;
  return renderPage("Beranda", body);
}
ENDOFLANDING

cat > src/views/dashboard.ts << 'ENDOFDASHBOARD'
import { renderPage } from "./layout";
import type { ApiKeyRow } from "../lib/db";

function fmtDate(ms: number | null): string {
  if (!ms) return "belum pernah";
  return new Date(ms).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function keyRow(k: ApiKeyRow): string {
  const status = k.revoked
    ? `<span class="badge revoked">revoked</span>`
    : `<span class="badge active">aktif</span>`;
  const action = k.revoked
    ? ""
    : `<button class="btn ghost" style="padding:6px 10px;font-size:12px" onclick="revokeKey('${k.id}')">Cabut</button>`;
  return `<tr id="row-${k.id}">
    <td>${k.name}</td>
    <td><code>${k.key_prefix}&hellip;</code></td>
    <td>${fmtDate(k.created_at)}</td>
    <td>${fmtDate(k.last_used_at)}</td>
    <td>${status}</td>
    <td>${action}</td>
  </tr>`;
}

export function renderDashboard(params: {
  user: { name: string | null; email: string; picture: string | null };
  keys: ApiKeyRow[];
  usage: { day: string; count: number }[];
}): string {
  const { user, keys, usage } = params;

  const body = `
<header class="top">
  <div class="wrap">
    <div class="brand"><span class="dot"></span> Coding AI</div>
    <div style="display:flex; align-items:center; gap:12px;">
      <a class="btn ghost" href="/chat">&larr; Kembali ke Chat</a>
      <span style="color:var(--muted); font-size:14px;">${user.email}</span>
      <a class="btn ghost" href="/logout">Keluar</a>
    </div>
  </div>
</header>

<section class="wrap" style="padding: 36px 0;">
  <p class="label">Dashboard</p>
  <h1 style="font-size: 26px; margin: 8px 0 28px; color: var(--neon); text-shadow: 0 0 5px var(--neon);">Halo, ${user.name ?? user.email}</h1>

  <div class="card" style="margin-bottom: 24px;">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px;">
      <p class="label" style="margin:0;">API keys</p>
      <div style="display:flex; gap:8px;">
        <input type="text" id="keyName" placeholder="nama key, misal: bot-wa" />
        <button class="btn" onclick="createKey()">+ Generate key</button>
      </div>
    </div>
    <div id="newKeyBox"></div>
    <table>
      <thead><tr><th>Nama</th><th>Key</th><th>Dibuat</th><th>Terakhir dipakai</th><th>Status</th><th></th></tr></thead>
      <tbody id="keysBody">
        ${keys.map(keyRow).join("") || `<tr><td colspan="6" style="color:var(--muted)">Belum ada key. Generate satu di atas.</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="grid" style="grid-template-columns: 1.3fr 1fr; align-items: start;">
    <div class="card">
      <p class="label">Pemakaian 14 hari terakhir</p>
      <canvas id="usageChart" height="160"></canvas>
    </div>
    <div class="terminal">
      <div class="bar"><span></span><span></span><span></span></div>
      <div class="body">
        <div class="muted-line"># contoh panggil dari Termux</div>
        <div><span class="prompt">$</span> export CODING_AI_KEY=cai_live_xxx</div>
        <div><span class="prompt">$</span> curl -s https://coding-ai.&lt;kamu&gt;.workers.dev/api/v1/gemini \\</div>
        <div class="muted-line">&nbsp;&nbsp;-H "Authorization: Bearer $CODING_AI_KEY" \\</div>
        <div class="muted-line">&nbsp;&nbsp;-H "Content-Type: application/json" \\</div>
        <div class="muted-line">&nbsp;&nbsp;-d '{"prompt":"Balas pesan WA ini: halo"}'</div>
        <div style="margin-top:10px;" class="muted-line"># endpoint gambar (Nano Banana)</div>
        <div><span class="prompt">$</span> curl .../api/v1/image -d '{"prompt":"kucing oren pixel art"}'<span class="cursor"></span></div>
      </div>
    </div>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
  const usageData = ${JSON.stringify(usage)};
  const ctx = document.getElementById('usageChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: usageData.map(d => d.day.slice(5)),
      datasets: [{ label: 'Panggilan API', data: usageData.map(d => d.count), backgroundColor: '#00ff41', borderColor: '#00ff41', borderWidth: 1 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#666' }, grid: { color: '#1a1a1a' } },
        y: { ticks: { color: '#666' }, grid: { color: '#1a1a1a' }, beginAtZero: true }
      }
    }
  });

  async function createKey() {
    const name = document.getElementById('keyName').value || 'Default key';
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) { alert('Gagal membuat key'); return; }
    const data = await res.json();
    document.getElementById('newKeyBox').innerHTML =
      '<div class="card" style="margin-bottom:14px; border-color:var(--neon);">' +
      '<p class="label" style="margin:0 0 8px;">Key baru &mdash; simpan sekarang, tidak akan ditampilkan lagi</p>' +
      '<code style="word-break:break-all; color:var(--neon);">' + data.key + '</code></div>';
    location.reload();
  }

  async function revokeKey(id) {
    if (!confirm('Cabut key ini? Aplikasi yang memakainya akan langsung gagal auth.')) return;
    const res = await fetch('/api/keys/' + id, { method: 'DELETE' });
    if (res.ok) location.reload(); else alert('Gagal mencabut key');
  }
</script>
`;
  return renderPage("Dashboard", body);
}
ENDOFDASHBOARD

cat > src/views/chat.ts << 'ENDOFCHAT'
import { renderPage } from "./layout";
import type { Conversation } from "../lib/db";

function svg(path: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const ICONS = {
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>', 16),
  code: svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', 16),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>', 16),
  chat: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', 16),
  trash: svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', 14),
  menu: svg('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>', 18),
  paperclip: svg('<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>', 18),
  send: svg('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>', 16),
  x: svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 12),
  logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>', 16),
  key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.6 12.4 6.4-6.4M17 3l4 4-3 3"/>', 16),
};

function convItem(c: Conversation): string {
  return `<div class="conv-item" data-id="${c.id}" onclick="openConversation('${c.id}')">
    <span>${escapeHtml(c.title)}</span>
    <button class="del-btn" onclick="event.stopPropagation(); deleteConversation('${c.id}')" title="Hapus">${ICONS.trash}</button>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export function renderChat(params: {
  user: { name: string | null; email: string; picture: string | null };
  conversations: Conversation[];
}): string {
  const { user, conversations } = params;

  const body = `
<div class="chat-shell">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-top">
      <div class="brand" style="font-size:14px;"><span class="dot"></span> Coding AI</div>
      <button class="icon-btn" onclick="toggleSidebar()" style="display:none" id="closeSidebarBtn">${ICONS.x}</button>
    </div>

    <button class="new-chat-btn" onclick="startNewConversation(null)">${ICONS.plus} Obrolan baru</button>

    <div class="quick-cats">
      <button class="quick-cat" onclick="startNewConversation('pr')">${ICONS.book} PR &amp; Sekolah</button>
      <button class="quick-cat" onclick="startNewConversation('coding')">${ICONS.code} Coding</button>
      <button class="quick-cat" onclick="startNewConversation('foto')">${ICONS.image} Edit Foto</button>
      <button class="quick-cat" onclick="startNewConversation('umum')">${ICONS.chat} Obrolan bebas</button>
    </div>

    <p class="sidebar-section-label">Riwayat</p>
    <div class="conv-list" id="convList">
      ${conversations.map(convItem).join("") || `<p style="color:var(--muted); font-size:12.5px; padding: 4px 10px;">Belum ada obrolan.</p>`}
    </div>

    <div class="sidebar-footer">
      <span title="${user.email}">${user.name ?? user.email}</span>
      <div style="display:flex; gap:10px;">
        <a href="/dashboard" title="API key">${ICONS.key}</a>
        <a href="/logout" title="Keluar">${ICONS.logout}</a>
      </div>
    </div>
  </aside>

  <main class="chat-main">
    <div class="chat-topbar">
      <button class="menu-toggle" onclick="toggleSidebar()">${ICONS.menu}</button>
      <span id="topbarTitle" style="font-size:14px; color:var(--muted);">Obrolan baru</span>
    </div>

    <div class="messages" id="messages">
      <div class="empty-state" id="emptyState">
        <h2>> Mau dibantu apa hari ini?</h2>
        <p>Pilih kategori di samping, atau langsung tulis perintah di bawah.</p>
        <div class="starter-grid">
          <div class="starter-card" onclick="startNewConversation('pr')"><b>PR &amp; Sekolah</b><span>Jelasin materi, bantu kerjain tugas</span></div>
          <div class="starter-card" onclick="startNewConversation('coding')"><b>Coding</b><span>Debug error, tulis/kaji ulang kode</span></div>
          <div class="starter-card" onclick="startNewConversation('foto')"><b>Edit Foto</b><span>Kirim foto, minta diedit AI</span></div>
          <div class="starter-card" onclick="startNewConversation('umum')"><b>Obrolan bebas</b><span>Tanya apa saja</span></div>
        </div>
      </div>
      <div class="messages-inner" id="messagesInner"></div>
    </div>

    <div class="composer-wrap">
      <div class="composer">
        <div class="image-preview" id="imagePreview" style="display:none;">
          <img id="imagePreviewImg" src="" />
          <span style="font-size:12px; color:var(--muted);">Gambar terlampir</span>
          <button onclick="clearImage()">${ICONS.x} Hapus</button>
        </div>
        <div class="composer-row">
          <input type="file" id="fileInput" accept="image/*" style="display:none" onchange="onFileSelected(event)" />
          <button class="icon-btn" onclick="document.getElementById('fileInput').click()" title="Lampirkan foto">${ICONS.paperclip}</button>
          <textarea id="composerInput" rows="1" placeholder="Ketik perintah... (Shift+Enter buat baris baru)"></textarea>
          <button class="send-btn" id="sendBtn" onclick="sendMessage()">${ICONS.send}</button>
        </div>
      </div>
      <p class="composer-hint">AI bisa saja salah. Cek lagi info penting.</p>
    </div>
  </main>
</div>

<script>
  let activeConversationId = null;
  let pendingImage = null;

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      pendingImage = { base64, mime: file.type, dataUrl };
      document.getElementById('imagePreviewImg').src = dataUrl;
      document.getElementById('imagePreview').style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    pendingImage = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
  }

  async function loadConversations() {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    const list = document.getElementById('convList');
    if (!data.conversations.length) {
      list.innerHTML = '<p style="color:var(--muted); font-size:12.5px; padding: 4px 10px;">Belum ada obrolan.</p>';
      return;
    }
    list.innerHTML = data.conversations.map(c =>
      '<div class="conv-item' + (c.id === activeConversationId ? ' active' : '') + '" data-id="' + c.id + '" onclick="openConversation(\\'' + c.id + '\\')">' +
      '<span>' + c.title.replace(/</g,'&lt;') + '</span>' +
      '<button class="del-btn" onclick="event.stopPropagation(); deleteConversation(\\'' + c.id + '\\')" title="Hapus">&times;</button></div>'
    ).join('');
  }

  async function startNewConversation(category) {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    const data = await res.json();
    activeConversationId = data.conversation.id;
    document.getElementById('messagesInner').innerHTML = '';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('topbarTitle').textContent = data.conversation.title;
    await loadConversations();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('composerInput').focus();
  }

  async function openConversation(id) {
    activeConversationId = id;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('sidebar').classList.remove('open');
    const res = await fetch('/api/conversations/' + id + '/messages');
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('topbarTitle').textContent = data.conversation.title;
    const inner = document.getElementById('messagesInner');
    inner.innerHTML = data.messages.map(renderBubble).join('');
    scrollToBottom();
    await loadConversations();
  }

  async function deleteConversation(id) {
    if (!confirm('Hapus obrolan ini?')) return;
    await fetch('/api/conversations/' + id, { method: 'DELETE' });
    if (activeConversationId === id) {
      activeConversationId = null;
      document.getElementById('messagesInner').innerHTML = '';
      document.getElementById('emptyState').style.display = 'block';
      document.getElementById('topbarTitle').textContent = 'Obrolan baru';
    }
    await loadConversations();
  }

  function renderBubble(m) {
    const isUser = m.role === 'user';
    const avatar = isUser ? '<div class="avatar me">>></div>' : '<div class="avatar ai">AI</div>';
    let content = '';
    if (m.content_text) content += m.content_text.replace(/</g,'&lt;');
    if (m.content_image_base64) content += '<img src="data:' + m.content_image_mime + ';base64,' + m.content_image_base64 + '" />';
    return '<div class="msg-row ' + m.role + '">' + avatar + '<div class="bubble">' + content + '</div></div>';
  }

  function scrollToBottom() {
    const el = document.getElementById('messages');
    el.scrollTop = el.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('composerInput');
    const text = input.value.trim();
    if (!text && !pendingImage) return;

    if (!activeConversationId) {
      const res = await fetch('/api/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: null })
      });
      const data = await res.json();
      activeConversationId = data.conversation.id;
      document.getElementById('emptyState').style.display = 'none';
    }

    const inner = document.getElementById('messagesInner');
    inner.insertAdjacentHTML('beforeend', renderBubble({ role: 'user', content_text: text, content_image_base64: pendingImage?.base64, content_image_mime: pendingImage?.mime }));
    inner.insertAdjacentHTML('beforeend', '<div class="msg-row assistant" id="typingRow"><div class="avatar ai">AI</div><div class="bubble typing-dots"><span></span><span></span><span></span></div></div>');
    scrollToBottom();

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';
    const imageToSend = pendingImage;
    clearImage();

    try {
      const res = await fetch('/api/conversations/' + activeConversationId + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, image_base64: imageToSend?.base64 || null, image_mime: imageToSend?.mime || null })
      });
      const data = await res.json();
      document.getElementById('typingRow')?.remove();
      if (!res.ok) {
        inner.insertAdjacentHTML('beforeend', renderBubble({ role: 'assistant', content_text: 'Maaf, ada error: ' + (data.error || 'gagal memproses') }));
      } else {
        inner.insertAdjacentHTML('beforeend', renderBubble(data.reply));
        if (data.title) document.getElementById('topbarTitle').textContent = data.title;
        await loadConversations();
      }
    } catch (err) {
      document.getElementById('typingRow')?.remove();
      inner.insertAdjacentHTML('beforeend', renderBubble({ role: 'assistant', content_text: 'Koneksi gagal, coba lagi.' }));
    }
    sendBtn.disabled = false;
    scrollToBottom();
  }

  const composerInput = document.getElementById('composerInput');
  composerInput.addEventListener('input', () => {
    composerInput.style.height = 'auto';
    composerInput.style.height = Math.min(composerInput.scrollHeight, 160) + 'px';
  });
  composerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  loadConversations();
</script>
`;
  return renderPage("Chat", body);
}
ENDOFCHAT

echo "✅ Semua file tampilan hacker sudah terpasang."
echo "🚀 Deploy ulang dengan: wrangler deploy"
