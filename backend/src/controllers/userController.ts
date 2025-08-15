import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { createAccessToken, verifyAccessToken } from "../utils/token";
import { generateOTP } from "../services/otpGenerator";
import { sendOtpMail } from "../services/otpSender";
import getRedisClient from "../config/redis";

const redis = getRedisClient()

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

    const token = createAccessToken({ id: user.id, email: user.email, role: user.role, firstName: user.firstName })
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const token = req.token as string;
    if (!token) {
      return res.status(401).json({ success: false, error: "Token missing" });
    }

    let payload: { id: string; email: string };
    try {
      payload = verifyAccessToken(token) as { id: string; email: string };
    } catch {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role !== "patient") {
      return res.status(403).json({ success: false, error: "Only patients can book appointments" });
    }

    const {
      slotId,
      mode,
      consultationFee,
      symptoms,
      notes,
      paymentStatus
    } = req.body;

    // Validation
    if (!slotId || typeof slotId !== "string") {
      return res.status(400).json({ success: false, error: "Invalid or missing slotId" });
    }
    if (!mode || (mode !== "online" && mode !== "in_person")) {
      return res.status(400).json({ success: false, error: "Invalid or missing mode" });
    }
    if (
      consultationFee === undefined ||
      typeof consultationFee !== "number" ||
      consultationFee < 0
    ) {
      return res.status(400).json({ success: false, error: "Invalid or missing consultationFee" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }

    const lockKey = `slotLock:${slotId}`;

    const lockedBy = await redis.get(lockKey);
    if (!lockedBy) {
      return res.status(409).json({ success: false, error: "Slot is not locked or lock expired" });
    }
    if (lockedBy !== user.id) {
      return res.status(409).json({ success: false, error: "Slot is locked by another user" });
    }

    const appointment = await prisma.$transaction(async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          slotId,
          patientId: user.id,
          doctorId: slot.doctorId,
          status: "confirmed",
          mode,
          consultationFee,
          symptoms: symptoms || null,
          confirmedAt: new Date()
        },
      });

      await redis.del(lockKey);

      return createdAppointment;
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function lockSlot(req: Request, res: Response) {
  try {
    const token = req.token as string;
    if (!token) {
      return res.status(401).json({ success: false, error: "Token missing" });
    }

    let payload: { id: string; email: string };
    try {
      payload = verifyAccessToken(token) as { id: string; email: string };
    } catch {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const { slotId } = req.body;
    if (!slotId || typeof slotId !== "string") {
      return res.status(400).json({ success: false, error: "Invalid or missing slotId" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }

    const lockKey = `slotLock:${slotId}`;

    // CRITICAL DEBUG INFO
    console.log("=== LOCK SLOT DEBUG ===");
    console.log(`User email: ${payload.email}`);
    console.log(`Slot ID: ${slotId}`);
    console.log(`Lock key: ${lockKey}`);
    console.log(`Are email and slotId the same? ${payload.email === slotId}`);
    
    // Check what keys exist in Redis before locking
    const allKeys = await redis.keys("*");
    console.log(`All Redis keys before locking:`, allKeys);

    const existingLock = await redis.get(lockKey);
    if (existingLock) {
      return res.status(409).json({ success: false, error: "Slot already locked" });
    }

    const ttlSeconds = 10 * 60;
    await redis.set(lockKey, payload.id, { ex: ttlSeconds });

    // Verify the lock was set correctly
    const verifyLock = await redis.get(lockKey);
    console.log(`Lock verification - Key: ${lockKey}, Value: ${verifyLock}`);
    
    // Check all keys after locking
    const allKeysAfter = await redis.keys("*");
    console.log(`All Redis keys after locking:`, allKeysAfter);
    console.log("=== END LOCK SLOT DEBUG ===");

    return res.status(200).json({ success: true, message: "Slot locked successfully" });
  } catch (error) {
    console.error("Error locking slot:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function sendOtpToMail(req: Request, res: Response) {
  try {
    const token = req.token as string;
    const { email } = verifyAccessToken(token) as { email: string }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }

    const otp = generateOTP(6);
    const otpKey = `otp:${email}`;

    console.log("=== SEND OTP DEBUG ===");
    console.log(`User email: ${email}`);
    console.log(`OTP key: ${otpKey}`);
    console.log(`OTP value: ${otp}`);
    
    const allKeysBefore = await redis.keys("*");
    console.log(`All Redis keys BEFORE storing OTP:`, allKeysBefore);
    
    const slotLockPattern = await redis.keys("slotLock:*");
    console.log(`Existing slot locks:`, slotLockPattern);
    
    for (const key of slotLockPattern) {
      const value = await redis.get(key);
      console.log(`Slot lock ${key} = ${value}`);
    }

    try {
      await redis.set(otpKey, otp, { ex: 600 }); 
      console.log(`OTP stored with key: ${otpKey}`);
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
      return res.status(500).json({ success: false, error: "Failed to store OTP. Please try again." });
    }

    // Check what keys exist AFTER storing OTP
    const allKeysAfter = await redis.keys("*");
    console.log(`All Redis keys AFTER storing OTP:`, allKeysAfter);
    
    // Check if slot locks still exist
    const slotLockPatternAfter = await redis.keys("slotLock:*");
    console.log(`Slot locks after OTP storage:`, slotLockPatternAfter);
    
    // Check the values of slot locks after OTP storage
    for (const key of slotLockPatternAfter) {
      const value = await redis.get(key);
      console.log(`Slot lock after OTP ${key} = ${value}`);
    }
    console.log("=== END SEND OTP DEBUG ===");

    const result = await sendOtpMail(email, otp);
    console.log(result);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    console.error("sendOtpToMail error:", err);
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

    const otpKey = `otp:${email}`;

    // CRITICAL DEBUG INFO
    console.log("=== VERIFY OTP DEBUG ===");
    console.log(`User email: ${email}`);
    console.log(`OTP key: ${otpKey}`);
    console.log(`Received OTP: ${otp}`);
    
    // Check what keys exist before verification
    const allKeysBefore = await redis.keys("*");
    console.log(`All Redis keys before verification:`, allKeysBefore);

    let storedOtp: string | null;
    try {
      storedOtp = await redis.get(otpKey);
      if(!storedOtp) throw new Error("OTP is expired");
      console.log("Redis stored OTP: " + storedOtp);
      console.log("User provided OTP: " + otp);
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
      return res.status(500).json({ error: "Failed to verify OTP. Please try again." });
    }

    if (!storedOtp) 
      return res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });

    if (storedOtp.toString() !== otp) 
      return res.status(400).json({ success: false, error: "Invalid OTP. Please try again." });

    try {
      await redis.del(otpKey);
      console.log(`Deleted OTP key: ${otpKey}`);
    } catch (delErr) {
      console.warn("Failed to delete OTP from Redis:", delErr);
    }

    // Check what keys exist after OTP deletion
    const allKeysAfter = await redis.keys("*");
    console.log(`All Redis keys after OTP deletion:`, allKeysAfter);
    console.log("=== END VERIFY OTP DEBUG ===");

    try {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true }
      })
    } catch(error) {
      console.error("Error verifying user:", error);
      return res.status(500).json({ success: false, error: "Failed to verify user" });
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
