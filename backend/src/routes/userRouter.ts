import express from "express"
import { register, login, createAppointment, sendOtpToMail, verify, getAppointments } from "../controllers/userController.ts"
import { authMiddleware } from "../middleware/auth.ts";

const userRouter = express.Router()

userRouter.post('/signup', register);
userRouter.post('/signin', login);
userRouter.post('/appointments/create', authMiddleware, createAppointment)
userRouter.post('/otp/send', authMiddleware, sendOtpToMail)
userRouter.post('/otp/verify', authMiddleware, verify)
userRouter.get('/appointments', authMiddleware, getAppointments)


export default userRouter


