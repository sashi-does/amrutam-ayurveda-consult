import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            token: string;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map