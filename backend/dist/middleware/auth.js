import { verifyAccessToken } from "../utils/token.ts";
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing" });
        }
        const token = authHeader.split(" ")[1];
        console.log("Middleware: " + token);
        const decoded = verifyAccessToken(token);
        if (decoded) {
            req.token = token;
            console.log(req.token);
            next();
        }
    }
    catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
//# sourceMappingURL=auth.js.map