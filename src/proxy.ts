import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimit } from "./lib/ratelimit";

interface UserAgentCheckResult {
  isBlocked: boolean;
}

function botcheckMiddleware(req: NextRequest): NextResponse | null {
  const userAgent: string | null = req.headers.get("user-agent");

  if (!userAgent || userAgent.includes("bot")) {
    return new NextResponse("Blocked", { status: 403 });
  }

  return null;
}

async function ratelimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (ip !== "unknown") {
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  return null;
}

export async function proxy(request: NextRequest) {
  // 1. Run bot check for ALL requests
  const botCheckResult = botcheckMiddleware(request);
  if (botCheckResult) {
    return botCheckResult;
  }

  // 2. Auth & RBAC Checks
  const path = request.nextUrl.pathname;
  const isAdminDashboard = path.startsWith("/dashboard/admin");
  const isUserDashboard = path.startsWith("/dashboard/user");
  const isProtectedApi = path.startsWith("/api/applications") ||
    path.startsWith("/api/members") ||
    path.startsWith("/api/apply");

  if (isAdminDashboard || isUserDashboard || isProtectedApi) {
    const token = await getToken({ req: request });

    // Not logged in
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role check for Admin Dashboard
    if (isAdminDashboard && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role check for User Dashboard
    if (isUserDashboard && token.role !== "USER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Run rate limit check only for auth routes (POST requests)
  if (request.method === "POST") {
    const rateLimitResult = await ratelimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
