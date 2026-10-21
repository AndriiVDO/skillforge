import type { Metadata } from "next";
import { TopicsCatalog } from "@/components/skillforge";

export const metadata: Metadata = {
  title: "Learning topics",
};

export default function TopicsPage() {
  return <TopicsCatalog />;
}
