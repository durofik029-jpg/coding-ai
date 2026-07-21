const GL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Catatan: nama model Google berubah dari waktu ke waktu. Cek nama model
// terbaru di https://ai.google.dev/gemini-api/docs/models sebelum deploy,
// lalu sesuaikan GEMINI_TEXT_MODEL / GEMINI_IMAGE_MODEL di wrangler.toml.
// "Nano Banana" adalah nama panggilan komunitas untuk model image Gemini.

export type ChatPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type ChatMessage = { role: "user" | "model"; parts: ChatPart[] };

export type AiResult = {
  ok: boolean;
  text?: string;
  imageBase64?: string;
  imageMime?: string;
  error?: string;
};

// Fungsi inti: dipakai buat chat teks biasa maupun kirim/edit gambar,
// tergantung parts yang dikirim dan apakah imageOutput diminta.
export async function callGemini(params: {
  apiKey: string;
  model: string;
  contents: ChatMessage[];
  systemInstruction?: string;
  imageOutput?: boolean;
}): Promise<AiResult> {
  const body: any = { contents: params.contents };
  if (params.systemInstruction) {
    body.systemInstruction = { parts: [{ text: params.systemInstruction }] };
  }
  if (params.imageOutput) {
    body.generationConfig = { responseModalities: ["IMAGE", "TEXT"] };
  }

  const res = await fetch(`${GL_BASE}/${params.model}:generateContent?key=${params.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    return { ok: false, error: data?.error?.message ?? "Gemini API error" };
  }

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p: any) => typeof p.text === "string")
    .map((p: any) => p.text)
    .join("");
  const imagePart = parts.find((p: any) => p.inlineData);

  if (!text && !imagePart) {
    return { ok: false, error: "Tidak ada balasan dari model" };
  }

  return {
    ok: true,
    text: text || undefined,
    imageBase64: imagePart?.inlineData?.data,
    imageMime: imagePart?.inlineData?.mimeType,
  };
}

// Dipakai endpoint publik /api/v1/gemini (dipanggil bot WA dengan API key)
export async function callGeminiText(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; text?: string; error?: string }> {
  const result = await callGemini({
    apiKey,
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return { ok: result.ok, text: result.text, error: result.error };
}

// Dipakai endpoint publik /api/v1/image (dipanggil bot WA dengan API key)
export async function callNanoBanana(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; imageBase64?: string; mimeType?: string; error?: string }> {
  const result = await callGemini({
    apiKey,
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    imageOutput: true,
  });
  return { ok: result.ok, imageBase64: result.imageBase64, mimeType: result.imageMime, error: result.error };
}
