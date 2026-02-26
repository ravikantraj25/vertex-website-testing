import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.upsert({
    where: {
      emailId: "darshilmahraur3@gmail.com", // change to your real email
    },
    update: {},
    create: {
      usn: "1ds23et043",        // change this
      emailId: "darshilmahraur3@gmail.com", // change this
      phoneNo: "9876543210",        // change this
    },
  });

  console.log("✅ Admin seeded:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });