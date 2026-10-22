"use client";

import { useActionState } from "react";
import { addLesson, type LessonFormState } from "@/app/topics/actions";

export function LessonForm({ topicSlug }: { topicSlug: string }) {
  const action = addLesson.bind(null, topicSlug);
  const initialState: LessonFormState = { error: "" };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <section className="panel">
      <span className="eyebrow">BUILD YOUR CHECKLIST</span>
      <h2>Add a task</h2>

      <p className="notes-description">
        Define a practical step you can explain and demonstrate.
      </p>

      <form action={formAction} className="topic-form">
        <div className="form-field">
          <label htmlFor="lesson-title">Task title</label>
          <input
            id="lesson-title"
            name="title"
            defaultValue={state.values?.title}
            placeholder="Understand primary and foreign keys"
            maxLength={200}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="lesson-description">Description</label>
          <textarea
            id="lesson-description"
            name="description"
            defaultValue={state.values?.description}
            placeholder="Describe what completing this task should demonstrate."
            rows={3}
            maxLength={4000}
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
            {pending ? "Adding…" : "Add task"}
          </button>
        </div>
      </form>
    </section>
  );
}
