import { type RoleKey } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: RoleKey;
    } & DefaultSession["user"];
  }

  interface User {
    role?: { key: RoleKey } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: RoleKey;
  }
}

