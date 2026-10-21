export type Lesson = {
  id: string;
  title: string;
  description: string;
};

export type LearningResource = {
  title: string;
  url: string;
};

export type Topic = {
  slug: string;
  title: string;
  category: string;
  description: string;
  outcome: string;
  lessons: Lesson[];
  resources: LearningResource[];
};
