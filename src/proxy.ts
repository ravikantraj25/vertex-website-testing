import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimit } from "./lib/ratelimit";
import path from "path";

function botcheckMiddleware(req: NextRequest): NextResponse | null {
  const userAgent = req.headers.get("user-agent");
  if (!userAgent || userAgent.includes("bot")) {
    return new NextResponse("Blocked", { status: 403 });
  }
  return null;
}

async function ratelimitMiddleware(request: NextRequest):  Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (ip !== "unknown") {
    const { success } = await ratelimit.limit(ip);
    if (!success) return new NextResponse("Too many requests", { status: 429 });
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Bot check ────────────────────────────────────────────────────────
  const botResult = botcheckMiddleware(request);
  if (botResult) return botResult;

  // ── 2. Always allow Next.js internals & static files ────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")        // next-auth callbacks must be public
  ) {
    return NextResponse.next();
  }

  // ── 3. Explicitly public routes (exact match or prefix) ─────────────────
  const isPublic =
  pathname === "/" ||
  pathname === "/lumousRegistration" ||
  pathname.startsWith("/api/lumous-register") ||
  pathname.startsWith("/logout")||
  pathname.startsWith("/api/send-otp")|| pathname.startsWith("/api/verify-otp") 
  ||pathname.startsWith("/api/upload-payment-ss") ;// next-auth routes are public by default
  // ── 4. Auth check for everything else ───────────────────────────────────
  if (!isPublic) {
    const token = await getToken({ req: request });

    if (!token) {
      // Preserve the intended destination so you can redirect back after login
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ── Role-based guards ──────────────────────────────────────────────────
    if (pathname.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/dashboard/user") && token.role !== "USER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── 5. Rate limit all POST requests ─────────────────────────────────────
  if (request.method === "POST") {
    const rateLimitResult = await ratelimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*"
  ],
};
