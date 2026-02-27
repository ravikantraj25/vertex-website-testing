import { PrismaClient, EventType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding events...");

  await prisma.event.upsert({
    where: { slug: "trapezoid" },
    update: {},
    create: {
      slug: "trapezoid",
      name: "Trap E Zoid (Hardware escape room)",
      type: EventType.TEAM,
      price: 15000, // ₹150
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