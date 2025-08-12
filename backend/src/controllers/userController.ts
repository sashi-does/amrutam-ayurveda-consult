import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { hashPassword, comparePassword } from "../utils/hash.ts";
import { createAccessToken, verifyAccessToken } from "../utils/token.ts";

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
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(401).json({ error: "Token missing" });
    }

    let payload: { id: string, email: string };
    try {
      payload = verifyAccessToken(token) as { id: string, email: string }
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can book appointments" });
    }

    const { slotId, mode, consultationFee } = req.body;

    if (!slotId || typeof slotId !== "string") {
      return res.status(400).json({ error: "Invalid or missing slotId" });
    }
    if (!mode || (mode !== "online" && mode !== "in_person")) {
      return res.status(400).json({ error: "Invalid or missing mode" });
    }
    if (
      consultationFee === undefined ||
      typeof consultationFee !== "number" ||
      consultationFee < 0
    ) {
      return res.status(400).json({ error: "Invalid or missing consultationFee" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
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

    res.status(201).json({ appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}



  