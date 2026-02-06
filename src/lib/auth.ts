import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { NextAuthOptions, getServerSession } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      let role: string | null = null;

      // Check Admin table first
      const admin = await prisma.admin.findUnique({
        where: { email: user.email },
      });

      if (admin) {
        role = "ADMIN";
      } else {
        // Check User table
        const dbUser = await prisma.user.findUnique({
          where: { emailId: user.email },
        });

        if (dbUser) {
          role = "USER";
        }
      }

      // User not found in either table
      if (!role) {
        console.log("Access denied: User not found in whitelist.");
        return false;
      }

      // Read role from cookie
      const cookieStore = await cookies();
      const requestedRole = cookieStore.get("requestedRole")?.value;

      console.log("Requested Role:", requestedRole);
      console.log("DB Role:", role);

      if (requestedRole && role !== requestedRole) {
        console.log("Access denied: Role mismatch.");
        return false;
      }

      (user as any).role = role;
      return true;
    },

    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    error: "/",
  },
};

/**
 * Helper function to require admin role for protected routes
 * Returns the session if authorized, null otherwise
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

/**
 * Helper function to get current session (for public routes that need optional auth)
 */
export async function getSession() {
  return await getServerSession(authOptions);
}
