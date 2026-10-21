import { Suspense } from "react";
import { connection } from "next/server";
import { Dashboard } from "@/components/skillforge";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getApiTopics } from "@/lib/api-topics";

async function DashboardContent() {
  await connection();

  const topics = await getApiTopics();

  if (topics === null) {
    return <CatalogUnavailable />;
  }

  return <Dashboard topics={topics} />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Loading your workspace…</h2>
          <p className="muted">Preparing your learning dashboard.</p>
        </section>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
