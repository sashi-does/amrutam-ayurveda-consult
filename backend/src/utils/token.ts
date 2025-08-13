
import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/payload.ts";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function createAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): { id: string, email: string, role: string } {
    return jwt.verify(token, JWT_SECRET) as UserPayload
}
