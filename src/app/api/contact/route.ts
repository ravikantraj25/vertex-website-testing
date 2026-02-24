import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
/**
 * GET /api/contact
 * Admin Only: List all contact form submissions
 */
export async function GET(request: NextRequest) {

    try {
        // Check admin authorization
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const contacts = await prisma.contactReceiving.findMany({
            orderBy: { name: "asc" },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: contacts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json(
            { error: "Failed to fetch contacts" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/contact
 * Public: Submit a contact form message
 */
export async function POST(request: NextRequest) {

    try {
        // Parse request body
        const body = await request.json();
        const { name, emailId, phoneNo, message } = body;

        // Validate required fields
        if (!name || !emailId || !phoneNo || !message) {
            return NextResponse.json(
                { error: "Missing required fields: name, emailId, phoneNo, message" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailId)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Create the contact submission
        const contact = await prisma.contactReceiving.create({
            data: {
                name,
                emailId,
                phoneNo,
                message,
            },
        });

        return NextResponse.json({ data: contact }, { status: 201 });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json(
            { error: "Failed to submit contact form" },
            { status: 500 }
        );
    }
}
