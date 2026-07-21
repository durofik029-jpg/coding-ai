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
