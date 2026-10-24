"use client";

import { useActionState, useId, useState } from "react";
import {
  changeLearningContent,
  type ContentActionState,
  type ContentTarget,
} from "@/app/topics/content-actions";
import type { Topic } from "@/lib/topics";

type ContentEditorProps = {
  target: ContentTarget;
  title: string;
  value: string;
};

function ContentEditor({
  target,
  title: initialTitle,
  value: initialValue,
}: ContentEditorProps) {
  const fieldId = useId();
  const [title, setTitle] = useState(initialTitle);
  const [value, setValue] = useState(initialValue);
  const [confirming, setConfirming] = useState(false);

  const action = changeLearningContent.bind(null, target);
  const initialState: ContentActionState = {
    error: "",
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);
  const isLesson = target.kind === "lessons";

  return (
    <details className="content-editor">
      <summary>{initialTitle}</summary>

      <form action={formAction} className="topic-form">
        <input
          type="hidden"
          name="operation"
          value={confirming ? "delete" : "update"}
        />

        <fieldset disabled={pending} className="content-editor-fields">
          {confirming ? (
            <div className="delete-confirmation">
              <p>Delete “{initialTitle}”? This cannot be undone.</p>

              <label className="confirmation-label">
                <input type="checkbox" name="confirmed" value="yes" required />
                <span>I want to permanently delete this item.</span>
              </label>
            </div>
          ) : (
            <>
              <div className="form-field">
                <label htmlFor={`${fieldId}-title`}>Title</label>
                <input
                  id={`${fieldId}-title`}
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor={`${fieldId}-value`}>
                  {isLesson ? "Description" : "URL"}
                </label>

                {isLesson ? (
                  <textarea
                    id={`${fieldId}-value`}
                    name="description"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    rows={3}
                    maxLength={4000}
                    required
                  />
                ) : (
                  <input
                    id={`${fieldId}-value`}
                    name="url"
                    type="url"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    maxLength={2048}
                    required
                  />
                )}
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className={
                confirming ? "button button-danger" : "button button-primary"
              }
            >
              {pending
                ? "Working…"
                : confirming
                  ? "Confirm deletion"
                  : "Save changes"}
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => setConfirming(!confirming)}
            >
              {confirming ? "Cancel deletion" : "Delete…"}
            </button>
          </div>
        </fieldset>

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
      </form>
    </details>
  );
}

export function LearningContentManager({ topic }: { topic: Topic }) {
  return (
    <section className="panel content-manager">
      <span className="eyebrow">ADMINISTRATION</span>
      <h2>Manage learning content</h2>
      <p className="notes-description">
        Open an item to edit its details or delete it.
      </p>

      <h3>Tasks</h3>

      {topic.lessons.length === 0 && (
        <p className="muted">No tasks to manage yet.</p>
      )}

      {topic.lessons.map((lesson) => (
        <ContentEditor
          key={lesson.id}
          target={{
            topicSlug: topic.slug,
            kind: "lessons",
            id: lesson.id,
          }}
          title={lesson.title}
          value={lesson.description}
        />
      ))}

      <h3>Resources</h3>

      {topic.resources.length === 0 && (
        <p className="muted">No resources to manage yet.</p>
      )}

      {topic.resources.map((resource) => (
        <ContentEditor
          key={resource.id}
          target={{
            topicSlug: topic.slug,
            kind: "resources",
            id: String(resource.id),
          }}
          title={resource.title}
          value={resource.url}
        />
      ))}
    </section>
  );
}
