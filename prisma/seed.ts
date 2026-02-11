import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("❌ Error: DATABASE_URL is missing from process.env");
}


const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Admin user (goes into Admin table)
  await prisma.admin.upsert({
    where: { emailId: "harshpandey12378@gmail.com" },
    update: {},
    create: {
      usn: "ADMIN001",
      emailId: "harshpandey12378@gmail.com",
      phoneNo: "0000000000",
    },
  });

  // Seed regular User (goes into User table)
  await prisma.user.upsert({
    where: { emailId: "testuser@gmail.com" },
    update: {},
    create: {
      usn: "USER001",
      emailId: "testuser@gmail.com",
      phoneNo: "1111111111",
    },
  });
  await prisma.user.upsert({
    where: { emailId: "shashankchakraborty712005@gmail.com" },
    update: {},
    create: {
      usn: "USER002",
      emailId: "shashankchakraborty712005@gmail.com",
      phoneNo: "1234567892",
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