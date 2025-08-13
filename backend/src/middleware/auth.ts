import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.ts";
import type { UserPayload } from "../types/payload.ts";

declare global {
    namespace Express {
        interface Request {
            token: string
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Middleware: " + token)
    const decoded = verifyAccessToken(token as string) as UserPayload
    if(decoded) {
        req.token = token as string
        console.log(req.token)
        next()
    }

  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
