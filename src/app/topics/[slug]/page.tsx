import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { TopicDetail } from "@/components/skillforge";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getApiTopics } from "@/lib/api-topics";
import { topics as localTopics } from "@/lib/topics";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return localTopics.map((topic) => ({
    slug: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = localTopics.find((item) => item.slug === slug);

  return {
    title: topic?.title ?? "Learning topic",
  };
}

async function TopicContent({ params }: PageProps) {
  await connection();

  const { slug } = await params;
  const topics = await getApiTopics();

  if (topics === null) {
    return <CatalogUnavailable />;
  }

  const topic = topics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  return <TopicDetail topic={topic} />;
}

export default function TopicPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading topic…</h2>
          <p className="muted">Preparing your learning checklist.</p>
        </section>
      }
    >
      <TopicContent params={params} />
    </Suspense>
  );
}
