import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { hashPassword, comparePassword } from "../utils/hash.ts";
import { createAccessToken } from "../utils/token.ts";

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

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
