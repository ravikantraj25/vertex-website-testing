// scripts/cleanup-all-registrations.ts
import { prisma } from "@/lib/prisma";

async function cleanupAll() {
  console.log("\n========== CLEANUP STARTED ==========");

  // Order matters — delete dependents first

  const participations = await prisma.participation.deleteMany({});
  console.log(`✓ Deleted ${participations.count} participation(s)`);

  const teams = await prisma.team.deleteMany({});
  console.log(`✓ Deleted ${teams.count} team(s)`);

  const payments = await prisma.payment.deleteMany({});
  console.log(`✓ Deleted ${payments.count} payment(s)`);

  const registrations = await prisma.registration.deleteMany({});
  console.log(`✓ Deleted ${registrations.count} registration(s)`);

  const participants = await prisma.participant.deleteMany({});
  console.log(`✓ Deleted ${participants.count} participant(s)`);

  console.log("========== CLEANUP COMPLETE ==========\n");
}

cleanupAll()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });