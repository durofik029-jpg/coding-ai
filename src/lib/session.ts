import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  name?: string;
  picture?: string;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export async function createSessionToken(
  payload: SessionPayload,
  secret: string
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
