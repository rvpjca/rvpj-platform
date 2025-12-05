import { PrismaClient, RoleKey, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { key: RoleKey.ADMIN, name: "Administrator", description: "Full access to all features" },
    { key: RoleKey.PARTNER, name: "Partner", description: "Can manage content and users" },
    { key: RoleKey.MANAGER, name: "Manager", description: "Can manage operations" },
    { key: RoleKey.STAFF, name: "Staff", description: "Can manage own tasks" },
    { key: RoleKey.VIEWER, name: "Viewer", description: "Read-only access" },
    { key: RoleKey.CLIENT, name: "Client", description: "Client portal access" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { description: role.description },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@rvpj.in";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe@123";

  const adminRole = await prisma.role.findUnique({
    where: { key: RoleKey.ADMIN },
  });

  if (!adminRole) {
    throw new Error("Admin role missing after seed.");
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Platform Administrator",
      hashedPassword: await hash(adminPassword, 12),
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  console.info(`Seed complete. Admin login → ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

