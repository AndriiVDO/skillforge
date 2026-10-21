import { cache } from "react";
import type { Lesson, LearningResource, Topic } from "@/lib/topics";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLesson(value: unknown): value is Lesson {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  );
}

function isResource(value: unknown): value is LearningResource {
  if (
    !isObject(value) ||
    typeof value.title !== "string" ||
    typeof value.url !== "string"
  ) {
    return false;
  }

  try {
    const url = new URL(value.url);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isTopic(value: unknown): value is Topic {
  return (
    isObject(value) &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    typeof value.description === "string" &&
    typeof value.outcome === "string" &&
    Array.isArray(value.lessons) &&
    value.lessons.every(isLesson) &&
    Array.isArray(value.resources) &&
    value.resources.every(isResource)
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

    if (!Array.isArray(data) || !data.every(isTopic)) {
      throw new Error("Topics API returned an invalid response.");
    }

    const slugs = new Set<string>();
    const lessonIds = new Set<string>();

    for (const topic of data) {
      if (slugs.has(topic.slug)) {
        throw new Error(`Duplicate topic slug: ${topic.slug}`);
      }

      slugs.add(topic.slug);

      for (const lesson of topic.lessons) {
        if (lessonIds.has(lesson.id)) {
          throw new Error(`Duplicate lesson ID: ${lesson.id}`);
        }

        lessonIds.add(lesson.id);
      }
    }

    return data;
  } catch (error) {
    console.error("Could not load topics:", error);
    return null;
  }
});
