import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "skillforge_admin_session";

export type AdminIdentity = {
  email: string;
  role: "Admin";
};

export async function getAdmin(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const baseUrl = process.env.SKILLFORGE_API_URL;

  if (!token || !baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("email" in data) ||
      typeof data.email !== "string" ||
      !("role" in data) ||
      data.role !== "Admin"
    ) {
      return null;
    }

    return {
      email: data.email,
      role: "Admin",
    };
  } catch {
    return null;
  }
}

export async function requireAdminToken(): Promise<string> {
  const admin = await getAdmin();

  if (!admin) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  return token;
}
