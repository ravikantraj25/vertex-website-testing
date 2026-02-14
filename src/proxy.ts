import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
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
  // Run bot check for ALL requests
  const botCheckResult = botcheckMiddleware(request);
  if (botCheckResult) {
    return botCheckResult;
  }

  // Run rate limit check only for auth routes
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
