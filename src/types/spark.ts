export type SparkStatus = "new" | "clarified" | "archived";

export type SparkCategory =
  | "Insight"
  | "Lesson"
  | "Quote"
  | "Content Idea"
  | "Story Seed"
  | "Business Idea"
  | "Task";

export interface Spark {
  id: string;
  raw_text: string;
  source_type: "text" | "voice";
  summary: string | null;
  core_idea: string | null;
  category: SparkCategory | null;
  status: SparkStatus;
  created_at: string;
  updated_at: string;
}

export interface PostDraft {
  id: string;
  spark_id: string;
  body: string;
  created_at: string;
}

