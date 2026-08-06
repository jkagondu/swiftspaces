import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Return the user object, which will be saved in the JWT
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          agentStatus: user.agentStatus,
          agencyName: user.agencyName,
          facebookUrl: user.facebookUrl,
          twitterUrl: user.twitterUrl,
          instagramUrl: user.instagramUrl,
          linkedinUrl: user.linkedinUrl,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.agentStatus = (user as any).agentStatus;
        token.agencyName = (user as any).agencyName;
        token.facebookUrl = (user as any).facebookUrl;
        token.twitterUrl = (user as any).twitterUrl;
        token.instagramUrl = (user as any).instagramUrl;
        token.linkedinUrl = (user as any).linkedinUrl;
      }
      
      // Allow updating session data
      if (trigger === "update" && session) {
        if (session.facebookUrl !== undefined) token.facebookUrl = session.facebookUrl;
        if (session.twitterUrl !== undefined) token.twitterUrl = session.twitterUrl;
        if (session.instagramUrl !== undefined) token.instagramUrl = session.instagramUrl;
        if (session.linkedinUrl !== undefined) token.linkedinUrl = session.linkedinUrl;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          agentStatus: token.agentStatus as string,
          agencyName: token.agencyName as string,
          facebookUrl: token.facebookUrl as string | undefined,
          twitterUrl: token.twitterUrl as string | undefined,
          instagramUrl: token.instagramUrl as string | undefined,
          linkedinUrl: token.linkedinUrl as string | undefined,
        } as any;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
};
