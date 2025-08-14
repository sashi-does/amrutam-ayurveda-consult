import { Router } from "express";
import userRouter from "./userRouter";
import doctorRouter from "./doctorRouter";

const router = Router();

router.use("/auth", userRouter);
router.use("/doctors", doctorRouter);

export default router;
