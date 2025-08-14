"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hashed) {
    return bcrypt_1.default.compare(password, hashed);
}
//# sourceMappingURL=hash.js.map