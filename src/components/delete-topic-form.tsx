"use client";

import { useActionState, useId, useState } from "react";
import {
  deleteTopic,
  type DeleteTopicState,
} from "@/app/topics/delete-topic-action";

export function DeleteTopicForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const inputId = useId();
  const [expanded, setExpanded] = useState(false);
  const action = deleteTopic.bind(null, slug);
  const initialState: DeleteTopicState = { error: "" };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <section className="panel">
      <h2>Delete topic</h2>
      <p className="notes-description">
        Permanently delete this topic and all its tasks and resources.
      </p>

      {!expanded ? (
        <button
          type="button"
          className="button button-danger"
          onClick={() => setExpanded(true)}
        >
          Delete this topic…
        </button>
      ) : (
        <form action={formAction} className="topic-form">
          <p>You are deleting “{title}”. This cannot be undone.</p>

          <div className="form-field">
            <label htmlFor={inputId}>
              Type <code>{slug}</code> to confirm
            </label>
            <input
              id={inputId}
              name="confirmation"
              autoComplete="off"
              maxLength={100}
              disabled={pending}
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
              className="button button-danger"
              disabled={pending}
            >
              {pending ? "Deleting…" : "Permanently delete topic"}
            </button>

            <button
              type="button"
              className="button button-secondary"
              disabled={pending}
              onClick={() => setExpanded(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
