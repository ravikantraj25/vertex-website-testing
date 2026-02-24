// app/api/register/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

// ─── Razorpay client ──────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
  name: string;
  usn: string;
}

interface RegisterBody {
  fullName: string;
  usn: string;
  email: string;
  soloEvents: string[]; // slugs — e.g. ["coding", "paper"]
  teamEvents: string[]; // slugs — e.g. ["hackathon", "ideathon"]
  team: {
    name: string;
    members: TeamMember[];
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
const USN_REGEX = /^1ds\d{2}[a-z]{2}\d{3}$/i;

function validateBody(body: Partial<RegisterBody>): string | null {
  if (!body.fullName?.trim()) return "Full name is required";
  if (!body.usn || !USN_REGEX.test(body.usn)) return "Invalid USN format";
  if (!body.email?.includes("@")) return "Invalid email";
  if (!Array.isArray(body.soloEvents)) return "soloEvents must be an array";
  if (!Array.isArray(body.teamEvents)) return "teamEvents must be an array";
  if (body.soloEvents.length + body.teamEvents.length === 0)
    return "At least one event must be selected";

  if (body.teamEvents.length > 0) {
    if (!body.team?.name?.trim()) return "Team name is required";
    if (!Array.isArray(body.team.members) || body.team.members.length < 2)
      return "Team must have at least 2 members";
    if (body.team.members.length > 4)
      return "Team cannot have more than 4 members";
    for (const m of body.team.members) {
      if (!m.name?.trim()) return "All team members must have a name";
      if (!USN_REGEX.test(m.usn))
        return `Invalid USN for member: ${m.name}`;
    }
  }

  return null;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json();

    // ── Step 1: Validate request body ─────────────────────────────────────────
    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const { fullName, usn, email, soloEvents, teamEvents, team } = body;
    const allSlugs = [...soloEvents, ...teamEvents];

    // ── Step 2: Resolve slugs → real Event rows ────────────────────────────────
    // Frontend sends slug strings like "hackathon".
    // DB needs real ObjectIds. We look them all up in one query.
    const eventRecords = await prisma.event.findMany({
      where: { slug: { in: allSlugs } },
    });

    if (eventRecords.length !== allSlugs.length) {
      const found = new Set(eventRecords.map((e) => e.slug));
      const missing = allSlugs.filter((s) => !found.has(s));
      return NextResponse.json(
        { message: `Unknown events: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // slug → Event record (with real ObjectId)
    const eventMap = Object.fromEntries(eventRecords.map((e) => [e.slug, e]));
    const eventIds = eventRecords.map((e) => e.id);

    // ── Step 3: Calculate total from DB prices ─────────────────────────────────
    // Never trust frontend-sent amounts. Use DB prices as source of truth.
    const soloTotal = soloEvents.reduce(
      (sum, slug) => sum + eventMap[slug].price,
      0
    );
    // Team price is FLAT regardless of how many team events are selected.
    const teamTotal = teamEvents.length > 0 ? 40000 : 0;
    const totalAmount = soloTotal + teamTotal;

    // ── Step 4: Upsert the primary participant ─────────────────────────────────
    // emailVerified: true because OTP was verified before form submission.
    const participant = await prisma.participant.upsert({
      where: { usn },
      create: { name: fullName, usn, email, emailVerified: true },
      update: { name: fullName, email, emailVerified: true },
    });

    // ── Step 5: Cancel stale PAYMENT_PENDING registrations ────────────────────
    // THE FIX: this MUST run before the duplicate check below.
    //
    // When a previous payment failed or was abandoned, the registration sits in
    // PAYMENT_PENDING forever. Without this cleanup, the duplicate check at
    // Step 6 finds the old participations (linked to a PAYMENT_PENDING
    // registration) and wrongly blocks the user from re-registering.
    //
    // We find stale registrations for this participant that overlap with the
    // events being requested, cancel them and mark their payments FAILED,
    // so Step 6 only sees clean CONFIRMED registrations.

    const staleRegistrations = await prisma.registration.findMany({
      where: {
        participantId: participant.id,
        status: "PAYMENT_PENDING",
        // Only fetch registrations that overlap with the requested events
        participations: {
          some: {
            eventId: { in: eventIds },
          },
        },
      },
      select: { id: true },
    });

    if (staleRegistrations.length > 0) {
  const staleIds = staleRegistrations.map((r) => r.id);

  await prisma.$transaction([
    // 1. Delete Participation rows first (they reference Registration via FK)
    //    This removes the @@unique([participantId, eventId]) entries
    //    so the new registration can create fresh ones cleanly.
    prisma.participation.deleteMany({
      where: { registrationId: { in: staleIds } },
    }),

    // 2. Mark stale payments as FAILED
    prisma.payment.updateMany({
      where: { registrationId: { in: staleIds } },
      data: { status: "FAILED" },
    }),

    // 3. Cancel the stale registrations
    prisma.registration.updateMany({
      where: { id: { in: staleIds } },
      data: { status: "CANCELLED" },
    }),
  ]);

  console.log(
    `[register] Cleaned up ${staleIds.length} stale registration(s) for ${participant.id}`
  );
}

    // ── Step 6: Block CONFIRMED duplicates only ────────────────────────────────
    // At this point, all stale PAYMENT_PENDING registrations are CANCELLED.
    // We only block if a genuinely paid and confirmed registration exists.

    const confirmedParticipations = await prisma.participation.findMany({
      where: {
        participantId: participant.id,
        eventId: { in: eventIds },
        registration: { status: "CONFIRMED" },
      },
      include: { event: true },
    });

    if (confirmedParticipations.length > 0) {
      const names = confirmedParticipations.map((p) => p.event.name);
      return NextResponse.json(
        { message: `Already registered for: ${names.join(", ")}` },
        { status: 409 }
      );
    }

    // ── Step 7: Create Razorpay order ──────────────────────────────────────────
    // Done BEFORE the DB transaction so we have the orderId to persist.
    // receipt max 40 chars — timestamp gives enough uniqueness.
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `reg_${Date.now()}`,
      notes: { usn, email },
    });

    // ── Step 8: DB transaction ─────────────────────────────────────────────────
    // Everything below is atomic. If any step fails, nothing is committed.
    //
    // Schema facts that drive this logic:
    //   - Registration groups all participations from one form submission
    //   - Payment links 1:1 to Registration (no participantId on Payment)
    //   - Team is per-event (one Team row per team event, not one for all)
    //   - Participation has no status field — status lives on Registration
    //   - @@unique([participantId, eventId]) prevents double-participation
    //   - @@unique([name, eventId]) prevents duplicate team names per event

    await prisma.$transaction(async (tx) => {
      // ── 8a: Create Registration (the batch wrapper) ────────────────────────
      const registration = await tx.registration.create({
        data: {
          participantId: participant.id,
          status: "PAYMENT_PENDING",
        },
      });

      // ── 8b: Handle solo events ─────────────────────────────────────────────
      // Solo events: one Participation per event, no Team involved.
      for (const slug of soloEvents) {
        const event = eventMap[slug];
        await tx.participation.create({
          data: {
            participantId: participant.id,
            eventId: event.id,
            teamId: null,
            registrationId: registration.id,
          },
        });
      }

      // ── 8c: Handle team events ─────────────────────────────────────────────
      // Team.eventId means one Team record is scoped to one Event.
      // If user selected Hackathon + Ideathon → 2 Team records, same name.
      // @@unique([name, eventId]) allows same name across different events.

      for (const slug of teamEvents) {
        const event = eventMap[slug];

        // One Team per team event
        const teamRecord = await tx.team.create({
          data: {
            name: team.name,
            eventId: event.id,
            leaderId: participant.id,
          },
        });

        // Participation for the registrant (team leader)
        await tx.participation.create({
          data: {
            participantId: participant.id,
            eventId: event.id,
            teamId: teamRecord.id,
            registrationId: registration.id,
          },
        });

        // Participation for each additional team member
        for (const member of team.members) {
          const memberParticipant = await tx.participant.upsert({
            where: { usn: member.usn },
            create: {
              name: member.name,
              usn: member.usn,
              // Members don't have emails at registration time.
              // Use a placeholder — or make email optional in schema (email String?)
              email: `${member.usn.toLowerCase()}@placeholder.techfest`,
              emailVerified: false,
            },
            update: { name: member.name },
          });

          // Guard against @@unique([participantId, eventId]) crash
          // if this member is already in another team for the same event
          const existingParticipation = await tx.participation.findUnique({
            where: {
              participantId_eventId: {
                participantId: memberParticipant.id,
                eventId: event.id,
              },
            },
          });

          if (!existingParticipation) {
            await tx.participation.create({
              data: {
                participantId: memberParticipant.id,
                eventId: event.id,
                teamId: teamRecord.id,
                registrationId: registration.id,
              },
            });
          }
        }
      }

      // ── 8d: Create Payment record ──────────────────────────────────────────
      // Payment links to Registration only — schema has no participantId on Payment
      await tx.payment.create({
        data: {
          registrationId: registration.id,
          razorpayOrderId: razorpayOrder.id,
          amount: totalAmount,
          currency: "INR",
          status: "PENDING",
        },
      });
    });

    // ── Step 9: Return order details to frontend ───────────────────────────────
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
    });

  } catch (error: unknown) {
    console.error("[POST /api/register]", error);

    // Razorpay SDK throws objects with a statusCode field
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error
    ) {
      return NextResponse.json(
        { message: "Payment gateway error. Please try again." },
        { status: 502 }
      );
    }

    // Prisma unique constraint — race condition on double submit
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "You have already registered for one or more of these events." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}