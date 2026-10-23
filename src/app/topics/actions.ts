"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminToken } from "@/lib/admin-session";

export type TopicFormValues = {
  slug: string;
  title: string;
  category: string;
  description: string;
  outcome: string;
};

export type TopicFormState = {
  error: string;
  values?: TopicFormValues;
};

export async function saveTopic(
  existingSlug: string | null,
  _previousState: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const adminToken = await requireAdminToken();

  const values: TopicFormValues = {
    slug: existingSlug ?? String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    outcome: String(formData.get("outcome") ?? "").trim(),
  };

  function fail(error: string): TopicFormState {
    return { error, values };
  }

  if (Object.values(values).some((value) => value.length === 0)) {
    return fail("Please complete every field.");
  }

  if (
    values.slug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) ||
    values.slug === "new"
  ) {
    return fail("Choose a valid slug, for example: database-fundamentals.");
  }

  if (
    values.title.length > 150 ||
    values.category.length > 100 ||
    values.description.length > 2000 ||
    values.outcome.length > 2000
  ) {
    return fail("One or more fields exceed the allowed length.");
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The API connection is not configured.");
  }

  try {
    const endpoint = existingSlug
      ? `/api/topics/${encodeURIComponent(existingSlug)}`
      : "/api/topics";

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: existingSlug ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 401 || response.status === 403) {
      return fail("Your session is no longer valid. Sign in again.");
    }

    if (response.status === 409) {
      return fail("A topic with this slug already exists.");
    }

    if (response.status === 404) {
      return fail(
        "The topic or editing endpoint was not found. Check that the API runs in Development.",
      );
    }

    if (!response.ok) {
      return fail(`Could not save the topic (HTTP ${response.status}).`);
    }
  } catch {
    return fail(
      "Could not confirm the save. Check the catalog before retrying.",
    );
  }

  revalidatePath("/", "layout");
  redirect(`/topics/${encodeURIComponent(values.slug)}`);
}

export type LessonFormState = {
  error: string;
  values?: {
    title: string;
    description: string;
  };
};

export async function addLesson(
  topicSlug: string,
  _previousState: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  const adminToken = await requireAdminToken();

  const values = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };

  function fail(error: string): LessonFormState {
    return { error, values };
  }

  if (
    values.title.length === 0 ||
    values.title.length > 200 ||
    values.description.length === 0 ||
    values.description.length > 4000
  ) {
    return fail(
      "Enter a title of up to 200 characters and a description of up to 4,000 characters.",
    );
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The API connection is not configured.");
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(topicSlug)}/lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 401 || response.status === 403) {
      return fail("Your session is no longer valid. Sign in again.");
    }

    if (response.status === 409) {
      return fail("The task list changed. Please try again.");
    }

    if (response.status === 404) {
      return fail(
        "The topic or editing endpoint was not found. Check that the API runs in Development.",
      );
    }

    if (!response.ok) {
      return fail(`Could not add the task (HTTP ${response.status}).`);
    }
  } catch {
    return fail(
      "Could not confirm the save. Check the task list before retrying.",
    );
  }

  revalidatePath("/", "layout");
  redirect(`/topics/${encodeURIComponent(topicSlug)}`);
}

export type ResourceFormState = {
  error: string;
  values?: {
    title: string;
    url: string;
  };
};

export async function addResource(
  topicSlug: string,
  _previousState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const adminToken = await requireAdminToken();

  const values = {
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
  };

  function fail(error: string): ResourceFormState {
    return { error, values };
  }

  if (values.title.length === 0 || values.title.length > 200) {
    return fail("Enter a title between 1 and 200 characters.");
  }

  try {
    const address = new URL(values.url);

    if (
      values.url.length > 2048 ||
      !["http:", "https:"].includes(address.protocol) ||
      !address.hostname
    ) {
      return fail("Enter a valid HTTP or HTTPS URL.");
    }
  } catch {
    return fail(
      "Enter a valid URL, for example: https://www.postgresql.org/docs/.",
    );
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The API connection is not configured.");
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(topicSlug)}/resources`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 401 || response.status === 403) {
      return fail("Your session is no longer valid. Sign in again.");
    }

    if (response.status === 409) {
      return fail("The resource list changed. Please try again.");
    }

    if (response.status === 404) {
      return fail(
        "The topic or editing endpoint was not found. Check that the API runs in Development.",
      );
    }

    if (!response.ok) {
      return fail(`Could not add the resource (HTTP ${response.status}).`);
    }
  } catch {
    return fail(
      "Could not confirm the save. Check the resource list before retrying.",
    );
  }

  revalidatePath("/", "layout");
  redirect(`/topics/${encodeURIComponent(topicSlug)}`);
}
