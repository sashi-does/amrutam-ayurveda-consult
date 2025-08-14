import type { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/hash";
import { prisma } from "../lib/prisma";
import { createAccessToken } from "../utils/token";

// For Doctor
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
      mode,
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

    const token = createAccessToken({
        userId: result.user.id,
        role: result.user.role,
        email: result.user.email,
      })

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully. Awaiting admin approval.",
      token,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      doctor: result.doctor,
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginDoctor(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
  
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.role !== "doctor") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const passwordMatch = await comparePassword(password,  user.password)
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = createAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      })
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}

export async function createSlot(req: Request, res: Response) {
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
  
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });
  
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
  
      if (!doctor.isActive || !doctor.isApproved) {
        return res.status(403).json({ error: "Doctor is not active or approved" });
      }
  
      const slot = await prisma.slot.create({
        data: {
          doctorId,
          startTime: start,
          endTime: end,
        },
      });
  
      return res.status(201).json(slot);
    } catch (error) {
      console.error("Error creating slot:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

// For Admin
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

// For Patients
export async function getFilteredDoctors(req: Request, res: Response) {
    try {
      const { specialization, mode } = req.query as { specialization: string, mode: string };
  
      let doctors = await prisma.doctor.findMany({
        include: { slots: true }
      });
  
      if (specialization)
        doctors = doctors.filter(doc => 
          doc.specialization.toLowerCase() === specialization.toLowerCase()
        );

      if (mode) 
        doctors = doctors.filter(doc => 
          doc.mode === mode
        );
      

      res.json({ success: true, doctors });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching doctors" });
    }
}

export async function getDoctorSlots(req: Request, res: Response) {
    try {
      const { doctorId } = req.query;
      console.log(doctorId)
  
      if (!doctorId) {
        return res.status(400).json({ success: false, message: "doctorId is required" });
      }
  
      const slots = await prisma.slot.findMany({
        where: {
          doctorId: doctorId as string,
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
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  