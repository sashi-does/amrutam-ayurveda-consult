import jwt from "jsonwebtoken";
export declare function createAccessToken(payload: object): string;
export declare function verifyAccessToken(token: string): string | jwt.JwtPayload;
//# sourceMappingURL=token.d.ts.map