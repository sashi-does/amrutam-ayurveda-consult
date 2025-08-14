import { Router } from "express";
import userRouter from "./userRouter.ts";
import doctorRouter from "./doctorRouter.ts";
const router = Router();
router.use("/auth", userRouter);
router.use("/doctors", doctorRouter);
// router.use("/appointments", appointmentRouter);
export default router;
//# sourceMappingURL=index.js.map