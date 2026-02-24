import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

interface SendOtpRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as SendOtpRequest;

  if (!email) {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // Upsert OTP (replace old if exists)
  await prisma.otp.upsert({
    where: { email },
    update: {
      otp,
      expiresAt: expires,
    },
    create: {
      email,
      otp,
      expiresAt: expires,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Event OTP",
   html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vertex | Lumous 2026 OTP</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0; color:#111827;">Hello from <span style="color:#6366f1;">Vertex</span> 🚀</h1>
              </td>
            </tr>

            <tr>
              <td style="color:#374151; font-size:16px; line-height:1.6;">
                <p>You're almost there!</p>
                <p>
                  Use the OTP below to complete your registration for 
                  <strong>Lumous 2026</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:30px 0;">
                <div style="
                  display:inline-block;
                  padding:15px 30px;
                  font-size:28px;
                  letter-spacing:6px;
                  font-weight:bold;
                  background:#f3f4f6;
                  border-radius:8px;
                  color:#111827;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td style="color:#6b7280; font-size:14px;">
                <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                <p>If you didn’t request this, you can safely ignore this email.</p>
              </td>
            </tr>

            <tr>
              <td style="padding-top:30px; font-size:12px; color:#9ca3af;" align="center">
                © ${new Date().getFullYear()} Vertex. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  });

  return NextResponse.json({ status: 200, message: "OTP sent" });
}