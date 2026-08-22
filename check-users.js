const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Users:', await prisma.user.findMany());
  console.log('Admins:', await prisma.admin.findMany());
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
