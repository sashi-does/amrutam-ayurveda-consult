import express from "express"
import { registerDoctor, getDoctors, createSlot, getFilteredDoctors, getDoctorSlots } from "../controllers/doctorController"

const doctorRouter = express.Router()

doctorRouter.post('/register', registerDoctor);
doctorRouter.get('/all', getDoctors);
doctorRouter.post('/slot/create', createSlot)
doctorRouter.get('/filter', getFilteredDoctors)
doctorRouter.get('/slot/all', getDoctorSlots)

export default doctorRouter;