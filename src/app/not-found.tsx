import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="panel not-found-panel">
        <span className="eyebrow">ERROR 404</span>

        <h1 id="not-found-title">Page not found.</h1>

        <p>
          This page does not exist or is not available to you. Explore the
          learning catalog to find your next topic.
        </p>

        <div className="form-actions">
          <Link href="/topics" className="button button-primary">
            Explore learning topics
          </Link>

          <Link href="/" className="button button-secondary">
            Back to overview
          </Link>
        </div>
      </div>
    </section>
  );
}
