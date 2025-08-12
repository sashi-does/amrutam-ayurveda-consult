import express from "express"
import { registerDoctor, getDoctors, createSlots } from "../controllers/doctorController.ts"

const doctorRouter = express.Router()

doctorRouter.post('/register', registerDoctor);
doctorRouter.get('/all', getDoctors);
doctorRouter.post('/slot/create', createSlots)

export default doctorRouter;