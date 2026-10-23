import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { TopicsCatalog } from "@/components/skillforge";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getApiTopics } from "@/lib/api-topics";
import { getAdmin } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Learning topics",
};

async function CatalogContent() {
  await connection();

  const [topics, admin] = await Promise.all([getApiTopics(), getAdmin()]);

  if (topics === null) {
    return <CatalogUnavailable />;
  }

  return <TopicsCatalog topics={topics} isAdmin={admin !== null} />;
}

export default function TopicsPage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading learning topics…</h2>
          <p className="muted">Fetching the latest catalog.</p>
        </section>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
