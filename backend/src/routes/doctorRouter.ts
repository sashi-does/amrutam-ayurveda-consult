import express from "express"
import { registerDoctor, getDoctors } from "../controllers/doctorController.ts"

const doctorRouter = express.Router()

doctorRouter.post('/register', registerDoctor);
doctorRouter.get('/all', getDoctors);

export default doctorRouter;