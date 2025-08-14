"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
const crypto_1 = __importDefault(require("crypto"));
function generateOTP(length = 6) {
    return crypto_1.default.randomInt(0, Math.pow(10, length))
        .toString()
        .padStart(length, "0");
}
//# sourceMappingURL=otpGenerator.js.map