import "dotenv/config"; 
import { PrismaClient } from "@prisma/client";
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("❌ Error: DATABASE_URL is missing from process.env");
}


const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...");

  // Use the data you already have
  await prisma.user.upsert({
    where: { email: "harshpandey12378@gmail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "harshpandey12378@gmail.com",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "harshpandey12378@gmail.com" },
    update: {},
    create: {
      name: "Test User",
      email: "uharshpandey12378@gmail.com",
      role: "USER",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });