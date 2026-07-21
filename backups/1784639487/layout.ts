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
