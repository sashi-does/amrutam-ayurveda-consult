import express from "express";
import { registerDoctor, getDoctors, createSlot } from "../controllers/doctorController.ts";
const doctorRouter = express.Router();
doctorRouter.post('/register', registerDoctor);
doctorRouter.get('/all', getDoctors);
doctorRouter.post('/slot/create', createSlot);
export default doctorRouter;
//# sourceMappingURL=doctorRouter.js.map