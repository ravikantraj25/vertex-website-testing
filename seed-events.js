const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EVENTS = [
  { slug: "bgmi", name: "BGMI", type: "TEAM", price: 5000 },
  { slug: "reeluminati", name: "Reeluminati", type: "TEAM", price: 0 },
  { slug: "volleyball", name: "Volleyball (Girls)", type: "TEAM", price: 10000 },
  { slug: "lagori", name: "Lagori", type: "TEAM", price: 0 },
  { slug: "dodgeball", name: "Dodgeball", type: "TEAM", price: 0 },
  { slug: "cooking", name: "Creative Bites: No Fire Edition", type: "TEAM", price: 5000 }
];

async function main() {
  console.log("Seeding events...");
  for (const event of EVENTS) {
    const existing = await prisma.event.findUnique({
      where: { slug: event.slug }
    });

    if (!existing) {
      const created = await prisma.event.create({
        data: event
      });
      console.log(`Created event: ${created.name} (${created.slug})`);
    } else {
      console.log(`Event already exists: ${existing.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
