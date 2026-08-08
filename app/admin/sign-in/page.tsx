import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";

export const metadata: Metadata = { title: "Sign in — Admin", robots: { index: false } };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-start justify-center px-6">
      <MonoDetail>Admin</MonoDetail>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-ink">
        Owner only.<span className="text-ink-faint"> Everyone else, enjoy the site.</span>
      </h1>
      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
      >
        <GlassButton type="submit">Continue with GitHub</GlassButton>
      </form>
    </main>
  );
}
