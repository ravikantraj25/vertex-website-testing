import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/applications
 * Admin Only: List all recruitment applications
 */
export async function GET() {
    try {
        // Check admin authorization
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const applications = await prisma.recruitmentApplication.findMany({
            orderBy: { name: "asc" },
            include: {
                user: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: applications }, { status: 200 });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}
