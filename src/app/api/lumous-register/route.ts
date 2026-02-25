// app/api/lumous-register/route.ts
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
  eventSlug: string; // Strictly single event 
  team?: {
    name?: string;
    members?: TeamMember[];
  };
}

const USN_REGEX = /^1ds\d{2}[a-z]{2}\d{3}$/i;

// Rule map defining team sizes and pricing logic
const eventRules: Record<
  string,
  { min?: number; max?: number; exact?: number; feeType: string; fee?: number }
> = {
    ideathon: { min: 1, max: 4, feeType: "free" },
  bgmi: { min: 1, max: 4, feeType: "per_person", fee: 50 },
  igp: { min: 1, max: 2, feeType: "free" },
  reel: { min: 1, max: 4, feeType: "free" },
  cricket: { min: 8, max: 11, feeType: "per_team", fee: 150 },
  volleyball: { min: 6, max: 9, feeType: "per_team", fee: 100 },
  lagori: { exact: 6, feeType: "free" },
  dodgeball: { exact: 6, feeType: "free" },
  cooking: { exact: 2, feeType: "per_team", fee: 50 },
};

function validateBody(body: Partial<RegisterBody>): string | null {
  if (!body.fullName?.trim()) return "Full name is required";
  if (!body.usn || !USN_REGEX.test(body.usn)) return "Invalid USN format";
  if (!body.email?.includes("@")) return "Invalid email";
  if (!body.eventSlug?.trim()) return "An event must be selected";

  const members = body.team?.members;
  if (members && Array.isArray(members)) {
    for (const m of members) {
      if (!m.name?.trim()) return "All team members must have a name";
      if (!USN_REGEX.test(m.usn)) return `Invalid USN for member: ${m.name}`;
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

    const { fullName, eventSlug, team: teamData } = body;
    const usn = body.usn.trim().toUpperCase();
    const email = body.email.trim().toLowerCase();
    const phone = body.phone?.trim() ?? undefined;

    const normalizedMembers: TeamMember[] = Array.isArray(teamData?.members)
      ? teamData!.members.map((m) => ({
          name: m.name.trim(),
          usn: m.usn.trim().toUpperCase(),
          phone: m.phone?.trim() ?? undefined,
        }))
      : [];

    const totalMembers = 1 + normalizedMembers.length; // 1 (Leader) + explicit members
    const isTeamRegistration = totalMembers > 1;

    // 1. Resolve event
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    // 2. Enforce Event Rules
    const rule = eventRules[eventSlug.toLowerCase()];
    if (!rule) {
      return NextResponse.json({ message: "Rules for this event are not configured." }, { status: 500 });
    }

    if (rule.exact && totalMembers !== rule.exact) {
      return NextResponse.json(
        { message: `Invalid team size. ${event.name} requires exactly ${rule.exact} members.` },
        { status: 400 }
      );
    } else if (rule.min && rule.max && (totalMembers < rule.min || totalMembers > rule.max)) {
      return NextResponse.json(
        { message: `Invalid team size. ${event.name} requires between ${rule.min} and ${rule.max} members.` },
        { status: 400 }
      );
    }

    if (isTeamRegistration && !teamData?.name?.trim()) {
      return NextResponse.json({ message: "Team name is required." }, { status: 400 });
    }

    // 3. Calculate Amount
    let amountINR = 0;
    if (rule.feeType === "per_person" && rule.fee) {
      amountINR = rule.fee * totalMembers;
    } else if (rule.feeType === "per_team" && rule.fee) {
      amountINR = rule.fee;
    }
    const totalAmount = amountINR * 100; // Convert to paise for DB

    // 4. Upsert participant (Leader)
    const participant = await prisma.participant.upsert({
      where: { usn },
      create: { name: fullName, usn, email, emailVerified: true, phoneNo: phone },
      update: { name: fullName, email, emailVerified: true, phoneNo: phone },
    });

    // 5. Block duplicates for confirmed registrations
    const confirmedRegistrationIds = await prisma.registration
      .findMany({
        where: { participantId: participant.id, status: "CONFIRMED" },
        select: { id: true },
      })
      .then((r) => r.map((x) => x.id));

    const confirmedParticipation = await prisma.participation.findFirst({
      where: {
        participantId: participant.id,
        eventId: event.id,
        registrationId: { in: confirmedRegistrationIds },
      },
    });

    if (confirmedParticipation) {
      return NextResponse.json(
        { message: `Already registered for ${event.name}.` },
        { status: 409 }
      );
    }

    // 6. Delete stale non-confirmed participations for this specific event
    await prisma.participation.deleteMany({
      where: {
        participantId: participant.id,
        eventId: event.id,
        ...(confirmedRegistrationIds.length > 0 && {
          registrationId: { notIn: confirmedRegistrationIds },
        }),
      },
    });

    // 7. Cancel orphaned PAYMENT_PENDING registrations
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

    // 8. Create DB records in transaction
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          participantId: participant.id,
          // Paid events default to PAYMENT_PENDING to wait for the screenshot upload
          status: totalAmount === 0 ? "CONFIRMED" : "PAYMENT_PENDING",
        },
      });

      let teamId = null;

      // Handle Team Creation if multiple members
      if (isTeamRegistration) {
        const teamRecord = await tx.team.create({
          data: {
            name: teamData!.name!.trim(),
            eventId: event.id,
            leaderId: participant.id,
          },
        });
        teamId = teamRecord.id;

        // Process other members
        for (const member of normalizedMembers) {
          const memberParticipant = await tx.participant.upsert({
            where: { usn: member.usn },
            create: {
              name: member.name,
              usn: member.usn,
              email: `${member.usn.toLowerCase()}@pending.techfest`,
              emailVerified: false,
              phoneNo: member.phone ?? undefined,
            },
            update: { name: member.name, phoneNo: member.phone ?? undefined },
          });

          // Create participation for member
          await tx.participation.create({
            data: {
              participantId: memberParticipant.id,
              eventId: event.id,
              teamId: teamId,
              registrationId: reg.id,
            },
          });
        }
      }

      // Create participation for the Leader
      await tx.participation.create({
        data: {
          participantId: participant.id,
          eventId: event.id,
          teamId: teamId,
          registrationId: reg.id,
        },
      });

      // --- PAYMENT RECORD ---
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          razorpayOrderId: `MANUAL_${Date.now()}_${reg.id}`,
          razorpayPaymentId: null, // Left null. Will be populated by /api/upload-payment-ss
          amount: totalAmount,
          currency: "INR",
          status: totalAmount === 0 ? "SUCCESS" : "PENDING",
        },
      });

      return reg;
    });

    // 9. Send confirmation email for FREE registrations only
    if (totalAmount === 0 && email) {
      await transporter.sendMail({
        from: `"Vertex - Lumous 2026" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Lumous 2026 Registration Confirmed ✅",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f6f8;">
          <div style="max-width: 500px; margin:auto; background:white; padding:30px; border-radius:10px;">
            <h2 style="color:#4f46e5;">Hello from Vertex 🚀</h2>
            <p>Your registration for <strong>${event.name} (Lumous 2026)</strong> has been received and confirmed.</p>
            <p>This event was free of charge, so no payment is required.</p>
            <p style="margin-top:20px;">
              ⚠️ Please do <strong>not register multiple times</strong>.
            </p>
            <hr style="margin:25px 0;" />
            <p>If you have any queries, please contact:</p>
            <p><strong>Team Lead 1:</strong> Naman Singh<br/>📞 8334072002</p>
            <p><strong>Team Lead 2:</strong> Shefali<br/>📞 8867429955</p>
              <p>
             <strong>Technical issues? </strong> Harsh <br/>
             📞 8269273139
            </p>
            <p style="margin-top:30px; font-size:12px; color:#777;">— Team Vertex | Lumous 2026</p>
          </div>
        </div>
        `,
      });
    }

    // Return exact signature expected by your frontend apiRegister function
    return NextResponse.json({
      registrationId: registration.id,
      amount: totalAmount, 
      eventName: event.name 
    });

  } catch (error: unknown) {
    console.error("[POST /api/lumous-register]", error);

    // Handle Prisma Unique Constraint Violations (Duplicate Team Name or USN for Event)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A participant or team name is already registered for this event." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
