import { createRemoteJWKSet, jwtVerify } from "jose";

export type GoogleEnv = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export function buildGoogleAuthUrl(env: GoogleEnv, state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForIdToken(
  code: string,
  env: GoogleEnv
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Gagal tukar code ke token Google: ${await res.text()}`);
  }
  const data = (await res.json()) as { id_token: string };
  return data.id_token;
}

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

// Verifikasi signature id_token langsung ke public key Google (bukan cuma decode).
export async function verifyGoogleIdToken(
  idToken: string,
  env: GoogleEnv
): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: env.GOOGLE_CLIENT_ID,
  });
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
  };
}
