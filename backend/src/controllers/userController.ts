import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { hashPassword, comparePassword } from "../utils/hash.ts";
import { createAccessToken, verifyAccessToken } from "../utils/token.ts";
import { generateOTP } from "../services/otpGenerator.ts";
import { sendOtpMail } from "../services/otpSender.ts";
import { Redis } from "@upstash/redis";
import getRedisClient from "../config/redis.ts";

export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: role || "patient"
      }
    });

    const token = createAccessToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false,message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createAccessToken({ id: user.id, email: user.email, role: user.role })
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const token = req.token as string;
    console.log(req.token)
    if (!token) {
      return res.status(401).json({ success: false, error: "Token missing" });
    }

    let payload: { id: string, email: string };
    try {
      payload = verifyAccessToken(token) as { id: string, email: string }
    } catch (err) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return res.status(404).json({ success: false,error: "User not found" });
    }

    if (user.role !== "patient") {
      return res.status(403).json({ success: false,error: "Only patients can book appointments" });
    }

    const { slotId, mode, consultationFee } = req.body;

    if (!slotId || typeof slotId !== "string") {
      return res.status(400).json({ success: false,error: "Invalid or missing slotId" });
    }
    if (!mode || (mode !== "online" && mode !== "in_person")) {
      return res.status(400).json({ success: false,error: "Invalid or missing mode" });
    }
    if (
      consultationFee === undefined ||
      typeof consultationFee !== "number" ||
      consultationFee < 0
    ) {
      return res.status(400).json({ success: false,error: "Invalid or missing consultationFee" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ success: false,error: "Slot not found" });
    }

    const appointment = await prisma.appointment.create({
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
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ success: false,error: "Internal server error" });
  }
}

export async function sendOtpToMail(req: Request, res: Response) {
  try {
    const token = req.token as string;
    const { email } = verifyAccessToken(token) as { email: string }
    console.log("$$$$$ " + email)
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }

    const otp = generateOTP(6);

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })

    try {
      await redis.set(email, otp, { ex: 600 }); // 10 minutes
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
      return res.status(500).json({ success: false, error: "Failed to store OTP. Please try again." });
    }

    const result = await sendOtpMail(email, otp);
    console.log(result);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    console.error("verifyAccount error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const token = req.token as string;
    const { email } = verifyAccessToken(token) as { email: string };

    if (!email) 
      return res.status(400).json({ success: false, error: "Valid email is required" });

    const { otp } = req.headers as { otp: string };
    if (!otp) 
      return res.status(400).json({ success: false, error: "OTP is required" });

    const redis = getRedisClient()

    let storedOtp: string | null;
    try {
      storedOtp = await redis.get(email);
      if(!storedOtp) throw new Error("OTP is expired");
      console.log("Redis otp: " + storedOtp)
      console.log("User otp: " + otp.length)
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
      return res.status(500).json({ error: "Failed to verify OTP. Please try again." });
    }

    if (!storedOtp) 
      return res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });

    if (storedOtp.toString() !== otp) 
      return res.status(400).json({ success: false, error: "Invalid OTP. Please try again." });

    try {
      await redis.del(email);
    } catch (delErr) {
      console.warn("Failed to delete OTP from Redis:", delErr);
    }

    try {
      await prisma.user.update({
        where: {
          email
        },
        data: {
          isVerified: true
        }
      })
    } catch(error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ success: false, error: "Failed to verify user" });
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getAppointments(req: Request, res: Response) {
  try {
    const token = req.token as string;
    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    const user = verifyAccessToken(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const appointments = await prisma.appointment.findMany({
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
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
