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
 * GET /api/members/:id
 * Public: Get member details by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid member ID format" },
                { status: 400 }
            );
        }

        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        usn: true,
                        emailId: true,
                    },
                },
            },
        });

        if (!member) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: member }, { status: 200 });
    } catch (error) {
        console.error("Error fetching member:", error);
        return NextResponse.json(
            { error: "Failed to fetch member" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/members/:id
 * Admin Only: Update a member
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
                { error: "Invalid member ID format" },
                { status: 400 }
            );
        }

        // Check if member exists
        const existingMember = await prisma.member.findUnique({
            where: { id },
        });

        if (!existingMember) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { usn, emailId, phoneNo, team, role, imageUrl } = body;

        // Validate team and role are arrays if provided
        if (team !== undefined && !Array.isArray(team)) {
            return NextResponse.json(
                { error: "team must be an array of strings" },
                { status: 400 }
            );
        }

        if (role !== undefined && !Array.isArray(role)) {
            return NextResponse.json(
                { error: "role must be an array of strings" },
                { status: 400 }
            );
        }

        // Update the member (only provided fields)
        const member = await prisma.member.update({
            where: { id },
            data: {
                ...(usn && { usn }),
                ...(emailId && { emailId }),
                ...(phoneNo && { phoneNo }),
                ...(team !== undefined && { team }),
                ...(role !== undefined && { role }),
                ...(imageUrl && { imageUrl }),
            },
        });

        return NextResponse.json({ data: member }, { status: 200 });
    } catch (error: any) {
        // Handle unique constraint violations
        if (error?.code === "P2002") {
            const target = error.meta?.target;
            return NextResponse.json(
                { error: `A member with this ${target} already exists` },
                { status: 409 }
            );
        }

        console.error("Error updating member:", error);
        return NextResponse.json(
            { error: "Failed to update member" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/members/:id
 * Admin Only: Delete a member
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
                { error: "Invalid member ID format" },
                { status: 400 }
            );
        }

        // Check if member exists
        const existingMember = await prisma.member.findUnique({
            where: { id },
        });

        if (!existingMember) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            );
        }

        // Delete the member
        await prisma.member.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Member deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting member:", error);
        return NextResponse.json(
            { error: "Failed to delete member" },
            { status: 500 }
        );
    }
}
