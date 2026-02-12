import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/members
 * Public: List all members
 */
export async function GET() {
    try {
        const members = await prisma.member.findMany({
            orderBy: { usn: "asc" },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: members }, { status: 200 });
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json(
            { error: "Failed to fetch members" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/members
 * Admin Only: Create a new member
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
        const { usn, emailId, phoneNo, team, role } = body;

        // Validate required fields
        if (!usn || !emailId || !phoneNo) {
            return NextResponse.json(
                { error: "Missing required fields: usn, emailId, phoneNo" },
                { status: 400 }
            );
        }

        // Validate team and role are arrays if provided
        if (team && !Array.isArray(team)) {
            return NextResponse.json(
                { error: "team must be an array of strings" },
                { status: 400 }
            );
        }

        if (role && !Array.isArray(role)) {
            return NextResponse.json(
                { error: "role must be an array of strings" },
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

        // Create the member
        const member = await prisma.member.create({
            data: {
                usn,
                emailId,
                phoneNo,
                team: team ?? [],
                role: role ?? [],
                adminId: admin.id,
            },
        });

        return NextResponse.json({ data: member }, { status: 201 });
    } catch (error: any) {
        // Handle unique constraint violations
        if (error?.code === "P2002") {
            const target = error.meta?.target;
            return NextResponse.json(
                { error: `A member with this ${target} already exists` },
                { status: 409 }
            );
        }

        console.error("Error creating member:", error);
        return NextResponse.json(
            { error: "Failed to create member" },
            { status: 500 }
        );
    }
}
