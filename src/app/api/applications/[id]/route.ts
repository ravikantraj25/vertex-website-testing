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
 * GET /api/applications/:id
 * Admin Only: Get application details by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
                { error: "Invalid application ID format" },
                { status: 400 }
            );
        }

        const application = await prisma.recruitmentApplication.findUnique({
            where: { id },
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
                        email: true,
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: application }, { status: 200 });
    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json(
            { error: "Failed to fetch application" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/applications/:id
 * Admin Only: Update an application (assign admin, update status, etc.)
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
                { error: "Invalid application ID format" },
                { status: 400 }
            );
        }

        // Check if application exists
        const existingApplication = await prisma.recruitmentApplication.findUnique({
            where: { id },
        });

        if (!existingApplication) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, usn, emailId, phoneNo, team } = body;

        // Get admin ID to link as reviewer
        const admin = await prisma.admin.findUnique({
            where: { email: session.user?.email ?? "" },
        });

        // Update the application (only provided fields + assign reviewing admin)
        const application = await prisma.recruitmentApplication.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(usn && { usn }),
                ...(emailId && { emailId }),
                ...(phoneNo && { phoneNo }),
                ...(team && { team }),
                ...(admin && { adminId: admin.id }),
            },
        });

        return NextResponse.json({ data: application }, { status: 200 });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/applications/:id
 * Admin Only: Delete an application
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
                { error: "Invalid application ID format" },
                { status: 400 }
            );
        }

        // Check if application exists
        const existingApplication = await prisma.recruitmentApplication.findUnique({
            where: { id },
        });

        if (!existingApplication) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Delete the application
        await prisma.recruitmentApplication.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Application deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json(
            { error: "Failed to delete application" },
            { status: 500 }
        );
    }
}
