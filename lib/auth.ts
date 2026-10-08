import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "Developer Sign In",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "shravan@shipit.dev" },
        name: { label: "Name", type: "text", placeholder: "Shravan Choudhary" },
        username: { label: "Username", type: "text", placeholder: "shravan" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }
        const email = credentials.email.trim().toLowerCase();
        const name = credentials.name?.trim() || "Developer";
        const rawUsername =
          credentials.username?.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") ||
          email.split("@")[0].replace(/[^a-z0-9_]/g, "");

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          let finalUsername = rawUsername;
          const existingUserWithUsername = await prisma.user.findUnique({
            where: { username: finalUsername },
          });
          if (existingUserWithUsername) {
            finalUsername = `${rawUsername}_${Math.floor(100 + Math.random() * 900)}`;
          }

          user = await prisma.user.create({
            data: {
              email,
              name,
              username: finalUsername,
              image: `https://api.dicebear.com/7.x/identicon/svg?seed=${finalUsername}`,
              bio: "Building cool stuff daily with Next.js & PostgreSQL",
              city: "Pune",
              college: "COEP",
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase();
        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          const rawUsername = (user.name || email.split("@")[0])
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "");
          let finalUsername = rawUsername;
          const existing = await prisma.user.findUnique({
            where: { username: finalUsername },
          });
          if (existing) {
            finalUsername = `${rawUsername}_${Math.floor(100 + Math.random() * 900)}`;
          }

          dbUser = await prisma.user.create({
            data: {
              email,
              name: user.name || "Developer",
              username: finalUsername,
              image: user.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${finalUsername}`,
            },
          });
        }
        user.id = dbUser.id;
        user.username = dbUser.username;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.username) token.username = session.user.username;
        if (session.user.image) token.image = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "shipit_super_secret_local_dev_key_2026_xxyyzz",
};
