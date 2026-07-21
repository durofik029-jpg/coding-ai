# Coding AI

Dashboard web dengan login Google, generator API key, dan proxy ke Gemini Pro
(teks) + Nano Banana (gambar) — berjalan di Cloudflare Workers + D1.
Key yang kamu generate di sini nantinya dipakai bot WhatsApp (Baileys, jalan
di Termux) atau aplikasi web lain untuk memanggil AI, dan setiap pemanggilan
tercatat buat dashboard monitoring.

## Arsitektur singkat

```
Browser (Google login) → Cloudflare Worker (Hono) → D1 (users, api_keys, usage_logs)
Bot WA / app lain --Authorization: Bearer <api key>--> /api/v1/gemini | /api/v1/image → Gemini API
```

- **Auth pengguna dashboard**: Google OAuth (Authorization Code), session di cookie httpOnly ter-signed (JWT).
- **Auth pemanggil API** (bot WA, dsb): API key sendiri (`cai_live_...`), disimpan sebagai hash SHA-256, bukan plaintext.
- **AI**: satu `GEMINI_API_KEY` milik platform disimpan sebagai secret; semua pemanggilan lewat proxy ini supaya bisa dimonitor per key.

## 1. Siapkan Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → buat project baru (atau pakai yang sudah ada).
2. **OAuth consent screen**: isi nama app "Coding AI", tambahkan email kamu sebagai test user kalau masih mode Testing.
3. **Credentials → Create Credentials → OAuth client ID** → tipe **Web application**.
4. **Authorized redirect URIs**, isi (ganti `<subdomain>` sesuai nanti):
   - `http://localhost:8787/auth/google/callback` (untuk dev lokal)
   - `https://coding-ai.<subdomain>.workers.dev/auth/google/callback` (untuk produksi)
5. Catat **Client ID** dan **Client Secret**.

## 2. Siapkan Gemini API key

Ambil API key dari [Google AI Studio](https://aistudio.google.com/apikey).
Cek juga nama model teks & gambar terbaru di https://ai.google.dev/gemini-api/docs/models
(nama model Google bisa berubah — sesuaikan `GEMINI_TEXT_MODEL` / `GEMINI_IMAGE_MODEL` di `wrangler.toml` kalau perlu).

## 3. Install & login Cloudflare

```bash
npm install
npx wrangler login
```

## 4. Buat database D1

```bash
npx wrangler d1 create coding-ai-db
```

Perintah di atas akan mencetak `database_id`. Tempel ke `wrangler.toml` pada bagian:

```toml
[[d1_databases]]
binding = "DB"
database_name = "coding-ai-db"
database_id = "TEMPEL_DI_SINI"
```

Lalu jalankan schema-nya:

```bash
npm run db:init:remote
```

## 5. Set secrets di Cloudflare

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GEMINI_API_KEY
```

`JWT_SECRET` isi string acak panjang, contoh generate: `openssl rand -hex 32`.

## 6. Deploy ke Cloudflare

```bash
npm run deploy
```

Setelah deploy, wrangler mencetak URL seperti `https://coding-ai.<subdomain>.workers.dev`.
Update dua tempat dengan URL asli ini:

1. `wrangler.toml` → `GOOGLE_REDIRECT_URI`, lalu `npm run deploy` ulang.
2. Google Cloud Console → Authorized redirect URIs (tambahkan URL produksi kalau belum).

Buka URL-nya → klik **Masuk dengan Google** → setelah login kamu masuk ke `/dashboard`
dan bisa generate API key pertama.

## 7. Coba endpoint AI

```bash
export CODING_AI_KEY=cai_live_xxx   # dari dashboard
curl https://coding-ai.<subdomain>.workers.dev/api/v1/gemini \
  -H "Authorization: Bearer $CODING_AI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Halo, kamu siapa?"}'

curl https://coding-ai.<subdomain>.workers.dev/api/v1/image \
  -H "Authorization: Bearer $CODING_AI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"kucing oren gaya pixel art"}'
```

Endpoint gambar mengembalikan `image_base64` — decode di sisi klien
(mis. `base64 -d` atau langsung dipakai bot WA untuk kirim media).

## 8. Jalankan / develop dari Termux

```bash
pkg update && pkg install nodejs git -y
git clone <url-repo-kamu>
cd coding-ai
npm install
cp .dev.vars.example .dev.vars   # lalu isi nilainya
npx wrangler dev --remote        # --remote karena D1 lokal kadang berat di Termux
```

`wrangler dev` juga dipakai untuk development di komputer biasa — sama saja, hanya beda environment.

## Langkah selanjutnya: bot WhatsApp

Dashboard dan API ini sudah siap dipanggil bot. Untuk bot WhatsApp yang jalan
di Termux (misalnya pakai library **Baileys**), alurnya nanti:

1. Bot scan QR / pairing code untuk connect ke WhatsApp Web.
2. Setiap pesan masuk → bot panggil `POST /api/v1/gemini` dengan `CODING_AI_KEY` di header Authorization.
3. Balasan dari Gemini dikirim balik ke chat WA.

Bilang saja kalau mau saya buatkan skrip bot Baileys-nya sebagai proyek Node
terpisah yang jalan di Termux dan memanggil API ini — itu bagian berikutnya
yang belum kita bangun.

## Struktur folder

```
src/
  index.ts          routing utama (auth, dashboard, API key, proxy AI)
  lib/
    crypto.ts        generate & hash API key
    session.ts        sign/verify cookie session (JWT)
    google.ts          OAuth Google + verifikasi ID token
    db.ts               query D1
    ai.ts                pemanggilan Gemini Pro & Nano Banana
  views/
    layout.ts        HTML shell + desain (tema terminal amber)
    landing.ts
    dashboard.ts
schema.sql            skema tabel D1
wrangler.toml          konfigurasi Cloudflare Worker
```
