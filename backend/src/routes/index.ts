import { Router } from "express";
import userRouter from "./userRouter.ts";
import doctorRouter from "./doctorRouter.ts";

const router = Router();

router.use("/auth", userRouter);
router.use("/doctors", doctorRouter);

export default router;
