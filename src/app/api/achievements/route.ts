import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/achievements
 * Public: List all achievements
 */
export async function GET() {
    try {
        const achievements = await prisma.achievement.findMany({
            orderBy: { year: "desc" },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: achievements }, { status: 200 });
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return NextResponse.json(
            { error: "Failed to fetch achievements" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/achievements
 * Admin Only: Create a new achievement
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
        const { participants, team, rank, competition, year } = body;

        // Validate required fields
        if (!participants || !team || !rank || !competition || !year) {
            return NextResponse.json(
                { error: "Missing required fields: participants, team, rank, competition, year" },
                { status: 400 }
            );
        }

        // Validate year is a number
        if (typeof year !== "number" || !Number.isInteger(year)) {
            return NextResponse.json(
                { error: "Year must be an integer" },
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

        // Create the achievement
        const achievement = await prisma.achievement.create({
            data: {
                participants,
                team,
                rank,
                competition,
                year,
                adminId: admin.id,
            },
        });

        return NextResponse.json({ data: achievement }, { status: 201 });
    } catch (error) {
        console.error("Error creating achievement:", error);
        return NextResponse.json(
            { error: "Failed to create achievement" },
            { status: 500 }
        );
    }
}
