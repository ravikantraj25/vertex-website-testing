import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // NO adapter here. This prevents automatic user creation.
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
    




    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // 1. Fetch user from YOUR database
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // 2. BLOCK: If user is not in your list
      if (!dbUser ) {
        console.log("Access denied: User not found in whitelist.");
        return false; 
      }

      // 3. BLOCK: Role Mismatch
     
      const url = new URL(typeof account?.callbackUrl === "string" ? account.callbackUrl : "");
      const intendedRole = url.searchParams.get("role"); // 'ADMIN' or 'USER'

      if (intendedRole && dbUser.role !== intendedRole) {
        console.log(`Access denied: Role mismatch. DB:${dbUser.role} vs Clicked:${intendedRole}`);
        return false;
      }

      // If we got here, they are in the DB and clicked the right button.
      // We manually attach the role to the user object for the JWT callback.
      (user as any).role = dbUser.role;
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    error: "/", // Redirect here if signIn returns false
  },
};