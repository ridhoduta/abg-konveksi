
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const kasirRole = await prisma.role.upsert({
    where: { name: "KASIR" },
    update: {},
    create: { name: "KASIR" },
  });


  const hashedPassword = await bcrypt.hash("admin123", 10);
  const kasirHashPassword = await bcrypt.hash("kasir123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      username: "kasir",
      password: kasirHashPassword,
      roleId: kasirRole.id,
    },
  });

  console.log("Seed successful!");
  console.log("Admin user created: admin / admin123");
  console.log("Kasir user created: kasir / kasir123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
