import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface UserAgentCheckResult {
    isBlocked: boolean;
}

export function middleware(req: NextRequest): NextResponse {
    const userAgent: string | null = req.headers.get("user-agent");

    if (!userAgent || userAgent.includes("bot")) {
        return new NextResponse("Blocked", { status: 403 });
    }

    return NextResponse.next();
}
