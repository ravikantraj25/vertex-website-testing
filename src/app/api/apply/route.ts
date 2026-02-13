import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
/**
 * POST /api/apply
 * Public (Authenticated Users): Submit a recruitment application
 * Any logged-in user can submit an application
 */
export async function POST(request: NextRequest) {
        const ip: string | null = request.headers.get("x-forwarded-for");
       if(!ip) {
        return new Response("Unable to determine IP address", { status: 400 });
       }
      const { success } = await ratelimit.limit(ip);
    
      if (!success) {
        return new Response("Too many requests", { status: 429 });
      }
    try {
        // Check if user is authenticated (any role)
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please login to apply" },
                { status: 401 }
            );
        }

        // Find the user in the User table
        const user = await prisma.user.findUnique({
            where: { emailId: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found. Please ensure you are registered." },
                { status: 404 }
            );
        }

        // Check if user already has an application
        const existingApplication = await prisma.recruitmentApplication.findUnique({
            where: { userId: user.id },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: "You have already submitted an application" },
                { status: 409 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, usn, emailId, phoneNo, team } = body;

        // Validate required fields
        if (!name || !usn || !emailId || !phoneNo || !team) {
            return NextResponse.json(
                { error: "Missing required fields: name, usn, emailId, phoneNo, team" },
                { status: 400 }
            );
        }

        // Create the application
        const application = await prisma.recruitmentApplication.create({
            data: {
                name,
                usn,
                emailId,
                phoneNo,
                team,
                userId: user.id,
            },
        });

        return NextResponse.json({ data: application }, { status: 201 });
    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
