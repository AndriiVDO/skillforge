import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicForm } from "@/components/topic-form";

export const metadata: Metadata = {
  title: "Create topic",
};

export default function NewTopicPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">GROW YOUR LEARNING PATH</span>
        <h1>Create a topic.</h1>
        <p>Define what you want to learn and what you want to build.</p>
      </section>

      <TopicForm />
    </>
  );
}
