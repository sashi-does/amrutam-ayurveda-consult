import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function createAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET)
}
