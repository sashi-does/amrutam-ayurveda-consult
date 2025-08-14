import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export function createAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=token.js.map