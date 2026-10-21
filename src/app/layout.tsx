import type { Metadata } from "next";
import { AppShell } from "@/components/skillforge";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SkillForge — Your learning workspace",
    template: "%s | SkillForge",
  },
  description:
    "A personal workspace for learning technical skills through practical tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
