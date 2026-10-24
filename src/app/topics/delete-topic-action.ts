"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminToken } from "@/lib/admin-session";

export type DeleteTopicState = {
  error: string;
};

export async function deleteTopic(
  slug: string,
  _previousState: DeleteTopicState,
  formData: FormData,
): Promise<DeleteTopicState> {
  const token = await requireAdminToken();

  if (
    typeof slug !== "string" ||
    slug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return { error: "Invalid topic reference." };
  }

  if (String(formData.get("confirmation") ?? "").trim() !== slug) {
    return { error: "Enter the topic slug exactly to confirm deletion." };
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return { error: "The API connection is not configured." };
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(slug)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 401 || response.status === 403) {
      return { error: "Your session is no longer valid. Sign in again." };
    }

    // If it was already deleted, return to the refreshed catalog.
    if (!response.ok && response.status !== 404) {
      return {
        error: `Could not delete the topic (HTTP ${response.status}).`,
      };
    }
  } catch {
    return {
      error: "Could not confirm deletion. Check the catalog before retrying.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/topics");
}
