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
  ideathon:   { min: 2, max: 3,  feeType: "free" },           // FIX: was min:1, frontend says 2
  bgmi:       { min: 1, max: 4,  feeType: "per_team", fee: 50 },
  igp:        { min: 1, max: 2,  feeType: "free" },
  reeluminati:{ min: 1, max: 4,  feeType: "free" },
  cricket:    { min: 8, max: 11, feeType: "per_team", fee: 150 },
  volleyball: { min: 6, max: 9,  feeType: "per_team", fee: 100 },
  lagori:     { exact: 6,        feeType: "free" },
  dodgeball:  { exact: 6,        feeType: "free" },
  cooking:    { exact: 2,        feeType: "per_team", fee: 50 },
  trapezoid:  { exact: 2,        feeType: "per_team", fee: 150 },
};

function validateBody(body: Partial<RegisterBody>): string | null {
  if (!body.fullName?.trim())                    return "Full name is required";
  if (!body.usn || !USN_REGEX.test(body.usn))   return "Invalid USN format";
  if (!body.email?.includes("@"))                return "Invalid email";
  if (!body.eventSlug?.trim())                   return "An event must be selected";

  const members = body.team?.members;
  if (members && Array.isArray(members)) {
    for (const m of members) {
      if (!m.name?.trim())        return "All team members must have a name";
      if (!USN_REGEX.test(m.usn)) return `Invalid USN for member: ${m.name}`;
    }
  }
  return null;
}

// ─── Structured error logger ──────────────────────────────────────────────────
function logError(tag: string, error: unknown) {
  const err = error as any;
  console.error(`\n========== [${tag}] ERROR ==========`);
  console.error("Prisma Code  :", err?.code       ?? "N/A");
  console.error("Message      :", err?.message     ?? "N/A");
  console.error("Meta         :", JSON.stringify(err?.meta ?? {}));
  console.error("Name         :", err?.name        ?? "N/A");
  console.error("Full JSON    :", JSON.stringify(error, null, 2));
  console.error("=====================================\n");
}

export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json();

    // ── 1. Basic field validation ────────────────────────────────────────────
    const validationError = validateBody(body);
    if (validationError) {
      console.warn("[lumous-register] Validation failed:", validationError);
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

    const totalMembers       = 1 + normalizedMembers.length;
    const isTeamRegistration = totalMembers > 1;

    console.log(`[lumous-register] Attempt | USN: ${usn} | Event: ${eventSlug} | Members: ${totalMembers}`);

    // ── 2. Resolve event ─────────────────────────────────────────────────────
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      console.warn(`[lumous-register] Event not found: ${eventSlug}`);
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    // ── 3. Resolve & enforce event rules ─────────────────────────────────────
    const rule = eventRules[eventSlug.toLowerCase()];
    if (!rule) {
      console.error(`[lumous-register] No rules configured for event: ${eventSlug}`);
      return NextResponse.json(
        { message: "Rules for this event are not configured." },
        { status: 500 }
      );
    }

    // Duplicate USN check across leader + all members
    const allUsns    = [usn, ...normalizedMembers.map((m) => m.usn)];
    const uniqueUsns = new Set(allUsns);
    if (uniqueUsns.size !== allUsns.length) {
      console.warn(`[lumous-register] Duplicate USNs detected: ${allUsns}`);
      return NextResponse.json(
        { message: "Duplicate USNs are not allowed in the same team." },
        { status: 400 }
      );
    }

    // Team-size check
    if (rule.exact !== undefined) {
      if (totalMembers !== rule.exact) {
        console.warn(`[lumous-register] Team size mismatch. Required: ${rule.exact}, Got: ${totalMembers}`);
        return NextResponse.json(
          {
            message: `Invalid team size. ${event.name} requires exactly ${rule.exact} member(s). You submitted ${totalMembers}.`,
          },
          { status: 400 }
        );
      }
    } else if (rule.min !== undefined && rule.max !== undefined) {
      if (totalMembers < rule.min || totalMembers > rule.max) {
        console.warn(`[lumous-register] Team size out of range. Allowed: ${rule.min}-${rule.max}, Got: ${totalMembers}`);
        return NextResponse.json(
          {
            message: `Invalid team size. ${event.name} requires between ${rule.min} and ${rule.max} member(s). You submitted ${totalMembers}.`,
          },
          { status: 400 }
        );
      }
    }

    // Team name required for multi-member registrations
    if (isTeamRegistration && !teamData?.name?.trim()) {
      console.warn(`[lumous-register] Team name missing for team event: ${eventSlug}`);
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
    const totalAmount = amountINR * 100; // convert to paise

    console.log(`[lumous-register] Amount: ₹${amountINR} (${totalAmount} paise) | Free: ${totalAmount === 0}`);

    // ── 5. Upsert leader participant ─────────────────────────────────────────
    let participant;
    try {
      participant = await prisma.participant.upsert({
        where:  { usn },
        create: { name: fullName, usn, email, emailVerified: true, phoneNo: phone },
        update: { name: fullName, email, emailVerified: true, phoneNo: phone },
      });
    } catch (err) {
      logError("lumous-register / upsert leader", err);
      return NextResponse.json(
        { message: "Failed to save your details. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[lumous-register] Leader participant ID: ${participant.id}`);

    // ── 6. Block duplicate confirmed registrations for leader ────────────────
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
      console.warn(`[lumous-register] Leader already confirmed for event: ${eventSlug} | participantId: ${participant.id}`);
      return NextResponse.json(
        { message: `You are already registered for ${event.name}.` },
        { status: 409 }
      );
    }

    // ── 7. Delete stale non-confirmed participations for LEADER ──────────────
    try {
      const leaderDeleteResult = await prisma.participation.deleteMany({
        where: {
          participantId: participant.id,
          eventId:       event.id,
          ...(confirmedRegistrationIds.length > 0 && {
            registrationId: { notIn: confirmedRegistrationIds },
          }),
        },
      });
      console.log(`[lumous-register] Deleted ${leaderDeleteResult.count} stale leader participation(s)`);
    } catch (err) {
      logError("lumous-register / delete stale leader participations", err);
      return NextResponse.json(
        { message: "Failed to clean up previous registration attempt. Please try again." },
        { status: 500 }
      );
    }

    // ── 7b. Delete stale non-confirmed participations for TEAM MEMBERS ────────
    // FIX: Previously only the leader's stale participations were cleaned.
    // If any member had a leftover Participation row from a prior failed/cancelled
    // attempt, the tx.participation.create inside the transaction would hit the
    // @@unique([participantId, eventId]) constraint and throw — causing the 500.
    if (normalizedMembers.length > 0) {
      let memberParticipants: { id: string }[] = [];

      try {
        memberParticipants = await prisma.participant.findMany({
          where:  { usn: { in: normalizedMembers.map((m) => m.usn) } },
          select: { id: true },
        });
      } catch (err) {
        logError("lumous-register / find member participants", err);
        return NextResponse.json(
          { message: "Failed to look up team member details. Please try again." },
          { status: 500 }
        );
      }

      if (memberParticipants.length > 0) {
        const memberIds = memberParticipants.map((p) => p.id);

        // Check if any member is already CONFIRMED for this event — block if so
        const confirmedMemberParticipation = await prisma.participation.findFirst({
          where: {
            participantId: { in: memberIds },
            eventId:       event.id,
            registration:  { status: "CONFIRMED" },
          },
          include: { participant: { select: { name: true, usn: true } } },
        });

        if (confirmedMemberParticipation) {
          const who = confirmedMemberParticipation.participant;
          console.warn(`[lumous-register] Member already confirmed: ${who.usn} for event: ${eventSlug}`);
          return NextResponse.json(
            {
              message: `Team member ${who.name} (${who.usn}) is already confirmed for ${event.name}. They cannot be in two teams for the same event.`,
            },
            { status: 409 }
          );
        }

        // Safe to wipe their stale (non-confirmed) participations for this event
        try {
          const memberDeleteResult = await prisma.participation.deleteMany({
            where: {
              participantId: { in: memberIds },
              eventId:       event.id,
            },
          });
          console.log(`[lumous-register] Deleted ${memberDeleteResult.count} stale member participation(s)`);
        } catch (err) {
          logError("lumous-register / delete stale member participations", err);
          return NextResponse.json(
            { message: "Failed to clean up previous team member registration. Please try again." },
            { status: 500 }
          );
        }
      }
    }

    // ── 8. Cancel orphaned PAYMENT_PENDING registrations for leader ──────────
    try {
      const orphaned = await prisma.registration.findMany({
        where:  { participantId: participant.id, status: "PAYMENT_PENDING" },
        select: { id: true },
      });

      if (orphaned.length > 0) {
        const orphanedIds = orphaned.map((r) => r.id);
        console.log(`[lumous-register] Cancelling ${orphaned.length} orphaned PAYMENT_PENDING registration(s): ${orphanedIds}`);

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
    } catch (err) {
      logError("lumous-register / cancel orphaned registrations", err);
      return NextResponse.json(
        { message: "Failed to clean up a previous pending registration. Please try again." },
        { status: 500 }
      );
    }

    // ── 8b. Safety guard before transaction ──────────────────────────────────
    if (isTeamRegistration && !teamData?.name?.trim()) {
      console.error(`[lumous-register] teamData.name missing right before transaction — should not happen`);
      return NextResponse.json(
        { message: "Team name is required for team events." },
        { status: 400 }
      );
    }

    // ── 9. Create registration + participation records ───────────────────────
    let registration;
    try {
      registration = await prisma.$transaction(async (tx) => {
        const reg = await tx.registration.create({
          data: {
            participantId: participant.id,
            status: totalAmount === 0 ? "CONFIRMED" : "PAYMENT_PENDING",
          },
        });

        console.log(`[lumous-register] Created registration: ${reg.id} | Status: ${reg.status}`);

        let teamId: string | null = null;

        if (isTeamRegistration) {
          const teamName = teamData!.name!.trim();

          // FIX: Use upsert instead of create to avoid @@unique([name, eventId])
          // collision when the same team name was used in a prior cancelled attempt.
          const teamRecord = await tx.team.upsert({
            where: {
              name_eventId: {
                name:    teamName,
                eventId: event.id,
              },
            },
            create: {
              name:     teamName,
              eventId:  event.id,
              leaderId: participant.id,
            },
            update: {
              // Re-assign leader in case a different person re-registers with same name
              leaderId: participant.id,
            },
          });

          teamId = teamRecord.id;
          console.log(`[lumous-register] Team upserted: "${teamName}" | ID: ${teamId}`);

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

            console.log(`[lumous-register] Member participation created: ${member.usn}`);
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

        console.log(`[lumous-register] Leader participation created: ${usn}`);

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
    } catch (err) {
      logError("lumous-register / main transaction", err);

      const code = (err as any)?.code as string | undefined;
      const meta  = (err as any)?.meta as any;

      if (code === "P2002") {
        // Unique constraint — tell the user what conflicted if possible
        const target = meta?.target ? ` (conflict on: ${JSON.stringify(meta.target)})` : "";
        console.error(`[lumous-register] P2002 unique constraint${target}`);
        return NextResponse.json(
          {
            message: `A registration conflict occurred${target}. This usually means a team member is already registered. Please check USNs and try again.`,
          },
          { status: 409 }
        );
      }

      if (code === "P2034" || code === "P2028") {
        // MongoDB write conflict / transaction timeout
        return NextResponse.json(
          { message: "A temporary conflict occurred. Please try submitting again." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: "Registration failed during save. Please try again." },
        { status: 500 }
      );
    }

    // ── 10. Confirmation email for FREE events ───────────────────────────────
    if (totalAmount === 0 && email) {
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

      try {
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
        console.log(`[lumous-register] Confirmation email sent to: ${email}`);
      } catch (mailErr) {
        // Email failure should NOT fail the registration — just log it
        logError("lumous-register / send confirmation email", mailErr);
        console.warn(`[lumous-register] Email failed but registration succeeded: ${registration.id}`);
      }
    }

    // ── 11. Response ─────────────────────────────────────────────────────────
    console.log(`[lumous-register] SUCCESS | registrationId: ${registration.id} | amount: ${totalAmount}`);

    return NextResponse.json(
      {
        registrationId: registration.id,
        amount:         totalAmount,
        eventName:      event.name,
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    // Outermost catch — should only be hit by unexpected errors (e.g. req.json() failure)
    logError("lumous-register / outer catch", error);

    const code = (error as any)?.code as string | undefined;

    if (code === "P2002") {
      return NextResponse.json(
        { message: "A participant or team with that name is already registered for this event." },
        { status: 409 }
      );
    }

    if (code === "P2034" || code === "P2028") {
      return NextResponse.json(
        { message: "A temporary conflict occurred. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}