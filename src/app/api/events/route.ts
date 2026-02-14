import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
/**
 * GET /api/events
 * Public: List all events
 */
export async function GET(request: NextRequest) {
   
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: "asc" },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: events }, { status: 200 });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/events
 * Admin Only: Create a new event
 */
export async function POST(request: NextRequest) {
    
    try {
        // Check admin authorization
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { venue, date, time } = body;

        // Validate required fields
        if (!venue || !date || !time) {
            return NextResponse.json(
                { error: "Missing required fields: venue, date, time" },
                { status: 400 }
            );
        }

        // Get admin ID from the database using session email
        const admin = await prisma.admin.findUnique({
            where: { emailId: session.user?.email ?? "" },
        });

        if (!admin) {
            return NextResponse.json(
                { error: "Admin not found in database" },
                { status: 404 }
            );
        }

        // Create the event
        const event = await prisma.event.create({
            data: {
                venue,
                date: new Date(date),
                time,
                adminId: admin.id,
            },
        });

        return NextResponse.json({ data: event }, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            { error: "Failed to create event" },
            { status: 500 }
        );
    }
}
