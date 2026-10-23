import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { TopicForm } from "@/components/topic-form";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getApiTopics } from "@/lib/api-topics";
import { requireAdminToken } from "@/lib/admin-session";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Edit topic",
};

export function generateStaticParams() {
  return [{ slug: "linux" }];
}

async function EditContent({ params }: PageProps) {
  await connection();
  await requireAdminToken();

  const { slug } = await params;
  const topics = await getApiTopics();

  if (topics === null) {
    return <CatalogUnavailable />;
  }

  const topic = topics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">SHAPE YOUR LEARNING PATH</span>
        <h1>Edit topic.</h1>
        <p>Update the topic details and practical outcome.</p>
      </section>

      <TopicForm topic={topic} />
    </>
  );
}

export default function EditTopicPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading editor…</h2>
        </section>
      }
    >
      <EditContent params={params} />
    </Suspense>
  );
}
