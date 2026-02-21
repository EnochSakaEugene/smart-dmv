import * as jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("Missing JWT_SECRET");

export function signSession(payload: { userId: string; email: string }) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifySession(token: string) {
  return jwt.verify(token, secret) as { userId: string; email: string; iat: number; exp: number };
}