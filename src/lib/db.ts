import { newId } from "./crypto";

export type User = {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: number;
};

export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  created_at: number;
  last_used_at: number | null;
  revoked: number;
};

export async function upsertUserFromGoogle(
  db: D1Database,
  google: { sub: string; email: string; name?: string; picture?: string }
): Promise<User> {
  const existing = await db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(google.sub)
    .first<User>();

  if (existing) {
    await db
      .prepare("UPDATE users SET name = ?, picture = ? WHERE id = ?")
      .bind(google.name ?? null, google.picture ?? null, existing.id)
      .run();
    return { ...existing, name: google.name ?? existing.name, picture: google.picture ?? existing.picture };
  }

  const id = newId();
  const now = Date.now();
  await db
    .prepare(
      "INSERT INTO users (id, google_id, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, google.sub, google.email, google.name ?? null, google.picture ?? null, now)
    .run();

  return {
    id,
    google_id: google.sub,
    email: google.email,
    name: google.name ?? null,
    picture: google.picture ?? null,
    created_at: now,
  };
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  return await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}

export async function createApiKey(
  db: D1Database,
  userId: string,
  name: string,
  keyHash: string,
  keyPrefix: string
): Promise<ApiKeyRow> {
  const id = newId();
  const now = Date.now();
  await db
    .prepare(
      "INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at, revoked) VALUES (?, ?, ?, ?, ?, ?, 0)"
    )
    .bind(id, userId, name, keyHash, keyPrefix, now)
    .run();
  return { id, user_id: userId, name, key_prefix: keyPrefix, created_at: now, last_used_at: null, revoked: 0 };
}

export async function listApiKeys(db: D1Database, userId: string): Promise<ApiKeyRow[]> {
  const res = await db
    .prepare(
      "SELECT id, user_id, name, key_prefix, created_at, last_used_at, revoked FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all<ApiKeyRow>();
  return res.results ?? [];
}

export async function revokeApiKey(db: D1Database, userId: string, keyId: string): Promise<void> {
  await db
    .prepare("UPDATE api_keys SET revoked = 1 WHERE id = ? AND user_id = ?")
    .bind(keyId, userId)
    .run();
}

export async function findActiveKeyByHash(
  db: D1Database,
  keyHash: string
): Promise<(ApiKeyRow & { user_id: string }) | null> {
  return await db
    .prepare("SELECT * FROM api_keys WHERE key_hash = ? AND revoked = 0")
    .bind(keyHash)
    .first();
}

export async function touchKeyUsage(db: D1Database, keyId: string): Promise<void> {
  await db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").bind(Date.now(), keyId).run();
}

export async function logUsage(
  db: D1Database,
  keyId: string,
  endpoint: string,
  status: number
): Promise<void> {
  await db
    .prepare("INSERT INTO usage_logs (id, key_id, endpoint, status, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newId(), keyId, endpoint, status, Date.now())
    .run();
}

// ---------- Chat AI: obrolan & pesan ----------

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  created_at: number;
  updated_at: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content_text: string | null;
  content_image_base64: string | null;
  content_image_mime: string | null;
  created_at: number;
};

export async function createConversation(
  db: D1Database,
  userId: string,
  title: string,
  category: string | null
): Promise<Conversation> {
  const id = newId();
  const now = Date.now();
  await db
    .prepare(
      "INSERT INTO conversations (id, user_id, title, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, userId, title, category, now, now)
    .run();
  return { id, user_id: userId, title, category, created_at: now, updated_at: now };
}

export async function listConversations(db: D1Database, userId: string): Promise<Conversation[]> {
  const res = await db
    .prepare("SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100")
    .bind(userId)
    .all<Conversation>();
  return res.results ?? [];
}

export async function getConversation(
  db: D1Database,
  userId: string,
  id: string
): Promise<Conversation | null> {
  return await db
    .prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first<Conversation>();
}

export async function renameConversationIfDefault(
  db: D1Database,
  id: string,
  title: string
): Promise<void> {
  await db
    .prepare("UPDATE conversations SET title = ? WHERE id = ? AND title = 'Obrolan baru'")
    .bind(title.slice(0, 60), id)
    .run();
}

export async function touchConversation(db: D1Database, id: string): Promise<void> {
  await db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").bind(Date.now(), id).run();
}

export async function deleteConversation(db: D1Database, userId: string, id: string): Promise<void> {
  await db
    .prepare("DELETE FROM messages WHERE conversation_id = ? AND conversation_id IN (SELECT id FROM conversations WHERE id = ? AND user_id = ?)")
    .bind(id, id, userId)
    .run();
  await db.prepare("DELETE FROM conversations WHERE id = ? AND user_id = ?").bind(id, userId).run();
}

export async function addMessage(
  db: D1Database,
  conversationId: string,
  role: "user" | "assistant",
  text: string | null,
  imageBase64: string | null,
  imageMime: string | null
): Promise<Message> {
  const id = newId();
  const now = Date.now();
  await db
    .prepare(
      "INSERT INTO messages (id, conversation_id, role, content_text, content_image_base64, content_image_mime, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, conversationId, role, text, imageBase64, imageMime, now)
    .run();
  return {
    id,
    conversation_id: conversationId,
    role,
    content_text: text,
    content_image_base64: imageBase64,
    content_image_mime: imageMime,
    created_at: now,
  };
}

export async function listMessages(db: D1Database, conversationId: string): Promise<Message[]> {
  const res = await db
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .bind(conversationId)
    .all<Message>();
  return res.results ?? [];
}

// Ringkasan pemakaian 14 hari terakhir per hari, buat chart monitoring di dashboard.
export async function getUsageSeries(
  db: D1Database,
  userId: string
): Promise<{ day: string; count: number }[]> {
  const res = await db
    .prepare(
      `SELECT strftime('%Y-%m-%d', datetime(u.created_at / 1000, 'unixepoch')) AS day, COUNT(*) AS count
       FROM usage_logs u
       JOIN api_keys k ON k.id = u.key_id
       WHERE k.user_id = ? AND u.created_at >= ?
       GROUP BY day ORDER BY day ASC`
    )
    .bind(userId, Date.now() - 14 * 24 * 60 * 60 * 1000)
    .all<{ day: string; count: number }>();
  return res.results ?? [];
}
