import express from "express"
import { register, login, createAppointment } from "../controllers/userController.ts"
import { authMiddleware } from "../middleware/auth.ts";

const userRouter = express.Router()

userRouter.post('/signup', register);
userRouter.post('/signin', login);
userRouter.post('/appointments/create', authMiddleware, createAppointment)


export default userRouter


