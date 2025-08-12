import type { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/hash.ts";
import { prisma } from "../lib/prisma.ts";
import { createAccessToken } from "../utils/token.ts";

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

export async function createSlots(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { availability, slotDuration, effectiveFrom, effectiveTo, exceptions } = req.body;
  
      // Validate input
      if (!availability || !slotDuration) {
        return res.status(400).json({ 
          error: 'availability and slotDuration are required' 
        });
      }
  
      // Validate doctor exists
      const doctor = await prisma.doctor.findFirst({
        where: {
            id: doctorId as string
        }
      });
  
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
  
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of validDays) {
        if (!Array.isArray(availability[day])) {
          return res.status(400).json({ 
            error: `availability.${day} must be an array` 
          });
        }
      }
  
      // Create or update the availability slot
      const availabilityData = {
        doctorId,
        startTime: new Date(effectiveFrom || new Date()),
        endTime: new Date(effectiveTo || '2025-12-31'),
        mode: 'online', // Default mode, actual mode is in the pattern
        status: 'available',
        isRecurring: true,
        recurringPattern: {
          type: 'weekly',
          availability,
          slotDuration,
          effectiveFrom: effectiveFrom || new Date().toISOString().split('T')[0],
          effectiveTo: effectiveTo || '2025-12-31',
          exceptions: exceptions || []
        }
      };
  
      // Delete existing availability for this doctor
      await prisma.slot.deleteMany({
        where: {
          doctorId: as string,
          isRecurring: true
        }
      });
  
      // Create new availability record
      const slot = await prisma.slot.create({
        data: availabilityData
      });
  
      res.status(201).json({
        message: 'Doctor availability saved successfully',
        slotId: slot.id,
        availability: slot.recurringPattern
      });
  
    } catch (error) {
      console.error('Error saving availability:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
//   export async function getDoctorAvailability(req: Request, res: Response) {
//     try {
//       const { doctorId } = req.params;
  
//       const slot = await prisma.slot.findFirst({
//         where: {
//           doctorId,
//           isRecurring: true
//         },
//         select: {
//           id: true,
//           recurringPattern: true,
//           createdAt: true,
//           updatedAt: true
//         }
//       });
  
//       if (!slot) {
//         return res.status(404).json({ 
//           message: 'No availability found for this doctor' 
//         });
//       }
  
//       res.json({
//         doctorId,
//         slotId: slot.id,
//         ...slot.recurringPattern,
//         lastUpdated: slot.updatedAt
//       });
  
//     } catch (error) {
//       console.error('Error fetching availability:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   export async function getAvailableSlots(req, res) {
//     try {
//       const { doctorId } = req.params;
//       const { date, from, to } = req.query;
  
//       // Get doctor's availability pattern
//       const availabilitySlot = await prisma.slot.findFirst({
//         where: {
//           doctorId,
//           isRecurring: true
//         }
//       });
  
//       if (!availabilitySlot) {
//         return res.status(404).json({ message: 'No availability pattern found' });
//       }
  
//       const pattern = availabilitySlot.recurringPattern;
//       const startDate = from ? new Date(from) : new Date(date || new Date());
//       const endDate = to ? new Date(to) : new Date(startDate);
//       endDate.setDate(endDate.getDate() + (date ? 0 : 7)); // Default to 7 days if no end date
  
//       // Generate available slots dynamically
//       const availableSlots = generateAvailableSlots(pattern, startDate, endDate, doctorId);
  
//       // Filter out already booked slots
//       const bookedSlots = await prisma.appointment.findMany({
//         where: {
//           doctorId,
//           startTime: {
//             gte: startDate,
//             lte: endDate
//           },
//           status: {
//             in: ['pending', 'confirmed']
//           }
//         },
//         select: {
//           startTime: true,
//           endTime: true
//         }
//       });
  
//       // Remove booked time slots
//       const filteredSlots = availableSlots.filter(slot => {
//         return !bookedSlots.some(booked => 
//           slot.startTime.getTime() === booked.startTime.getTime()
//         );
//       });
  
//       res.json({
//         doctorId,
//         requestedPeriod: { from: startDate, to: endDate },
//         availableSlots: filteredSlots
//       });
  
//     } catch (error) {
//       console.error('Error generating available slots:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }


  export async function updateDoctorAvailability(req: Request, res: Response) {
    try {
      return await setDoctorAvailability(req, res);
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ error });
    }
  }
  