export type Lesson = {
  id: string;
  title: string;
  description: string;
};

export type LearningResource = {
  id: number;
  title: string;
  url: string;
};

export type Topic = {
  slug: string;
  title: string;
  category: string;
  description: string;
  outcome: string;
  isPublished: boolean;
  lessons: Lesson[];
  resources: LearningResource[];
};
