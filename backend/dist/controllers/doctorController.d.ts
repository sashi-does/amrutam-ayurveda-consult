import type { Request, Response } from "express";
export declare function registerDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function loginDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createSlot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getDoctors(req: Request, res: Response): Promise<void>;
export declare function getFilteredDoctors(req: Request, res: Response): Promise<void>;
export declare function getDoctorSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=doctorController.d.ts.map