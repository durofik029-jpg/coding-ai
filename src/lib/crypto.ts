// Bikin API key baru dengan prefix biar gampang dikenali di log/dashboard.
// Formatnya: cai_live_<32 karakter hex acak>
export function generateApiKey(): { plaintext: string; prefix: string } {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const plaintext = `cai_live_${hex}`;
  const prefix = plaintext.slice(0, 12); // ditampilkan di dashboard, sisanya disembunyikan
  return { plaintext, prefix };
}

// Kita cuma simpan hash-nya di database, bukan key aslinya.
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function newId(): string {
  return crypto.randomUUID();
}
