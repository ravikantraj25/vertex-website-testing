import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.upsert({
    where: {
      emailId: "harshpandey12378@gmail.com", // change to your real email
    },
    update: {},
    create: {
      usn: "1ds23et045",        // change this
      emailId: "harshpandey12378@gmail.com", // change this
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