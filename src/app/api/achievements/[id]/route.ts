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
 * GET /api/achievements/:id
 * Public: Get achievement details by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid achievement ID format" },
                { status: 400 }
            );
        }

        const achievement = await prisma.achievement.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        usn: true,
                        email: true,
                    },
                },
            },
        });

        if (!achievement) {
            return NextResponse.json(
                { error: "Achievement not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: achievement }, { status: 200 });
    } catch (error) {
        console.error("Error fetching achievement:", error);
        return NextResponse.json(
            { error: "Failed to fetch achievement" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/achievements/:id
 * Admin Only: Update an achievement
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
                { error: "Invalid achievement ID format" },
                { status: 400 }
            );
        }

        // Check if achievement exists
        const existingAchievement = await prisma.achievement.findUnique({
            where: { id },
        });

        if (!existingAchievement) {
            return NextResponse.json(
                { error: "Achievement not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { participants, team, rank, competition, year } = body;

        // Validate year if provided
        if (year !== undefined && (typeof year !== "number" || !Number.isInteger(year))) {
            return NextResponse.json(
                { error: "Year must be an integer" },
                { status: 400 }
            );
        }

        // Update the achievement (only provided fields)
        const achievement = await prisma.achievement.update({
            where: { id },
            data: {
                ...(participants && { participants }),
                ...(team && { team }),
                ...(rank && { rank }),
                ...(competition && { competition }),
                ...(year && { year }),
            },
        });

        return NextResponse.json({ data: achievement }, { status: 200 });
    } catch (error) {
        console.error("Error updating achievement:", error);
        return NextResponse.json(
            { error: "Failed to update achievement" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/achievements/:id
 * Admin Only: Delete an achievement
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
                { error: "Invalid achievement ID format" },
                { status: 400 }
            );
        }

        // Check if achievement exists
        const existingAchievement = await prisma.achievement.findUnique({
            where: { id },
        });

        if (!existingAchievement) {
            return NextResponse.json(
                { error: "Achievement not found" },
                { status: 404 }
            );
        }

        // Delete the achievement
        await prisma.achievement.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Achievement deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting achievement:", error);
        return NextResponse.json(
            { error: "Failed to delete achievement" },
            { status: 500 }
        );
    }
}
