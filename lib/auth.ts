import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { RoleKey, UserStatus } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const clientCredentialsSchema = z.object({
  panNumber: z.string().length(10),
  birthDate: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Staff/Admin login with Email & Password
    CredentialsProvider({
      id: "staff-login",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { role: true },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await compare(parsed.data.password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.key ?? RoleKey.VIEWER,
        };
      },
    }),
    
    // Client login with PAN & Birth Date
    CredentialsProvider({
      id: "client-login",
      name: "PAN & Birth Date",
      credentials: {
        panNumber: { label: "PAN Number", type: "text" },
        birthDate: { label: "Birth Date", type: "date" },
      },
      authorize: async (credentials) => {
        const parsed = clientCredentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { panNumber: parsed.data.panNumber.toUpperCase() },
          include: { role: true },
        });

        if (!user) {
          return null;
        }

        // Verify this is a client
        if (user.role?.key !== RoleKey.CLIENT) {
          return null;
        }

        // Check birth date
        if (!user.birthDate) {
          return null;
        }

        const userBirthDate = new Date(user.birthDate).toISOString().split("T")[0];
        const inputBirthDate = new Date(parsed.data.birthDate).toISOString().split("T")[0];

        if (userBirthDate !== inputBirthDate) {
          return null;
        }

        // Check if active
        if (user.status !== UserStatus.ACTIVE) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.key ?? RoleKey.CLIENT,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: RoleKey }).role ?? RoleKey.VIEWER;
      } else if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { role: true },
        });
        if (dbUser?.role?.key) {
          token.role = dbUser.role.key;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as RoleKey | undefined) ?? RoleKey.VIEWER;
      }
      return session;
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = () => getServerSession(authOptions);

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      employeeProfile: true,
    },
  });
}

