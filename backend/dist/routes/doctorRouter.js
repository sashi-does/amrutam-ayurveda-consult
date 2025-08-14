"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const doctorRouter = express_1.default.Router();
doctorRouter.post('/register', doctorController_1.registerDoctor);
doctorRouter.get('/all', doctorController_1.getDoctors);
doctorRouter.post('/slot/create', doctorController_1.createSlot);
doctorRouter.get('/filter', doctorController_1.getFilteredDoctors);
doctorRouter.get('/slot/all', doctorController_1.getDoctorSlots);
exports.default = doctorRouter;
//# sourceMappingURL=doctorRouter.js.map