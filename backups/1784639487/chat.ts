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
