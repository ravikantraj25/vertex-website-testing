import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- ADMIN ----------
  const admin = await prisma.admin.create({
    data: {
      usn: "1ds23et045",
      emailId: "harshpandey12378@gmail.com",
      phoneNo: "9999999999",
    },
  });

  console.log("✅ Admin created:", admin);

  // ---------- USER ----------
  const user = await prisma.user.create({
    data: {
      usn: "1ds23et045",
      emailId: "harshpandey12378@gmail.com",
      phoneNo: "8888888888",
      eventIds: [], // required array field for Mongo relations
    },
  });

  console.log("✅ User created:", user);

  console.log("🌱 Seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
