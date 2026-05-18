import type { LucideIcon } from "lucide-react";

export type Priority = "ziftinity" | "high" | "medium" | "low";
export type View = "dashboard" | "today" | "planner" | "goals" | "habits" | "tasks" | "kanban" | "notes" | "chinese" | "prompt" | "pentesting" | "calendar" | "progress" | "insights" | "agents";
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
  milestones?: GoalMilestone[];
};

export type GoalMilestone = {
  id: string;
  title: string;
  done: boolean;
  weight: number;
};

export type ProjectTask = {
  id: string;
  name: string;
  done: boolean;
};

export type TaskProject = {
  id: string;
  name: string;
  goalId?: string;
  outcome?: string;
  startDate: string;
  endDate: string;
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
  date: string;
  day: number;
  title: string;
  kind: "meeting" | "deadline" | "appointment" | "project" | "personal";
  time: string;
};

export type StudyNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  kind: "note" | "document";
  folderId?: string;
  sourceName?: string;
  mimeType?: string;
  fileDataUrl?: string;
  extractedText?: string;
  flashcards?: StudyFlashcard[];
  askHistory?: StudyAskMessage[];
  readingProgress?: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type StudyFlashcard = {
  id: string;
  question: string;
  answer: string;
  source: string;
  difficulty: "new" | "learning" | "known";
  reviewCount: number;
  dueAt: string;
  lastReviewedAt?: string;
  createdAt: string;
};

export type StudyAskMessage = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export type StudyObjective = {
  id: string;
  title: string;
  done: boolean;
  weight: number;
};

export type StudyFolder = {
  id: string;
  name: string;
  color: KanbanLabelColor;
  parentId?: string;
  examDate?: string;
  objectives?: StudyObjective[];
  deletedAt?: string;
  createdAt: string;
};

export type KanbanColumnId = string;
export type KanbanLabelColor = "cyan" | "violet" | "lime" | "amber" | "red";

export type KanbanLabel = {
  name: string;
  color: KanbanLabelColor;
};

export type KanbanSubtask = {
  id: string;
  title: string;
  done: boolean;
};

export type KanbanAttachment = {
  id: string;
  name: string;
  url: string;
};

export type KanbanComment = {
  id: string;
  body: string;
  createdAt: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  description: string;
  columnId: KanbanColumnId;
  priority: Priority;
  linkedTaskProjectId?: string;
  linkedDay?: number;
  dueDate?: string;
  tags: string[];
  labels: KanbanLabel[];
  subtasks: KanbanSubtask[];
  estimateMinutes?: number;
  trackedMinutes?: number;
  attachments: KanbanAttachment[];
  comments: KanbanComment[];
  blockedBy?: string;
  archivedAt?: string;
  order: number;
};

export type KanbanActivity = {
  id: string;
  cardId: string;
  cardTitle: string;
  action: "created" | "moved" | "deleted";
  fromColumnId?: KanbanColumnId;
  toColumnId?: KanbanColumnId;
  createdAt: string;
};

export type ActivityEventDomain = "goal" | "habit" | "task" | "kanban" | "calendar" | "notes" | "agent" | "system";
export type ActivityEventAction =
  | "created"
  | "updated"
  | "deleted"
  | "completed"
  | "reopened"
  | "deferred"
  | "moved"
  | "reviewed"
  | "opened"
  | "accepted"
  | "dismissed"
  | "archived"
  | "generated";
export type ActivityEventMetadata = Record<string, string | number | boolean | null | undefined>;

export type ActivityEvent = {
  id: string;
  domain: ActivityEventDomain;
  action: ActivityEventAction;
  entityId: string;
  entityTitle: string;
  source: string;
  dayKey: string;
  timestamp: string;
  metadata?: ActivityEventMetadata;
};

export type AgentId = "planner" | "reviewer" | "motivation" | "project" | "discipline";
export type AgentSeverity = "info" | "notice" | "warning" | "critical";
export type AgentRecommendationStatus = "pending" | "accepted" | "dismissed";

export type AgentRecommendationAction =
  | {
      type: "create_task";
      label: string;
      projectId: string;
      day: number;
      taskName: string;
    }
  | {
      type: "create_kanban";
      label: string;
      title: string;
      description: string;
      priority: Priority;
      tags: string[];
      dueDate?: string;
    }
  | {
      type: "create_calendar";
      label: string;
      title: string;
      date: string;
      time: string;
      kind: CalendarEvent["kind"];
    };

export type AgentRecommendation = {
  id: string;
  agentId: AgentId;
  agentName: string;
  title: string;
  body: string;
  severity: AgentSeverity;
  score?: number;
  confidence?: number;
  evidence?: string[];
  status: AgentRecommendationStatus;
  source: string;
  action?: AgentRecommendationAction;
  createdAt: string;
};
