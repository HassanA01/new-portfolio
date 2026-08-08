import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  trustHost: true,
  pages: { signIn: "/admin/sign-in" },
  callbacks: {
    signIn({ profile }) {
      return (profile as { login?: string } | undefined)?.login === "HassanA01";
    },
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin") && !path.startsWith("/admin/sign-in")) {
        return !!session?.user;
      }
      return true;
    },
  },
});
