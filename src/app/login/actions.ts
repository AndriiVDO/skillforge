"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-session";

export type LoginState = {
  error: string;
  email?: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  function fail(error: string): LoginState {
    return { error, email };
  }

  if (
    email.length === 0 ||
    email.length > 256 ||
    password.length === 0 ||
    password.length > 1024
  ) {
    return fail("Enter your email and password.");
  }

  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!baseUrl) {
    return fail("The login service is not configured.");
  }

  let accessToken: string;
  let expiresIn: number;

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401) {
      return fail("Sign-in failed. Check your credentials or try again later.");
    }

    if (response.status === 429) {
      return fail("Too many sign-in attempts. Please wait a minute.");
    }

    if (!response.ok) {
      return fail("The login service is currently unavailable.");
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("accessToken" in data) ||
      typeof data.accessToken !== "string" ||
      data.accessToken.length === 0 ||
      !("expiresIn" in data) ||
      typeof data.expiresIn !== "number" ||
      !Number.isFinite(data.expiresIn) ||
      data.expiresIn <= 0
    ) {
      return fail("The login service returned an invalid response.");
    }

    accessToken = data.accessToken;
    expiresIn = Math.min(Math.floor(data.expiresIn), 1800);
  } catch {
    return fail("Could not connect to the login service.");
  }

  const cookieStore = await cookies();

  const secureCookie =
    process.env.AUTH_COOKIE_SECURE === undefined
      ? process.env.NODE_ENV === "production"
      : process.env.AUTH_COOKIE_SECURE === "true";

  cookieStore.set(ADMIN_COOKIE, accessToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE);

  revalidatePath("/", "layout");
  redirect("/login");
}
