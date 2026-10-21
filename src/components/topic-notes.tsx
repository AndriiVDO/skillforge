"use client";

import { useId, useState, useSyncExternalStore } from "react";

type TopicNotesProps = {
  topicSlug: string;
};

const NOTES_EVENT = "skillforge-notes-updated";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(NOTES_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(NOTES_EVENT, onChange);
  };
}

function getServerSnapshot(): null {
  return null;
}

export function TopicNotes({ topicSlug }: TopicNotesProps) {
  const storageKey = `skillforge.notes.v1.${topicSlug}`;

  const savedNotes = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) ?? "";
      } catch {
        return "";
      }
    },
    getServerSnapshot,
  );

  if (savedNotes === null) {
    return (
      <section className="panel notes-panel" aria-busy="true">
        <h2>Personal notes</h2>
        <p className="muted">Loading notes…</p>
      </section>
    );
  }

  return (
    <NotesEditor
      key={topicSlug}
      storageKey={storageKey}
      savedNotes={savedNotes}
    />
  );
}

function NotesEditor({
  storageKey,
  savedNotes,
}: {
  storageKey: string;
  savedNotes: string;
}) {
  const inputId = useId();

  const [notes, setNotes] = useState(savedNotes);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasChanges = notes !== savedNotes;

  function saveNotes() {
    try {
      localStorage.setItem(storageKey, notes);
      window.dispatchEvent(new Event(NOTES_EVENT));

      setError("");
      setMessage("Notes saved in this browser.");
    } catch {
      setMessage("");
      setError("Could not save notes. Browser storage may be unavailable.");
    }
  }

  return (
    <section className="panel notes-panel">
      <span className="eyebrow">MAKE IT YOURS</span>
      <h2>Personal notes</h2>

      <p className="notes-description">
        Write down what you learned, what confused you, and what you want to
        practise next.
      </p>

      <label htmlFor={inputId} className="notes-label">
        Your notes
      </label>

      <textarea
        id={inputId}
        className="notes-input"
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value);
          setMessage("");
        }}
        placeholder={
          "What I learned:\n\nWhat I want to practise:\n\nQuestions:"
        }
        rows={10}
        maxLength={10000}
      />

      <div className="notes-toolbar">
        <span className="muted">
          {notes.length.toLocaleString("en-US")} / 10,000 characters
        </span>

        <button
          type="button"
          className="button button-primary"
          disabled={!hasChanges}
          onClick={saveNotes}
        >
          Save notes
        </button>
      </div>

      <p className="notes-feedback" role="status">
        {hasChanges ? "You have unsaved changes." : message}
      </p>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <p className="storage-note">
        Notes are stored only in this browser. Save your changes before leaving
        this page.
      </p>
    </section>
  );
}
