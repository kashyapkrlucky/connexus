import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import UserService from "@/server/services/UserService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/", error: "/" },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "google" && profile?.email_verified === true;
    },

    // `token.sub` holds our own users.id, not Google's account id.
    async jwt({ token, profile, trigger }) {
      if (profile?.email) {
        const user = await UserService.findOrCreateFromGoogle({
          email: profile.email,
          name: profile.name ?? profile.email,
          image: profile.picture ?? null,
        });
        return { ...token, sub: user.id, name: user.displayName, picture: user.avatarUrl, username: user.username };
      }

      // Client called `update()` after a profile edit — pull fresh name/avatar.
      if (trigger === "update" && token.sub) {
        const user = await UserService.getUserById(token.sub);
        if (user) return { ...token, name: user.displayName, picture: user.avatarUrl, username: user.username };
      }

      return token;
    },

    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.username = token.username;
      return session;
    },
  },
});
