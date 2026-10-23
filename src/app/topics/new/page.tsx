import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { TopicForm } from "@/components/topic-form";
import { requireAdminToken } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Create topic",
};

async function NewTopicContent() {
  await connection();
  await requireAdminToken();

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">GROW YOUR LEARNING PATH</span>
        <h1>Create a topic.</h1>
        <p>Define what you want to learn and what you want to build.</p>
      </section>

      <TopicForm />
    </>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading editor…</h2>
        </section>
      }
    >
      <NewTopicContent />
    </Suspense>
  );
}
