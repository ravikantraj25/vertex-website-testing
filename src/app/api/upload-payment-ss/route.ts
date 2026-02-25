// app/api/upload-screenshot/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { transporter } from "@/lib/mailer";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
 
  try {
    const formData = await req.formData();
    const file = formData.get("screenshot") as File | null;
    const registrationId = formData.get("registrationId") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "Screenshot is required" },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
  return NextResponse.json(
    { message: "Only image files are allowed" },
    { status: 400 }
  );
}

    if (!registrationId) {
      return NextResponse.json(
        { message: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { registrationId },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { message: "Payment already processed" },
        { status: 409 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
  // Upload to Cloudinary
const uploadResult = await new Promise<any>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "lumous2026/paymentScreenshots",
      resource_type: "image",
      public_id: `${registrationId}_${Date.now()}`,
    },
    (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }
  );

  stream.end(buffer);
});

// ✅ Validate response before DB update
if (
  !uploadResult ||
  typeof uploadResult !== "object" ||
  !uploadResult.secure_url ||
  !uploadResult.public_id
) {
  console.error("Invalid Cloudinary response:", uploadResult);

  return NextResponse.json(
    { message: "Image upload failed. Please try again." },
    { status: 500 }
  );
}

const screenshotUrl = uploadResult.secure_url;

try {
  await prisma.payment.update({
    where: { registrationId },
    data: {
      razorpayPaymentId: screenshotUrl,
    },
  });
} catch (dbError) {
  // Optional: delete uploaded image if DB fails
  await cloudinary.uploader.destroy(uploadResult.public_id);
  return NextResponse.json({success: false, message: "Failed to save screenshot. Please try again."}, { status: 500 });
}
    const registration = await prisma.registration.findUnique({
  where: { id: registrationId },
  include: {
    participant: true,
  },
});

if (registration?.participant?.email) {
  await transporter.sendMail({
    from: `"Vertex - Lumous 2026" <${process.env.SMTP_USER}>`,
    to: registration.participant.email,
    subject: "Lumous 2026 Registration Received ✅",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f6f8;">
      <div style="max-width: 500px; margin:auto; background:white; padding:30px; border-radius:10px;">
        
        <h2 style="color:#4f46e5;">Hello from Vertex 🚀</h2>
        
        <p>Your registration for <strong>Lumous 2026</strong> has been received successfully.</p>
        
        <p>
          Your payment screenshot has been uploaded and is currently 
          To ensure a smooth verification process, please avoid registering multiple times.
          <strong>under verification</strong>.
        </p>
        <p>
          
          <strong>Total Amount Paid:</strong> ₹${payment.amount / 100} <br/>
        </p>

        <p style="margin-top:20px;">
          ⚠️ Please do <strong>not register multiple times</strong>.  
          We will notify you once the payment is verified.
        </p>

        <hr style="margin:25px 0;" />

        <p>If you have any queries, please contact:</p>

        <p>
          <strong>Team Lead 1:</strong> Naman singh<br/>
          📞 8334072002
        </p>

        <p>
          <strong>Team Lead 2:</strong> Shefali <br/>
          📞 8867429955
        </p>
         <p>
          <strong>Technical issues? </strong> Harsh <br/>
          📞 8269273139
        </p>

        <p style="margin-top:30px; font-size:12px; color:#777;">
          — Team Vertex | Lumous 2026
        </p>
      </div>
    </div>
    `,
  });
}
    return NextResponse.json({ success: true, screenshotUrl });

  } catch (error) {
    console.error("[POST /api/upload-payment-ss]", error);
    return NextResponse.json(
      { message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}