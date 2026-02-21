import * as jwt from "jsonwebtoken";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

export function signSession(payload: { userId: string; email: string }) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifySession(token: string) {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === "string") throw new Error("Invalid token payload");
  return decoded as { userId: string; email: string; iat: number; exp: number };
}