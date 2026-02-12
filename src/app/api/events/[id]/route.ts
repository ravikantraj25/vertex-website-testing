import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * Validate MongoDB ObjectId format
 */
function isValidObjectId(id: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * GET /api/events/:id
 * Public: Get event details by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid event ID format" },
                { status: 400 }
            );
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
                users: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: event }, { status: 200 });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json(
            { error: "Failed to fetch event" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/events/:id
 * Admin Only: Update an event
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Check admin authorization
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid event ID format" },
                { status: 400 }
            );
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id },
        });

        if (!existingEvent) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { venue, date, time } = body;

        // Update the event (only provided fields)
        const event = await prisma.event.update({
            where: { id },
            data: {
                ...(venue && { venue }),
                ...(date && { date: new Date(date) }),
                ...(time && { time }),
            },
        });

        return NextResponse.json({ data: event }, { status: 200 });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json(
            { error: "Failed to update event" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/events/:id
 * Admin Only: Delete an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Check admin authorization
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid event ID format" },
                { status: 400 }
            );
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id },
        });

        if (!existingEvent) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        // Delete the event
        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Event deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json(
            { error: "Failed to delete event" },
            { status: 500 }
        );
    }
}
