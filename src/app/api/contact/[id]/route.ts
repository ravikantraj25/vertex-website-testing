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
 * GET /api/contact/:id
 * Admin Only: Get a single contact submission
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
                { error: "Invalid contact ID format" },
                { status: 400 }
            );
        }

        const contact = await prisma.contactReceiving.findUnique({
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

        if (!contact) {
            return NextResponse.json(
                { error: "Contact submission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: contact }, { status: 200 });
    } catch (error) {
        console.error("Error fetching contact:", error);
        return NextResponse.json(
            { error: "Failed to fetch contact" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/contact/:id
 * Admin Only: Delete a contact submission
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
                { error: "Invalid contact ID format" },
                { status: 400 }
            );
        }

        // Check if contact exists
        const existingContact = await prisma.contactReceiving.findUnique({
            where: { id },
        });

        if (!existingContact) {
            return NextResponse.json(
                { error: "Contact submission not found" },
                { status: 404 }
            );
        }

        // Delete the contact
        await prisma.contactReceiving.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Contact submission deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json(
            { error: "Failed to delete contact" },
            { status: 500 }
        );
    }
}
