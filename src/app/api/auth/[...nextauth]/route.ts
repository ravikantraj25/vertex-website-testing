import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";

const handler = NextAuth(authOptions);

async function rateLimitedHandler(request: Request) {
  const ip = request.headers.get("x-forwarded-for");

  if (!ip) {
    return new Response("Unable to determine IP address", { status: 400 });
  }

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  return handler(request);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
