import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { NextAuthOptions } from "next-auth";
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

      const dbUser = await prisma.user.findUnique({
        where: { emailId: user.email },
      });

      if (!dbUser) {
        console.log("Access denied: User not found in whitelist.");
        return false;
      }

      
      const cookieStore = await cookies();
      const requestedRole = cookieStore.get("requestedRole")?.value;
      console.log("Requested Role:", requestedRole);
      
     

      (user as any).role = requestedRole === "ADMIN" ? "ADMIN" : "USER";
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
