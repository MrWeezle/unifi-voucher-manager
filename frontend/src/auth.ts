import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const required = process.env.ADMIN_GROUP_ID;
      if (!required) {
        console.warn(
          "ADMIN_GROUP_ID is not set — allowing any authenticated user",
        );
        return true;
      }
      const groups = (profile as { groups?: unknown } | null | undefined)
        ?.groups;
      const hasGroup =
        Array.isArray(groups) &&
        groups.every((g): g is string => typeof g === "string") &&
        groups.includes(required);
      if (!hasGroup) {
        console.warn(
          `Sign-in rejected: user ${profile?.email ?? "unknown"} is not in ADMIN_GROUP_ID`,
        );
      }
      return hasGroup;
    },
    async jwt({ token, profile }) {
      if (profile) {
        const groups = (profile as { groups?: unknown }).groups;
        if (
          Array.isArray(groups) &&
          groups.every((g): g is string => typeof g === "string")
        ) {
          token.groups = groups;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.groups = token.groups;
      }
      return session;
    },
  },
});
