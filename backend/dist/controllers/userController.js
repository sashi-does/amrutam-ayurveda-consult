"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.createAppointment = createAppointment;
exports.sendOtpToMail = sendOtpToMail;
exports.verify = verify;
exports.getAppointments = getAppointments;
const prisma_1 = require("../lib/prisma");
const hash_1 = require("../utils/hash");
const token_1 = require("../utils/token");
const otpGenerator_1 = require("../services/otpGenerator");
const otpSender_1 = require("../services/otpSender");
const redis_1 = require("@upstash/redis");
const redis_2 = __importDefault(require("../config/redis"));
async function register(req, res) {
    try {
        const { firstName, lastName, email, password, phone, role } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                role: role || "patient"
            }
        });
        const token = (0, token_1.createAccessToken)({ id: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { id: user.id, email: user.email, role: user.role },
            token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = (0, token_1.createAccessToken)({ id: user.id, email: user.email, role: user.role, firstName: user.firstName });
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
async function createAppointment(req, res) {
    try {
        const token = req.token;
        console.log(req.token);
        if (!token) {
            return res.status(401).json({ success: false, error: "Token missing" });
        }
        let payload;
        try {
            payload = (0, token_1.verifyAccessToken)(token);
        }
        catch (err) {
            return res.status(401).json({ success: false, error: "Invalid token" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.id },
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        if (user.role !== "patient") {
            return res.status(403).json({ success: false, error: "Only patients can book appointments" });
        }
        const { slotId, mode, consultationFee } = req.body;
        if (!slotId || typeof slotId !== "string") {
            return res.status(400).json({ success: false, error: "Invalid or missing slotId" });
        }
        if (!mode || (mode !== "online" && mode !== "in_person")) {
            return res.status(400).json({ success: false, error: "Invalid or missing mode" });
        }
        if (consultationFee === undefined ||
            typeof consultationFee !== "number" ||
            consultationFee < 0) {
            return res.status(400).json({ success: false, error: "Invalid or missing consultationFee" });
        }
        const slot = await prisma_1.prisma.slot.findUnique({ where: { id: slotId } });
        if (!slot) {
            return res.status(404).json({ success: false, error: "Slot not found" });
        }
        const appointment = await prisma_1.prisma.appointment.create({
            data: {
                slotId,
                patientId: user.id,
                doctorId: slot.doctorId,
                status: "confirmed",
                mode,
                consultationFee,
            },
        });
        res.status(201).json({ success: true, appointment });
    }
    catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
async function sendOtpToMail(req, res) {
    try {
        const token = req.token;
        const { email } = (0, token_1.verifyAccessToken)(token);
        console.log("$$$$$ " + email);
        if (!email || typeof email !== "string") {
            return res.status(400).json({ success: false, error: "Valid email is required" });
        }
        const otp = (0, otpGenerator_1.generateOTP)(6);
        const redis = new redis_1.Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        try {
            await redis.set(email, otp, { ex: 600 }); // 10 minutes
        }
        catch (redisErr) {
            console.error("Redis error:", redisErr);
            return res.status(500).json({ success: false, error: "Failed to store OTP. Please try again." });
        }
        const result = await (0, otpSender_1.sendOtpMail)(email, otp);
        console.log(result);
        if (!result.success) {
            return res.status(500).json({ success: false, error: result.message });
        }
        return res.status(200).json({ success: true, message: result.message });
    }
    catch (err) {
        console.error("verifyAccount error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
async function verify(req, res) {
    try {
        const token = req.token;
        const { email } = (0, token_1.verifyAccessToken)(token);
        if (!email)
            return res.status(400).json({ success: false, error: "Valid email is required" });
        const { otp } = req.headers;
        if (!otp)
            return res.status(400).json({ success: false, error: "OTP is required" });
        const redis = (0, redis_2.default)();
        let storedOtp;
        try {
            storedOtp = await redis.get(email);
            if (!storedOtp)
                throw new Error("OTP is expired");
            console.log("Redis otp: " + storedOtp);
            console.log("User otp: " + otp.length);
        }
        catch (redisErr) {
            console.error("Redis error:", redisErr);
            return res.status(500).json({ error: "Failed to verify OTP. Please try again." });
        }
        if (!storedOtp)
            return res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });
        if (storedOtp.toString() !== otp)
            return res.status(400).json({ success: false, error: "Invalid OTP. Please try again." });
        try {
            await redis.del(email);
        }
        catch (delErr) {
            console.warn("Failed to delete OTP from Redis:", delErr);
        }
        try {
            await prisma_1.prisma.user.update({
                where: {
                    email
                },
                data: {
                    isVerified: true
                }
            });
        }
        catch (error) {
            console.error("Error verifying user:", error);
            res.status(500).json({ success: false, error: "Failed to verify user" });
        }
        return res.status(200).json({ success: true, message: "OTP verified successfully!" });
    }
    catch (err) {
        console.error("verify error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
async function getAppointments(req, res) {
    try {
        const token = req.token;
        if (!token) {
            return res.status(401).json({ error: "Access token missing" });
        }
        const user = (0, token_1.verifyAccessToken)(token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const appointments = await prisma_1.prisma.appointment.findMany({
            where: { patientId: user.id },
            include: {
                slot: {
                    include: {
                        doctor: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ success: true, appointments });
    }
    catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
//# sourceMappingURL=userController.js.map