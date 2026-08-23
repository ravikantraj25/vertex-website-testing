import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { registrationId, action } = body;

    if (!registrationId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        participant: true,
        payment: true,
        participations: {
          include: {
            event: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 });
    }

    const eventName = registration.participations[0]?.event?.name || "InnoVerse 2026 Event";

    if (action === "APPROVE") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { registrationId },
          data: { status: "SUCCESS" }
        }),
        prisma.registration.update({
          where: { id: registrationId },
          data: { status: "CONFIRMED" }
        })
      ]);

      if (registration.participant.email) {
        await transporter.sendMail({
          from: `"Vertex - InnoVerse 2026" <${process.env.SMTP_USER}>`,
          to: registration.participant.email,
          subject: "Registration Confirmed! 🎉 - InnoVerse 2026",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f6f8;">
              <div style="max-width: 500px; margin:auto; background:white; padding:30px; border-radius:10px;">
                <h2 style="color:#10b981;">Payment Verified ✅</h2>
                <p>Hi ${registration.participant.name},</p>
                <p>Your payment for <strong>${eventName}</strong> has been successfully verified by our team.</p>
                <p>Your registration is now <strong>CONFIRMED</strong>!</p>
                <p>We look forward to seeing you at InnoVerse 2026.</p>
                <p style="margin-top:30px; font-size:12px; color:#777;">— Team Vertex | InnoVerse 2026</p>
              </div>
            </div>
          `,
        });
      }

      return NextResponse.json({ success: true, message: "Approved successfully" });

    } else if (action === "REJECT") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { registrationId },
          data: { status: "FAILED" }
        }),
        prisma.registration.update({
          where: { id: registrationId },
          data: { status: "CANCELLED" }
        })
      ]);

      if (registration.participant.email) {
        await transporter.sendMail({
          from: `"Vertex - InnoVerse 2026" <${process.env.SMTP_USER}>`,
          to: registration.participant.email,
          subject: "Payment Issue - InnoVerse 2026",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f6f8;">
              <div style="max-width: 500px; margin:auto; background:white; padding:30px; border-radius:10px;">
                <h2 style="color:#ef4444;">Payment Verification Failed ⚠️</h2>
                <p>Hi ${registration.participant.name},</p>
                <p>We could not verify your payment screenshot for <strong>${eventName}</strong>. Your registration has been marked as cancelled.</p>
                <p>If you believe this is a mistake, please contact our team immediately:</p>
                <ul>
                  <li>Naman Singh: 8334072002</li>
                  <li>Shefali: 8867429955</li>
                </ul>
                <p style="margin-top:30px; font-size:12px; color:#777;">— Team Vertex | InnoVerse 2026</p>
              </div>
            </div>
          `,
        });
      }

      return NextResponse.json({ success: true, message: "Rejected successfully" });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("[POST /api/admin/innoverse-confirm]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
