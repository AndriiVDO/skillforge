import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-session";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Administration",
};

async function AdminContent() {
  await connection();

  const admin = await getAdmin();

  if (!admin) {
    redirect("/login");
  }

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>Your workspace.</h1>
        <p>Signed in as {admin.email}</p>
      </section>

      <section className="panel topic-form">
        <div>
          <span className="badge">{admin.role}</span>
          <h2>Administrator session active</h2>
          <p className="notes-description">
            Your account has been verified by the API.
          </p>
        </div>

        <div className="form-actions">
          <Link href="/topics" className="button button-secondary">
            View learning topics →
          </Link>

          <form action={logout}>
            <button type="submit" className="button button-primary">
              Sign out
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Checking your session…</h2>
        </section>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
