import type { Request, Response } from "express";
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function sendOtpToMail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function verify(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map