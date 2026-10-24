"use server";

import { revalidatePath } from "next/cache";
import { requireAdminToken } from "@/lib/admin-session";

export type ContentTarget = {
  topicSlug: string;
  kind: "lessons" | "resources";
  id: string;
};

export type ContentActionState = {
  error: string;
  message: string;
};

export async function changeLearningContent(
  target: ContentTarget,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const token = await requireAdminToken();

  function fail(error: string): ContentActionState {
    return { error, message: "" };
  }

  // Bound arguments must also be validated on the server.
  if (
    !target ||
    typeof target.topicSlug !== "string" ||
    target.topicSlug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.topicSlug) ||
    !["lessons", "resources"].includes(target.kind) ||
    typeof target.id !== "string" ||
    target.id.length === 0 ||
    target.id.length > 100
  ) {
    return fail("Invalid content reference. Refresh the page.");
  }

  if (
    target.kind === "resources" &&
    (!/^[1-9]\d*$/.test(target.id) ||
      !Number.isSafeInteger(Number(target.id)) ||
      Number(target.id) > 2147483647)
  ) {
    return fail("Invalid resource ID.");
  }

  const operation = formData.get("operation");

  if (operation !== "update" && operation !== "delete") {
    return fail("Choose a valid operation.");
  }

  let body: string | undefined;

  if (operation === "delete") {
    if (formData.get("confirmed") !== "yes") {
      return fail("Confirm deletion before continuing.");
    }
  } else {
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();

    if (!title || title.length > 200) {
      return fail("Enter a title between 1 and 200 characters.");
    }

    if (target.kind === "lessons") {
      if (!description || description.length > 4000) {
        return fail("Enter a description between 1 and 4,000 characters.");
      }

      body = JSON.stringify({ title, description });
    } else {
      try {
        const address = new URL(url);

        if (
          url.length > 2048 ||
          !["http:", "https:"].includes(address.protocol) ||
          !address.hostname
        ) {
          return fail("Enter a valid HTTP or HTTPS URL.");
        }
      } catch {
        return fail("Enter a valid HTTP or HTTPS URL.");
      }

      body = JSON.stringify({ title, url });
    }
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The API connection is not configured.");
  }

  const endpoint =
    `/api/topics/${encodeURIComponent(target.topicSlug)}` +
    `/${target.kind}/${encodeURIComponent(target.id)}`;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: operation === "delete" ? "DELETE" : "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 401 || response.status === 403) {
      return fail("Your session is no longer valid. Sign in again.");
    }

    if (response.status === 404) {
      return fail(
        "This item no longer exists in this topic. Refresh the page.",
      );
    }

    if (response.status === 400) {
      return fail("The API rejected the input. Check the fields.");
    }

    if (!response.ok) {
      return fail(
        `Could not complete the operation (HTTP ${response.status}).`,
      );
    }
  } catch {
    return fail(
      "Could not confirm the operation. Refresh the page before retrying.",
    );
  }

  revalidatePath("/", "layout");

  return {
    error: "",
    message: operation === "delete" ? "Item deleted." : "Changes saved.",
  };
}
