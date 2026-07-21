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

  /* Badge "dilindungi Cloudflare" */
  .shield-badge {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--border);
    padding: 6px 10px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace;
  }
  .shield-badge svg { flex-shrink: 0; }

  /* ---------- Layout chat AI ---------- */
  .chat-shell { display: flex; height: 100vh; height: 100dvh; overflow: hidden; }

  .sidebar {
    width: 268px; flex-shrink: 0; background: var(--panel); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 14px; gap: 14px;
    transition: transform 0.2s ease;
  }
  .sidebar-top { display: flex; align-items: center; justify-content: space-between; }
  .new-chat-btn {
    display: flex; align-items: center; gap: 8px; width: 100%;
    background: var(--amber); color: #1a1200; border: none; border-radius: 8px;
    padding: 11px 12px; font-weight: 600; font-size: 13.5px; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
  }
  .quick-cats { display: flex; flex-direction: column; gap: 6px; }
  .quick-cat {
    display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px;
    color: var(--text); font-size: 13px; cursor: pointer; border: 1px solid transparent;
    background: transparent;
  }
  .quick-cat:hover { background: var(--card); border-color: var(--border); }
  .sidebar-section-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin: 6px 0 2px; font-family: 'IBM Plex Mono', monospace; }
  .conv-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; margin: 0 -6px; padding: 0 6px; }
  .conv-item {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13.5px;
    color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .conv-item:hover { background: var(--card); }
  .conv-item.active { background: var(--card); border: 1px solid var(--border); }
  .conv-item .del-btn { opacity: 0; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; flex-shrink: 0; }
  .conv-item:hover .del-btn { opacity: 1; }
  .sidebar-footer { border-top: 1px solid var(--border); padding-top: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--muted); }
  .sidebar-footer a { color: var(--muted); }
  .sidebar-footer a:hover { color: var(--amber); }

  .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .chat-topbar { display: none; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .menu-toggle { background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text); padding: 6px 10px; cursor: pointer; }

  .messages { flex: 1; overflow-y: auto; padding: 24px 16px 8px; }
  .messages-inner { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
  .empty-state { max-width: 640px; margin: 10vh auto 0; text-align: center; color: var(--muted); }
  .empty-state h2 { color: var(--text); font-size: 22px; margin-bottom: 8px; }
  .starter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 22px; text-align: left; }
  .starter-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 13px; cursor: pointer; font-size: 13px; }
  .starter-card:hover { border-color: var(--amber-dim); }
  .starter-card b { display: block; color: var(--text); margin-bottom: 3px; font-size: 13.5px; }
  .starter-card span { color: var(--muted); }

  .msg-row { display: flex; gap: 12px; }
  .msg-row.user { flex-direction: row-reverse; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
  .avatar.ai { background: linear-gradient(135deg, var(--amber), #7a5a00); color: #1a1200; }
  .avatar.me { background: var(--card); border: 1px solid var(--border); color: var(--text); }
  .bubble { max-width: 78%; padding: 11px 14px; border-radius: 12px; font-size: 14.5px; line-height: 1.55; white-space: pre-wrap; word-wrap: break-word; }
  .msg-row.assistant .bubble { background: var(--card); border: 1px solid var(--border); border-top-left-radius: 3px; }
  .msg-row.user .bubble { background: #2a2410; border: 1px solid var(--amber-dim); border-top-right-radius: 3px; }
  .bubble img { max-width: 100%; border-radius: 8px; margin-top: 6px; display: block; }
  .typing-dots span { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--muted); margin-right: 3px; animation: blink 1.2s infinite; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; } .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  .composer-wrap { padding: 12px 16px 18px; }
  .composer { max-width: 760px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 8px 10px; }
  .image-preview { display: flex; align-items: center; gap: 8px; padding: 6px 6px 10px; }
  .image-preview img { width: 46px; height: 46px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); }
  .image-preview button { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px; }
  .composer-row { display: flex; align-items: flex-end; gap: 8px; }
  .icon-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 8px; border-radius: 8px; display: flex; }
  .icon-btn:hover { background: var(--panel); color: var(--text); }
  #composerInput {
    flex: 1; background: transparent; border: none; color: var(--text); resize: none;
    font-family: 'IBM Plex Sans', sans-serif; font-size: 14.5px; padding: 8px 4px; max-height: 160px; outline: none;
  }
  .send-btn { background: var(--amber); border: none; color: #1a1200; width: 34px; height: 34px; border-radius: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .send-btn:disabled { opacity: 0.4; cursor: default; }
  .composer-hint { text-align: center; font-size: 11px; color: var(--muted); margin-top: 8px; }

  @media (max-width: 820px) {
    .sidebar { position: fixed; z-index: 20; height: 100%; transform: translateX(-100%); box-shadow: 20px 0 40px rgba(0,0,0,0.5); }
    .sidebar.open { transform: translateX(0); }
    .chat-topbar { display: flex; }
    .bubble { max-width: 88%; }
  }
</style>
</head>
<body>
${body}
<footer>Coding AI &middot; jalan di Cloudflare Workers, ditulis buat dipanggil dari Termux</footer>
</body>
</html>`;
}
