"use client";
import { TopicNotes } from "@/components/topic-notes";
import { LessonForm } from "@/components/lesson-form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Topic } from "@/lib/topics";
import { ResourceForm } from "@/components/resource-form";
import { LearningContentManager } from "@/components/learning-content-manager";
import { DeleteTopicForm } from "@/components/delete-topic-form";
import { TopicPublicationForm } from "@/components/topic-publication-form";

const STORAGE_KEY = "skillforge.completed-lessons.v1";
const PROGRESS_EVENT = "skillforge-progress";

function readProgress(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return [
      ...new Set(
        parsed.filter((value): value is string => typeof value === "string"),
      ),
    ];
  } catch {
    return [];
  }
}

function useProgress() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    function syncProgress() {
      setCompleted(readProgress());
      setReady(true);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        syncProgress();
      }
    }

    syncProgress();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROGRESS_EVENT, syncProgress);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROGRESS_EVENT, syncProgress);
    };
  }, []);

  function toggleLesson(id: string) {
    if (!ready) return;

    const current = readProgress();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCompleted(next);
      setStorageError(false);
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    } catch {
      setStorageError(true);
    }
  }

  return { completed, ready, storageError, toggleLesson };
}

function getCompletedCount(topic: Topic, completed: string[]) {
  return topic.lessons.filter((lesson) => completed.includes(lesson.id)).length;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="main-content" role="status">
          <p>Loading SkillForge…</p>
        </div>
      }
    >
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { href: "/", label: "Overview" },
    { href: "/topics", label: "Learning topics" },
    { href: "/system", label: "System" },
    { href: "/admin", label: "Administration" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="SkillForge home">
          <span className="brand-mark">S</span>
          SkillForge<span className="brand-dot">.</span>
        </Link>

        <p className="nav-label">YOUR WORKSPACE</p>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <span className="eyebrow">BUILD YOUR KNOWLEDGE</span>
          <p>Learn something. Build something. Make it yours.</p>
          <span className="muted">Your personal learning workspace.</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <span>Personal workspace</span>
          <span className="workspace-status">
            <span className="status-dot" />
            Learning mode
          </span>
        </header>

        <main id="main-content" className="main-content">
          {children}
        </main>

        <footer className="footer">
          <span>SkillForge · Built through practice</span>
          <span>Small steps. Real skills.</span>
        </footer>
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  completed,
  ready,
}: {
  topic: Topic;
  completed: string[];
  ready: boolean;
}) {
  const done = getCompletedCount(topic, completed);
  const percent =
    topic.lessons.length === 0
      ? 0
      : Math.round((done / topic.lessons.length) * 100);
  return (
    <Link href={`/topics/${topic.slug}`} className="topic-card">
      <div className="card-top">
        <span className="badge">{topic.category}</span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>

      {!topic.isPublished && <span className="badge">Draft</span>}
      <h3>{topic.title}</h3>
      <p>{topic.description}</p>

      <div className="card-progress">
        <div className="progress-label">
          <span>
            {ready ? `${done} / ${topic.lessons.length} completed` : "Loading…"}
          </span>
          <span>{ready ? `${percent}%` : "—"}</span>
        </div>

        <div className="progress-track" aria-hidden="true">
          <div style={{ width: `${ready ? percent : 0}%` }} />
        </div>
      </div>
    </Link>
  );
}

export function Dashboard({ topics }: { topics: Topic[] }) {
  const { completed, ready } = useProgress();

  const totalLessons = topics.reduce(
    (total, topic) => total + topic.lessons.length,
    0,
  );

  const completedTaskCount = topics.reduce(
    (total, topic) =>
      total +
      topic.lessons.filter((lesson) => completed.includes(lesson.id)).length,
    0,
  );

  const activeTopics = topics.filter((topic) => {
    const count = getCompletedCount(topic, completed);
    return count > 0 && count < topic.lessons.length;
  }).length;

  const nextTopic = topics.find(
    (topic) => getCompletedCount(topic, completed) < topic.lessons.length,
  );

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">YOUR LEARNING JOURNEY</span>
        <h1>Build skills that stick.</h1>
        <p>
          Turn curiosity into practical knowledge, one finished task at a time.
        </p>
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-tag">LEARN → BUILD → SHARE</span>
          <h2>Your next chapter starts with a small step.</h2>
          <p>
            Explore a topic, practise what you learn, and turn your progress
            into projects you can show.
          </p>
          <Link href="/topics" className="button button-primary">
            Explore learning topics <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-core">S</span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Learning statistics">
        <div className="stat-card">
          <span>Learning topics</span>
          <strong>{topics.length.toString().padStart(2, "0")}</strong>
          <p>A foundation for your next projects</p>
        </div>

        <div className="stat-card">
          <span>Completed tasks</span>
          <strong>
            {ready ? completedTaskCount.toString().padStart(2, "0") : "—"}
            <small> / {totalLessons}</small>
          </strong>
          <p>Practical steps you have finished</p>
        </div>

        <div className="stat-card">
          <span>In progress</span>
          <strong>
            {ready ? activeTopics.toString().padStart(2, "0") : "—"}
          </strong>
          <p>Topics you have started exploring</p>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">MAKE YOUR NEXT MOVE</span>
            <h2>Your learning path</h2>
          </div>
          <Link href="/topics" className="text-link">
            View all topics →
          </Link>
        </div>

        <div className="topics-grid">
          {topics.slice(0, 3).map((topic) => (
            <TopicCard
              key={topic.slug}
              topic={topic}
              completed={completed}
              ready={ready}
            />
          ))}
        </div>
      </section>

      {ready && (
        <section className="next-step">
          <div>
            <span className="eyebrow">
              {nextTopic ? "SUGGESTED NEXT STEP" : "PATH COMPLETED"}
            </span>
            <h2>
              {nextTopic
                ? `Keep moving with ${nextTopic.title}.`
                : "You have completed every task in this learning path."}
            </h2>
            <p>
              {nextTopic
                ? nextTopic.outcome
                : "Revisit a topic and apply what you learned in a new project."}
            </p>
          </div>
          <Link
            href={nextTopic ? `/topics/${nextTopic.slug}` : "/topics"}
            className="button button-secondary"
          >
            {nextTopic ? "Open topic →" : "Review topics →"}
          </Link>
        </section>
      )}
    </>
  );
}

export function TopicsCatalog({
  topics,
  isAdmin = false,
}: {
  topics: Topic[];
  isAdmin?: boolean;
}) {
  const { completed, ready } = useProgress();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "drafts">("all");

  const availableTopics = isAdmin
    ? topics
    : topics.filter((topic) => topic.isPublished);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTopics = availableTopics.filter((topic) => {
    const matchesQuery = `${topic.title} ${topic.category} ${topic.description}`
      .toLowerCase()
      .includes(normalizedQuery);

    const matchesStatus =
      !isAdmin ||
      status === "all" ||
      (status === "published" && topic.isPublished) ||
      (status === "drafts" && !topic.isPublished);

    return matchesQuery && matchesStatus;
  });

  const publishedCount = availableTopics.filter(
    (topic) => topic.isPublished,
  ).length;

  const filters = [
    { value: "all", label: "All", count: availableTopics.length },
    { value: "published", label: "Published", count: publishedCount },
    {
      value: "drafts",
      label: "Drafts",
      count: availableTopics.length - publishedCount,
    },
  ] as const;

  function resetFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">EXPLORE YOUR INTERESTS</span>
        <h1>A little curiosity goes far.</h1>
        <p>Choose a topic and start turning ideas into practical skills.</p>
      </section>

      {isAdmin && (
        <div className="editor-actions">
          <Link href="/topics/new" className="button button-primary">
            Create topic →
          </Link>
        </div>
      )}

      <div className="catalog-toolbar">
        <label className="search-field">
          <span className="sr-only">Search topics</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search topics or categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <span className="muted" role="status" aria-live="polite">
          {filteredTopics.length} of {availableTopics.length} topics
        </span>
      </div>

      {isAdmin && (
        <div
          className="catalog-filters"
          role="group"
          aria-label="Filter topics by publication status"
        >
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`catalog-filter ${
                status === filter.value ? "is-active" : ""
              }`}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
              <span className="catalog-filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="topics-grid">
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.slug}
            topic={topic}
            completed={completed}
            ready={ready}
          />
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="empty-state">
          <h2>
            {availableTopics.length === 0
              ? "No topics available yet"
              : "No matching topics"}
          </h2>

          <p>
            {availableTopics.length === 0
              ? isAdmin
                ? "Create your first topic to start building the catalog."
                : "Check back soon for new learning content."
              : "Try another search or reset the filters."}
          </p>

          {(query !== "" || (isAdmin && status !== "all")) && (
            <button
              type="button"
              className="button button-secondary"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function TopicDetail({
  topic,
  isAdmin = false,
}: {
  topic: Topic;
  isAdmin?: boolean;
}) {
  const { completed, ready, storageError, toggleLesson } = useProgress();

  const done = getCompletedCount(topic, completed);
  const percent =
    topic.lessons.length === 0
      ? 0
      : Math.round((done / topic.lessons.length) * 100);
  return (
    <>
      <Link href="/topics" className="back-link">
        ← Back to learning topics
      </Link>

      <section className="page-heading detail-heading">
        <span className="eyebrow">{topic.category}</span>
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </section>

      {isAdmin && (
        <TopicPublicationForm
          key={`publication-${topic.slug}`}
          slug={topic.slug}
          isPublished={topic.isPublished}
        />
      )}

      {isAdmin && (
        <div className="editor-actions">
          <Link
            href={`/topics/${topic.slug}/edit`}
            className="button button-secondary"
          >
            Edit topic
          </Link>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">LEARNING CHECKLIST</span>
                <h2>One task at a time.</h2>
              </div>
              <span className="badge">
                {ready ? `${done}/${topic.lessons.length}` : "…"}
              </span>
            </div>

            <p className="checklist-intro">
              Mark a task complete when you can explain it and demonstrate it.
            </p>

            {topic.lessons.length === 0 && (
              <p className="notes-description">
                {isAdmin
                  ? "No tasks yet. Add the first practical step below."
                  : "No tasks have been added yet."}
              </p>
            )}

            <div className="lesson-list">
              {topic.lessons.map((lesson, index) => {
                const checked = completed.includes(lesson.id);

                return (
                  <label
                    key={lesson.id}
                    className={`lesson ${checked ? "lesson-completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!ready}
                      onChange={() => toggleLesson(lesson.id)}
                    />
                    <span className="lesson-copy">
                      <span className="lesson-number">
                        TASK {String(index + 1).padStart(2, "0")}
                      </span>
                      <strong>{lesson.title}</strong>
                      <span>{lesson.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="storage-note">
              Progress is saved in this browser. It is not synced across
              devices.
            </p>

            {storageError && (
              <p className="error-message" role="alert">
                Could not save your progress. Check whether browser storage is
                available.
              </p>
            )}
          </section>

          {isAdmin && (
            <LessonForm
              key={`lesson-form-${topic.slug}`}
              topicSlug={topic.slug}
            />
          )}
          <TopicNotes key={topic.slug} topicSlug={topic.slug} />

          {isAdmin && (
            <>
              <LearningContentManager
                key={`manager-${topic.slug}`}
                topic={topic}
              />

              <DeleteTopicForm
                key={`delete-topic-${topic.slug}`}
                slug={topic.slug}
                title={topic.title}
              />
            </>
          )}
        </div>

        <aside className="detail-aside">
          <section className="panel">
            <span className="eyebrow">YOUR PROGRESS</span>
            <div className="large-progress">{ready ? `${percent}%` : "…"}</div>
            <div className="progress-track" aria-hidden="true">
              <div style={{ width: `${ready ? percent : 0}%` }} />
            </div>
            <p className="muted">
              {ready ? done : "—"} of {topic.lessons.length} tasks completed
            </p>
          </section>

          <section className="panel outcome-panel">
            <span className="eyebrow">PRACTICAL OUTCOME</span>
            <h2>Build something real.</h2>
            <p>{topic.outcome}</p>
          </section>

          <section className="panel">
            <span className="eyebrow">GO DEEPER</span>
            <h2>Learning resources</h2>
            <div className="resource-list">
              {topic.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.title}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>

          {isAdmin && (
            <ResourceForm
              key={`resource-form-${topic.slug}`}
              topicSlug={topic.slug}
            />
          )}
        </aside>
      </div>
    </>
  );
}
