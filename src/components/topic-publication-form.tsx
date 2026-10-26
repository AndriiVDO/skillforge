"use client";

import { useActionState } from "react";
import {
  setTopicPublication,
  type PublicationState,
} from "@/app/topics/publication-actions";

export function TopicPublicationForm({
  slug,
  isPublished,
}: {
  slug: string;
  isPublished: boolean;
}) {
  const action = setTopicPublication.bind(null, slug, !isPublished);
  const initialState: PublicationState = {
    error: "",
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <section className="panel">
      <span className="eyebrow">PUBLICATION</span>
      <h2>{isPublished ? "Published" : "Draft"}</h2>

      <p className="notes-description">
        {isPublished
          ? "This topic is visible to everyone. Move it to drafts to hide it while keeping its content."
          : "Only administrators can view this topic. Publish it when the content is ready."}
      </p>

      <form action={formAction}>
        <button
          type="submit"
          className="button button-secondary"
          disabled={pending}
        >
          {pending
            ? "Updating…"
            : isPublished
              ? "Move to drafts"
              : "Publish topic"}
        </button>
      </form>

      {state.error && (
        <p className="error-message" role="alert">
          {state.error}
        </p>
      )}

      {state.message && (
        <p className="storage-note" role="status">
          {state.message}
        </p>
      )}
    </section>
  );
}
