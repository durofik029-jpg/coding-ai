export function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · Coding AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0b0e14;
    --panel: #10141b;
    --card: #171c25;
    --border: #232a36;
    --amber: #ffb300;
    --amber-dim: #8a6a1f;
    --violet: #9b8cff;
    --text: #e9e7e1;
    --muted: #8a8f98;
    --green: #4ade80;
    --red: #f37171;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'IBM Plex Sans', sans-serif;
    line-height: 1.5;
    min-height: 100vh;
  }
  h1, h2, h3, .mono, code, pre, .btn, .badge, .label {
    font-family: 'IBM Plex Mono', monospace;
  }
  a { color: var(--amber); text-decoration: none; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; }
  header.top {
    border-bottom: 1px solid var(--border);
    padding: 18px 0;
  }
  header.top .wrap { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: 0.5px; }
  .brand .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 8px var(--amber); }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--amber); color: #1a1200; border: none;
    padding: 11px 18px; border-radius: 6px; font-weight: 600; font-size: 14px;
    cursor: pointer; text-decoration: none;
  }
  .btn:hover { filter: brightness(1.08); }
  .btn.ghost {
    background: transparent; color: var(--text); border: 1px solid var(--border);
  }
  .btn.danger { background: var(--red); color: #250808; }
  .btn:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }

  /* Terminal signature component, dipakai di landing & dashboard */
  .terminal {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255,179,0,0.03), 0 20px 60px rgba(0,0,0,0.4);
  }
  .terminal .bar {
    display: flex; gap: 7px; padding: 10px 14px; border-bottom: 1px solid var(--border);
    background: #0d1015;
  }
  .terminal .bar span { width: 10px; height: 10px; border-radius: 50%; background: #333c48; }
  .terminal .body { padding: 18px 20px; font-size: 13.5px; color: #cfead2; }
  .terminal .body .muted-line { color: var(--muted); }
  .terminal .body .prompt { color: var(--amber); }
  .cursor { display: inline-block; width: 8px; height: 15px; background: var(--amber); animation: blink 1s steps(1) infinite; vertical-align: -2px; }
  @keyframes blink { 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }

  .label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
  .grid { display: grid; gap: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; border: 1px solid var(--border); color: var(--muted); }
  .badge.active { color: var(--green); border-color: rgba(74,222,128,0.3); }
  .badge.revoked { color: var(--red); border-color: rgba(243,113,113,0.3); }
  footer { color: var(--muted); font-size: 12.5px; padding: 40px 0; text-align: center; }
  input[type=text] {
    background: var(--panel); border: 1px solid var(--border); color: var(--text);
    padding: 10px 12px; border-radius: 6px; font-family: inherit; font-size: 14px;
  }
</style>
</head>
<body>
${body}
<footer>Coding AI &middot; jalan di Cloudflare Workers, ditulis buat dipanggil dari Termux</footer>
</body>
</html>`;
}
