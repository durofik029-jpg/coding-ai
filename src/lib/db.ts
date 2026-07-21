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
