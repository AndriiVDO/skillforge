"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  saveTopic,
  type TopicFormState,
  type TopicFormValues,
} from "@/app/topics/actions";

type TopicFormProps = {
  topic?: TopicFormValues;
};

export function TopicForm({ topic }: TopicFormProps) {
  const action = saveTopic.bind(null, topic?.slug ?? null);
  const initialState: TopicFormState = { error: "" };

  const [state, formAction, pending] = useActionState(action, initialState);

  const values = state.values ?? topic;

  return (
    <form action={formAction} className="panel topic-form">
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          defaultValue={values?.title}
          maxLength={150}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="slug">URL slug</label>
        <input
          id="slug"
          name="slug"
          defaultValue={values?.slug}
          placeholder="database-fundamentals"
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          readOnly={Boolean(topic)}
          aria-describedby="slug-help"
          required
        />
        <p id="slug-help" className="storage-note">
          {topic
            ? "The URL slug stays fixed to preserve existing links and notes."
            : "Use lowercase letters, numbers, and hyphens. The slug “new” is reserved."}
        </p>
      </div>

      <div className="form-field">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          defaultValue={values?.category}
          maxLength={100}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={values?.description}
          rows={4}
          maxLength={2000}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="outcome">Practical outcome</label>
        <textarea
          id="outcome"
          name="outcome"
          defaultValue={values?.outcome}
          rows={3}
          maxLength={2000}
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
          {pending ? "Saving…" : topic ? "Save changes" : "Create topic"}
        </button>

        <Link
          href={topic ? `/topics/${topic.slug}` : "/topics"}
          className="button button-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
