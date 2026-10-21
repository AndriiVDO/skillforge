import { cache } from "react";
import { topics as localTopics, type Topic } from "@/lib/topics";

type TopicSummary = {
  slug: string;
  title: string;
  category: string;
  taskCount: number;
};

function isTopicSummary(value: unknown): value is TopicSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "slug" in value &&
    typeof value.slug === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "category" in value &&
    typeof value.category === "string" &&
    "taskCount" in value &&
    typeof value.taskCount === "number" &&
    Number.isInteger(value.taskCount) &&
    value.taskCount >= 0
  );
}

export const getApiTopics = cache(async (): Promise<Topic[] | null> => {
  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    console.error("SKILLFORGE_API_URL is not configured.");
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/topics`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Topics API returned HTTP ${response.status}.`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data) || !data.every(isTopicSummary)) {
      throw new Error("Topics API returned an invalid response.");
    }

    const slugs = new Set<string>();

    return data.map((summary) => {
      if (slugs.has(summary.slug)) {
        throw new Error(`Duplicate topic slug: ${summary.slug}`);
      }

      slugs.add(summary.slug);

      const content = localTopics.find((topic) => topic.slug === summary.slug);

      if (!content) {
        throw new Error(
          `Learning content is missing for topic: ${summary.slug}`,
        );
      }

      if (summary.taskCount !== content.lessons.length) {
        throw new Error(
          `Task count does not match learning content: ${summary.slug}`,
        );
      }

      return {
        ...content,
        title: summary.title,
        category: summary.category,
      };
    });
  } catch (error) {
    console.error("Could not load topics:", error);
    return null;
  }
});
