import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Admin...");

  const admin = await prisma.admin.create({
    data: {
      usn: "1DS23ET101",
      emailId: "shefalibadgi@gmail.com",
      phoneNo: "9876543210",
    },
  });

  console.log("✅ Admin created:", admin);
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });