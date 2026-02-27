import { PrismaClient, EventType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding events...");

  await prisma.event.upsert({
    where: { slug: "reeluminati" },
    update: {},
    create: {
      slug: "reeluminati",
      name: "Reeluminati",
      type: EventType.TEAM,
      price: 0, // ₹150
    },
  });


  console.log("✅ Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });