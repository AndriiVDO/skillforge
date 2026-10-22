"use client";

import { useActionState } from "react";
import { addResource, type ResourceFormState } from "@/app/topics/actions";

export function ResourceForm({ topicSlug }: { topicSlug: string }) {
  const action = addResource.bind(null, topicSlug);
  const initialState: ResourceFormState = { error: "" };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <section className="panel">
      <span className="eyebrow">KEEP USEFUL REFERENCES</span>
      <h2>Add a resource</h2>

      <form action={formAction} className="topic-form">
        <div className="form-field">
          <label htmlFor="resource-title">Resource title</label>
          <input
            id="resource-title"
            name="title"
            defaultValue={state.values?.title}
            placeholder="PostgreSQL Documentation"
            maxLength={200}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="resource-url">URL</label>
          <input
            id="resource-url"
            name="url"
            type="url"
            defaultValue={state.values?.url}
            placeholder="https://www.postgresql.org/docs/"
            maxLength={2048}
            required
          />
        </div>

        {state.error && (
          <p className="error-message" role="alert">
            {state.error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={pending}
          >
            {pending ? "Adding…" : "Add resource"}
          </button>
        </div>
      </form>
    </section>
  );
}
