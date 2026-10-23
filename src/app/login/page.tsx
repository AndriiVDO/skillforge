import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getAdmin } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Administrator sign-in",
};

async function LoginContent() {
  await connection();

  const admin = await getAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">YOUR ADMIN WORKSPACE</span>
        <h1>Welcome back.</h1>
        <p>Sign in with your SkillForge administrator account.</p>
      </section>

      <LoginForm />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading sign-in…</h2>
        </section>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
