import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "System",
};

type ApiHealth = {
  status: string;
  service: string;
  runtime: string;
};

function isApiHealth(value: unknown): value is ApiHealth {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "status" in value &&
    typeof value.status === "string" &&
    "service" in value &&
    typeof value.service === "string" &&
    "runtime" in value &&
    typeof value.runtime === "string"
  );
}

async function getApiHealth(): Promise<ApiHealth | null> {
  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();

    return isApiHealth(data) ? data : null;
  } catch {
    return null;
  }
}

async function SystemContent() {
  await connection();

  const health = await getApiHealth();
  const online = health?.status === "ok";

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">BEHIND THE APPLICATION</span>
        <h1>System overview.</h1>
        <p>
          A live connection between the Next.js frontend and the ASP.NET Core
          backend.
        </p>
      </section>

      <section className="stats-grid" aria-label="System status">
        <div className="stat-card">
          <span>Backend connection</span>
          <strong>{online ? "Online" : "Offline"}</strong>
          <p>
            {online
              ? "The API responded successfully."
              : "The API is unavailable or is not configured."}
          </p>
        </div>

        <div className="stat-card">
          <span>API service</span>
          <strong style={{ fontSize: "24px" }}>{health?.service ?? "—"}</strong>
          <p>Independent ASP.NET Core application</p>
        </div>

        <div className="stat-card">
          <span>.NET runtime</span>
          <strong>{health?.runtime ?? "—"}</strong>
          <p>Reported by the running backend</p>
        </div>
      </section>

      <section className="panel">
        <span className="eyebrow">REQUEST FLOW</span>
        <h2>How this page gets its data</h2>
        <p className="notes-description">
          Your browser requests this page from Next.js. The Next.js server
          requests the API health endpoint, reads its JSON response, and renders
          the result.
        </p>
        <p className="storage-note">
          Refresh this page to check the connection again.
        </p>

        <Link href="/topics" className="button button-secondary">
          Back to learning topics →
        </Link>
      </section>
    </>
  );
}

export default function SystemPage() {
  return (
    <Suspense
      fallback={
        <section className="panel" role="status">
          <h2>Checking backend connection…</h2>
          <p className="muted">Waiting for the API response.</p>
        </section>
      }
    >
      <SystemContent />
    </Suspense>
  );
}
