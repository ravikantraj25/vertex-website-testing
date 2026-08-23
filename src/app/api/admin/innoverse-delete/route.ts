// app/api/admin/innoverse-delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    // ── Auth guard ─────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type           = searchParams.get("type");           // "team" | "solo"
    const registrationId = searchParams.get("registrationId"); // for solo
    const teamId         = searchParams.get("teamId");         // for team

    // ── Team deletion ───────────────────────────────────────────────────────
    if (type === "team") {
      if (!teamId) {
        return NextResponse.json(
          { message: "teamId is required for team deletion." },
          { status: 400 }
        );
      }

      // Find the team and its registration via any participation
      const teamParticipation = await prisma.participation.findFirst({
        where:  { teamId },
        select: { registrationId: true },
      });

      if (!teamParticipation) {
        return NextResponse.json(
          { message: "Team not found or already deleted." },
          { status: 404 }
        );
      }

      const regId = teamParticipation.registrationId;

      console.log(`[admin/innoverse-delete] Deleting team: ${teamId} | regId: ${regId}`);

      // Delete in order: participations → payment → registration → team
      const deletedParticipations = await prisma.participation.deleteMany({
        where: { teamId },
      });
      console.log(`[admin/innoverse-delete] Deleted ${deletedParticipations.count} participation(s)`);

      await prisma.payment.deleteMany({
        where: { registrationId: regId },
      });
      console.log(`[admin/innoverse-delete] Deleted payment for reg: ${regId}`);

      await prisma.registration.delete({
        where: { id: regId },
      });
      console.log(`[admin/innoverse-delete] Deleted registration: ${regId}`);

      await prisma.team.delete({
        where: { id: teamId },
      });
      console.log(`[admin/innoverse-delete] Deleted team: ${teamId}`);

      return NextResponse.json(
        { message: "Team and all related records deleted successfully." },
        { status: 200 }
      );
    }

    // ── Solo deletion ───────────────────────────────────────────────────────
    if (type === "solo") {
      if (!registrationId) {
        return NextResponse.json(
          { message: "registrationId is required for solo deletion." },
          { status: 400 }
        );
      }

      const registration = await prisma.registration.findUnique({
        where:  { id: registrationId },
        select: { id: true, participantId: true },
      });

      if (!registration) {
        return NextResponse.json(
          { message: "Registration not found or already deleted." },
          { status: 404 }
        );
      }

      console.log(`[admin/innoverse-delete] Deleting solo registration: ${registrationId}`);

      // Delete in order: participations → payment → registration
      const deletedParticipations = await prisma.participation.deleteMany({
        where: { registrationId },
      });
      console.log(`[admin/innoverse-delete] Deleted ${deletedParticipations.count} participation(s)`);

      await prisma.payment.deleteMany({
        where: { registrationId },
      });
      console.log(`[admin/innoverse-delete] Deleted payment for reg: ${registrationId}`);

      await prisma.registration.delete({
        where: { id: registrationId },
      });
      console.log(`[admin/innoverse-delete] Deleted registration: ${registrationId}`);

      return NextResponse.json(
        { message: "Registration deleted successfully." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid type. Must be 'team' or 'solo'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as any;
    console.error("[admin/innoverse-delete] ERROR:", err?.code, err?.message);

    if (err?.code === "P2025") {
      return NextResponse.json(
        { message: "Record not found. It may have already been deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Deletion failed. Please try again." },
      { status: 500 }
    );
  }
}