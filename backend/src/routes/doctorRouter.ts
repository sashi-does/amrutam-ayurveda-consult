import express from "express"
import { registerDoctor, getDoctors, createSlot, getFilteredDoctors } from "../controllers/doctorController.ts"

const doctorRouter = express.Router()

doctorRouter.post('/register', registerDoctor);
doctorRouter.get('/all', getDoctors);
doctorRouter.post('/slot/create', createSlot)
doctorRouter.get('/filter', getFilteredDoctors)

export default doctorRouter;