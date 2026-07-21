const GL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Catatan: nama model Google berubah dari waktu ke waktu. Cek nama model
// terbaru di https://ai.google.dev/gemini-api/docs/models sebelum deploy,
// lalu sesuaikan GEMINI_TEXT_MODEL / GEMINI_IMAGE_MODEL di wrangler.toml.

export async function callGeminiText(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; text?: string; error?: string }> {
  const res = await fetch(`${GL_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    return { ok: false, error: data?.error?.message ?? "Gemini API error" };
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return { ok: true, text };
}

// "Nano Banana" adalah nama panggilan model image-generation Gemini.
export async function callNanoBanana(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; imageBase64?: string; mimeType?: string; error?: string }> {
  const res = await fetch(`${GL_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    return { ok: false, error: data?.error?.message ?? "Nano Banana API error" };
  }
  const part = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!part) {
    return { ok: false, error: "Tidak ada gambar yang dihasilkan" };
  }
  return { ok: true, imageBase64: part.inlineData.data, mimeType: part.inlineData.mimeType };
}
