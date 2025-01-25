import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtube.force-ssl",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtubepartner"
          ].join(" ")
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account && user) {
        // Create or update the user first
        const createdUser = await db.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          update: {
            name: user.name,
            email: user.email,
            image: user.image,
          },
        });

        // Now upsert the account using the created or updated user's ID
        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: createdUser.id, // Use the created or updated user ID
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
            token_type: account.token_type,
            id_token: account.id_token,
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
            token_type: account.token_type,
            id_token: account.id_token,
          },
        });
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account && user) {
        console.log("Saving tokens to database...");
        await db.account.updateMany({
          where: {
            userId: user.id,
            provider: "google",
          },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
            token_type: account.token_type,
            id_token: account.id_token,
          },
        });
      }
    },

  },
  pages: {
    signIn: "/sign-in",
  },
  debug: process.env.NODE_ENV === "development",
}; 