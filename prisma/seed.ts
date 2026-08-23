import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { EventType } from "@prisma/client";
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
  await prisma.event.upsert({
    where: { slug: "protopitch" },
    update: {},
    create: {
      slug: "protopitch",
      name: "Protopitch",
      type: EventType.TEAM,
      price: 10000, // ₹100
    },
  });

  await prisma.event.upsert({
    where: { slug: "embedded-enigma" },
    update: {},
    create: {
      slug: "embedded-enigma",
      name: "Embedded Enigma",
      type: EventType.TEAM,
      price: 0,
    },
  });

  await prisma.event.upsert({
    where: { slug: "vector-chase" },
    update: {},
    create: {
      slug: "vector-chase",
      name: "Vector Chase",
      type: EventType.TEAM,
      price: 0,
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
  });