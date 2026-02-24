import { PrismaClient, EventType } from "@prisma/client";

const prisma = new PrismaClient();

const events = [
  // Solo events
  {
    slug: "coding",
    name: "Coding Contest",
    type: EventType.SOLO,
    price: 10000,        // ₹100 in paise
  },
  {
    slug: "paper",
    name: "Paper Presentation",
    type: EventType.SOLO,
    price: 10000,
  },
  // Team events
  {
    slug: "hackathon",
    name: "Hackathon",
    type: EventType.TEAM,
    price: 40000,        // ₹400 in paise — stored for reference
  },
  {
    slug: "ideathon",
    name: "Ideathon",
    type: EventType.TEAM,
    price: 40000,
  },
  {
    slug: "circuit",
    name: "Circuit Design",
    type: EventType.TEAM,
    price: 40000,
  },
];

async function main() {
  console.log("Seeding events...");

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        name: event.name,
        price: event.price,
      },
      create: event,
    });
    console.log(`✓ ${event.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());