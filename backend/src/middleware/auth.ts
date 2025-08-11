import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.ts";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token as string) as { userId: string }
    if(decoded) {
        req.body.id = decoded.userId
        next()
    }

  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
