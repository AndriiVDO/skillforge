"use server";

import { revalidatePath } from "next/cache";
import { requireAdminToken } from "@/lib/admin-session";

export type PublicationState = {
  error: string;
  message: string;
};

export async function setTopicPublication(
  slug: string,
  isPublished: boolean,
): Promise<PublicationState> {
  const token = await requireAdminToken();

  function fail(error: string): PublicationState {
    return { error, message: "" };
  }

  if (
    typeof slug !== "string" ||
    slug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof isPublished !== "boolean"
  ) {
    return fail("Invalid publication request.");
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The API connection is not configured.");
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(slug)}/publication`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished }),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 401 || response.status === 403) {
      return fail("Your session is no longer valid. Sign in again.");
    }

    if (response.status === 404) {
      return fail("The topic no longer exists. Refresh the catalog.");
    }

    if (!response.ok) {
      return fail(
        `Could not change publication status (HTTP ${response.status}).`,
      );
    }
  } catch {
    return fail(
      "Could not confirm the change. Refresh the page before retrying.",
    );
  }

  revalidatePath("/", "layout");

  return {
    error: "",
    message: isPublished
      ? "The topic is now published."
      : "The topic is now a draft.",
  };
}
