// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
interface TeamMember {
  name: string;
  usn: string;
  phone?: string;
}

interface RegisterBody {
  fullName: string;
  usn: string;
  email: string;
  phone?: string;
  soloEvents: string[];
  teamEvents: string[];
  team: {
    name: string;
    members: TeamMember[];
  };
}

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

export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json();

    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const { fullName, soloEvents, teamEvents, team: teamData } = body;
    const allSlugs = [...soloEvents, ...teamEvents];
    const usn = body.usn.trim().toUpperCase(); // Normalize USN to uppercase for consistency
    const email = body.email.trim().toLowerCase(); // Normalize email to lowercase
    const phone = body.phone?.trim() ?? undefined;
    
    // Normalize team members' USN as well
    const normalizedTeam = {
      name: teamData.name,
      members: teamData.members.map((m) => ({
        name: m.name,
        usn: m.usn.trim().toUpperCase(),
        phone: m.phone?.trim() ?? undefined,
      })),
    };
    // Resolve slugs → real Event rows
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

    const eventMap = Object.fromEntries(eventRecords.map((e) => [e.slug, e]));
    const eventIds = eventRecords.map((e) => e.id);

    // Calculate total from DB prices
    const soloTotal = soloEvents.reduce(
      (sum, slug) => sum + eventMap[slug].price,
      0
    );
    const teamTotal = teamEvents.reduce(
      (sum, slug) => sum + (eventMap[slug]?.price ?? 0),
      0
    );
    const totalAmount = soloTotal + teamTotal;

    // Upsert participant
    const participant = await prisma.participant.upsert({
      where: { usn },
      create: {
        name: fullName,
        usn,
        email,
        emailVerified: true,
        phoneNo: phone,
      },
      update: { name: fullName, email, emailVerified: true, phoneNo: phone },
    });

    // Find confirmed registration IDs to protect
    const confirmedRegistrationIds = await prisma.registration
      .findMany({
        where: { participantId: participant.id, status: "CONFIRMED" },
        select: { id: true },
      })
      .then((r) => r.map((x) => x.id));

    // Block if any requested event is already CONFIRMED
    const confirmedParticipations = await prisma.participation.findMany({
      where: {
        participantId: participant.id,
        eventId: { in: eventIds },
        registrationId: { in: confirmedRegistrationIds },
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

    // Delete stale non-confirmed participations for these events
    await prisma.participation.deleteMany({
      where: {
        participantId: participant.id,
        eventId: { in: eventIds },
        ...(confirmedRegistrationIds.length > 0 && {
          registrationId: { notIn: confirmedRegistrationIds },
        }),
      },
    });

    // Cancel orphaned PAYMENT_PENDING registrations
    const orphaned = await prisma.registration.findMany({
      where: { participantId: participant.id, status: "PAYMENT_PENDING" },
      select: { id: true },
    });

    if (orphaned.length > 0) {
      const orphanedIds = orphaned.map((r) => r.id);
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: { registrationId: { in: orphanedIds } },
          data: { status: "FAILED" },
        }),
        prisma.registration.updateMany({
          where: { id: { in: orphanedIds } },
          data: { status: "CANCELLED" },
        }),
      ]);
    }

    // Create registration + participations + payment in one transaction
    const registration = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          participantId: participant.id,
          status: totalAmount === 0 ? "CONFIRMED" : "PAYMENT_PENDING",
        },
      });

      // Solo event participations
      for (const slug of soloEvents) {
        await tx.participation.create({
          data: {
            participantId: participant.id,
            eventId: eventMap[slug].id,
            teamId: null,
            registrationId: registration.id,
          },
        });
      }

      // Team event participations
      for (const slug of teamEvents) {
        const event = eventMap[slug];

        const teamRecord = await tx.team.create({
          data: {
            name: normalizedTeam.name,
            eventId: event.id,
            leaderId: participant.id,
          },
        });

        await tx.participation.create({
          data: {
            participantId: participant.id,
            eventId: event.id,
            teamId: teamRecord.id,
            registrationId: registration.id,
          },
        });

        for (const member of normalizedTeam.members) {
          const memberParticipant = await tx.participant.upsert({
            where: { usn: member.usn },
            create: {
              name: member.name,
              usn: member.usn,
              email: `${member.usn}@pending.techfest`,
              emailVerified: false,
              phoneNo: member.phone ?? undefined,
            },
            update: { name: member.name, phoneNo: member.phone ?? undefined },
          });

          const existing = await tx.participation.findUnique({
            where: {
              participantId_eventId: {
                participantId: memberParticipant.id,
                eventId: event.id,
              },
            },
          });

          if (!existing) {
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

      // ── KEY PART: store a placeholder order ID since no Razorpay ──────────
      // Format: MANUAL_{registrationId} — fits the @unique constraint cleanly.
      // When you switch to Razorpay later, real orders replace this pattern.
      await tx.payment.create({
        data: {
          registrationId: registration.id,
          razorpayOrderId: `MANUAL_${registration.id}`, // placeholder
          razorpayPaymentId: null,
          razorpaySignature: null,
          amount: totalAmount,
          currency: "INR",
          status: totalAmount === 0 ? "SUCCESS" : "PENDING",
        },
      });

      return registration;
    });

    // Fetch registration with participant for post-transaction work
    const fullRegistration = await prisma.registration.findUnique({
      where: { id: registration.id },
      include: { participant: true },
    });

    // If this was a free registration (amount === 0) send immediate email
    if (totalAmount === 0 && fullRegistration?.participant?.email) {
      await transporter.sendMail({
        from: `"Vertex - Lumous 2026" <${process.env.SMTP_USER}>`,
        to: fullRegistration.participant.email,
        subject: "Lumous 2026 Registration Confirmed ✅",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f6f8;">
          <div style="max-width: 500px; margin:auto; background:white; padding:30px; border-radius:10px;">
            <h2 style="color:#4f46e5;">Hello from Vertex 🚀</h2>
            <p>Your registration for <strong>Lumous 2026</strong> has been received and confirmed.</p>
            <p>This event was free of charge, so no payment is required.</p>
            <p style="margin-top:20px;">
              ⚠️ Please do <strong>not register multiple times</strong>.  We will notify you if any further action is needed.
            </p>
            <hr style="margin:25px 0;" />
            <p>If you have any queries, please contact:</p>
            <p>
              <strong>Team Lead 1:</strong> Harsh Pandey<br/>
              📞 9876543210
            </p>
            <p>
              <strong>Team Lead 2:</strong> Aditya Sharma<br/>
              📞 9123456780
            </p>
            <p style="margin-top:30px; font-size:12px; color:#777;">
              — Team Vertex | Lumous 2026
            </p>
          </div>
        </div>
        `,
      });
    }

    return NextResponse.json({
      registrationId: registration.id,
      amount: totalAmount,
    });

  } catch (error: unknown) {
    console.error("[POST /api/lumous-register]", error);
    console.error("meta:", (error as any)?.meta);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Already registered for one or more of these events." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}