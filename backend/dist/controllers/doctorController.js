"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDoctor = registerDoctor;
exports.loginDoctor = loginDoctor;
exports.createSlot = createSlot;
exports.getDoctors = getDoctors;
exports.getFilteredDoctors = getFilteredDoctors;
exports.getDoctorSlots = getDoctorSlots;
const hash_1 = require("../utils/hash");
const prisma_1 = require("../lib/prisma");
const token_1 = require("../utils/token");
// For Doctor
async function registerDoctor(req, res) {
    try {
        const { firstName, lastName, email, password, phone, specialization, experience, consultationFee, mode, bio, qualifications, } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phone,
                    role: "doctor",
                },
            });
            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    specialization,
                    experience,
                    consultationFee,
                    mode,
                    bio,
                    qualifications,
                    rating: 0,
                    totalReviews: 0,
                    isApproved: false,
                },
            });
            return { user, doctor };
        });
        const token = (0, token_1.createAccessToken)({
            userId: result.user.id,
            role: result.user.role,
            email: result.user.email,
        });
        res.status(201).json({
            success: true,
            message: "Doctor registered successfully. Awaiting admin approval.",
            token,
            user: { id: result.user.id, email: result.user.email, role: result.user.role },
            doctor: result.doctor,
        });
    }
    catch (error) {
        console.error("Error registering doctor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
async function loginDoctor(req, res) {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== "doctor") {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const passwordMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, token_1.createAccessToken)({
            userId: user.id,
            role: user.role,
            email: user.email,
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
async function createSlot(req, res) {
    try {
        const { doctorId, startTime, endTime } = req.body;
        if (!doctorId || !startTime || !endTime) {
            return res.status(400).json({ error: "doctorId, startTime and endTime are required" });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (start >= end) {
            return res.status(400).json({ error: "startTime must be before endTime" });
        }
        const doctor = await prisma_1.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        if (!doctor.isActive || !doctor.isApproved) {
            return res.status(403).json({ error: "Doctor is not active or approved" });
        }
        const slot = await prisma_1.prisma.slot.create({
            data: {
                doctorId,
                startTime: start,
                endTime: end,
            },
        });
        return res.status(201).json(slot);
    }
    catch (error) {
        console.error("Error creating slot:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
// For Admin
async function getDoctors(req, res) {
    try {
        const doctors = await prisma_1.prisma.doctor.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                }
            }
        });
        res.status(200).json({ doctors });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
// For Patients
async function getFilteredDoctors(req, res) {
    try {
        const { specialization, mode } = req.query;
        let doctors = await prisma_1.prisma.doctor.findMany({
            include: { slots: true }
        });
        if (specialization)
            doctors = doctors.filter(doc => doc.specialization.toLowerCase() === specialization.toLowerCase());
        if (mode)
            doctors = doctors.filter(doc => doc.mode === mode);
        res.json({ success: true, doctors });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching doctors" });
    }
}
async function getDoctorSlots(req, res) {
    try {
        const { doctorId } = req.query;
        console.log(doctorId);
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId is required" });
        }
        const slots = await prisma_1.prisma.slot.findMany({
            where: {
                doctorId: doctorId,
            },
            orderBy: {
                startTime: "asc",
            },
        });
        return res.status(200).json({
            success: true,
            doctorId,
            slots,
        });
    }
    catch (error) {
        console.error("Error fetching doctor slots:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
//# sourceMappingURL=doctorController.js.map