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
