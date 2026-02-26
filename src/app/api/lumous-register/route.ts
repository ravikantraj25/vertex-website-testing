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
  eventSlug: string;
  team?: {
    name?: string;
    members?: TeamMember[];
  };
}

const USN_REGEX = /^1ds\d{2}[a-z]{2}\d{3}$/i;

const eventRules: Record<
  string,
  { min?: number; max?: number; exact?: number; feeType: string; fee?: number }
> = {
    ideathon: { min: 1, max: 3, feeType: "free" },
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
  if (!body.fullName?.trim())       return "Full name is required";
  if (!body.usn || !USN_REGEX.test(body.usn)) return "Invalid USN format";
  if (!body.email?.includes("@"))   return "Invalid email";
  if (!body.eventSlug?.trim())      return "An event must be selected";

  const members = body.team?.members;
  if (members && Array.isArray(members)) {
    for (const m of members) {
      if (!m.name?.trim())          return "All team members must have a name";
      if (!USN_REGEX.test(m.usn))   return `Invalid USN for member: ${m.name}`;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json();

    // ── 1. Basic field validation ────────────────────────────────────────────
    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const { fullName, eventSlug, team: teamData } = body;
    const usn   = body.usn.trim().toUpperCase();
    const email = body.email.trim().toLowerCase();
    const phone = body.phone?.trim() ?? undefined;

    const normalizedMembers: TeamMember[] = Array.isArray(teamData?.members)
      ? teamData!.members.map((m) => ({
          name:  m.name.trim(),
          usn:   m.usn.trim().toUpperCase(),
          phone: m.phone?.trim() ?? undefined,
        }))
      : [];

    const totalMembers     = 1 + normalizedMembers.length; // leader + extra members
    const isTeamRegistration = totalMembers > 1;

    // ── 2. Resolve event ─────────────────────────────────────────────────────
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    // ── 3. Resolve & enforce event rules ─────────────────────────────────────
    const rule = eventRules[eventSlug.toLowerCase()];
    if (!rule) {
      return NextResponse.json(
        { message: "Rules for this event are not configured." },
        { status: 500 }
      );
    }

    // Duplicate USN check
    const allUsns    = [usn, ...normalizedMembers.map((m) => m.usn)];
    const uniqueUsns = new Set(allUsns);
    if (uniqueUsns.size !== allUsns.length) {
      return NextResponse.json(
        { message: "Duplicate USNs are not allowed in the same team." },
        { status: 400 }
      );
    }

    // Team-size check — exact takes priority; otherwise min/max range
    if (rule.exact !== undefined) {
      if (totalMembers !== rule.exact) {
        return NextResponse.json(
          {
            message: `Invalid team size. ${event.name} requires exactly ${rule.exact} member(s).`,
          },
          { status: 400 }
        );
      }
    } else if (rule.min !== undefined && rule.max !== undefined) {
      if (totalMembers < rule.min || totalMembers > rule.max) {
        return NextResponse.json(
          {
            message: `Invalid team size. ${event.name} requires between ${rule.min} and ${rule.max} member(s).`,
          },
          { status: 400 }
        );
      }
    }

    // Team name is required whenever there is more than one member
    if (isTeamRegistration && !teamData?.name?.trim()) {
      return NextResponse.json(
        { message: "Team name is required for team events." },
        { status: 400 }
      );
    }

    // ── 4. Calculate amount ──────────────────────────────────────────────────
    let amountINR = 0;
    if (rule.feeType === "per_person" && rule.fee) {
      amountINR = rule.fee * totalMembers;
    } else if (rule.feeType === "per_team" && rule.fee) {
      amountINR = rule.fee;
    }
    const totalAmount = amountINR * 100; // paise

    // ── 5. Upsert leader participant ─────────────────────────────────────────
    const participant = await prisma.participant.upsert({
      where:  { usn },
      create: { name: fullName, usn, email, emailVerified: true, phoneNo: phone },
      update: { name: fullName, email, emailVerified: true, phoneNo: phone },
    });

    // ── 6. Block duplicate confirmed registrations ───────────────────────────
    const confirmedRegistrationIds = await prisma.registration
      .findMany({
        where:  { participantId: participant.id, status: "CONFIRMED" },
        select: { id: true },
      })
      .then((r) => r.map((x) => x.id));

    const confirmedParticipation = await prisma.participation.findFirst({
      where: {
        participantId:  participant.id,
        eventId:        event.id,
        registrationId: { in: confirmedRegistrationIds },
      },
    });

    if (confirmedParticipation) {
      return NextResponse.json(
        { message: `You are already registered for ${event.name}.` },
        { status: 409 }
      );
    }

    // ── 7. Delete stale non-confirmed participations for this event ───────────
    await prisma.participation.deleteMany({
      where: {
        participantId: participant.id,
        eventId:       event.id,
        ...(confirmedRegistrationIds.length > 0 && {
          registrationId: { notIn: confirmedRegistrationIds },
        }),
      },
    });

    // ── 8. Cancel orphaned PAYMENT_PENDING registrations ────────────────────
    const orphaned = await prisma.registration.findMany({
      where:  { participantId: participant.id, status: "PAYMENT_PENDING" },
      select: { id: true },
    });

    if (orphaned.length > 0) {
      const orphanedIds = orphaned.map((r) => r.id);
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: { registrationId: { in: orphanedIds } },
          data:  { status: "FAILED" },
        }),
        prisma.registration.updateMany({
          where: { id: { in: orphanedIds } },
          data:  { status: "CANCELLED" },
        }),
      ]);
    }

    // ── 9. Create registration + participation records ───────────────────────
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          participantId: participant.id,
          status: totalAmount === 0 ? "CONFIRMED" : "PAYMENT_PENDING",
        },
      });

      let teamId: string | null = null;

      if (isTeamRegistration) {
        const teamRecord = await tx.team.create({
          data: {
            name:     teamData!.name!.trim(),
            eventId:  event.id,
            leaderId: participant.id,
          },
        });
        teamId = teamRecord.id;

        for (const member of normalizedMembers) {
          const memberParticipant = await tx.participant.upsert({
            where:  { usn: member.usn },
            create: {
              name:          member.name,
              usn:           member.usn,
              email:         `${member.usn.toLowerCase()}@pending.techfest`,
              emailVerified: false,
              phoneNo:       member.phone ?? undefined,
            },
            update: { name: member.name, phoneNo: member.phone ?? undefined },
          });

          await tx.participation.create({
            data: {
              participantId:  memberParticipant.id,
              eventId:        event.id,
              teamId,
              registrationId: reg.id,
            },
          });
        }
      }

      // Leader participation
      await tx.participation.create({
        data: {
          participantId:  participant.id,
          eventId:        event.id,
          teamId,
          registrationId: reg.id,
        },
      });

      // Payment record
      await tx.payment.create({
        data: {
          registrationId:    reg.id,
          razorpayOrderId:   `MANUAL_${Date.now()}_${reg.id}`,
          razorpayPaymentId: null,
          amount:            totalAmount,
          currency:          "INR",
          status:            totalAmount === 0 ? "SUCCESS" : "PENDING",
        },
      });

      return reg;
    });

    // ── 10. Confirmation email for FREE events ───────────────────────────────
    if (totalAmount === 0 && email) {
      // Build a readable participants list
      const allParticipants = [
        { name: fullName, usn },
        ...normalizedMembers.map((m) => ({ name: m.name, usn: m.usn })),
      ];

      const participantRows = allParticipants
        .map(
          (p, i) =>
            `<tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
               <td style="padding:6px 12px">${i === 0 ? "👑 Leader" : `Member ${i}`}</td>
               <td style="padding:6px 12px">${p.name}</td>
               <td style="padding:6px 12px">${p.usn}</td>
             </tr>`
        )
        .join("");

      const teamSection = isTeamRegistration
        ? `<p><strong>Team Name:</strong> ${teamData!.name!.trim()}</p>`
        : "";

      await transporter.sendMail({
        from:    `"Vertex - Lumous 2026" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: `Lumous 2026 — ${event.name} Registration Confirmed ✅`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
            <h2 style="color:#4f46e5">Hello from Vertex 🚀</h2>
            <p>Your registration for <strong>${event.name}</strong> (Lumous 2026) has been
               <strong style="color:green">confirmed</strong>.</p>
            <p>This event is <strong>free of charge</strong> — no payment required.</p>

            ${teamSection}

            <h3 style="margin-top:24px">Registered Participant(s)</h3>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <thead>
                <tr style="background:#4f46e5;color:#fff">
                  <th style="padding:8px 12px;text-align:left">Role</th>
                  <th style="padding:8px 12px;text-align:left">Name</th>
                  <th style="padding:8px 12px;text-align:left">USN</th>
                </tr>
              </thead>
              <tbody>${participantRows}</tbody>
            </table>

            <p style="margin-top:20px;color:#c0392b">
              ⚠️ Please <strong>do not register multiple times</strong>.
            </p>

            <h3>Need Help?</h3>
            <p>
              Team Lead 1 — Naman Singh: 📞 8334072002<br/>
              Team Lead 2 — Shefali: 📞 8867429955<br/>
              Technical Issues — Harsh: 📞 8269273139
            </p>

            <p style="margin-top:24px;font-size:12px;color:#888">
              — Team Vertex | Lumous 2026
            </p>
          </div>
        `,
      });
    }

    // ── 11. Response ─────────────────────────────────────────────────────────
    return NextResponse.json(
      {
        registrationId: registration.id,
        amount:         totalAmount,
        eventName:      event.name,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/lumous-register]", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A participant or team with that name is already registered for this event." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}