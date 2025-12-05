"use server";

import { Prisma, RoleKey, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Validation schema for client registration
const clientRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  panNumber: z
    .string()
    .length(10, "PAN must be exactly 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
  birthDate: z.string().min(1, "Birth date is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ActionResult = {
  success?: string;
  error?: string;
};

export async function registerClient(input: {
  name: string;
  email: string;
  phone?: string;
  panNumber: string;
  birthDate: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const payload = clientRegisterSchema.parse(input);

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingEmail) {
      return { error: "Email is already registered." };
    }

    // Check if PAN already exists
    const existingPan = await prisma.user.findUnique({
      where: { panNumber: payload.panNumber.toUpperCase() },
    });

    if (existingPan) {
      return { error: "PAN number is already registered." };
    }

    // Get or create CLIENT role
    let clientRole = await prisma.role.findUnique({
      where: { key: RoleKey.CLIENT },
    });

    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: {
          key: RoleKey.CLIENT,
          name: "Client",
          description: "Client portal access",
        },
      });
    }

    // Create user
    await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        panNumber: payload.panNumber.toUpperCase(),
        birthDate: new Date(payload.birthDate),
        hashedPassword: await hash(payload.password, 12),
        roleId: clientRole.id,
        status: UserStatus.ACTIVE,
      },
    });

    return { success: "Account created successfully! You can now login." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid data submitted." };
    }

    console.error("[registerClient]", error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return { error: "Database connection unavailable. Please try again." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This email or PAN is already registered." };
    }

    return { error: "Unable to complete registration. Please try again." };
  }
}

// Validate client login with PAN and Birth Date
export async function validateClientLogin(input: {
  panNumber: string;
  birthDate: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { panNumber: input.panNumber.toUpperCase() },
      include: { role: true },
    });

    if (!user) {
      return { success: false, error: "PAN number not found" };
    }

    // Check if user is a client
    if (user.role?.key !== RoleKey.CLIENT) {
      return { success: false, error: "This login is only for clients" };
    }

    // Check birth date
    if (!user.birthDate) {
      return { success: false, error: "Account not properly set up. Contact support." };
    }

    const userBirthDate = new Date(user.birthDate).toISOString().split("T")[0];
    const inputBirthDate = new Date(input.birthDate).toISOString().split("T")[0];

    if (userBirthDate !== inputBirthDate) {
      return { success: false, error: "Invalid birth date" };
    }

    if (user.status !== UserStatus.ACTIVE) {
      return { success: false, error: "Your account is not active. Contact support." };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("[validateClientLogin]", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}



