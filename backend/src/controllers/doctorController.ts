import type { Request, Response } from "express";
import { hashPassword } from "../utils/hash.ts";
import { prisma } from "../lib/prisma.ts";

export async function registerDoctor(req: Request, res: Response) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            specialization,
            experience,
            consultationFee,
            modes,
            bio,
            qualifications,
        } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await hashPassword(password);

        const result = await prisma.$transaction(async (tx) => {
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
                    modes,
                    bio,
                    qualifications,
                    rating: 0,
                    totalReviews: 0,
                    isApproved: false,
                },
            });

            return { user, doctor };
        });

        res.status(201).json({
            success: true,
            message: "Doctor registered successfully. Awaiting admin approval.",
            user: { id: result.user.id, email: result.user.email, role: result.user.role },
            doctor: result.doctor,
        });
    } catch (error) {
        console.error("Error registering doctor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getDoctors(req: Request, res: Response) {
  try {
    const doctors = await prisma.doctor.findMany({
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
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

