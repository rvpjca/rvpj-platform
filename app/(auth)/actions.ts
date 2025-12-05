'use server'

import { Prisma, RoleKey, UserStatus } from "@prisma/client"
import { hash } from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth"

type ActionResult = {
  success?: string
  error?: string
}

export async function registerUser(input: RegisterSchema): Promise<ActionResult> {
  try {
    const payload = registerSchema.parse(input)

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (existingUser) {
      return { error: "Email is already registered." }
    }

    // New users get CLIENT role for client portal access
    let defaultRole = await prisma.role.findUnique({
      where: { key: RoleKey.CLIENT },
    })

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          key: RoleKey.CLIENT,
          name: "Client",
          description: "Client portal access for registered users",
        },
      })
    }

    await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        hashedPassword: await hash(payload.password, 12),
        roleId: defaultRole.id,
        status: UserStatus.ACTIVE,
      },
    })

    return { success: "Account created successfully. You can now log in." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid data submitted." }
    }

    console.error("[registerUser]", error)

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return { error: "Database connection is unavailable. Please start PostgreSQL and try again." }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This email is already registered. Try signing in instead." }
    }

    return { error: "Unable to complete registration right now. Please try again in a moment." }
  }
}

