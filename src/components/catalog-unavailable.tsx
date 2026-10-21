"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function CatalogUnavailable() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function retry() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="panel" role="alert">
      <span className="eyebrow">CONNECTION REQUIRED</span>
      <h1>Learning catalog is unavailable.</h1>

      <p className="notes-description">
        We could not load learning topics. Please try again shortly.
      </p>

      <button
        type="button"
        className="button button-secondary"
        onClick={retry}
        disabled={isPending}
      >
        {isPending ? "Retrying…" : "Try again →"}
      </button>
    </section>
  );
}
