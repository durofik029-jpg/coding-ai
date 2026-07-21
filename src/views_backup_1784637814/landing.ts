import { renderPage } from "./layout";

export function renderLanding(appName: string): string {
  const body = `
<header class="top">
  <div class="wrap">
    <div class="brand"><span class="dot"></span> ${appName}</div>
    <a class="btn" href="/auth/google">Masuk dengan Google</a>
  </div>
</header>

<section class="wrap" style="padding: 64px 0 20px;">
  <p class="label">API key &middot; bot WhatsApp &middot; monitoring</p>
  <h1 style="font-size: 34px; line-height: 1.25; margin: 10px 0 14px;">
    Satu API key.<br/>Gemini Pro dan Nano Banana,<br/>siap dipanggil dari mana saja.
  </h1>
  <p style="color: var(--muted); max-width: 540px; margin-bottom: 28px;">
    Login dengan Google, generate API key, lalu pakai key itu untuk hubungkan bot WhatsApp-mu
    (jalan di Termux) atau aplikasi web-mu ke Gemini Pro dan Nano Banana. Semua pemakaian
    tercatat di dashboard monitoring.
  </p>
  <a class="btn" href="/auth/google" style="margin-bottom: 40px;">$ login --provider google</a>

  <div class="terminal" style="max-width: 640px;">
    <div class="bar"><span></span><span></span><span></span></div>
    <div class="body">
      <div><span class="prompt">$</span> npx coding-ai login --provider google</div>
      <div class="muted-line">&gt; membuka jendela login Google...</div>
      <div class="muted-line">&gt; terautentikasi sebagai kamu@gmail.com</div>
      <div><span class="prompt">$</span> coding-ai keys:create --name "bot-wa"</div>
      <div class="muted-line">&gt; key dibuat: cai_live_9f2a8c1e***&nbsp;(disimpan hash-nya saja)</div>
      <div><span class="prompt">$</span> curl coding-ai.dev/api/v1/gemini \\</div>
      <div class="muted-line">&nbsp;&nbsp;-H "Authorization: Bearer $CODING_AI_KEY" \\</div>
      <div class="muted-line">&nbsp;&nbsp;-d '{"prompt":"halo!"}'<span class="cursor"></span></div>
    </div>
  </div>
</section>

<section class="wrap" style="padding: 40px 0 60px;">
  <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
    <div class="card">
      <p class="label">Auth</p>
      <p>Login Google, session lewat cookie ter-signed. Tidak ada password yang perlu dikelola.</p>
    </div>
    <div class="card">
      <p class="label">API key</p>
      <p>Generate dan revoke key dari dashboard. Key asli hanya tampil sekali saat dibuat.</p>
    </div>
    <div class="card">
      <p class="label">Integrasi AI</p>
      <p>Satu endpoint untuk Gemini Pro (teks) dan Nano Banana (gambar), tinggal pakai key-mu.</p>
    </div>
    <div class="card">
      <p class="label">Monitoring</p>
      <p>Grafik pemakaian per hari per key, jadi kelihatan bot mana yang paling aktif.</p>
    </div>
  </div>
</section>
`;
  return renderPage("Beranda", body);
}
