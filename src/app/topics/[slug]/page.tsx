import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { TopicDetail } from "@/components/skillforge";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getApiTopics } from "@/lib/api-topics";
import { getAdmin } from "@/lib/admin-session";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Learning topic",
};

// Representative route for build-time prerender validation.
// The actual topic content is fetched at request time.
export function generateStaticParams() {
  return [{ slug: "linux" }];
}

async function TopicContent({ params }: PageProps) {
  await connection();

  const { slug } = await params;

  const [topics, admin] = await Promise.all([getApiTopics(), getAdmin()]);

  if (topics === null) {
    return <CatalogUnavailable />;
  }

  const topic = topics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  return <TopicDetail topic={topic} isAdmin={admin !== null} />;
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
