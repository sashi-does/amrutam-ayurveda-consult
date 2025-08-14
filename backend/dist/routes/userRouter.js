"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const userRouter = express_1.default.Router();
userRouter.post('/signup', userController_1.register);
userRouter.post('/signin', userController_1.login);
userRouter.post('/appointments/create', auth_1.authMiddleware, userController_1.createAppointment);
userRouter.post('/otp/send', auth_1.authMiddleware, userController_1.sendOtpToMail);
userRouter.post('/otp/verify', auth_1.authMiddleware, userController_1.verify);
userRouter.get('/appointments', auth_1.authMiddleware, userController_1.getAppointments);
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map