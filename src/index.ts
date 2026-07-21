import { Hono, type Context, type Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { generateApiKey, newId, sha256Hex } from "./lib/crypto";
import { createSessionToken, verifySessionToken } from "./lib/session";
import { buildGoogleAuthUrl, exchangeCodeForIdToken, verifyGoogleIdToken } from "./lib/google";
import {
  createApiKey,
  findActiveKeyByHash,
  getUsageSeries,
  listApiKeys,
  logUsage,
  revokeApiKey,
  touchKeyUsage,
  upsertUserFromGoogle,
  getUserById,
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  addMessage,
  listMessages,
  renameConversationIfDefault,
  touchConversation,
} from "./lib/db";
import { callGeminiText, callNanoBanana, callGemini, type ChatMessage } from "./lib/ai";
import { renderLanding } from "./views/landing";
import { renderDashboard } from "./views/dashboard";
import { renderChat } from "./views/chat";

const CATEGORY_PROMPTS: Record<string, string> = {
  pr: "Kamu adalah asisten belajar yang sabar dan jelas, membantu murid mengerjakan PR dan memahami materi sekolah. Jelaskan langkah demi langkah, jangan cuma kasih jawaban akhir, dan pakai bahasa Indonesia yang mudah dimengerti.",
  coding: "Kamu adalah asisten coding yang membantu debug error, menjelaskan kode, dan menulis kode yang rapi dan benar. Sertakan contoh kode dalam blok kode kalau relevan.",
  foto: "Kamu bisa menganalisis foto yang dikirim pengguna dan mengedit foto sesuai instruksi mereka.",
  umum: "Kamu adalah asisten AI yang ramah, jelas, dan membantu untuk berbagai topik.",
};

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  GEMINI_API_KEY: string;
  GEMINI_TEXT_MODEL: string;
  GEMINI_IMAGE_MODEL: string;
  APP_NAME: string;
};

type Variables = {
  session: { sub: string; email: string; name?: string; picture?: string };
  apiKeyId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const SESSION_COOKIE = "cai_session";

// ---------- Halaman publik ----------

app.get("/", (c) => c.html(renderLanding(c.env.APP_NAME ?? "Coding AI")));

app.get("/auth/google", (c) => {
  const state = newId();
  setCookie(c, "oauth_state", state, { httpOnly: true, secure: true, sameSite: "Lax", maxAge: 600 });
  return c.redirect(buildGoogleAuthUrl(c.env, state));
});

app.get("/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const savedState = getCookie(c, "oauth_state");

  if (!code || !state || state !== savedState) {
    return c.text("State OAuth tidak valid. Coba login lagi.", 400);
  }

  try {
    const idToken = await exchangeCodeForIdToken(code, c.env);
    const profile = await verifyGoogleIdToken(idToken, c.env);
    const user = await upsertUserFromGoogle(c.env.DB, profile);

    const session = await createSessionToken(
      { sub: user.id, email: user.email, name: user.name ?? undefined, picture: user.picture ?? undefined },
      c.env.JWT_SECRET
    );
    setCookie(c, SESSION_COOKIE, session, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    deleteCookie(c, "oauth_state");
    return c.redirect("/chat");
  } catch (err) {
    console.error(err);
    return c.text("Login Google gagal. Cek GOOGLE_CLIENT_ID/SECRET dan redirect URI.", 500);
  }
});

app.get("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.redirect("/");
});

// ---------- Middleware: session (untuk dashboard) ----------

app.use("/dashboard/*", requireSession);
app.use("/dashboard", requireSession);
app.use("/api/keys/*", requireSession);
app.use("/api/keys", requireSession);
app.use("/chat", requireSession);
app.use("/chat/*", requireSession);
app.use("/api/conversations", requireSession);
app.use("/api/conversations/*", requireSession);

type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

async function requireSession(c: AppContext, next: Next) {
  const token = getCookie(c, SESSION_COOKIE);
  const session = token ? await verifySessionToken(token, c.env.JWT_SECRET) : null;
  if (!session) return c.redirect("/");
  c.set("session", session);
  await next();
}

// ---------- Dashboard & manajemen API key ----------

app.get("/dashboard", async (c) => {
  const session = c.get("session");
  const user = await getUserById(c.env.DB, session.sub);
  if (!user) return c.redirect("/");

  const keys = await listApiKeys(c.env.DB, user.id);
  const usage = await getUsageSeries(c.env.DB, user.id);
  return c.html(renderDashboard({ user, keys, usage }));
});

app.post("/api/keys", async (c) => {
  const session = c.get("session");
  const body = await c.req.json<{ name?: string }>().catch(() => ({ name: undefined }));
  const { plaintext, prefix } = generateApiKey();
  const hash = await sha256Hex(plaintext);
  await createApiKey(c.env.DB, session.sub, body.name || "Default key", hash, prefix);
  return c.json({ key: plaintext });
});

app.delete("/api/keys/:id", async (c) => {
  const session = c.get("session");
  await revokeApiKey(c.env.DB, session.sub, c.req.param("id"));
  return c.json({ ok: true });
});

// ---------- Chat AI (dashboard utama setelah login) ----------

app.get("/chat", async (c) => {
  const session = c.get("session");
  const user = await getUserById(c.env.DB, session.sub);
  if (!user) return c.redirect("/");
  const conversations = await listConversations(c.env.DB, user.id);
  return c.html(renderChat({ user, conversations }));
});

app.get("/api/conversations", async (c) => {
  const session = c.get("session");
  const conversations = await listConversations(c.env.DB, session.sub);
  return c.json({ conversations });
});

app.post("/api/conversations", async (c) => {
  const session = c.get("session");
  const body = await c.req.json<{ category?: string | null }>().catch(() => ({ category: null }));
  const category = body.category && CATEGORY_PROMPTS[body.category] ? body.category : null;
  const conversation = await createConversation(c.env.DB, session.sub, "Obrolan baru", category);
  return c.json({ conversation });
});

app.get("/api/conversations/:id/messages", async (c) => {
  const session = c.get("session");
  const conversation = await getConversation(c.env.DB, session.sub, c.req.param("id"));
  if (!conversation) return c.json({ error: "Obrolan tidak ditemukan" }, 404);
  const messages = await listMessages(c.env.DB, conversation.id);
  return c.json({ conversation, messages });
});

app.delete("/api/conversations/:id", async (c) => {
  const session = c.get("session");
  await deleteConversation(c.env.DB, session.sub, c.req.param("id"));
  return c.json({ ok: true });
});

app.post("/api/conversations/:id/messages", async (c) => {
  const session = c.get("session");
  const conversation = await getConversation(c.env.DB, session.sub, c.req.param("id"));
  if (!conversation) return c.json({ error: "Obrolan tidak ditemukan" }, 404);

  const body = await c.req
    .json<{ text?: string; image_base64?: string | null; image_mime?: string | null }>()
    .catch(() => ({ text: "", image_base64: null, image_mime: null }));
  const text = (body.text || "").trim();
  const imageBase64 = body.image_base64 || null;
  const imageMime = body.image_mime || null;
  if (!text && !imageBase64) return c.json({ error: "Pesan kosong" }, 400);

  await addMessage(c.env.DB, conversation.id, "user", text || null, imageBase64, imageMime);

  // Bangun histori percakapan (teks saja) buat konteks multi-turn.
  const history = await listMessages(c.env.DB, conversation.id);
  const contents: ChatMessage[] = history
    .slice(0, -1) // pesan user yang baru saja disimpan ditambahkan manual di bawah dengan gambar
    .filter((m) => m.content_text)
    .map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content_text as string }] }));

  const currentParts: ChatMessage["parts"] = [];
  if (text) currentParts.push({ text });
  if (imageBase64 && imageMime) currentParts.push({ inlineData: { mimeType: imageMime, data: imageBase64 } });
  contents.push({ role: "user", parts: currentParts });

  const systemInstruction = conversation.category ? CATEGORY_PROMPTS[conversation.category] : CATEGORY_PROMPTS.umum;
  const useImageModel = Boolean(imageBase64) || conversation.category === "foto";

  const result = await callGemini({
    apiKey: c.env.GEMINI_API_KEY,
    model: useImageModel ? c.env.GEMINI_IMAGE_MODEL : c.env.GEMINI_TEXT_MODEL,
    contents,
    systemInstruction,
    imageOutput: useImageModel,
  });

  if (!result.ok) {
    return c.json({ error: result.error || "Gagal memproses pesan" }, 502);
  }

  const assistantMsg = await addMessage(
    c.env.DB,
    conversation.id,
    "assistant",
    result.text || null,
    result.imageBase64 || null,
    result.imageMime || null
  );
  await touchConversation(c.env.DB, conversation.id);
  if (text) await renameConversationIfDefault(c.env.DB, conversation.id, text);

  return c.json({ reply: assistantMsg, title: text ? text.slice(0, 60) : undefined });
});

// ---------- Middleware: API key (untuk endpoint AI, dipanggil bot WA / app lain) ----------

async function requireApiKey(c: AppContext, next: Next) {
  const auth = c.req.header("Authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key) return c.json({ error: "Header Authorization: Bearer <api_key> wajib diisi" }, 401);

  const hash = await sha256Hex(key);
  const row = await findActiveKeyByHash(c.env.DB, hash);
  if (!row) return c.json({ error: "API key tidak valid atau sudah dicabut" }, 401);

  c.set("apiKeyId", row.id);
  await touchKeyUsage(c.env.DB, row.id);
  await next();
}

app.use("/api/v1/*", requireApiKey);

// ---------- Endpoint AI (dipanggil dari bot WhatsApp / web app kamu) ----------

app.post("/api/v1/gemini", async (c) => {
  const keyId = c.get("apiKeyId");
  const { prompt } = await c.req.json<{ prompt?: string }>().catch(() => ({ prompt: "" }));
  if (!prompt) return c.json({ error: "Field 'prompt' wajib diisi" }, 400);

  const result = await callGeminiText(prompt, c.env.GEMINI_API_KEY, c.env.GEMINI_TEXT_MODEL);
  await logUsage(c.env.DB, keyId, "/api/v1/gemini", result.ok ? 200 : 502);
  if (!result.ok) return c.json({ error: result.error }, 502);
  return c.json({ text: result.text });
});

app.post("/api/v1/image", async (c) => {
  const keyId = c.get("apiKeyId");
  const { prompt } = await c.req.json<{ prompt?: string }>().catch(() => ({ prompt: "" }));
  if (!prompt) return c.json({ error: "Field 'prompt' wajib diisi" }, 400);

  const result = await callNanoBanana(prompt, c.env.GEMINI_API_KEY, c.env.GEMINI_IMAGE_MODEL);
  await logUsage(c.env.DB, keyId, "/api/v1/image", result.ok ? 200 : 502);
  if (!result.ok) return c.json({ error: result.error }, 502);
  return c.json({ image_base64: result.imageBase64, mime_type: result.mimeType });
});

export default app;
