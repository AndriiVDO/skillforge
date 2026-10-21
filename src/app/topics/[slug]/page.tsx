import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TopicDetail } from "@/components/skillforge";
import { topics } from "@/lib/topics";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return topics.map((topic) => ({
    slug: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = topics.find((item) => item.slug === slug);

  return {
    title: topic?.title ?? "Topic not found",
  };
}

async function TopicContent({ params }: PageProps) {
  const { slug } = await params;
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
