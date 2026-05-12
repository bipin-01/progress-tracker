import type { LucideIcon } from "lucide-react";

export type Priority = "ziftinity" | "high" | "medium" | "low";
export type View = "dashboard" | "goals" | "habits" | "tasks" | "notes" | "calendar" | "progress" | "insights";
export type GoalChart = "line" | "bars" | "blocks" | "dots";
export type IconKey = "book" | "run" | "wallet" | "code" | "leaf" | "target";

export type Category = {
  name: string;
  progress: number;
  fraction: string;
  Icon: LucideIcon;
};

export type Goal = {
  id: string;
  title: string;
  due: string;
  level: Priority;
  progress: number;
  meta: string;
  iconKey: IconKey;
  chart: GoalChart;
};

export type ProjectTask = {
  id: string;
  name: string;
  done: boolean;
};

export type TaskProject = {
  id: string;
  name: string;
  deadlineDays: number;
  currentDay: number;
  tasksByDay: Record<number, ProjectTask[]>;
};

export type Habit = {
  id: string;
  name: string;
  time: string;
  duration: string;
  done: boolean;
};

export type CalendarEvent = {
  id: string;
  day: number;
  title: string;
  kind: "meeting" | "deadline" | "appointment" | "project" | "personal";
  time: string;
};
