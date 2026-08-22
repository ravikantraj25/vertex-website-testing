const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "mytechnologyguide384@gmail.com";
  
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { emailId: email }
  });

  if (!existingAdmin) {
    const newAdmin = await prisma.admin.create({
      data: {
        emailId: email,
        usn: "admin-usn-1",
        phoneNo: "0000000000"
      }
    });
    console.log("Created Admin:", newAdmin);
  } else {
    console.log("Admin already exists:", existingAdmin);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
