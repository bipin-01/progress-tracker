import {
  Bell,
  Bot,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Columns3,
  CircleDollarSign,
  Code2,
  Gauge,
  HeartPulse,
  Home,
  Leaf,
  ListTodo,
  Music,
  NotebookText,
  Eye,
  FileText,
  PersonStanding,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
  WalletCards,
} from "lucide-react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { CSSProperties, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  activityEventCrud,
  agentRecommendationCrud,
  calendarCrud,
  goalCrud,
  habitCrud,
  kanbanActivityCrud,
  kanbanCrud,
  studyFolderCrud,
  studyNoteCrud,
  taskProjectCrud,
  seedRemoteDatabase,
  useCalendarEventsData,
  useActivityEventsData,
  useAgentRecommendationsData,
  useDataBackendLabel,
  useGoalsData,
  useHabitsData,
  useKanbanActivityData,
  useKanbanCardsData,
  useSupabaseAuth,
  useStudyFoldersData,
  useStudyNotesData,
  useTaskProjectsData,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "./dataStore";
import { seedDatabase } from "./database";
import type { ActivityEvent, ActivityEventAction, ActivityEventDomain, ActivityEventMetadata, AgentId, AgentRecommendation, CalendarEvent, Category, Goal, GoalMilestone, Habit, IconKey, KanbanActivity, KanbanCard, KanbanColumnId, KanbanLabelColor, Priority, ProjectTask, StudyFolder, StudyNote, StudyObjective, TaskProject, View } from "./types";

const iconMap: Record<IconKey, typeof BookOpen> = {
  book: BookOpen,
  run: PersonStanding,
  wallet: WalletCards,
  code: Code2,
  leaf: Leaf,
  target: Target,
};

const categories: Category[] = [
  { name: "Personal", progress: 75, fraction: "6 / 8", Icon: PersonStanding },
  { name: "Health", progress: 68, fraction: "4 / 6", Icon: HeartPulse },
  { name: "Learning", progress: 60, fraction: "3 / 5", Icon: BookOpen },
  { name: "Career", progress: 80, fraction: "4 / 5", Icon: BriefcaseBusiness },
  { name: "Finance", progress: 64, fraction: "3 / 5", Icon: CircleDollarSign },
  { name: "Creativity", progress: 50, fraction: "2 / 4", Icon: Music },
];

const priorityRank: Record<Priority, number> = {
  ziftinity: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const priorityLabel: Record<Priority, string> = {
  ziftinity: "Ziftinity",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const initialGoals: Goal[] = [
  {
    id: "read-books",
    title: "Read 24 books this year",
    due: "Dec 31, 2026",
    level: "high",
    progress: 50,
    meta: "12 / 24 books completed",
    iconKey: "book",
    chart: "line",
    milestones: makeGoalMilestones([
      ["Choose monthly reading queue", true, 20],
      ["Finish 12 books", true, 30],
      ["Write 6 book summaries", false, 25],
      ["Finish remaining 12 books", false, 25],
    ]),
  },
  {
    id: "run-10k",
    title: "Run a 10K",
    due: "Jun 30, 2026",
    level: "high",
    progress: 70,
    meta: "4 runs this week",
    iconKey: "run",
    chart: "bars",
    milestones: makeGoalMilestones([
      ["Build 5K base", true, 25],
      ["Complete 4 tempo sessions", true, 25],
      ["Run 8K comfortably", false, 25],
      ["Complete 10K attempt", false, 25],
    ]),
  },
  {
    id: "save-5000",
    title: "Save $5,000",
    due: "Dec 31, 2026",
    level: "high",
    progress: 64,
    meta: "$3,200 / $5,000 saved",
    iconKey: "wallet",
    chart: "line",
    milestones: makeGoalMilestones([
      ["Automate weekly transfer", true, 25],
      ["Reach $3,000 saved", true, 30],
      ["Audit recurring spending", false, 20],
      ["Reach $5,000 saved", false, 25],
    ]),
  },
  {
    id: "launch-website",
    title: "Launch my website",
    due: "Aug 15, 2026",
    level: "medium",
    progress: 45,
    meta: "Design phase in progress",
    iconKey: "code",
    chart: "blocks",
    milestones: makeGoalMilestones([
      ["Map sitemap", true, 20],
      ["Ship homepage design", false, 25],
      ["Build project pages", false, 25],
      ["Launch public site", false, 30],
    ]),
  },
  {
    id: "meditation",
    title: "Daily meditation habit",
    due: "Ongoing",
    level: "low",
    progress: 80,
    meta: "24 of 30 days this month",
    iconKey: "leaf",
    chart: "dots",
    milestones: makeGoalMilestones([
      ["Set morning cue", true, 30],
      ["Complete 20 sessions", true, 35],
      ["Add evening recovery check", false, 15],
      ["Complete 30-session month", false, 20],
    ]),
  },
];

const initialTaskProjects: TaskProject[] = [
  {
    id: "onboarding-flow",
    name: "Launch onboarding flow",
    goalId: "launch-website",
    outcome: "Complete onboarding experience before website launch",
    startDate: "2026-05-01",
    endDate: "2026-06-19",
    deadlineDays: 50,
    currentDay: 12,
    tasksByDay: {
      12: [
        { id: "wireframe-screen", name: "Wireframe onboarding screen 3", done: false },
        { id: "review-pr", name: "Review pull request #312", done: false },
        { id: "maya-copy", name: "Sync with Maya - copy review", done: true },
      ],
    },
  },
  {
    id: "run-10k",
    name: "Run a 10K",
    goalId: "run-10k",
    outcome: "Finish a comfortable 10K attempt",
    startDate: "2026-05-01",
    endDate: "2026-06-09",
    deadlineDays: 40,
    currentDay: 8,
    tasksByDay: {
      8: [
        { id: "tempo-run", name: "Tempo run - 5km", done: false },
        { id: "hydrate", name: "Hydrate 2L", done: true },
        { id: "stretch", name: "Stretch - 15 min", done: false },
      ],
    },
  },
  {
    id: "save-money",
    name: "Save $5,000",
    goalId: "save-5000",
    outcome: "Reach $5,000 saved with weekly money tasks",
    startDate: "2026-05-01",
    endDate: "2026-07-29",
    deadlineDays: 90,
    currentDay: 41,
    tasksByDay: {
      41: [
        { id: "log-spending", name: "Log this week's spending", done: false },
        { id: "auto-transfer", name: "Auto-transfer $120 to savings", done: false },
      ],
    },
  },
];

function makeGoalMilestones(items: Array<[string, boolean, number]>): GoalMilestone[] {
  return items.map(([title, done, weight], index) => ({
    id: `milestone-${index + 1}-${slugify(title)}`,
    title,
    done,
    weight,
  }));
}

const initialHabits: Habit[] = [
  { id: "wake", name: "Wake", time: "06:30", duration: "start", done: true },
  { id: "meditate", name: "Meditate", time: "07:00", duration: "10 min", done: true },
  { id: "run", name: "Run 5km", time: "07:30", duration: "easy pace", done: true },
  { id: "deep-work", name: "Deep work - onboarding flow", time: "09:30", duration: "90 min", done: true },
  { id: "read", name: "Read 30 pages", time: "21:00", duration: "pages", done: false },
  { id: "stretch", name: "Stretch & mobility", time: "20:00", duration: "15 min", done: false },
  { id: "journal", name: "Evening journal", time: "22:00", duration: "reflection", done: false },
];

const journalEntries = [
  {
    date: "May 11",
    body: "Tried the running shoes my brother gave me. They click. Slept like a rock after.",
  },
  {
    date: "May 10",
    body: "First draft of onboarding wireframes done. Hate the third screen. Will revisit Tuesday.",
  },
  {
    date: "May 09",
    body: "Skipped reading. Brain was mush. Slept early instead - fair trade.",
  },
];

const initialStudyNotes: StudyNote[] = [
  {
    id: "study-running-shoes",
    title: "Running Shoes Field Notes",
    body: "## Observation\nTried the running shoes my brother gave me. They click, but recovery sleep was strong after.\n\n## Follow-up\n- Compare pace after two more runs\n- Note ankle comfort\n- Decide if these become race-day shoes",
    tags: ["running", "reflection"],
    pinned: true,
    kind: "note",
    createdAt: "2026-05-11T21:45:00.000Z",
    updatedAt: "2026-05-11T21:45:00.000Z",
  },
  {
    id: "study-onboarding-wireframes",
    title: "Onboarding Wireframe Review",
    body: "## Current read\nFirst draft is functional, but the third screen is carrying too much explanation.\n\n> Revisit Tuesday with a smaller decision path.\n\n### Questions\n- What does the user need to know first?\n- Which action should be visually dominant?\n- Can the empty state become useful instead of decorative?",
    tags: ["product", "ux", "study"],
    pinned: false,
    kind: "note",
    createdAt: "2026-05-12T09:45:00.000Z",
    updatedAt: "2026-05-12T09:45:00.000Z",
  },
];

const initialStudyFolders: StudyFolder[] = [
  { id: "folder-all-study", name: "Study Inbox", color: "cyan", createdAt: "2026-05-11T12:00:00.000Z" },
  { id: "folder-certifications", name: "Certifications", color: "violet", createdAt: "2026-05-11T12:05:00.000Z" },
  {
    id: "folder-network-plus",
    name: "Network+",
    color: "cyan",
    parentId: "folder-certifications",
    examDate: "2026-07-10",
    objectives: makeStudyObjectives([
      ["Networking fundamentals", 24],
      ["IP addressing and subnetting", 22],
      ["Network implementations", 20],
      ["Operations and troubleshooting", 18],
      ["Security concepts", 16],
    ]),
    createdAt: "2026-05-11T12:06:00.000Z",
  },
  {
    id: "folder-security-plus",
    name: "Security+",
    color: "red",
    parentId: "folder-certifications",
    examDate: "2026-08-28",
    objectives: makeStudyObjectives([
      ["General security concepts", 22],
      ["Threats, vulnerabilities, and mitigations", 22],
      ["Security architecture", 20],
      ["Security operations", 20],
      ["Governance, risk, and compliance", 16],
    ]),
    createdAt: "2026-05-11T12:07:00.000Z",
  },
  {
    id: "folder-prompt-engineering",
    name: "Prompt Engineering",
    color: "amber",
    parentId: "folder-certifications",
    examDate: "2026-06-21",
    objectives: makeStudyObjectives([
      ["Prompt patterns", 20],
      ["Evaluation loops", 22],
      ["Tool use and agents", 22],
      ["Retrieval workflows", 18],
      ["Safety and guardrails", 18],
    ]),
    createdAt: "2026-05-11T12:08:00.000Z",
  },
  { id: "folder-project-notes", name: "Project Notes", color: "lime", createdAt: "2026-05-11T12:10:00.000Z" },
];

function makeStudyObjectives(items: Array<[string, number]>): StudyObjective[] {
  return items.map(([title, weight], index) => ({
    id: `objective-${index + 1}-${slugify(title)}`,
    title,
    weight,
    done: false,
  }));
}

const initialCalendarEvents: CalendarEvent[] = [];
const calendarMonth = 4;
const calendarYear = 2026;

type KanbanColumnConfig = {
  id: KanbanColumnId;
  title: string;
  signal: string;
  wipLimit: number;
  collapsed: boolean;
};

type KanbanSortMode = "manual" | "priority" | "due" | "title";
type KanbanSwimlaneMode = "none" | "priority" | "tag" | "project";
type KanbanBoardMode = "board" | "list" | "calendar";
type KanbanDueFilter = "all" | "overdue" | "today" | "scheduled" | "none";

const defaultKanbanColumns: KanbanColumnConfig[] = [
  { id: "backlog", title: "Backlog", signal: "Capture", wipLimit: 6, collapsed: false },
  { id: "planned", title: "Planned", signal: "Queued", wipLimit: 5, collapsed: false },
  { id: "in-progress", title: "In Progress", signal: "Active", wipLimit: 3, collapsed: false },
  { id: "review", title: "Review", signal: "Verify", wipLimit: 4, collapsed: false },
  { id: "done", title: "Done", signal: "Complete", wipLimit: 99, collapsed: false },
];

const initialKanbanCards: KanbanCard[] = [
  {
    id: "kanban-wireframes",
    title: "Wireframe onboarding flow",
    description: "Resolve the third screen and map the first-run task path.",
    columnId: "in-progress",
    priority: "high",
    linkedTaskProjectId: "onboarding-flow",
    linkedDay: 12,
    dueDate: "2026-05-15",
    tags: ["product", "ux"],
    labels: [{ name: "Product", color: "cyan" }],
    subtasks: [
      { id: "sub-wire-1", title: "Map screen states", done: true },
      { id: "sub-wire-2", title: "Clean empty state", done: false },
    ],
    estimateMinutes: 180,
    trackedMinutes: 95,
    attachments: [{ id: "att-wire-1", name: "Flow notes", url: "https://example.com/onboarding-flow" }],
    comments: [
      { id: "comment-wire-1", body: "Third screen still needs sharper hierarchy.", createdAt: "2026-05-12T14:30:00.000Z" },
    ],
    order: 1,
  },
  {
    id: "kanban-supabase",
    title: "Connect hosted Supabase",
    description: "Move from local stack to hosted project once credentials are ready.",
    columnId: "planned",
    priority: "ziftinity",
    dueDate: "2026-05-18",
    tags: ["backend"],
    labels: [{ name: "Backend", color: "violet" }],
    subtasks: [
      { id: "sub-supa-1", title: "Create hosted project", done: false },
      { id: "sub-supa-2", title: "Push migrations", done: false },
    ],
    estimateMinutes: 120,
    trackedMinutes: 35,
    attachments: [],
    comments: [],
    blockedBy: "Waiting on hosted Supabase credentials",
    order: 1,
  },
  {
    id: "kanban-calendar-signal",
    title: "Calendar signal colors",
    description: "Surface event type markers directly on calendar days.",
    columnId: "done",
    priority: "medium",
    tags: ["calendar"],
    labels: [{ name: "Calendar", color: "lime" }],
    subtasks: [
      { id: "sub-cal-1", title: "Add day markers", done: true },
      { id: "sub-cal-2", title: "Preview event titles", done: true },
    ],
    estimateMinutes: 90,
    trackedMinutes: 80,
    attachments: [],
    comments: [],
    order: 1,
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", Icon: Home },
  { id: "today", label: "Today", Icon: Sparkles },
  { id: "planner", label: "Planner", Icon: BriefcaseBusiness },
  { id: "goals", label: "Goals", Icon: Target },
  { id: "habits", label: "Habits", Icon: Check, count: "4/7" },
  { id: "tasks", label: "Tasks", Icon: ListTodo },
  { id: "kanban", label: "Kanban", Icon: Columns3 },
  { id: "notes", label: "Notes", Icon: NotebookText },
  { id: "calendar", label: "Calendar", Icon: CalendarDays },
  { id: "progress", label: "Progress", Icon: TrendingUp },
  { id: "insights", label: "Insights", Icon: Gauge },
  { id: "agents", label: "Agents", Icon: Bot },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(now),
    day: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now),
  };
}

const routeViewMap: Record<string, View> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/today": "today",
  "/planner": "planner",
  "/plan": "planner",
  "/goals": "goals",
  "/habits": "habits",
  "/tasks": "tasks",
  "/task": "tasks",
  "/kanban": "kanban",
  "/board": "kanban",
  "/notes": "notes",
  "/calendar": "calendar",
  "/calender": "calendar",
  "/progress": "progress",
  "/insights": "insights",
  "/agents": "agents",
};

function getViewFromPath(pathname: string): View {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return routeViewMap[normalizedPath] ?? "dashboard";
}

function isView(value: string): value is View {
  return Object.values(routeViewMap).includes(value as View);
}

function getPathForView(view: View) {
  return view === "dashboard" ? "/" : `/${view}`;
}

type NotesMode = "home" | "writing" | "reading" | "review" | "queue" | "certifications" | "ai";
type QuickCaptureIntent = "note" | "task" | "calendar" | "goal" | "kanban";

type QuickCapturePreview = {
  intent: QuickCaptureIntent;
  suggestedIntent: QuickCaptureIntent;
  title: string;
  raw: string;
  priority: Priority;
  date?: string;
  dateLabel?: string;
  time?: string;
  calendarKind: CalendarEvent["kind"];
  taskProjectId?: string;
  taskProjectName?: string;
  taskDay?: number;
  folderId?: string;
  folderName?: string;
  tags: string[];
  confidence: number;
  actionLabel: string;
  summary: string;
  warnings: string[];
};

type QuickCaptureContext = {
  now: Date;
  taskProjects: TaskProject[];
  activeTaskProjectId: string;
  studyFolders: StudyFolder[];
  kanbanCards: KanbanCard[];
};

type AppCommand = {
  id: string;
  title: string;
  hint: string;
  group: string;
  action: () => void;
};

const STUDY_FOLDER_ROOT_ID = "root";
const STUDY_FOLDER_UNCATEGORIZED_ID = "uncategorized";
const STUDY_FOLDER_TRASH_ID = "trash";

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

function App() {
  const clock = useClock();
  const auth = useSupabaseAuth();
  const [activeView, setActiveView] = useState<View>(() => getViewFromPath(window.location.pathname));
  const [remoteSeedVersion, setRemoteSeedVersion] = useState(0);
  const [activeTaskProjectId, setActiveTaskProjectId] = useState(initialTaskProjects[0]?.id ?? "");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [notesModeRequest, setNotesModeRequest] = useState<{ mode: NotesMode; nonce: number } | null>(null);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [quickCaptureIntent, setQuickCaptureIntent] = useState<QuickCaptureIntent | null>(null);
  const [quickCaptureStatus, setQuickCaptureStatus] = useState("");
  const [quickCaptureBusy, setQuickCaptureBusy] = useState(false);
  const goals = useGoalsData(initialGoals, remoteSeedVersion);
  const habits = useHabitsData(initialHabits, remoteSeedVersion);
  const taskProjects = useTaskProjectsData(initialTaskProjects, remoteSeedVersion);
  const calendarEvents = useCalendarEventsData(initialCalendarEvents, remoteSeedVersion);
  const kanbanCards = useKanbanCardsData(initialKanbanCards, remoteSeedVersion);
  const kanbanActivity = useKanbanActivityData(remoteSeedVersion);
  const activityEvents = useActivityEventsData(remoteSeedVersion);
  const agentRecommendations = useAgentRecommendationsData(remoteSeedVersion);
  const studyFolders = useStudyFoldersData(initialStudyFolders, remoteSeedVersion);
  const studyNotes = useStudyNotesData(initialStudyNotes, remoteSeedVersion);
  const activeStudyFolders = useMemo(() => studyFolders.filter((folder) => !folder.deletedAt), [studyFolders]);
  const activeStudyNotes = useMemo(() => studyNotes.filter((note) => !note.deletedAt), [studyNotes]);
  const backendLabel = useDataBackendLabel();
  const quickCapturePreview = useMemo(
    () =>
      buildQuickCapturePreview(quickCaptureText, quickCaptureIntent, {
        now: new Date(),
        taskProjects,
        activeTaskProjectId,
        studyFolders: activeStudyFolders,
        kanbanCards,
      }),
    [activeStudyFolders, activeTaskProjectId, kanbanCards, quickCaptureIntent, quickCaptureText, taskProjects],
  );

  useEffect(() => {
    void seedDatabase({
      goals: initialGoals,
      habits: initialHabits,
      taskProjects: initialTaskProjects,
      calendarEvents: initialCalendarEvents,
      kanbanCards: initialKanbanCards,
      studyNotes: initialStudyNotes,
      studyFolders: initialStudyFolders,
    });
  }, []);

  useEffect(() => {
    if (!auth.user) return;
    void seedRemoteDatabase({
      goals: initialGoals,
      habits: initialHabits,
      taskProjects: initialTaskProjects,
      calendarEvents: initialCalendarEvents,
      kanbanCards: initialKanbanCards,
      studyNotes: initialStudyNotes,
      studyFolders: initialStudyFolders,
    }, auth.user.id).then(() => setRemoteSeedVersion((version) => version + 1));
  }, [auth.user]);

  useEffect(() => {
    const handlePopState = () => setActiveView(getViewFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigateTo(view: View) {
    const route = getPathForView(view);
    if (window.location.pathname !== route) {
      window.history.pushState({}, "", route);
    }
    setActiveView(view);
  }

  function openNotesMode(mode: NotesMode) {
    setNotesModeRequest((request) => ({ mode, nonce: (request?.nonce ?? 0) + 1 }));
    navigateTo("notes");
  }

  function openQuickCapture(seed = "") {
    setCommandOpen(false);
    setQuickCaptureStatus("");
    if (seed) setQuickCaptureText(seed);
    setQuickCaptureOpen(true);
  }

  function closeQuickCapture() {
    if (quickCaptureBusy) return;
    setQuickCaptureOpen(false);
    setQuickCaptureStatus("");
    setQuickCaptureIntent(null);
  }

  async function saveQuickCapture() {
    const preview = quickCapturePreview;
    if (!preview.title || quickCaptureBusy) return;
    if (preview.intent === "task" && !preview.taskProjectId) {
      setQuickCaptureStatus("No task project is available for this capture.");
      return;
    }
    setQuickCaptureBusy(true);
    const now = new Date();
    const timestamp = now.getTime();
    const id = `${timestamp}-${slugify(preview.title)}`;

    try {
      if (preview.intent === "note") {
        await studyNoteCrud.add({
          id,
          title: preview.title,
          body: `# ${preview.title}\n\n${preview.raw}`,
          tags: preview.tags.length ? preview.tags : ["capture"],
          pinned: false,
          kind: "note",
          folderId: preview.folderId,
          flashcards: [],
          askHistory: [],
          readingProgress: 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
        logActivityEvent({
          domain: "notes",
          action: "created",
          entityId: id,
          entityTitle: preview.title,
          source: "Quick capture",
          metadata: { intent: preview.intent, folderId: preview.folderId },
        });
        openNotesMode("writing");
      } else if (preview.intent === "task" && preview.taskProjectId && preview.taskDay) {
        await taskProjectCrud.addTask(preview.taskProjectId, preview.taskDay, {
          id,
          name: preview.title,
          done: false,
        });
        logActivityEvent({
          domain: "task",
          action: "created",
          entityId: id,
          entityTitle: preview.title,
          source: "Quick capture",
          metadata: {
            projectId: preview.taskProjectId,
            projectName: taskProjects.find((project) => project.id === preview.taskProjectId)?.name,
            day: preview.taskDay,
          },
        });
        setActiveTaskProjectId(preview.taskProjectId);
        navigateTo("tasks");
      } else if (preview.intent === "calendar") {
        const date = parseDateInput(preview.date) ?? now;
        if (isPastCalendarDate(date, startOfDay(now))) {
          setQuickCaptureStatus("Calendar capture blocked: past dates are locked.");
          return;
        }
        await calendarCrud.add({
          id,
          date: toDateInputValue(date),
          day: date.getDate(),
          title: preview.title,
          kind: preview.calendarKind,
          time: preview.time ?? "09:00",
        });
        logActivityEvent({
          domain: "calendar",
          action: "created",
          entityId: id,
          entityTitle: preview.title,
          source: "Quick capture",
          metadata: { kind: preview.calendarKind, date: toDateInputValue(date), time: preview.time ?? "09:00" },
        });
        navigateTo("calendar");
      } else if (preview.intent === "goal") {
        await goalCrud.add({
          id,
          title: preview.title,
          due: preview.date ? formatQuickCaptureGoalDate(preview.date) : "Ongoing",
          level: preview.priority,
          progress: 0,
          meta: "Captured from quick capture",
          iconKey: "target",
          chart: "line",
          milestones: makeGoalMilestones([
            ["Define success criteria", false, 25],
            ["Create execution plan", false, 25],
            ["Complete first visible milestone", false, 25],
            ["Review and close loop", false, 25],
          ]),
        });
        logActivityEvent({
          domain: "goal",
          action: "created",
          entityId: id,
          entityTitle: preview.title,
          source: "Quick capture",
          metadata: { priority: preview.priority, due: preview.date },
        });
        navigateTo("goals");
      } else {
        const columnCards = kanbanCards.filter((card) => card.columnId === "backlog" && !card.archivedAt);
        const card: KanbanCard = {
          id,
          title: preview.title,
          description: preview.raw,
          columnId: "backlog",
          priority: preview.priority,
          dueDate: preview.date,
          tags: preview.tags.length ? preview.tags : ["capture"],
          labels: (preview.tags.length ? preview.tags : ["capture"]).slice(0, 2).map((tag, index) => ({
            name: tag,
            color: index === 0 ? getQuickCapturePriorityColor(preview.priority) : "cyan",
          })),
          subtasks: [],
          trackedMinutes: 0,
          attachments: [],
          comments: [],
          order: columnCards.length + 1,
        };
        await kanbanCrud.add(card);
        logKanbanActivity({ card, action: "created", toColumnId: card.columnId });
        navigateTo("kanban");
      }

      setQuickCaptureStatus(`Captured as ${preview.actionLabel}.`);
      setQuickCaptureText("");
      setQuickCaptureIntent(null);
      window.setTimeout(() => {
        setQuickCaptureOpen(false);
        setQuickCaptureStatus("");
      }, 450);
    } catch (error) {
      setQuickCaptureStatus(`Capture failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setQuickCaptureBusy(false);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "j") {
        event.preventDefault();
        openQuickCapture();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
        return;
      }

      if (commandOpen && event.key === "Escape") {
        event.preventDefault();
        setCommandOpen(false);
        setCommandQuery("");
        return;
      }

      if (event.key === "?" && !isTypingTarget(event.target)) {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (commandOpen || activeView === "notes" || isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const shortcutMap: Partial<Record<string, View>> = {
        d: "dashboard",
        g: "goals",
        h: "habits",
        t: "tasks",
        y: "today",
        l: "planner",
        k: "kanban",
        n: "notes",
        c: "calendar",
        p: "progress",
        i: "insights",
        a: "agents",
      };
      const nextView = shortcutMap[key];
      if (nextView) {
        event.preventDefault();
        navigateTo(nextView);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeView, commandOpen]);

  useEffect(() => {
    if (!taskProjects.some((project) => project.id === activeTaskProjectId)) {
      setActiveTaskProjectId(taskProjects[0]?.id ?? "");
    }
  }, [activeTaskProjectId, taskProjects]);
  const dashboardTasks = useMemo(() => getDashboardTasks(taskProjects), [taskProjects]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(calendarEvents, new Date()), [calendarEvents]);
  const done = dashboardTasks.filter((task) => task.done).length;
  const taskProgress = Math.round((done / Math.max(dashboardTasks.length, 1)) * 100);
  const sortedGoals = useMemo(() => sortGoals(goals), [goals]);
  const currentObjectives = useMemo(() => getCurrentObjectives(taskProjects), [taskProjects]);
  const dashboardReflection = useMemo(
    () => getDashboardReflection({ goals, habits, dashboardTasks, upcomingEvents }),
    [dashboardTasks, goals, habits, upcomingEvents],
  );
  const priorities = sortedGoals.slice(0, 5).map((goal) => ({
    name: goal.title,
    level: goal.level,
    progress: goal.progress,
  }));
  const overall = Math.round(
    goals.reduce((total, goal) => total + goal.progress, 0) / Math.max(goals.length, 1),
  );
  const circumference = 2 * Math.PI * 78;
  const ringOffset = circumference * (1 - overall / 100);
  const hexNoise = useMemo(() => makeNoise(), []);
  const habitsDone = habits.filter((habit) => habit.done).length;
  const pageMeta =
    activeView === "today"
      ? { title: "Today Command Brief", subtitle: "Daily execution // live operating plan" }
      : activeView === "planner"
      ? { title: "Focus Planner", subtitle: "Unified planning engine // tasks calendar board" }
      : activeView === "goals"
      ? { title: "Goals Registry", subtitle: "All active objectives - sorted by priority" }
      : activeView === "habits"
        ? { title: "Habit Protocol", subtitle: "Daily routines // execute at scheduled time" }
        : activeView === "tasks"
          ? { title: "Task Protocol", subtitle: "Tabbed objectives // day-by-day execution" }
          : activeView === "kanban"
            ? { title: "Execution Board", subtitle: "Workflow state // card-based operations" }
            : activeView === "notes"
              ? { title: "Study Notes", subtitle: "Reading library // markdown workspace" }
              : activeView === "calendar"
                ? { title: "Calendar", subtitle: "Schedule map // future-proof planning" }
                : activeView === "progress"
                  ? { title: "Progress Metrics", subtitle: "Streak · Focus · Momentum" }
                  : activeView === "insights"
                    ? { title: "Pattern Analysis", subtitle: "Behavioral insights // 30-day window" }
                    : activeView === "agents"
                      ? { title: "Agents Command", subtitle: "Autonomous coach agents // recommendations" }
                    : { title: "Goals Command Center", subtitle: "Plan. Execute. Track. Achieve." };
  const appCommands: AppCommand[] = [
    { id: "quick-capture", group: "Capture", title: "Universal Quick Capture", hint: "Open Cmd+J capture and route an idea to notes, tasks, calendar, goals, or board.", action: () => openQuickCapture() },
    { id: "nav-dashboard", group: "Navigate", title: "Dashboard", hint: "Open the goals command center.", action: () => navigateTo("dashboard") },
    { id: "nav-today", group: "Navigate", title: "Today Command Brief", hint: "Open the daily operating plan.", action: () => navigateTo("today") },
    { id: "nav-planner", group: "Navigate", title: "Focus Planner", hint: "Generate tasks, calendar blocks, and Kanban cards from goals or cert tracks.", action: () => navigateTo("planner") },
    { id: "nav-goals", group: "Navigate", title: "Goals Registry", hint: "Manage objectives and priorities.", action: () => navigateTo("goals") },
    { id: "nav-habits", group: "Navigate", title: "Habit Protocol", hint: "Track daily routines and scheduled habits.", action: () => navigateTo("habits") },
    { id: "nav-tasks", group: "Navigate", title: "Task Protocol", hint: "Open day-by-day task projects.", action: () => navigateTo("tasks") },
    { id: "nav-kanban", group: "Navigate", title: "Execution Board", hint: "Open Kanban workflow state.", action: () => navigateTo("kanban") },
    { id: "nav-calendar", group: "Navigate", title: "Calendar", hint: "Open deadlines, appointments, and projects.", action: () => navigateTo("calendar") },
    { id: "nav-progress", group: "Navigate", title: "Progress Metrics", hint: "Review streak, focus, and momentum.", action: () => navigateTo("progress") },
    { id: "nav-insights", group: "Navigate", title: "Pattern Analysis", hint: "Open behavior and completion insights.", action: () => navigateTo("insights") },
    { id: "nav-agents", group: "Navigate", title: "Agents Command", hint: "Open autonomous coach recommendations.", action: () => navigateTo("agents") },
    { id: "notes-home", group: "Study Notes", title: "Study Home", hint: "Open the notes command center.", action: () => openNotesMode("home") },
    { id: "notes-write", group: "Study Notes", title: "Write Mode", hint: "Open the markdown writing studio.", action: () => openNotesMode("writing") },
    { id: "notes-read", group: "Study Notes", title: "Reading Mode", hint: "Open the document reading workspace.", action: () => openNotesMode("reading") },
    { id: "notes-review", group: "Study Notes", title: "Review Mode", hint: "Generate active recall cards.", action: () => openNotesMode("review") },
    { id: "notes-queue", group: "Study Notes", title: "Review Queue", hint: "Run due flashcards and scheduled study cards.", action: () => openNotesMode("queue") },
    { id: "notes-certs", group: "Study Notes", title: "Certification Tracks", hint: "Open exam readiness, objectives, and study plans.", action: () => openNotesMode("certifications") },
    { id: "notes-ai", group: "Study Notes", title: "AI Study Console", hint: "Analyze notes and ask study questions.", action: () => openNotesMode("ai") },
  ];

  if (auth.isConfigured && auth.loading) {
    return <AuthScreen mode="loading" />;
  }

  if (auth.isConfigured && !auth.user) {
    return <AuthScreen mode="signin" />;
  }

  return (
    <>
      <svg width="0" height="0" className="defs" aria-hidden="true">
        <defs>
          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#35d7ff" />
            <stop offset="100%" stopColor="#aa72ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="data-noise left">{hexNoise}</div>
      <div className="data-noise right">{hexNoise}</div>
      <div className="scan-top">{hexNoise}</div>
      <div className="app-shell">
        <Sidebar
          activeView={activeView}
          goalsCount={goals.length}
          habitsDone={habitsDone}
          habitsTotal={habits.length}
          taskProjectCount={taskProjects.length}
          onNavigate={navigateTo}
        />
        <main className="main-panel">
          <header className="topbar">
            <div>
              <h1>{pageMeta.title}</h1>
              <p>{pageMeta.subtitle}</p>
            </div>
            <div className="topbar-meta" aria-label="Current dashboard time">
              <span>{clock.date}</span>
              <span className="sep">.</span>
              <span>{clock.day}</span>
              <span className="sep">.</span>
              <strong>{clock.time}</strong>
              <button className="command-trigger" type="button" aria-label="Open command palette" onClick={() => setCommandOpen(true)}>
                <Search />
              </button>
              <button className="capture-trigger" type="button" aria-label="Open quick capture" onClick={() => openQuickCapture()}>
                <Sparkles />
              </button>
              <button aria-label="Alerts">
                <Bell />
                <i />
              </button>
              <button aria-label="Settings">
                <Settings />
              </button>
              {auth.user && (
                <button className="auth-chip" type="button" onClick={() => void signOut()} title={auth.user.email ?? "Signed in"}>
                  {auth.user.email?.split("@")[0] ?? "User"}
                </button>
              )}
            </div>
          </header>

          {activeView === "dashboard" ? (
            <>
          <section className="top-grid" aria-label="Dashboard overview">
            <HudCard className="ring-card" active>
              <CardHeader title="Overall Goal Progress" meta="live" />
              <div className="ring-layout">
                <div className="progress-ring" aria-label={`${overall}% complete`}>
                  <svg viewBox="0 0 200 200">
                    <g className="ring-ticks">
                      {Array.from({ length: 60 }, (_, index) => {
                        const angle = (index / 60) * Math.PI * 2;
                        const r1 = 90;
                        const r2 = index % 5 === 0 ? 101 : 96;
                        return (
                          <line
                            key={index}
                            x1={100 + Math.cos(angle) * r1}
                            y1={100 + Math.sin(angle) * r1}
                            x2={100 + Math.cos(angle) * r2}
                            y2={100 + Math.sin(angle) * r2}
                          />
                        );
                      })}
                    </g>
                    <circle className="ring-track" cx="100" cy="100" r="78" />
                    <circle
                      className="ring-value"
                      cx="100"
                      cy="100"
                      r="78"
                      strokeDasharray={circumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="ring-copy">
                    <strong>{overall}%</strong>
                    <span>Complete</span>
                  </div>
                </div>
                <div className="legend">
                  <LegendItem color="cyan" label="Completed" value="22" />
                  <LegendItem color="violet" label="In Progress" value="9" />
                  <LegendItem color="dim" label="Not Started" value="5" />
                </div>
              </div>
              <div className="quote-strip">Small steps today, unstoppable tomorrow.</div>
            </HudCard>

            <HudCard className="category-card">
              <CardHeader title="Category Progress" />
              <div className="category-list">
                {categories.map(({ Icon, ...category }) => (
                  <div className="category-row" key={category.name}>
                    <div className="category-line">
                      <Icon />
                      <span>{category.name}</span>
                      <strong>{category.progress}%</strong>
                      <em>{category.fraction}</em>
                    </div>
                    <ProgressBar value={category.progress} />
                  </div>
                ))}
              </div>
              <CommandLink>View Category Analytics</CommandLink>
            </HudCard>

            <HudCard className="priority-card">
              <CardHeader title="Top Priorities" />
              <div className="priority-list">
                {priorities.map((priority, index) => (
                  <div className="priority-row" key={priority.name}>
                    <span className="priority-index">{String(index + 1).padStart(2, "0")}</span>
                    <span>{priority.name}</span>
                    <PriorityChip level={priority.level} />
                    <strong>{priority.progress}%</strong>
                  </div>
                ))}
              </div>
              <CommandLink>View All Priorities</CommandLink>
            </HudCard>
          </section>

          <section className="goals-grid" aria-label="Goal cards">
            {sortedGoals.slice(0, 5).map((goal) => (
              <GoalCard key={goal.title} goal={goal} />
            ))}
          </section>

          <section className="work-grid daily-work">
            <HudCard className="tasks-card">
              <CardHeader title="Today's Daily Tasks" meta={`${done} / ${dashboardTasks.length} - ${taskProgress}%`} />
              <div className="task-list">
                {dashboardTasks.map((task) => (
                  <button
                    className={`task-row ${task.done ? "done" : ""}`}
                    key={`${task.projectId}-${task.day}-${task.id}`}
                    onClick={() => {
                      void taskProjectCrud.updateTask(task.projectId, task.day, task.id, (item) => ({
                          ...item,
                          done: !item.done,
                        }));
                      logActivityEvent({
                        domain: "task",
                        action: task.done ? "reopened" : "completed",
                        entityId: task.id,
                        entityTitle: task.name,
                        source: "Dashboard daily tasks",
                        metadata: { projectId: task.projectId, projectName: task.projectName, day: task.day },
                      });
                    }}
                  >
                    <span className="checkbox">{task.done && <Check />}</span>
                    <span className="task-label">{task.name}</span>
                    <span className="task-source">{task.projectName} - D{task.day}</span>
                  </button>
                ))}
              </div>
            </HudCard>
          </section>

          <HudCard className="next-days-card">
            <CardHeader title="Next 14 Days" meta={`${upcomingEvents.length} events`} />
            <div className="upcoming-list" aria-label="Upcoming calendar events">
              {upcomingEvents.length === 0 ? (
                <div className="empty-calendar-band">// no scheduled items in range</div>
              ) : (
                upcomingEvents.map(({ event, date }) => (
                  <div className="upcoming-row" key={event.id}>
                    <span className={`event-kind ${event.kind}`}>{event.kind}</span>
                    <div>
                      <strong>{event.title}</strong>
                      <em>{formatUpcomingDate(date)} - {event.time}</em>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dashboard-command-row">
              <CommandLink onClick={() => navigateTo("planner")}>Open Planner</CommandLink>
              <CommandLink onClick={() => navigateTo("calendar")}>Open Calendar</CommandLink>
            </div>
          </HudCard>

          <div className="row-divider">View All Goals</div>

          <section className="bottom-grid" aria-label="Long range dashboard">
            <MonthlyGoals projects={taskProjects} objectives={currentObjectives} />
            <YearlyGoals goals={goals} />
            <TimelineCard goals={goals} events={upcomingEvents} />
            <ReflectionCard reflection={dashboardReflection} />
          </section>

          <svg className="bottom-scan" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points="0,24 42,21 88,23 132,20 178,25 222,19 268,24 312,18 356,22 402,16 448,21 490,17 536,23 578,20 624,24 668,18 714,22 760,17 804,25 850,21 896,23 940,18 986,24 1032,21 1076,19 1122,23 1168,20 1200,22"
            />
          </svg>

          <footer className="sysline">
            <span>// System synchronized</span>
            <strong>All nodes operational</strong>
            <span>{backendLabel}</span>
          </footer>
            </>
          ) : activeView === "today" ? (
            <TodayView
              goals={goals}
              habits={habits}
              projects={taskProjects}
              dashboardTasks={dashboardTasks}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
              notes={activeStudyNotes}
              recommendations={agentRecommendations}
              activityEvents={activityEvents}
              onQuickCapture={openQuickCapture}
              onNavigate={navigateTo}
              onOpenProject={(projectId) => {
                setActiveTaskProjectId(projectId);
                navigateTo("tasks");
              }}
            />
          ) : activeView === "planner" ? (
            <PlannerView
              goals={goals}
              folders={activeStudyFolders}
              notes={activeStudyNotes}
              projects={taskProjects}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
              onNavigate={navigateTo}
            />
          ) : activeView === "goals" ? (
            <GoalsRegistry
              goals={sortedGoals}
              projects={taskProjects}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
              onAddGoal={(goal) => {
                logActivityEvent({
                  domain: "goal",
                  action: "created",
                  entityId: goal.id,
                  entityTitle: goal.title,
                  source: "Goals registry",
                  metadata: { priority: goal.level, due: goal.due },
                });
                return goalCrud.add(goal);
              }}
              onUpdateGoal={(id, patch) => {
                const goal = sortedGoals.find((item) => item.id === id);
                logActivityEvent({
                  domain: "goal",
                  action: "updated",
                  entityId: id,
                  entityTitle: patch.title ?? goal?.title ?? "Goal",
                  source: "Goals registry",
                  metadata: { progress: patch.progress ?? goal?.progress, priority: patch.level ?? goal?.level },
                });
                return goalCrud.update(id, patch);
              }}
              onDeleteGoal={(id) => {
                const goal = sortedGoals.find((item) => item.id === id);
                logActivityEvent({
                  domain: "goal",
                  action: "deleted",
                  entityId: id,
                  entityTitle: goal?.title ?? "Goal",
                  source: "Goals registry",
                  metadata: { priority: goal?.level },
                });
                return goalCrud.delete(id);
              }}
              onNavigate={navigateTo}
              onOpenProject={(projectId) => {
                setActiveTaskProjectId(projectId);
                navigateTo("tasks");
              }}
            />
          ) : activeView === "habits" ? (
            <HabitProtocol habits={habits} />
          ) : activeView === "tasks" ? (
            <TaskProtocol
              goals={goals}
              projects={taskProjects}
              activeProjectId={activeTaskProjectId}
              onActiveProjectChange={setActiveTaskProjectId}
            />
          ) : activeView === "kanban" ? (
            <KanbanView cards={kanbanCards} activity={kanbanActivity} projects={taskProjects} />
          ) : activeView === "notes" ? (
            <NotesView notes={studyNotes} folders={studyFolders} modeRequest={notesModeRequest} />
          ) : activeView === "calendar" ? (
            <CalendarView events={calendarEvents} />
          ) : activeView === "progress" ? (
            <ProgressView
              events={activityEvents}
              projects={taskProjects}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
              onNavigate={navigateTo}
              onOpenProject={(projectId) => {
                setActiveTaskProjectId(projectId);
                navigateTo("tasks");
              }}
            />
          ) : activeView === "insights" ? (
            <InsightsView
              events={activityEvents}
              projects={taskProjects}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
            />
          ) : (
            <AgentsView
              goals={goals}
              habits={habits}
              projects={taskProjects}
              dashboardTasks={dashboardTasks}
              calendarEvents={calendarEvents}
              kanbanCards={kanbanCards}
              activityEvents={activityEvents}
              recommendations={agentRecommendations}
              onNavigate={navigateTo}
            />
          )}
        </main>
      </div>
      <CommandPalette
        open={commandOpen}
        query={commandQuery}
        commands={appCommands}
        onQueryChange={setCommandQuery}
        onClose={() => {
          setCommandOpen(false);
          setCommandQuery("");
        }}
      />
      <QuickCapture
        open={quickCaptureOpen}
        text={quickCaptureText}
        preview={quickCapturePreview}
        overrideIntent={quickCaptureIntent}
        status={quickCaptureStatus}
        busy={quickCaptureBusy}
        onTextChange={(value) => {
          setQuickCaptureText(value);
          setQuickCaptureStatus("");
        }}
        onOverrideIntent={setQuickCaptureIntent}
        onClose={closeQuickCapture}
        onSave={() => void saveQuickCapture()}
      />
    </>
  );
}

function CommandPalette({
  open,
  query,
  commands,
  onQueryChange,
  onClose,
}: {
  open: boolean;
  query: string;
  commands: AppCommand[];
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filteredCommands = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.group} ${command.title} ${command.hint}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  function runCommand(command: AppCommand) {
    command.action();
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="command-palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-search-row">
          <Search />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
              if (event.key === "Enter" && filteredCommands[0]) {
                event.preventDefault();
                runCommand(filteredCommands[0]);
              }
            }}
            placeholder="// jump to route, tool, study mode"
          />
        </div>
        <div className="command-results">
          {filteredCommands.length === 0 ? (
            <div className="command-empty">// no command matched</div>
          ) : (
            filteredCommands.map((command) => (
              <button type="button" onClick={() => runCommand(command)} key={command.id}>
                <span>{command.group}</span>
                <strong>{command.title}</strong>
                <em>{command.hint}</em>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

const quickCaptureDestinations: Array<{ intent: QuickCaptureIntent; label: string; hint: string }> = [
  { intent: "note", label: "Note", hint: "Study note" },
  { intent: "task", label: "Task", hint: "Project day task" },
  { intent: "calendar", label: "Calendar", hint: "Timed event" },
  { intent: "goal", label: "Goal", hint: "Objective" },
  { intent: "kanban", label: "Card", hint: "Board card" },
];

function QuickCapture({
  open,
  text,
  preview,
  overrideIntent,
  status,
  busy,
  onTextChange,
  onOverrideIntent,
  onClose,
  onSave,
}: {
  open: boolean;
  text: string;
  preview: QuickCapturePreview;
  overrideIntent: QuickCaptureIntent | null;
  status: string;
  busy: boolean;
  onTextChange: (value: string) => void;
  onOverrideIntent: (intent: QuickCaptureIntent | null) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const canSave = Boolean(preview.title) && !(preview.intent === "task" && !preview.taskProjectId);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="quick-capture-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="quick-capture" role="dialog" aria-modal="true" aria-label="Universal quick capture">
        <div className="quick-capture-head">
          <div>
            <span>Universal Capture</span>
            <strong>{preview.actionLabel}</strong>
          </div>
          <button type="button" onClick={onClose}>close</button>
        </div>
        <div className="quick-capture-input">
          <Sparkles />
          <textarea
            ref={inputRef}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                onSave();
              }
            }}
            placeholder="Try: Meeting with HR June 25 2pm, Task finish onboarding D12 high, Note Security+ ports, Goal save $5000 by Dec 31"
          />
        </div>
        <div className="quick-capture-destinations" aria-label="Capture destination">
          <button className={!overrideIntent ? "active" : ""} type="button" onClick={() => onOverrideIntent(null)}>
            auto <em>{preview.suggestedIntent}</em>
          </button>
          {quickCaptureDestinations.map((destination) => (
            <button
              className={overrideIntent === destination.intent || (!overrideIntent && preview.intent === destination.intent) ? "active" : ""}
              type="button"
              onClick={() => onOverrideIntent(destination.intent)}
              key={destination.intent}
            >
              {destination.label}
              <em>{destination.hint}</em>
            </button>
          ))}
        </div>
        <div className="quick-capture-preview">
          <div>
            <span>Title</span>
            <strong>{preview.title || "Waiting for signal"}</strong>
          </div>
          <div>
            <span>Route</span>
            <strong>{preview.actionLabel}</strong>
          </div>
          <div>
            <span>When</span>
            <strong>{preview.dateLabel ? `${preview.dateLabel}${preview.time ? ` · ${preview.time}` : ""}` : "No date"}</strong>
          </div>
          <div>
            <span>Priority</span>
            <strong>{preview.priority}</strong>
          </div>
          <div>
            <span>Target</span>
            <strong>{preview.taskProjectName ?? preview.folderName ?? preview.calendarKind ?? "Backlog"}</strong>
          </div>
          <div>
            <span>Tags</span>
            <strong>{preview.tags.length ? preview.tags.join(", ") : "capture"}</strong>
          </div>
        </div>
        <p className="quick-capture-summary">{preview.summary}</p>
        {preview.warnings.length > 0 && (
          <div className="quick-capture-warnings">
            {preview.warnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </div>
        )}
        {status && <div className="quick-capture-status">{status}</div>}
        <div className="quick-capture-actions">
          <span>{preview.confidence}% route confidence</span>
          <button type="button" onClick={onClose}>cancel</button>
          <button type="button" disabled={!canSave || busy} onClick={onSave}>
            {busy ? "saving" : "save capture"}
          </button>
        </div>
      </section>
    </div>
  );
}

function buildQuickCapturePreview(input: string, overrideIntent: QuickCaptureIntent | null, context: QuickCaptureContext): QuickCapturePreview {
  const raw = input.trim();
  const dateMatch = parseQuickCaptureDate(raw, context.now);
  const timeMatch = parseQuickCaptureTime(raw);
  const suggestedIntent = inferQuickCaptureIntent(raw, dateMatch?.date, timeMatch?.time);
  const intent = overrideIntent ?? suggestedIntent;
  const priority = parseQuickCapturePriority(raw);
  const project = pickQuickCaptureProject(raw, context.taskProjects, context.activeTaskProjectId);
  const folder = pickQuickCaptureFolder(raw, context.studyFolders);
  const parsedTaskDay = parseQuickCaptureTaskDay(raw);
  const taskDay =
    project && intent === "task"
      ? Math.min(Math.max(parsedTaskDay ?? project.currentDay ?? 1, 1), Math.max(project.deadlineDays, 1))
      : undefined;
  const date = dateMatch?.date ?? (intent === "calendar" ? toDateInputValue(context.now) : undefined);
  const time = timeMatch?.time ?? (intent === "calendar" ? "09:00" : undefined);
  const calendarKind = parseQuickCaptureCalendarKind(raw, intent);
  const tags = parseQuickCaptureTags(raw, intent);
  const title = cleanQuickCaptureTitle(raw, { intent, dateRaw: dateMatch?.raw, timeRaw: timeMatch?.raw, priority });
  const warnings: string[] = [];

  if (intent === "task" && !project) warnings.push("No task project exists yet.");
  if (intent === "task" && project && parsedTaskDay && parsedTaskDay > project.deadlineDays) {
    warnings.push(`D${parsedTaskDay} is outside ${project.name}; routing to D${taskDay}.`);
  }
  if (intent === "calendar" && !dateMatch) warnings.push("No date detected; routing to today.");
  if (intent === "calendar" && !timeMatch) warnings.push("No time detected; defaulting to 09:00.");
  if (intent === "goal" && !dateMatch) warnings.push("No goal due date detected; saving as ongoing.");

  return {
    intent,
    suggestedIntent,
    title,
    raw,
    priority,
    date,
    dateLabel: date ? formatQuickCaptureDateLabel(date) : undefined,
    time,
    calendarKind,
    taskProjectId: project?.id,
    taskProjectName: project ? `${project.name}${taskDay ? ` · D${taskDay}` : ""}` : undefined,
    taskDay,
    folderId: folder?.id,
    folderName: folder?.name,
    tags,
    confidence: getQuickCaptureConfidence(raw, suggestedIntent, overrideIntent, dateMatch?.date, timeMatch?.time),
    actionLabel: getQuickCaptureActionLabel(intent),
    summary: getQuickCaptureSummary(intent, { project, taskDay, folder, date, time, calendarKind }),
    warnings,
  };
}

function inferQuickCaptureIntent(raw: string, date?: string, time?: string): QuickCaptureIntent {
  const value = raw.toLowerCase().trim();
  if (!value) return "note";
  if (/^(goal|objective)\b/.test(value) || /\bby\s+[a-z]{3,9}\s+\d{1,2}\b/.test(value) || /^save\s+.+\bby\b/.test(value)) return "goal";
  if (/^(kanban|card|board)\b/.test(value)) return "kanban";
  if (/^(task|todo|to-do)\b/.test(value) || /\bd\s*\d{1,3}\b/.test(value)) return "task";
  if (/\b(meeting|appointment|doctor|dentist|interview|call|deadline|event|calendar|hr)\b/.test(value)) return "calendar";
  if (/^study\b/.test(value) && (date || time)) return "calendar";
  if (/^(note|study|read|reading|write)\b/.test(value)) return "note";
  if (date && time) return "calendar";
  return "note";
}

function parseQuickCapturePriority(raw: string): Priority {
  const value = raw.toLowerCase();
  if (/\bziftinity\b|\bhighest\b|\bcritical\b|\bmust\b/.test(value)) return "ziftinity";
  if (/\bhigh\b|\burgent\b/.test(value)) return "high";
  if (/\bmedium\b|\bmed\b/.test(value)) return "medium";
  if (/\blow\b|\blater\b/.test(value)) return "low";
  return "medium";
}

function parseQuickCaptureDate(raw: string, now: Date) {
  const value = raw.toLowerCase();
  const iso = value.match(/\b(20\d{2}-\d{1,2}-\d{1,2})\b/);
  if (iso) {
    const date = parseDateInput(iso[1]);
    if (date) return { date: toDateInputValue(date), raw: iso[0] };
  }
  if (/\btoday\b/.test(value)) return { date: toDateInputValue(now), raw: "today" };
  if (/\btomorrow\b/.test(value)) return { date: toDateInputValue(addDays(now, 1)), raw: "tomorrow" };

  const monthNames = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
  const monthDay = value.match(new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(20\\d{2}))?\\b`));
  if (monthDay) {
    const date = buildQuickCaptureMonthDate(monthDay[1], Number(monthDay[2]), monthDay[3] ? Number(monthDay[3]) : now.getFullYear(), now, Boolean(monthDay[3]));
    if (date) return { date: toDateInputValue(date), raw: monthDay[0] };
  }
  const dayMonth = value.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})(?:,?\\s*(20\\d{2}))?\\b`));
  if (dayMonth) {
    const date = buildQuickCaptureMonthDate(dayMonth[2], Number(dayMonth[1]), dayMonth[3] ? Number(dayMonth[3]) : now.getFullYear(), now, Boolean(dayMonth[3]));
    if (date) return { date: toDateInputValue(date), raw: dayMonth[0] };
  }

  const weekday = value.match(/\b(next\s+)?(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/);
  if (weekday) {
    return { date: toDateInputValue(getUpcomingWeekday(now, weekday[2], Boolean(weekday[1]))), raw: weekday[0] };
  }

  return null;
}

function buildQuickCaptureMonthDate(monthText: string, day: number, year: number, now: Date, explicitYear: boolean) {
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].findIndex((item) =>
    monthText.toLowerCase().startsWith(item),
  );
  if (month < 0 || day < 1 || day > 31) return null;
  const candidate = new Date(year, month, day);
  if (candidate.getMonth() !== month || candidate.getDate() !== day) return null;
  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate()) && !explicitYear) {
    return new Date(year + 1, month, day);
  }
  return candidate;
}

function getUpcomingWeekday(now: Date, weekdayText: string, forceNext: boolean) {
  const target = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].findIndex((item) => weekdayText.startsWith(item));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let delta = target - today.getDay();
  if (delta <= 0 || forceNext) delta += 7;
  return addDays(today, delta);
}

function parseQuickCaptureTime(raw: string) {
  const value = raw.toLowerCase();
  const meridian = value.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/);
  if (meridian) {
    let hour = Number(meridian[1]);
    const minute = meridian[2] ?? "00";
    if (meridian[3] === "pm" && hour < 12) hour += 12;
    if (meridian[3] === "am" && hour === 12) hour = 0;
    return { time: `${String(hour).padStart(2, "0")}:${minute}`, raw: meridian[0] };
  }
  const clock = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (clock) return { time: `${String(Number(clock[1])).padStart(2, "0")}:${clock[2]}`, raw: clock[0] };
  return null;
}

function parseQuickCaptureTaskDay(raw: string) {
  const match = raw.match(/\bd\s*(\d{1,3})\b/i) ?? raw.match(/\bday\s+(\d{1,3})\b/i);
  return match ? Number(match[1]) : null;
}

function parseQuickCaptureCalendarKind(raw: string, intent: QuickCaptureIntent): CalendarEvent["kind"] {
  const value = raw.toLowerCase();
  if (/\bdeadline\b|\bdue\b/.test(value)) return "deadline";
  if (/\bdoctor|dentist|appointment\b/.test(value)) return "appointment";
  if (/\bproject|sprint|launch\b/.test(value)) return "project";
  if (/\bpersonal|family|friend\b/.test(value)) return "personal";
  return intent === "calendar" ? "meeting" : "project";
}

function parseQuickCaptureTags(raw: string, intent: QuickCaptureIntent) {
  const hashTags = Array.from(raw.matchAll(/#([a-z0-9-]+)/gi)).map((match) => match[1].toLowerCase());
  const derived =
    intent === "note"
      ? ["capture", "study"]
      : intent === "task"
        ? ["capture", "task"]
        : intent === "calendar"
          ? ["capture", "calendar"]
          : intent === "goal"
            ? ["capture", "goal"]
            : ["capture", "quick"];
  return Array.from(new Set([...hashTags, ...derived])).slice(0, 5);
}

function pickQuickCaptureProject(raw: string, projects: TaskProject[], activeProjectId: string) {
  if (projects.length === 0) return null;
  const scored = projects
    .map((project) => ({ project, score: scoreQuickCaptureTextMatch(raw, `${project.name} ${project.outcome ?? ""}`) }))
    .sort((a, b) => b.score - a.score);
  if (scored[0]?.score > 0) return scored[0].project;
  return projects.find((project) => project.id === activeProjectId) ?? projects[0];
}

function pickQuickCaptureFolder(raw: string, folders: StudyFolder[]) {
  if (folders.length === 0) return null;
  const scored = folders
    .map((folder) => ({ folder, score: scoreQuickCaptureTextMatch(raw, folder.name) }))
    .sort((a, b) => b.score - a.score);
  if (scored[0]?.score > 0) return scored[0].folder;
  return folders.find((folder) => folder.name.toLowerCase().includes("inbox")) ?? folders[0];
}

function scoreQuickCaptureTextMatch(raw: string, candidate: string) {
  const words = new Set(raw.toLowerCase().split(/[^a-z0-9+]+/).filter((word) => word.length > 2));
  return candidate
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((word) => words.has(word)).length;
}

function cleanQuickCaptureTitle(
  raw: string,
  options: { intent: QuickCaptureIntent; dateRaw?: string; timeRaw?: string; priority: Priority },
) {
  let value = raw.trim();
  if (options.intent !== "calendar") {
    value = value.replace(/^(note|study|read|reading|write|task|todo|to-do|goal|objective|kanban|card|board|calendar|event)\s*:?\s*/i, "");
  } else {
    value = value.replace(/^(calendar|event)\s*:?\s*/i, "");
  }
  if (options.dateRaw) value = value.replace(new RegExp(escapeRegExp(options.dateRaw), "i"), " ");
  if (options.timeRaw) value = value.replace(new RegExp(escapeRegExp(options.timeRaw), "i"), " ");
  value = value
    .replace(/\bd\s*\d{1,3}\b/gi, " ")
    .replace(/\b(ziftinity|highest|critical|must|high|urgent|medium|med|low|later)\b/gi, " ")
    .replace(/#[a-z0-9-]+/gi, " ")
    .replace(/\b(by|on|at)\s*$/i, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (value) return value.charAt(0).toUpperCase() + value.slice(1);
  return raw.trim() ? "Captured signal" : "";
}

function getQuickCaptureConfidence(raw: string, suggestedIntent: QuickCaptureIntent, overrideIntent: QuickCaptureIntent | null, date?: string, time?: string) {
  if (!raw.trim()) return 0;
  if (overrideIntent) return 100;
  let score = 62;
  if (/^(note|study|task|todo|meeting|appointment|deadline|goal|kanban|card|calendar|event)\b/i.test(raw)) score += 18;
  if (date) score += 8;
  if (time) score += 6;
  if (suggestedIntent === "task" && /\bd\s*\d{1,3}\b/i.test(raw)) score += 8;
  return Math.min(score, 98);
}

function getQuickCaptureActionLabel(intent: QuickCaptureIntent) {
  if (intent === "note") return "Study note";
  if (intent === "task") return "Daily task";
  if (intent === "calendar") return "Calendar event";
  if (intent === "goal") return "Goal";
  return "Kanban card";
}

function getQuickCaptureSummary(
  intent: QuickCaptureIntent,
  context: {
    project: TaskProject | null;
    taskDay?: number;
    folder: StudyFolder | null;
    date?: string;
    time?: string;
    calendarKind: CalendarEvent["kind"];
  },
) {
  if (intent === "task") return context.project ? `Adds a task to ${context.project.name} on D${context.taskDay}.` : "Needs a task project before it can be saved.";
  if (intent === "calendar") return `Creates a ${context.calendarKind} event for ${context.date ? formatQuickCaptureDateLabel(context.date) : "today"} at ${context.time ?? "09:00"}.`;
  if (intent === "goal") return context.date ? `Creates a new goal due ${formatQuickCaptureDateLabel(context.date)}.` : "Creates a new ongoing goal.";
  if (intent === "kanban") return context.date ? `Creates a backlog card due ${formatQuickCaptureDateLabel(context.date)}.` : "Creates a backlog card for later triage.";
  return `Creates a study note${context.folder ? ` in ${context.folder.name}` : ""}.`;
}

function getQuickCapturePriorityColor(priority: Priority): KanbanLabelColor {
  if (priority === "ziftinity") return "violet";
  if (priority === "high") return "red";
  if (priority === "low") return "lime";
  return "amber";
}

function formatQuickCaptureDateLabel(dateInput: string) {
  const date = parseDateInput(dateInput);
  if (!date) return dateInput;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatQuickCaptureGoalDate(dateInput: string) {
  return formatQuickCaptureDateLabel(dateInput);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type TodayFocusItem = {
  id: string;
  title: string;
  source: string;
  meta: string;
  score: number;
  priority: Priority;
  progress?: number;
  view: View;
};

type DashboardTask = ProjectTask & {
  projectId: string;
  projectName: string;
  day: number;
};

type TodayLane = "morning" | "midday" | "evening" | "anytime";

type TodayQueueKind = "task" | "habit" | "event" | "kanban" | "study" | "agent" | "goal";

type SavedFlashcardSignal = {
  noteId: string;
  noteTitle: string;
  card: NonNullable<StudyNote["flashcards"]>[number];
};

type TodayQueueItem = {
  id: string;
  kind: TodayQueueKind;
  title: string;
  source: string;
  meta: string;
  score: number;
  priority: Priority;
  lane: TodayLane;
  view: View;
  timeLabel?: string;
  progress?: number;
  task?: DashboardTask;
  habit?: Habit;
  event?: CalendarEvent;
  card?: KanbanCard;
  flashcard?: SavedFlashcardSignal;
  recommendation?: AgentRecommendation;
  followUp?: AgentOutcomeImpact;
};

type ForecastBalanceSnapshot = {
  label: string;
  createdAt: string;
  task?: {
    projectId: string;
    projectName: string;
    task: ProjectTask;
    fromDay: number;
    toDay: number;
  };
  card?: {
    cardId: string;
    cardTitle: string;
    fromDate?: string;
    toDate: string;
  };
};

function TodayView({
  goals,
  habits,
  projects,
  dashboardTasks,
  calendarEvents,
  kanbanCards,
  notes,
  recommendations,
  activityEvents,
  onQuickCapture,
  onNavigate,
  onOpenProject,
}: {
  goals: Goal[];
  habits: Habit[];
  projects: TaskProject[];
  dashboardTasks: DashboardTask[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  notes: StudyNote[];
  recommendations: AgentRecommendation[];
  activityEvents: ActivityEvent[];
  onQuickCapture: () => void;
  onNavigate: (view: View) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const now = new Date();
  const todayKey = toDateInputValue(now);
  const [protocolStatus, setProtocolStatus] = useState("");
  const [forecastStatus, setForecastStatus] = useState("");
  const [coachStatus, setCoachStatus] = useState("");
  const [lastForecastBalance, setLastForecastBalance] = useState<ForecastBalanceSnapshot | null>(null);
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(now);
  const context = useMemo(
    () => buildAgentContext({ goals, habits, projects, dashboardTasks, calendarEvents, kanbanCards, activityEvents, now }),
    [activityEvents, calendarEvents, dashboardTasks, goals, habits, kanbanCards, projects, todayKey],
  );
  const todayEvents = useMemo(
    () =>
      calendarEvents
        .map((event) => ({ event, date: getEventDate(event) }))
        .filter(({ date }) => toDateInputValue(date) === todayKey)
        .sort((a, b) => a.event.time.localeCompare(b.event.time)),
    [calendarEvents, todayKey],
  );
  const openCards = useMemo(
    () => kanbanCards.filter((card) => card.columnId !== "done" && !card.archivedAt),
    [kanbanCards],
  );
  const urgentCards = useMemo(
    () =>
      openCards
        .filter((card) => ["ziftinity", "high"].includes(card.priority) || ["overdue", "due-today"].includes(getDueState(card.dueDate)))
        .sort((a, b) => getTodayCardScore(b, now) - getTodayCardScore(a, now))
        .slice(0, 5),
    [openCards, todayKey],
  );
  const focusItems = useMemo(
    () => getTodayFocusItems(context, goals, urgentCards),
    [context, goals, urgentCards],
  );
  const pendingReports = useMemo(
    () => recommendations.filter((item) => item.status === "pending").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    [recommendations],
  );
  const agentLearningMemory = useMemo(
    () => getAgentLearningMemory(recommendations, activityEvents, now),
    [activityEvents, recommendations, todayKey],
  );
  const trustedCoachReport = useMemo(
    () => getTrustedCoachReport(recommendations, agentLearningMemory),
    [agentLearningMemory, recommendations],
  );
  const topFollowUpDebt = agentLearningMemory.followUpDebt[0];
  const queueItems = useMemo(
    () =>
      getTodayQueueItems({
        context,
        goals,
        habits,
        todayEvents,
        notes,
        recommendations,
        followUpDebt: agentLearningMemory.followUpDebt,
        now,
      }),
    [agentLearningMemory.followUpDebt, context, goals, habits, notes, recommendations, todayEvents, todayKey],
  );
  const laneMap = useMemo(() => groupTodayQueue(queueItems), [queueItems]);
  const readiness = getTodayReadiness(context);
  const readinessLabel = getTodayReadinessLabel(readiness);
  const directive = getTodayDirective(context, focusItems[0], todayEvents.length);
  const completedTasks = dashboardTasks.filter((task) => task.done).length;
  const activeQueue = queueItems.filter((item) => item.kind !== "event" || item.score >= 55);
  const topQueueItems = activeQueue.slice(0, 7);
  const primaryItem = topQueueItems[0];
  const blockedCount = context.blockedCards.length;
  const dueStudyCount = queueItems.filter((item) => item.kind === "study").length;
  const carryForward = queueItems
    .filter((item) => item.kind !== "event" && item.kind !== "habit")
    .slice(0, 3);
  const protocolPacket = useMemo(
    () => getTodayProtocolPacket(projects, calendarEvents, kanbanCards, now),
    [calendarEvents, kanbanCards, projects, todayKey],
  );

  function completeTask(task: DashboardTask) {
    void taskProjectCrud.updateTask(task.projectId, task.day, task.id, (item) => ({ ...item, done: true }));
    logActivityEvent({
      domain: "task",
      action: "completed",
      entityId: task.id,
      entityTitle: task.name,
      source: "Today queue",
      metadata: { projectId: task.projectId, projectName: task.projectName, day: task.day },
    });
  }

  function toggleTask(task: DashboardTask) {
    void taskProjectCrud.updateTask(task.projectId, task.day, task.id, (item) => ({ ...item, done: !item.done }));
    logActivityEvent({
      domain: "task",
      action: task.done ? "reopened" : "completed",
      entityId: task.id,
      entityTitle: task.name,
      source: "Today daily execution",
      metadata: { projectId: task.projectId, projectName: task.projectName, day: task.day },
    });
  }

  function deferTask(task: DashboardTask) {
    const project = projects.find((item) => item.id === task.projectId);
    if (!project || task.day >= project.deadlineDays) return;
    const deferred: ProjectTask = {
      id: `${Date.now()}-defer-${slugify(task.name)}`,
      name: task.name,
      done: false,
    };
    void taskProjectCrud.addTask(task.projectId, task.day + 1, deferred).then(() => taskProjectCrud.deleteTask(task.projectId, task.day, task.id));
    logActivityEvent({
      domain: "task",
      action: "deferred",
      entityId: task.id,
      entityTitle: task.name,
      source: "Today queue",
      metadata: { projectId: task.projectId, projectName: task.projectName, fromDay: task.day, toDay: task.day + 1 },
    });
  }

  function deferCard(card: KanbanCard) {
    void kanbanCrud.update(card.id, { dueDate: toDateInputValue(addDays(now, 1)) });
    logActivityEvent({
      domain: "kanban",
      action: "deferred",
      entityId: card.id,
      entityTitle: card.title,
      source: "Today queue",
      metadata: { oldDueDate: card.dueDate, newDueDate: toDateInputValue(addDays(now, 1)), priority: card.priority },
    });
  }

  function syncProtocolDay(packet: TodayProtocolPacket) {
    void taskProjectCrud.setCurrentDay(packet.project.id, packet.day);
    logActivityEvent({
      domain: "task",
      action: "updated",
      entityId: packet.project.id,
      entityTitle: packet.project.name,
      source: "Today protocol packet",
      metadata: { currentDay: packet.day, progress: packet.progress, daysLeft: packet.daysLeft },
    });
    onOpenProject(packet.project.id);
  }

  function toggleProtocolTask(packet: TodayProtocolPacket, task: ProjectTask) {
    void taskProjectCrud.updateTask(packet.project.id, packet.day, task.id, (item) => ({ ...item, done: !item.done }));
    logActivityEvent({
      domain: "task",
      action: task.done ? "reopened" : "completed",
      entityId: task.id,
      entityTitle: task.name,
      source: "Today protocol packet",
      metadata: { projectId: packet.project.id, projectName: packet.project.name, day: packet.day },
    });
  }

  async function sealProtocolDay(packet: TodayProtocolPacket) {
    const timestamp = new Date().toISOString();
    const openTasks = packet.tasks.filter((task) => !task.done);
    const nextDay = packet.day + 1;
    const nextDayTasks = packet.project.tasksByDay[nextDay] ?? [];
    const noteTitle = `Shutdown Review - ${packet.project.name} D${packet.day}`;
    const existingNote = notes.find((note) => !note.deletedAt && note.title === noteTitle);
    const carryTasks =
      nextDay <= packet.project.deadlineDays
        ? openTasks
            .filter((task) => !nextDayTasks.some((item) => item.name === `Carry forward: ${task.name}`))
            .map((task, index) => ({
              id: `${Date.now()}-carry-d${nextDay}-${index}-${slugify(task.name)}`,
              name: `Carry forward: ${task.name}`,
              done: false,
            }))
        : [];
    const note: StudyNote = {
      id: existingNote?.id ?? `${Date.now()}-shutdown-${packet.project.id}-d${packet.day}`,
      title: noteTitle,
      body: formatProtocolShutdownNote(packet, openTasks, carryTasks, now),
      tags: ["shutdown-review", "weekly-protocol", "activity-ledger"],
      pinned: packet.progress < 100,
      kind: "note",
      flashcards: [],
      askHistory: [],
      readingProgress: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const writes: Promise<unknown>[] = [
      existingNote
        ? studyNoteCrud.update(existingNote.id, {
            title: note.title,
            body: note.body,
            tags: note.tags,
            pinned: note.pinned,
            updatedAt: timestamp,
          })
        : studyNoteCrud.add(note),
      ...carryTasks.map((task) => taskProjectCrud.addTask(packet.project.id, nextDay, task)),
    ];
    const hasShutdownComment = packet.card?.comments.some((comment) => comment.body.startsWith(`Shutdown D${packet.day}:`));

    if (packet.card && !hasShutdownComment) {
      writes.push(
        kanbanCrud.update(packet.card.id, {
          comments: [
            ...packet.card.comments,
            {
              id: `${Date.now()}-shutdown-d${packet.day}`,
              body: `Shutdown D${packet.day}: ${packet.completedTasks}/${packet.totalTasks} tasks complete. Carried ${carryTasks.length} task${carryTasks.length === 1 ? "" : "s"} forward.`,
              createdAt: timestamp,
            },
          ],
        }),
      );
    }

    await Promise.all(writes);
    logActivityEvent({
      domain: "notes",
      action: existingNote ? "updated" : "created",
      entityId: note.id,
      entityTitle: note.title,
      source: "Today protocol shutdown",
      metadata: { projectId: packet.project.id, day: packet.day, progress: packet.progress, openTasks: openTasks.length },
    });
    if (carryTasks.length > 0) {
      logActivityEvent({
        domain: "task",
        action: "deferred",
        entityId: `${packet.project.id}-d${packet.day}-carry-forward`,
        entityTitle: `${packet.project.name} carry forward`,
        source: "Today protocol shutdown",
        metadata: { projectId: packet.project.id, fromDay: packet.day, toDay: nextDay, taskCount: carryTasks.length },
      });
    }
    if (packet.card && !hasShutdownComment) {
      logActivityEvent({
        domain: "kanban",
        action: "updated",
        entityId: packet.card.id,
        entityTitle: packet.card.title,
        source: "Today protocol shutdown",
        metadata: { projectId: packet.project.id, day: packet.day, carryForward: carryTasks.length },
      });
    }
    setProtocolStatus(
      nextDay <= packet.project.deadlineDays
        ? `Shutdown note saved. ${carryTasks.length} task${carryTasks.length === 1 ? "" : "s"} carried to D${nextDay}.`
        : "Shutdown note saved. Final protocol day has no next-day carry-forward.",
    );
  }

  async function acceptRecommendation(recommendation: AgentRecommendation) {
    let outcome: AgentActionResult | undefined;
    if (recommendation.action) {
      outcome = await executeAgentAction(recommendation.action, recommendation);
    }
    await agentRecommendationCrud.update(recommendation.id, { status: "accepted" });
    logActivityEvent({
      domain: "agent",
      action: "accepted",
      entityId: recommendation.id,
      entityTitle: recommendation.title,
      source: "Today queue",
      metadata: {
        agent: recommendation.agentName,
        agentId: recommendation.agentId,
        severity: recommendation.severity,
        actionType: recommendation.action?.type,
        outcomeDomain: outcome?.domain,
        outcomeEntityId: outcome?.entityId,
        outcomeEntityTitle: outcome?.entityTitle,
      },
    });
  }

  async function refreshCoachBrief() {
    const generated = generateAgentRecommendations({
      goals,
      habits,
      projects,
      dashboardTasks,
      calendarEvents,
      kanbanCards,
      activityEvents,
      existing: recommendations,
    });

    if (generated.length === 0) {
      setCoachStatus("Coach brief is already current. No new high-value reports were generated.");
      return;
    }

    await Promise.all(generated.map((recommendation) => agentRecommendationCrud.add(recommendation)));
    logActivityEvent({
      domain: "agent",
      action: "generated",
      entityId: `today-coach-brief-${Date.now()}`,
      entityTitle: "Today coach brief refresh",
      source: "Today coach autopilot",
      metadata: { count: generated.length, trust: agentLearningMemory.totalTrust },
    });
    setCoachStatus(`Generated ${generated.length} coach report${generated.length === 1 ? "" : "s"} with memory weighting.`);
  }

  async function scheduleOutcomeRescue(item: AgentOutcomeImpact, source = "Today coach autopilot") {
    const result = await scheduleAgentOutcomeRescue(item, calendarEvents, source);
    setCoachStatus(result.message);
  }

  async function stabilizeForecastLoad(forecast: ReturnType<typeof getLoadForecast>) {
    const { mitigation } = forecast;
    if (!mitigation.hasAction) {
      setForecastStatus("Forecast is already balanced enough; no mitigation action is queued.");
      return;
    }

    const writes: Promise<unknown>[] = [];
    const movedLabels: string[] = [];
    const snapshot: ForecastBalanceSnapshot = {
      label: "",
      createdAt: new Date().toISOString(),
    };

    const taskMove = mitigation.task;
    if (taskMove) {
      const project = projects.find((item) => item.id === taskMove.projectId);
      const task = project?.tasksByDay[taskMove.fromDay]?.find((item) => item.id === taskMove.taskId);
      if (project && task && !task.done && taskMove.fromDay !== taskMove.toDay) {
        writes.push(
          taskProjectCrud
            .deleteTask(project.id, taskMove.fromDay, task.id)
            .then(() => taskProjectCrud.addTask(project.id, taskMove.toDay, task)),
        );
        movedLabels.push(`${task.name} to D${taskMove.toDay}`);
        snapshot.task = {
          projectId: project.id,
          projectName: project.name,
          task: { ...task },
          fromDay: taskMove.fromDay,
          toDay: taskMove.toDay,
        };
        logActivityEvent({
          domain: "task",
          action: "deferred",
          entityId: task.id,
          entityTitle: task.name,
          source: "Forecast load balancer",
          metadata: {
            projectId: project.id,
            projectName: project.name,
            fromDay: taskMove.fromDay,
            toDay: taskMove.toDay,
            peakDate: forecast.peakDay.key,
            targetDate: taskMove.toDate,
          },
        });
      }
    }

    const cardMove = mitigation.card;
    if (cardMove) {
      const card = kanbanCards.find((item) => item.id === cardMove.cardId);
      if (card && card.dueDate !== cardMove.toDate) {
        writes.push(kanbanCrud.update(card.id, { dueDate: cardMove.toDate }));
        movedLabels.push(`${card.title} due ${formatShortDate(cardMove.toDate)}`);
        snapshot.card = {
          cardId: card.id,
          cardTitle: card.title,
          fromDate: card.dueDate,
          toDate: cardMove.toDate,
        };
        logActivityEvent({
          domain: "kanban",
          action: "deferred",
          entityId: card.id,
          entityTitle: card.title,
          source: "Forecast load balancer",
          metadata: {
            oldDueDate: card.dueDate,
            newDueDate: cardMove.toDate,
            priority: card.priority,
            peakDate: forecast.peakDay.key,
          },
        });
      }
    }

    if (writes.length === 0) {
      setForecastStatus("No movable task or board card was available for this peak day.");
      return;
    }

    await Promise.all(writes);
    snapshot.label = movedLabels.join(" and ");
    setLastForecastBalance(snapshot);
    setForecastStatus(`Balanced ${snapshot.label}.`);
  }

  async function undoForecastBalance() {
    if (!lastForecastBalance) {
      setForecastStatus("No forecast balance move is available to undo.");
      return;
    }

    const writes: Promise<unknown>[] = [];
    const restoredLabels: string[] = [];

    if (lastForecastBalance.task) {
      const { projectId, projectName, task, fromDay, toDay } = lastForecastBalance.task;
      const project = projects.find((item) => item.id === projectId);
      const targetTask = project?.tasksByDay[toDay]?.find((item) => item.id === task.id);
      if (project && targetTask) {
        writes.push(
          taskProjectCrud
            .deleteTask(projectId, toDay, task.id)
            .then(() => taskProjectCrud.addTask(projectId, fromDay, { ...targetTask })),
        );
        restoredLabels.push(`${task.name} to D${fromDay}`);
        logActivityEvent({
          domain: "task",
          action: "updated",
          entityId: task.id,
          entityTitle: task.name,
          source: "Forecast load balancer undo",
          metadata: { projectId, projectName, fromDay: toDay, toDay: fromDay },
        });
      }
    }

    if (lastForecastBalance.card) {
      const { cardId, cardTitle, fromDate, toDate } = lastForecastBalance.card;
      const card = kanbanCards.find((item) => item.id === cardId);
      if (card) {
        writes.push(kanbanCrud.update(cardId, { dueDate: fromDate }));
        restoredLabels.push(`${cardTitle} due ${fromDate ? formatShortDate(fromDate) : "unset"}`);
        logActivityEvent({
          domain: "kanban",
          action: "updated",
          entityId: cardId,
          entityTitle: cardTitle,
          source: "Forecast load balancer undo",
          metadata: { oldDueDate: toDate, newDueDate: fromDate, priority: card.priority },
        });
      }
    }

    if (writes.length === 0) {
      setForecastStatus("Undo could not find the moved task or card. Nothing changed.");
      setLastForecastBalance(null);
      return;
    }

    await Promise.all(writes);
    setForecastStatus(`Undo complete: ${restoredLabels.join(" and ")}.`);
    setLastForecastBalance(null);
  }

  return (
    <>
      <section className="today-command-grid">
        <HudCard className="today-command-card" active>
          <CardHeader title="Daily Command Brief" meta={todayLabel} />
          <div className="today-command-copy">
            <div className={`today-score ${readinessLabel.toLowerCase()}`}>
              <strong>{readiness}%</strong>
              <span>{readinessLabel}</span>
            </div>
            <div>
              <span className="today-eyebrow">Operating plan</span>
              <strong>{getTodayHeadline(context, todayEvents.length)}</strong>
              <p>{directive}</p>
              {primaryItem && (
                <div className="today-next-action">
                  <span>next best action</span>
                  <strong>{primaryItem.title}</strong>
                  <em>{primaryItem.source} - score {Math.round(primaryItem.score)}</em>
                </div>
              )}
            </div>
          </div>
          <div className="today-signal-row">
            <span><strong>{context.incompleteTasks.length}</strong> tasks open</span>
            <span><strong>{context.missedHabits.length}</strong> habits left</span>
            <span><strong>{todayEvents.length}</strong> events today</span>
            <span><strong>{context.overdueCards.length}</strong> board risks</span>
          </div>
          <div className="today-command-actions">
            <button type="button" onClick={onQuickCapture}>Quick Capture</button>
            <button type="button" onClick={() => onNavigate("tasks")}>Open Tasks</button>
            <button type="button" onClick={() => onNavigate("kanban")}>Open Board</button>
            <button type="button" onClick={() => onNavigate("agents")}>Open Agents</button>
          </div>
        </HudCard>

        <HudCard className="today-metrics-card">
          <CardHeader title="Live Load" meta={`${Math.round(context.executionLoad)}%`} />
          <TodayRiskRow label="Execution load" value={Math.round(context.executionLoad)} />
          <TodayRiskRow label="Drift risk" value={Math.round(context.driftScore)} />
          <TodayRiskRow label="Kanban pressure" value={Math.round(context.kanbanPressure)} />
          <TodayRiskRow label="Habit completion" value={Math.round(context.habitCompletion)} tone="good" />
        </HudCard>
      </section>

      <LoadForecastPanel
        forecast={context.loadForecast}
        lastBalance={lastForecastBalance}
        mitigationStatus={forecastStatus}
        onMitigate={(forecast) => void stabilizeForecastLoad(forecast)}
        onUndo={lastForecastBalance ? () => void undoForecastBalance() : undefined}
        onNavigate={onNavigate}
      />

      <HudCard className="today-coach-card" active>
        <CardHeader title="Coach Autopilot" meta={`${agentLearningMemory.totalTrust}% trust`} />
        <div className="today-coach-layout">
          <div className="today-coach-score">
            <strong>{agentLearningMemory.totalTrust}</strong>
            <span>agent trust</span>
          </div>
          <div className="today-coach-main">
            <span className="today-eyebrow">Memory-weighted decisions</span>
            <strong>{getTodayCoachHeadline(agentLearningMemory, trustedCoachReport)}</strong>
            <p>{getTodayCoachDirective(agentLearningMemory, trustedCoachReport)}</p>
            {trustedCoachReport && (
              <div className="today-coach-report">
                <span>{trustedCoachReport.agentName} - {trustedCoachReport.confidence ?? 0}% confidence</span>
                <strong>{trustedCoachReport.title}</strong>
                <em>{trustedCoachReport.source}</em>
              </div>
            )}
          </div>
          <div className="today-coach-actions">
            <button type="button" onClick={() => void refreshCoachBrief()}>Refresh Coach Brief</button>
            {topFollowUpDebt && (
              <button type="button" onClick={() => void scheduleOutcomeRescue(topFollowUpDebt)}>Schedule Rescue</button>
            )}
            {trustedCoachReport?.action && (
              <button type="button" onClick={() => void acceptRecommendation(trustedCoachReport)}>Accept Trusted Report</button>
            )}
            <button type="button" onClick={() => onNavigate("agents")}>Open Agents</button>
          </div>
        </div>
        <div className="today-coach-metrics">
          <span><strong>{agentLearningMemory.strongest.name}</strong> strongest</span>
          <span><strong>{agentLearningMemory.impactRate}%</strong> outcome impact</span>
          <span><strong>{agentLearningMemory.pendingCount}</strong> pending</span>
          <span><strong>{agentLearningMemory.staleOutcomeCount}</strong> follow-up debt</span>
        </div>
        {coachStatus && <div className="today-coach-status">{coachStatus}</div>}
      </HudCard>

      {protocolPacket && (
        <HudCard className="today-protocol-card" active>
          <CardHeader title="Weekly Protocol Packet" meta={`D${protocolPacket.day} - ${protocolPacket.dateLabel}`} />
          <div className="today-protocol-layout">
            <div className="today-protocol-gauge">
              <strong>{protocolPacket.progress}%</strong>
              <span>{protocolPacket.status}</span>
            </div>
            <div className="today-protocol-main">
              <span className="today-eyebrow">Active operating packet</span>
              <strong>{protocolPacket.project.name}</strong>
              <p>{protocolPacket.directive}</p>
              <div className="today-protocol-meta">
                <span><strong>{protocolPacket.completedTasks}/{protocolPacket.totalTasks}</strong> today tasks</span>
                <span><strong>{protocolPacket.daysLeft}</strong> days left</span>
                <span><strong>{protocolPacket.event ? "yes" : "missing"}</strong> calendar anchor</span>
                <span><strong>{protocolPacket.card ? "linked" : "missing"}</strong> board card</span>
              </div>
            </div>
            <div className="today-protocol-actions">
              <button type="button" onClick={() => syncProtocolDay(protocolPacket)}>Sync Day</button>
              <button type="button" onClick={() => void sealProtocolDay(protocolPacket)}>Seal Day</button>
              <button type="button" onClick={() => onNavigate("calendar")}>Calendar</button>
              <button type="button" onClick={() => onNavigate("kanban")}>Board</button>
              <button type="button" onClick={() => onNavigate("progress")}>Review</button>
            </div>
          </div>
          <div className="today-protocol-task-strip">
            {protocolPacket.tasks.length === 0 ? (
              <div className="kanban-empty">// no protocol tasks assigned to this day</div>
            ) : (
              protocolPacket.tasks.map((task) => (
                <button className={`today-protocol-task ${task.done ? "done" : ""}`} type="button" onClick={() => toggleProtocolTask(protocolPacket, task)} key={task.id}>
                  <span className="checkbox">{task.done && <Check />}</span>
                  <strong>{task.name}</strong>
                </button>
              ))
            )}
          </div>
          {protocolStatus && <div className="today-protocol-status">{protocolStatus}</div>}
        </HudCard>
      )}

      <section className="today-command-center-grid">
        <HudCard className="today-queue-card">
          <CardHeader title="Unified Today Queue" meta={`${topQueueItems.length} ranked actions`} />
          <div className="today-queue-list">
            {topQueueItems.length === 0 ? (
              <div className="kanban-empty">// nothing urgent in the queue</div>
            ) : (
              topQueueItems.map((item, index) => (
                <TodayQueueRow
                  item={item}
                  rank={index + 1}
                  key={item.id}
                  onNavigate={onNavigate}
                  onCompleteTask={completeTask}
                  onDeferTask={deferTask}
                  onToggleHabit={(habit) => {
                    void habitCrud.toggle(habit.id);
                    logActivityEvent({
                      domain: "habit",
                      action: habit.done ? "reopened" : "completed",
                      entityId: habit.id,
                      entityTitle: habit.name,
                      source: "Today queue",
                      metadata: { time: habit.time, duration: habit.duration },
                    });
                  }}
                  onDeferCard={deferCard}
                  onAcceptRecommendation={(recommendation) => void acceptRecommendation(recommendation)}
                  onScheduleFollowUp={(item) => void scheduleOutcomeRescue(item, "Today queue")}
                />
              ))
            )}
          </div>
        </HudCard>

        <HudCard className="today-lanes-card">
          <CardHeader title="Time Lanes" meta="morning / midday / evening" />
          <div className="today-lane-grid">
            {todayLaneOrder.map((lane) => (
              <TodayLaneStack
                lane={lane}
                items={laneMap[lane]}
                key={lane}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </HudCard>
      </section>

      <section className="today-work-grid">
        <HudCard className="today-checklist-card">
          <CardHeader title="Daily Execution" meta={`${completedTasks} / ${dashboardTasks.length} complete`} />
          <div className="today-task-list">
            {dashboardTasks.length === 0 ? (
              <div className="kanban-empty">// no project tasks assigned to today</div>
            ) : (
              dashboardTasks.map((task) => (
                <button className={`task-row ${task.done ? "done" : ""}`} type="button" onClick={() => toggleTask(task)} key={`${task.projectId}-${task.day}-${task.id}`}>
                  <span className="checkbox">{task.done && <Check />}</span>
                  <span className="task-label">{task.name}</span>
                  <span className="task-source">{task.projectName} - D{task.day}</span>
                </button>
              ))
            )}
          </div>
        </HudCard>

        <HudCard className="today-risk-card">
          <CardHeader title="Risk Radar" meta={`${blockedCount + pendingReports.length} live signals`} />
          <div className="today-risk-stack">
            <div className="today-risk-summary">
              <span><strong>{blockedCount}</strong> blocked</span>
              <span><strong>{dueStudyCount}</strong> study due</span>
              <span><strong>{carryForward.length}</strong> carry forward</span>
            </div>
            {context.blockedCards.slice(0, 2).map((card) => (
              <button type="button" onClick={() => onNavigate("kanban")} key={card.id}>
                <span>Blocked</span>
                <strong>{card.title}</strong>
                <em>{card.blockedBy}</em>
              </button>
            ))}
            {pendingReports.map((report) => (
              <button type="button" onClick={() => onNavigate("agents")} key={report.id}>
                <span>{report.agentName}</span>
                <strong>{report.title}</strong>
                <em>{report.severity} - {report.confidence}% confidence</em>
              </button>
            ))}
            {carryForward.length > 0 && (
              <div className="today-carry-forward">
                <span>Shutdown carry-forward</span>
                {carryForward.map((item) => (
                  <button type="button" onClick={() => onNavigate(item.view)} key={`carry-${item.id}`}>
                    <strong>{item.title}</strong>
                    <em>{item.source}</em>
                  </button>
                ))}
              </div>
            )}
            {context.blockedCards.length === 0 && pendingReports.length === 0 && carryForward.length === 0 && (
              <div className="kanban-empty">// no high-risk blockers detected</div>
            )}
          </div>
        </HudCard>

        <HudCard className="today-upcoming-card">
          <CardHeader title="Next Calendar Window" meta={`${context.upcomingEvents.length} events`} />
          <div className="upcoming-list">
            {context.upcomingEvents.length === 0 ? (
              <div className="empty-calendar-band">// no scheduled items in range</div>
            ) : (
              context.upcomingEvents.slice(0, 5).map(({ event, date }) => (
                <button className="upcoming-row today-upcoming-row" type="button" onClick={() => onNavigate("calendar")} key={event.id}>
                  <span className={`event-kind ${event.kind}`}>{event.kind}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <em>{formatUpcomingDate(date)} - {event.time}</em>
                  </div>
                </button>
              ))
            )}
          </div>
        </HudCard>
      </section>

      <SystemTrace label="Today command brief online" />
    </>
  );
}

const todayLaneOrder: TodayLane[] = ["morning", "midday", "evening", "anytime"];

const todayLaneLabels: Record<TodayLane, string> = {
  morning: "Morning",
  midday: "Midday",
  evening: "Evening",
  anytime: "Anytime",
};

function TodayQueueRow({
  item,
  rank,
  onNavigate,
  onCompleteTask,
  onDeferTask,
  onToggleHabit,
  onDeferCard,
  onAcceptRecommendation,
  onScheduleFollowUp,
}: {
  item: TodayQueueItem;
  rank: number;
  onNavigate: (view: View) => void;
  onCompleteTask: (task: DashboardTask) => void;
  onDeferTask: (task: DashboardTask) => void;
  onToggleHabit: (habit: Habit) => void;
  onDeferCard: (card: KanbanCard) => void;
  onAcceptRecommendation: (recommendation: AgentRecommendation) => void;
  onScheduleFollowUp: (item: AgentOutcomeImpact) => void;
}) {
  const task = item.task;
  const card = item.card;

  function runPrimary() {
    if (item.followUp) {
      onScheduleFollowUp(item.followUp);
      return;
    }
    if (task) {
      onCompleteTask(task);
      return;
    }
    if (item.habit) {
      onToggleHabit(item.habit);
      return;
    }
    if (item.recommendation?.action) {
      onAcceptRecommendation(item.recommendation);
      return;
    }
    onNavigate(item.view);
  }

  return (
    <article
      className={`today-queue-item ${item.kind} ${item.priority}`}
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(item.view)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate(item.view);
        }
      }}
    >
      <div className="today-queue-rank">
        <strong>{String(rank).padStart(2, "0")}</strong>
        <span>{Math.round(item.score)}</span>
      </div>
      <div className="today-queue-body">
        <div className="today-queue-head">
          <span className={`today-kind ${item.kind}`}>{getTodayKindLabel(item.kind)}</span>
          <PriorityChip level={item.priority} />
          {item.timeLabel && <em>{item.timeLabel}</em>}
        </div>
        <strong>{item.title}</strong>
        <p>{item.source} - {item.meta}</p>
        {typeof item.progress === "number" && <ProgressBar value={item.progress} />}
      </div>
      <div className="today-queue-actions">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            runPrimary();
          }}
        >
          {getTodayPrimaryActionLabel(item)}
        </button>
        {task && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeferTask(task);
            }}
          >
            defer
          </button>
        )}
        {card && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeferCard(card);
            }}
          >
            +1d
          </button>
        )}
      </div>
    </article>
  );
}

function TodayLaneStack({
  lane,
  items,
  onNavigate,
}: {
  lane: TodayLane;
  items: TodayQueueItem[];
  onNavigate: (view: View) => void;
}) {
  return (
    <div className={`today-lane ${lane}`}>
      <div className="today-lane-head">
        <span>{todayLaneLabels[lane]}</span>
        <strong>{items.length}</strong>
      </div>
      <div className="today-lane-list">
        {items.length === 0 ? (
          <div className="today-lane-empty">// clear</div>
        ) : (
          items.slice(0, 4).map((item) => (
            <button className={`today-lane-item ${item.kind}`} type="button" onClick={() => onNavigate(item.view)} key={`${lane}-${item.id}`}>
              <span>{item.timeLabel ?? getTodayKindLabel(item.kind)}</span>
              <strong>{item.title}</strong>
              <em>{item.source}</em>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function TodayRiskRow({ label, value, tone = "risk" }: { label: string; value: number; tone?: "risk" | "good" }) {
  return (
    <div className={`today-risk-row ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

function LoadForecastPanel({
  forecast,
  lastBalance,
  mitigationStatus,
  onMitigate,
  onUndo,
  onNavigate,
  compact = false,
}: {
  forecast: ReturnType<typeof getLoadForecast>;
  lastBalance?: ForecastBalanceSnapshot | null;
  mitigationStatus?: string;
  onMitigate?: (forecast: ReturnType<typeof getLoadForecast>) => void;
  onUndo?: () => void;
  onNavigate?: (view: View) => void;
  compact?: boolean;
}) {
  const visibleDays = forecast.days.slice(0, compact ? 10 : 14);

  return (
    <HudCard className={`load-forecast-card ${compact ? "compact" : ""}`} active={!compact}>
      <CardHeader title="Two-Week Load Forecast" meta={`${forecast.collisionDays} collision day${forecast.collisionDays === 1 ? "" : "s"}`} />
      <div className="load-forecast-hero">
        <div className={`load-forecast-score ${forecast.peakDay.tone}`}>
          <strong>{forecast.peakDay.load}%</strong>
          <span>peak load</span>
        </div>
        <div>
          <span className="today-eyebrow">Predictive schedule model</span>
          <strong>{forecast.headline}</strong>
          <p>{forecast.directive}</p>
        </div>
        <div className="load-forecast-metrics">
          <span><strong>{forecast.averageLoad}%</strong> avg load</span>
          <span><strong>{forecast.openTaskCount}</strong> open tasks</span>
          <span><strong>{forecast.scheduledCount}</strong> scheduled signals</span>
        </div>
      </div>
      <div className="load-forecast-strip" aria-label="Fourteen day load forecast">
        {visibleDays.map((day) => (
          onNavigate ? (
            <button
              className={`load-forecast-day ${day.tone}`}
              type="button"
              onClick={() => onNavigate(day.primaryView)}
              style={{ "--forecast-load": `${day.load}%` } as CSSProperties}
              key={day.key}
            >
              <span>{day.weekday}</span>
              <strong>{day.dayLabel}</strong>
              <i />
              <em>{day.load}%</em>
            </button>
          ) : (
            <div
              className={`load-forecast-day ${day.tone}`}
              style={{ "--forecast-load": `${day.load}%` } as CSSProperties}
              key={day.key}
            >
              <span>{day.weekday}</span>
              <strong>{day.dayLabel}</strong>
              <i />
              <em>{day.load}%</em>
            </div>
          )
        ))}
      </div>
      <div className="load-forecast-signals">
        <section>
          <span>Peak Day</span>
          <strong>{forecast.peakDay.label}</strong>
          <p>{forecast.peakDay.topSignals.join(" / ")}</p>
        </section>
        <section>
          <span>Best Recovery</span>
          <strong>{forecast.recoveryDay.label}</strong>
          <p>{forecast.recoveryDay.load}% load with {forecast.recoveryDay.openTaskCount} open task{forecast.recoveryDay.openTaskCount === 1 ? "" : "s"}.</p>
        </section>
        <section>
          <span>Next Move</span>
          <strong>{forecast.nextActionTitle}</strong>
          <p>{forecast.nextActionBody}</p>
        </section>
      </div>
      <div className="load-forecast-mitigation">
        <div>
          <span>Balancer</span>
          <strong>{forecast.mitigation.title}</strong>
          <p>{forecast.mitigation.summary}</p>
          <div className="load-forecast-projection">
            <span><strong>{forecast.peakDay.load}%</strong> current peak</span>
            <span><strong>{forecast.mitigation.peakLoadAfter}%</strong> projected peak</span>
            <span><strong>-{forecast.mitigation.loadReduction}</strong> load relief</span>
            <span><strong>{forecast.mitigation.targetLoadAfter}%</strong> {forecast.mitigation.targetDayLabel}</span>
          </div>
        </div>
        {onMitigate && (
          <button type="button" disabled={!forecast.mitigation.hasAction} onClick={() => onMitigate(forecast)}>
            {forecast.mitigation.buttonLabel}
          </button>
        )}
      </div>
      {lastBalance && onUndo && (
        <div className="load-forecast-undo">
          <div>
            <span>Last Balance</span>
            <strong>{lastBalance.label}</strong>
            <p>{formatActivityTime(lastBalance.createdAt)}</p>
          </div>
          <button type="button" onClick={onUndo}>Undo Balance</button>
        </div>
      )}
      {mitigationStatus && <div className="load-forecast-status">{mitigationStatus}</div>}
      {(onNavigate || onMitigate) && (
        <div className="load-forecast-actions">
          {onNavigate && <button type="button" onClick={() => onNavigate("calendar")}>Open Calendar</button>}
          {onNavigate && <button type="button" onClick={() => onNavigate("tasks")}>Open Tasks</button>}
          {onNavigate && <button type="button" onClick={() => onNavigate("kanban")}>Open Board</button>}
        </div>
      )}
    </HudCard>
  );
}

type TodayProtocolPacket = {
  project: TaskProject;
  day: number;
  dateLabel: string;
  tasks: ProjectTask[];
  completedTasks: number;
  totalTasks: number;
  progress: number;
  daysLeft: number;
  event?: CalendarEvent;
  card?: KanbanCard;
  status: string;
  directive: string;
};

function getTodayProtocolPacket(
  projects: TaskProject[],
  calendarEvents: CalendarEvent[],
  kanbanCards: KanbanCard[],
  now: Date,
): TodayProtocolPacket | null {
  const protocolProjects = projects
    .filter((project) => project.name.startsWith("Weekly Protocol -"))
    .sort((a, b) => getProjectEndDate(b).getTime() - getProjectEndDate(a).getTime());
  if (protocolProjects.length === 0) return null;

  const today = startOfDay(now);
  const activeProject =
    protocolProjects.find((project) => {
      const start = startOfDay(getProjectStartDate(project));
      const end = startOfDay(getProjectEndDate(project));
      return today >= start && today <= end;
    }) ?? protocolProjects[0];
  const start = startOfDay(getProjectStartDate(activeProject));
  const end = startOfDay(getProjectEndDate(activeProject));
  const day = Math.round(clamp(daysBetween(start, today) + 1, 1, Math.max(activeProject.deadlineDays, 1)));
  const tasks = activeProject.tasksByDay[day] ?? [];
  const completedTasks = tasks.filter((task) => task.done).length;
  const totalTasks = tasks.length;
  const progress = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100);
  const dateKey = toDateInputValue(addDays(start, day - 1));
  const event = calendarEvents.find((item) => item.id === `${activeProject.id}-calendar-d${day}` || (item.date === dateKey && item.title.startsWith(`Protocol D${day}:`)));
  const card = kanbanCards.find((item) => item.id === `${activeProject.id}-control-card` || item.linkedTaskProjectId === activeProject.id);
  const daysLeft = Math.max(0, daysBetween(today, end));
  const status = progress >= 100 ? "sealed" : progress > 0 ? "in motion" : daysLeft <= 1 ? "urgent" : "ready";
  const directive =
    progress >= 100
      ? "Today protocol is complete. Use the remaining window to clear the linked board card or write a short proof note."
      : tasks[0]
        ? `Execute ${tasks[0].name} first, then clear the remaining protocol checks before shutdown.`
        : "Sync the protocol day and add one concrete task before the packet goes quiet.";

  return {
    project: activeProject,
    day,
    dateLabel: formatTaskDate(addDays(start, day - 1)),
    tasks,
    completedTasks,
    totalTasks,
    progress,
    daysLeft,
    event,
    card,
    status,
    directive,
  };
}

function formatProtocolShutdownNote(
  packet: TodayProtocolPacket,
  openTasks: ProjectTask[],
  carryTasks: ProjectTask[],
  now: Date,
) {
  return [
    `# Shutdown Review - ${packet.project.name} D${packet.day}`,
    "",
    `**Date:** ${formatTaskDate(now)}`,
    `**Progress:** ${packet.completedTasks}/${packet.totalTasks} tasks complete (${packet.progress}%)`,
    `**Status:** ${packet.status}`,
    "",
    "## Completed Today",
    ...(packet.tasks.filter((task) => task.done).length
      ? packet.tasks.filter((task) => task.done).map((task) => `- ${task.name}`)
      : ["- No protocol tasks completed yet."]),
    "",
    "## Open Loops",
    ...(openTasks.length ? openTasks.map((task) => `- ${task.name}`) : ["- No open protocol tasks."]),
    "",
    "## Carry Forward",
    ...(carryTasks.length ? carryTasks.map((task) => `- ${task.name}`) : ["- Nothing carried forward."]),
    "",
    "## Linked Signals",
    `- Calendar anchor: ${packet.event ? `${packet.event.title} at ${packet.event.time}` : "missing"}`,
    `- Board control card: ${packet.card ? packet.card.title : "missing"}`,
    "",
    "## Tomorrow",
    "- What is the first visible proof step?",
    "- What should be removed if the packet feels heavy?",
    "- What evidence will show that the day was protected?",
  ].join("\n");
}

function getTodayQueueItems({
  context,
  goals,
  habits,
  todayEvents,
  notes,
  recommendations,
  followUpDebt,
  now,
}: {
  context: AgentContext;
  goals: Goal[];
  habits: Habit[];
  todayEvents: Array<{ event: CalendarEvent; date: Date }>;
  notes: StudyNote[];
  recommendations: AgentRecommendation[];
  followUpDebt: AgentOutcomeImpact[];
  now: Date;
}): TodayQueueItem[] {
  const taskItems: TodayQueueItem[] = context.incompleteTasks.map((task, index) => {
    const project = context.projects.find((item) => item.id === task.projectId);
    const pressure = project ? getProjectPressure(project, now) : context.projectPressure;
    const daysLeft = project ? Math.max(project.deadlineDays - task.day, 0) : 0;
    const score = clamp(72 + pressure * 0.16 + Math.max(0, 5 - index) * 2, 35, 98);
    return {
      id: `queue-task-${task.projectId}-${task.day}-${task.id}`,
      kind: "task",
      title: task.name,
      source: `${task.projectName} - D${task.day}`,
      meta: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
      score,
      priority: pressure >= 80 ? "ziftinity" : pressure >= 58 ? "high" : "medium",
      lane: index < 2 ? "morning" : index < 5 ? "midday" : "anytime",
      view: "tasks",
      task,
    };
  });

  const habitItems: TodayQueueItem[] = sortHabits(habits)
    .filter((habit) => !habit.done)
    .map((habit) => {
      const late = isTodayTimePast(habit.time, now);
      return {
        id: `queue-habit-${habit.id}`,
        kind: "habit",
        title: habit.name,
        source: "Habit protocol",
        meta: late ? `${habit.duration} - overdue window` : habit.duration,
        score: clamp(54 + getHabitFriction(habit) * 0.8 + (late ? 14 : 0), 35, 88),
        priority: late ? "high" : "medium",
        lane: getTodayLaneFromTime(habit.time),
        view: "habits",
        timeLabel: habit.time,
        habit,
      } satisfies TodayQueueItem;
    });

  const eventItems: TodayQueueItem[] = todayEvents.map(({ event }) => ({
    id: `queue-event-${event.id}`,
    kind: "event",
    title: event.title,
    source: "Calendar",
    meta: event.kind,
    score: getTodayEventScore(event, now),
    priority: getTodayEventPriority(event),
    lane: getTodayLaneFromTime(event.time),
    view: "calendar",
    timeLabel: event.time,
    event,
  }));

  const seenCards = new Set<string>();
  const pressureCards = [...context.overdueCards, ...context.dueSoonCards, ...context.highOpenCards]
    .filter((card) => {
      if (seenCards.has(card.id)) return false;
      seenCards.add(card.id);
      return true;
    })
    .slice(0, 7);
  const cardItems: TodayQueueItem[] = pressureCards.map((card) => {
    const dueState = getDueState(card.dueDate);
    return {
      id: `queue-card-${card.id}`,
      kind: "kanban",
      title: card.title,
      source: getKanbanColumnTitle(card.columnId),
      meta: getTodayCardMeta(card),
      score: clamp(getTodayCardScore(card, now), 35, 100),
      priority: card.priority,
      lane: dueState === "overdue" ? "morning" : dueState === "due-today" ? "midday" : "anytime",
      view: "kanban",
      progress: card.subtasks.length ? getSubtaskProgress(card) : undefined,
      card,
    };
  });

  const dueFlashcards = getDueFlashcards(getAllSavedFlashcards(notes))
    .filter((item) => item.card.difficulty !== "known")
    .slice(0, 6);
  const studyItems: TodayQueueItem[] = dueFlashcards.map((item) => {
    const hoursOverdue = Math.max(0, (now.getTime() - new Date(item.card.dueAt).getTime()) / 36e5);
    const score = clamp(58 + hoursOverdue * 1.2 + (item.card.difficulty === "learning" ? 14 : 7), 40, 94);
    return {
      id: `queue-study-${item.noteId}-${item.card.id}`,
      kind: "study",
      title: item.card.question,
      source: item.noteTitle,
      meta: `${item.card.difficulty} recall - ${item.card.source}`,
      score,
      priority: score >= 82 ? "high" : "medium",
      lane: "evening",
      view: "notes",
      flashcard: item,
    };
  });

  const agentItems: TodayQueueItem[] = recommendations
    .filter((recommendation) => recommendation.status === "pending")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((recommendation) => {
      const priority = agentSeverityToPriority(recommendation.severity);
      return {
        id: `queue-agent-${recommendation.id}`,
        kind: "agent",
        title: recommendation.title,
        source: recommendation.agentName,
        meta: `${recommendation.confidence ?? 0}% confidence - ${recommendation.source}`,
        score: clamp((recommendation.score ?? 55) + priorityToScore(priority) * 0.1, 35, 98),
        priority,
        lane: priority === "ziftinity" || priority === "high" ? "morning" : "anytime",
        view: "agents",
        recommendation,
      };
    });

  const followUpItems: TodayQueueItem[] = followUpDebt.slice(0, 4).map((item, index) => {
    const priority: Priority = item.ageDays >= 14 ? "ziftinity" : "high";
    return {
      id: `queue-followup-${item.id}`,
      kind: "agent",
      title: `Rescue: ${item.title}`,
      source: `${item.agentName} follow-up`,
      meta: `${item.ageDays}d stale - ${item.meta}`,
      score: clamp(94 + Math.min(item.ageDays, 10) - index * 3, 72, 99),
      priority,
      lane: "morning",
      view: getAgentOutcomeView(item.domain),
      followUp: item,
    };
  });

  const goalItems: TodayQueueItem[] = sortGoals(goals)
    .filter((goal) => goal.progress < 100)
    .slice(0, 3)
    .map((goal) => ({
      id: `queue-goal-${goal.id}`,
      kind: "goal",
      title: goal.title,
      source: `${priorityLabel[goal.level]} goal`,
      meta: `${goal.progress}% complete`,
      score: clamp(priorityToScore(goal.level) * 0.52 + (100 - goal.progress) * 0.24 + context.projectPressure * 0.18, 30, 88),
      priority: goal.level,
      lane: "anytime",
      view: "goals",
      progress: goal.progress,
    }));

  return [...followUpItems, ...taskItems, ...habitItems, ...eventItems, ...cardItems, ...studyItems, ...agentItems, ...goalItems]
    .sort((a, b) => b.score - a.score || priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title))
    .slice(0, 28);
}

function groupTodayQueue(items: TodayQueueItem[]) {
  const groups = todayLaneOrder.reduce<Record<TodayLane, TodayQueueItem[]>>((result, lane) => {
    result[lane] = [];
    return result;
  }, { morning: [], midday: [], evening: [], anytime: [] });

  items.forEach((item) => {
    groups[item.lane].push(item);
  });

  todayLaneOrder.forEach((lane) => {
    groups[lane] = groups[lane].sort((a, b) => getTodayLaneSortValue(a) - getTodayLaneSortValue(b) || b.score - a.score);
  });

  return groups;
}

function getTodayLaneSortValue(item: TodayQueueItem) {
  const minutes = getTimeMinutes(item.timeLabel);
  if (typeof minutes === "number") return minutes;
  return 1500 - item.score;
}

function getTodayLaneFromTime(time?: string): TodayLane {
  const minutes = getTimeMinutes(time);
  if (typeof minutes !== "number") return "anytime";
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "midday";
  return "evening";
}

function getTimeMinutes(value?: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function isTodayTimePast(time: string, now: Date) {
  const minutes = getTimeMinutes(time);
  if (typeof minutes !== "number") return false;
  return now.getHours() * 60 + now.getMinutes() > minutes;
}

function getTodayEventScore(event: CalendarEvent, now: Date) {
  const minutes = getTimeMinutes(event.time);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const timePressure = typeof minutes === "number" ? clamp(60 - Math.abs(minutes - currentMinutes) / 6, 0, 60) : 22;
  const kindPressure = event.kind === "deadline" ? 34 : event.kind === "project" ? 26 : event.kind === "meeting" ? 22 : event.kind === "appointment" ? 18 : 12;
  return clamp(38 + kindPressure + timePressure * 0.42, 35, 96);
}

function getTodayEventPriority(event: CalendarEvent): Priority {
  if (event.kind === "deadline") return "high";
  if (event.kind === "project" || event.kind === "meeting") return "medium";
  return "low";
}

function getTodayKindLabel(kind: TodayQueueKind) {
  if (kind === "kanban") return "board";
  if (kind === "study") return "review";
  return kind;
}

function getTodayPrimaryActionLabel(item: TodayQueueItem) {
  if (item.followUp) return "rescue";
  if (item.kind === "task") return "complete";
  if (item.kind === "habit") return "done";
  if (item.kind === "study") return "review";
  if (item.kind === "agent") return item.recommendation?.action ? "accept" : "open";
  return "open";
}

function PlannerView({
  goals,
  folders,
  notes,
  projects,
  calendarEvents,
  kanbanCards,
  onNavigate,
}: {
  goals: Goal[];
  folders: StudyFolder[];
  notes: StudyNote[];
  projects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  onNavigate: (view: View) => void;
}) {
  const [sourceId, setSourceId] = useState("");
  const [horizon, setHorizon] = useState(14);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [startTime, setStartTime] = useState("08:00");
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeCalendar, setIncludeCalendar] = useState(true);
  const [includeKanban, setIncludeKanban] = useState(true);
  const [plannerStatus, setPlannerStatus] = useState("");
  const sources = useMemo(() => getPlanningSources(goals, folders, notes), [folders, goals, notes]);
  const activeSource = sources.find((source) => source.id === sourceId) ?? sources[0];
  const generatedPlan = useMemo(
    () => (activeSource ? buildUnifiedPlan(activeSource, horizon, dailyMinutes) : null),
    [activeSource, dailyMinutes, horizon],
  );
  const upcomingPlannerEvents = useMemo(
    () =>
      getUpcomingEvents(calendarEvents, new Date())
        .filter(({ event }) => event.title.toLowerCase().includes("focus:") || event.title.toLowerCase().includes("planner"))
        .slice(0, 6),
    [calendarEvents],
  );
  const plannerCards = useMemo(
    () => kanbanCards.filter((card) => card.tags.includes("planner") && !card.archivedAt),
    [kanbanCards],
  );
  const plannerProjects = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes("planner") || project.name.toLowerCase().includes("sprint")),
    [projects],
  );

  useEffect(() => {
    if (!sourceId && activeSource) {
      setSourceId(activeSource.id);
      return;
    }
    if (sourceId && !sources.some((source) => source.id === sourceId)) {
      setSourceId(sources[0]?.id ?? "");
    }
  }, [activeSource, sourceId, sources]);

  async function deployPlan() {
    if (!generatedPlan || !activeSource) return;
    if (!includeTasks && !includeCalendar && !includeKanban) {
      setPlannerStatus("Select at least one destination: tasks, calendar, or board.");
      return;
    }

    const timestamp = Date.now();
    const writes: Promise<unknown>[] = [];
    const deployed: string[] = [];

    if (includeTasks) {
      writes.push(taskProjectCrud.add(createTaskProjectFromPlan(generatedPlan, timestamp)));
      deployed.push("task project");
    }

    if (includeCalendar) {
      generatedPlan.rows.forEach((row, index) => {
        writes.push(calendarCrud.add(createCalendarEventFromPlan(row, activeSource, startTime, timestamp + index)));
      });
      deployed.push(`${generatedPlan.rows.length} calendar blocks`);
    }

    if (includeKanban) {
      const card = createKanbanCardFromPlan(generatedPlan, timestamp, includeTasks);
      writes.push(kanbanCrud.add(card).then(() => logKanbanActivity({ card, action: "created", toColumnId: card.columnId })));
      deployed.push("Kanban card");
    }

    await Promise.all(writes);
    setPlannerStatus(`${activeSource.title} plan deployed to ${deployed.join(", ")}.`);
  }

  return (
    <>
      <section className="planner-command-grid">
        <HudCard className="planner-hero-card" active>
          <CardHeader title="Unified Planning Engine" meta={activeSource?.kindLabel ?? "source required"} />
          {activeSource ? (
            <div className="planner-hero">
              <div>
                <span className="today-eyebrow">Active source</span>
                <strong>{activeSource.title}</strong>
                <p>{activeSource.summary}</p>
              </div>
              <div className="planner-score">
                <strong>{generatedPlan?.pressure ?? 0}%</strong>
                <span>pressure</span>
              </div>
            </div>
          ) : (
            <div className="kanban-empty">// add a goal or certification track to generate a plan</div>
          )}
          <div className="planner-controls">
            <label>
              <span>Source</span>
              <select value={activeSource?.id ?? ""} onChange={(event) => setSourceId(event.target.value)}>
                {sources.map((source) => (
                  <option value={source.id} key={source.id}>{source.kindLabel} - {source.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Window</span>
              <select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
            <label>
              <span>Daily load</span>
              <input type="number" min="20" max="180" step="10" value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value) || 60)} />
            </label>
            <label>
              <span>Start time</span>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
          </div>
          <div className="planner-destinations">
            <button className={includeTasks ? "active" : ""} type="button" onClick={() => setIncludeTasks((value) => !value)}>
              <ListTodo /> tasks
            </button>
            <button className={includeCalendar ? "active" : ""} type="button" onClick={() => setIncludeCalendar((value) => !value)}>
              <CalendarDays /> calendar
            </button>
            <button className={includeKanban ? "active" : ""} type="button" onClick={() => setIncludeKanban((value) => !value)}>
              <Columns3 /> board
            </button>
            <button className="planner-deploy" type="button" onClick={() => void deployPlan()} disabled={!generatedPlan}>
              deploy plan
            </button>
          </div>
          {plannerStatus && <p className="planner-status">{plannerStatus}</p>}
        </HudCard>

        <HudCard className="planner-health-card">
          <CardHeader title="System Impact" meta="live preview" />
          <div className="planner-impact-grid">
            <div><strong>{generatedPlan?.rows.length ?? 0}</strong><span>planned days</span></div>
            <div><strong>{generatedPlan?.taskCount ?? 0}</strong><span>tasks</span></div>
            <div><strong>{generatedPlan?.calendarCount ?? 0}</strong><span>events</span></div>
            <div><strong>{includeKanban && generatedPlan ? 1 : 0}</strong><span>cards</span></div>
          </div>
          <div className="planner-signal-stack">
            <button type="button" onClick={() => onNavigate("tasks")}>
              <span>Task protocol</span>
              <strong>{plannerProjects.length} planner sprint{plannerProjects.length === 1 ? "" : "s"}</strong>
            </button>
            <button type="button" onClick={() => onNavigate("calendar")}>
              <span>Dashboard window</span>
              <strong>{upcomingPlannerEvents.length} planner block{upcomingPlannerEvents.length === 1 ? "" : "s"} in 14 days</strong>
            </button>
            <button type="button" onClick={() => onNavigate("kanban")}>
              <span>Board pressure</span>
              <strong>{plannerCards.length} active planner card{plannerCards.length === 1 ? "" : "s"}</strong>
            </button>
          </div>
        </HudCard>
      </section>

      <section className="planner-main-grid">
        <HudCard className="planner-sources-card">
          <CardHeader title="Planning Sources" meta={`${sources.length} detected`} />
          <div className="planner-source-list">
            {sources.map((source) => (
              <button className={activeSource?.id === source.id ? "active" : ""} type="button" onClick={() => setSourceId(source.id)} key={source.id}>
                <span>{source.kindLabel}</span>
                <strong>{source.title}</strong>
                <em>{source.dueLabel} - {source.progress}% ready</em>
                <ProgressBar value={source.progress} />
              </button>
            ))}
          </div>
        </HudCard>

        <HudCard className="planner-preview-card">
          <CardHeader title="Generated Daily Blocks" meta={generatedPlan ? `${generatedPlan.rows.length} days` : "no plan"} />
          <div className="planner-preview-list">
            {generatedPlan?.rows.map((row) => (
              <article key={row.day}>
                <span>D{String(row.day).padStart(2, "0")}</span>
                <div>
                  <strong>{row.focus}</strong>
                  <em>{formatUpcomingDate(row.date)} - {row.intensity} - {row.minutes}m</em>
                  <p>{row.recall}</p>
                </div>
              </article>
            )) ?? <div className="kanban-empty">// choose a source to preview a plan</div>}
          </div>
        </HudCard>

        <HudCard className="planner-drift-card">
          <CardHeader title="Adaptive Rules" meta="planner logic" />
          <div className="planner-rules">
            <div>
              <strong>Deadline pressure</strong>
              <p>Shorter windows raise priority and generate tighter daily blocks.</p>
            </div>
            <div>
              <strong>Objective gaps</strong>
              <p>Incomplete certification objectives and low-progress goals are scheduled first.</p>
            </div>
            <div>
              <strong>Recovery rhythm</strong>
              <p>Weekends become review days unless the pressure score is high.</p>
            </div>
            <div>
              <strong>System sync</strong>
              <p>Calendar events feed the dashboard window, tasks feed Today, and Kanban logs the sprint.</p>
            </div>
          </div>
        </HudCard>
      </section>

      <SystemTrace label="Unified planning engine online" />
    </>
  );
}

function AuthScreen({ mode }: { mode: "loading" | "signin" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(mode === "loading" ? "Synchronizing auth session..." : "");
  const [busy, setBusy] = useState(false);
  const hexNoise = useMemo(() => makeNoise(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      setMessage("Use an email and a password with at least 6 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
        setMessage("Account created. If email confirmation is enabled, confirm it before signing in.");
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Auth request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="data-noise left">{hexNoise}</div>
      <div className="data-noise right">{hexNoise}</div>
      <div className="scan-top">{hexNoise}</div>
      <main className="auth-shell">
        <HudCard className="auth-card" active>
          <div className="brand-card auth-brand">
            <div className="brand-mark" />
            <div>
              <strong>FOCUS//OS</strong>
              <span>secure sync</span>
            </div>
          </div>
          <CardHeader title="Identity Link" meta={isSignUp ? "create account" : "sign in"} />
          <p className="auth-copy">
            Connect a Supabase user account so goals, habits, tasks, calendar, and Kanban history sync across web and the future Mac app.
          </p>
          {mode === "loading" ? (
            <div className="auth-message">{message}</div>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              <label>
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="minimum 6 characters" />
              </label>
              {message && <div className="auth-message">{message}</div>}
              <button className="submit-goal" type="submit" disabled={busy}>
                {busy ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
              <button className="auth-switch" type="button" onClick={() => setIsSignUp((value) => !value)}>
                {isSignUp ? "Already have an account" : "Create a new account"}
              </button>
            </form>
          )}
        </HudCard>
      </main>
    </>
  );
}

function GoalsRegistry({
  goals,
  projects,
  calendarEvents,
  kanbanCards,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onNavigate,
  onOpenProject,
}: {
  goals: Goal[];
  projects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => void;
  onDeleteGoal: (id: string) => void;
  onNavigate: (view: View) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("Dec 31, 2026");
  const [level, setLevel] = useState<Priority>("ziftinity");
  const [progress, setProgress] = useState(0);
  const [activeGoalId, setActiveGoalId] = useState(goals[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");

  useEffect(() => {
    if (!goals.length) {
      setActiveGoalId("");
      return;
    }
    if (!goals.some((goal) => goal.id === activeGoalId)) {
      setActiveGoalId(goals[0].id);
    }
  }, [activeGoalId, goals]);

  const activeGoal = goals.find((goal) => goal.id === activeGoalId) ?? goals[0] ?? null;
  const filteredGoals = goals.filter((goal) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return `${goal.title} ${goal.due} ${goal.level} ${goal.meta}`.toLowerCase().includes(query);
  });
  const executionMap = useMemo(
    () => (activeGoal ? getGoalExecutionMap(activeGoal, projects, calendarEvents, kanbanCards) : null),
    [activeGoal, calendarEvents, kanbanCards, projects],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAddGoal({
      id: `${Date.now()}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: cleanTitle,
      due: due.trim() || "Ongoing",
      level,
      progress,
      meta: `${progress}% initialized`,
      iconKey: "target",
      chart: "line",
      milestones: makeGoalMilestones([
        ["Define measurable outcome", progress >= 15, 20],
        ["Create execution plan", progress >= 30, 25],
        ["Ship visible progress", progress >= 60, 30],
        ["Close goal or reset target", progress >= 95, 25],
      ]),
    });
    setTitle("");
    setDue("Dec 31, 2026");
    setLevel("ziftinity");
    setProgress(0);
  }

  function toggleMilestone(goal: Goal, milestoneId: string) {
    const milestones = getGoalMilestones(goal).map((milestone) =>
      milestone.id === milestoneId ? { ...milestone, done: !milestone.done } : milestone,
    );
    onUpdateGoal(goal.id, { milestones });
  }

  function addMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeGoal) return;
    const title = milestoneInput.trim();
    if (!title) return;
    const milestones = getGoalMilestones(activeGoal);
    onUpdateGoal(activeGoal.id, {
      milestones: [
        ...milestones,
        {
          id: `${Date.now()}-${slugify(title)}`,
          title,
          done: false,
          weight: Math.max(10, Math.round(100 / Math.max(milestones.length + 1, 1))),
        },
      ],
    });
    setMilestoneInput("");
  }

  function syncProgress() {
    if (!activeGoal || !executionMap) return;
    onUpdateGoal(activeGoal.id, {
      progress: executionMap.computedProgress,
      meta: executionMap.statusLine,
    });
  }

  function buildExecutionSprint() {
    if (!activeGoal) return;
    const project = createGoalExecutionProject(activeGoal, projects.length);
    void taskProjectCrud.add(project).then(() => onOpenProject(project.id));
  }

  return (
    <>
      <HudCard className="goal-editor-card">
        <CardHeader title="Goal Command" meta={`${goals.length} active`} />
        <form className="goal-form" onSubmit={handleSubmit}>
          <label>
            <span>Objective</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Launch app beta" />
          </label>
          <label>
            <span>Due</span>
            <input value={due} onChange={(event) => setDue(event.target.value)} placeholder="Dec 31, 2026" />
          </label>
          <label>
            <span>Priority</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as Priority)}>
              <option value="ziftinity">Ziftinity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span>Progress</span>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
            />
          </label>
          <button className="submit-goal" type="submit">+ Add Goal</button>
        </form>
        <div className="goal-registry-filter">
          <Search />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="// search objectives, priority, due date" />
        </div>
      </HudCard>

      <section className="goal-command-grid">
        <HudCard className="goals-registry-card">
          <CardHeader title="All Goals" meta={`${filteredGoals.length} visible`} />
          <div className="registry-list">
            {filteredGoals.length === 0 ? (
              <div className="empty-calendar-band">// no objective matches that filter</div>
            ) : (
              filteredGoals.map((goal, index) => {
                const map = getGoalExecutionMap(goal, projects, calendarEvents, kanbanCards);
                return (
                  <div className={`registry-row ${goal.id === activeGoal?.id ? "active" : ""}`} key={goal.id}>
                    <button
                      className="registry-select-button"
                      type="button"
                      onClick={() => setActiveGoalId(goal.id)}
                    >
                      <span className="priority-index">{String(index + 1).padStart(2, "0")}</span>
                      <div className="registry-main">
                        <strong>{goal.title}</strong>
                        <ProgressBar value={map.computedProgress} />
                      </div>
                      <span className="registry-due">{goal.due}</span>
                      <PriorityChip level={goal.level} />
                      <strong className="registry-progress">{map.computedProgress}%</strong>
                    </button>
                    <button className="delete-goal" type="button" onClick={() => onDeleteGoal(goal.id)} aria-label={`Delete ${goal.title}`}>
                      <Trash2 />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </HudCard>

        <HudCard className="goal-detail-card">
          {activeGoal && executionMap ? (
            <>
              <div className="goal-detail-hero">
                <div>
                  <span className="goal-detail-kicker">Execution map</span>
                  <h2>{activeGoal.title}</h2>
                  <p>{executionMap.statusLine}</p>
                </div>
                <div className="goal-score">
                  <strong>{executionMap.computedProgress}%</strong>
                  <span>computed</span>
                </div>
              </div>
              <ProgressBar value={executionMap.computedProgress} />
              <div className="goal-source-grid">
                <MetricBadge value={`${executionMap.milestoneProgress}%`} label="milestones" />
                <MetricBadge value={`${executionMap.taskProgress}%`} label="task proof" />
                <MetricBadge value={`${executionMap.boardProgress}%`} label="board proof" />
              </div>
              <div className="goal-action-row">
                <button type="button" onClick={syncProgress}>Sync Progress</button>
                <button type="button" onClick={buildExecutionSprint}>Build Task Sprint</button>
                <button type="button" onClick={() => executionMap.projects[0] ? onOpenProject(executionMap.projects[0].id) : onNavigate("tasks")}>Open Tasks</button>
                <button type="button" onClick={() => onNavigate("calendar")}>Calendar</button>
              </div>

              <div className="goal-execution-grid">
                <section>
                  <CardHeader title="Milestones" meta={`${executionMap.milestones.filter((item) => item.done).length}/${executionMap.milestones.length} complete`} />
                  <div className="goal-milestone-list">
                    {executionMap.milestones.map((milestone) => (
                      <button
                        className={`goal-milestone-row ${milestone.done ? "done" : ""}`}
                        type="button"
                        key={milestone.id}
                        onClick={() => toggleMilestone(activeGoal, milestone.id)}
                      >
                        <span className="checkbox">{milestone.done && <Check />}</span>
                        <strong>{milestone.title}</strong>
                        <em>{milestone.weight}%</em>
                      </button>
                    ))}
                  </div>
                  <form className="goal-milestone-add" onSubmit={addMilestone}>
                    <input
                      value={milestoneInput}
                      onChange={(event) => setMilestoneInput(event.target.value)}
                      placeholder="// add milestone"
                    />
                    <button type="submit">Add</button>
                  </form>
                </section>

                <section>
                  <CardHeader title="Linked Task Plans" meta={`${executionMap.projects.length} tabs`} />
                  <div className="goal-linked-list">
                    {executionMap.projects.length === 0 ? (
                      <div className="empty-calendar-band">// no linked task plan yet</div>
                    ) : (
                      executionMap.projects.map((project) => {
                        const projectProgress = getTaskProjectProgress(project);
                        return (
                          <button type="button" key={project.id} onClick={() => onOpenProject(project.id)}>
                            <span>{project.name}</span>
                            <em>D{project.currentDay} / {project.deadlineDays}</em>
                            <strong>{projectProgress}%</strong>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                <section>
                  <CardHeader title="Upcoming Signals" meta="next 14 days" />
                  <div className="goal-linked-list">
                    {executionMap.events.length === 0 ? (
                      <div className="empty-calendar-band">// no calendar pressure linked</div>
                    ) : (
                      executionMap.events.map(({ event, date }) => (
                        <button type="button" key={event.id} onClick={() => onNavigate("calendar")}>
                          <span>{event.title}</span>
                          <em>{formatUpcomingDate(date)} - {event.time}</em>
                          <strong>{event.kind}</strong>
                        </button>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <CardHeader title="Kanban Signals" meta={`${executionMap.cards.length} cards`} />
                  <div className="goal-linked-list">
                    {executionMap.cards.length === 0 ? (
                      <div className="empty-calendar-band">// no board card linked</div>
                    ) : (
                      executionMap.cards.map((card) => (
                        <button type="button" key={card.id} onClick={() => onNavigate("kanban")}>
                          <span>{card.title}</span>
                          <em>{card.columnId}</em>
                          <strong>{getSubtaskProgress(card)}%</strong>
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="empty-calendar-band">// add a goal to open execution mapping</div>
          )}
        </HudCard>
      </section>

      <svg className="bottom-scan" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,24 42,21 88,23 132,20 178,25 222,19 268,24 312,18 356,22 402,16 448,21 490,17 536,23 578,20 624,24 668,18 714,22 760,17 804,25 850,21 896,23 940,18 986,24 1032,21 1076,19 1122,23 1168,20 1200,22" />
      </svg>
      <footer className="sysline">
        <span>// System synchronized</span>
        <strong>All nodes operational</strong>
        <span>Goal registry online</span>
      </footer>
    </>
  );
}

function HabitProtocol({ habits }: { habits: Habit[] }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("07:00");
  const [duration, setDuration] = useState("10 min");
  const [editingId, setEditingId] = useState<string | null>(null);
  const sortedHabits = useMemo(() => sortHabits(habits), [habits]);
  const done = habits.filter((habit) => habit.done).length;
  const pct = Math.round((done / Math.max(habits.length, 1)) * 100);

  function resetForm() {
    setName("");
    setTime("07:00");
    setDuration("10 min");
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    if (editingId) {
      void habitCrud.update(editingId, { name: cleanName, time, duration: duration.trim() || "scheduled" });
      logActivityEvent({
        domain: "habit",
        action: "updated",
        entityId: editingId,
        entityTitle: cleanName,
        source: "Habit protocol",
        metadata: { time, duration: duration.trim() || "scheduled" },
      });
    } else {
      const habit: Habit = {
        id: `${Date.now()}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: cleanName,
        time,
        duration: duration.trim() || "scheduled",
        done: false,
      };
      void habitCrud.add(habit);
      logActivityEvent({
        domain: "habit",
        action: "created",
        entityId: habit.id,
        entityTitle: habit.name,
        source: "Habit protocol",
        metadata: { time: habit.time, duration: habit.duration },
      });
    }
    resetForm();
  }

  function startEdit(habit: Habit) {
    setName(habit.name);
    setTime(habit.time);
    setDuration(habit.duration);
    setEditingId(habit.id);
  }

  return (
    <>
      <section className="habit-layout">
        <div className="habit-main">
          <HudCard className="habit-editor-card">
            <CardHeader title={editingId ? "Edit Daily Habit" : "Add Daily Habit"} meta={`${done} / ${habits.length} - ${pct}%`} />
            <form className="habit-form" onSubmit={handleSubmit}>
              <label>
                <span>Habit</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Read 30 pages" />
              </label>
              <label>
                <span>Time</span>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
              </label>
              <label>
                <span>Duration</span>
                <input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="15 min" />
              </label>
              <button className="submit-goal" type="submit">{editingId ? "Save Habit" : "+ Add Habit"}</button>
              {editingId && <button className="cancel-edit" type="button" onClick={resetForm}>Cancel</button>}
            </form>
          </HudCard>

          <HudCard className="habits-card">
            <CardHeader title="Daily Habits" meta={`${done} / ${habits.length} - ${pct}%`} />
            <div className="habit-list">
              {sortedHabits.map((habit) => (
                <div className={`habit-row ${habit.done ? "done" : ""}`} key={habit.id}>
                  <button
                    className="checkbox"
                    type="button"
                    onClick={() => {
                      void habitCrud.toggle(habit.id);
                      logActivityEvent({
                        domain: "habit",
                        action: habit.done ? "reopened" : "completed",
                        entityId: habit.id,
                        entityTitle: habit.name,
                        source: "Habit protocol",
                        metadata: { time: habit.time, duration: habit.duration },
                      });
                    }}
                    aria-label={`${habit.done ? "Mark incomplete" : "Mark complete"} ${habit.name}`}
                  >
                    {habit.done && <Check />}
                  </button>
                  <div>
                    <strong>{habit.name}</strong>
                    <span>{habit.duration}</span>
                  </div>
                  <span className="habit-time">{habit.time}</span>
                  <button className="edit-habit" type="button" onClick={() => startEdit(habit)}>Edit</button>
                  <button
                    className="delete-goal"
                    type="button"
                    onClick={() => {
                      void habitCrud.delete(habit.id);
                      logActivityEvent({
                        domain: "habit",
                        action: "deleted",
                        entityId: habit.id,
                        entityTitle: habit.name,
                        source: "Habit protocol",
                        metadata: { time: habit.time },
                      });
                    }}
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        <HudCard className="habit-timeline-card">
          <CardHeader title="Today's Timeline" />
          <div className="timeline-list habit-timeline-list">
            {sortedHabits.map((habit) => (
              <div className="timeline-row" key={habit.id}>
                <div className="timeline-date">
                  <strong>{habit.time}</strong>
                </div>
                <div className="timeline-rail">
                  <i className={habit.done ? "cyan" : "violet"} />
                </div>
                <div>
                  <strong>{habit.name}</strong>
                  <span>{habit.done ? "Done" : "Scheduled"}</span>
                </div>
              </div>
            ))}
          </div>
        </HudCard>
      </section>

      <svg className="bottom-scan" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,24 42,21 88,23 132,20 178,25 222,19 268,24 312,18 356,22 402,16 448,21 490,17 536,23 578,20 624,24 668,18 714,22 760,17 804,25 850,21 896,23 940,18 986,24 1032,21 1076,19 1122,23 1168,20 1200,22" />
      </svg>
      <footer className="sysline">
        <span>// System synchronized</span>
        <strong>All nodes operational</strong>
        <span>Habit protocol online</span>
      </footer>
    </>
  );
}

function TaskProtocol({
  goals,
  projects,
  activeProjectId,
  onActiveProjectChange,
}: {
  goals: Goal[];
  projects: TaskProject[];
  activeProjectId: string;
  onActiveProjectChange: (id: string) => void;
}) {
  const normalizedProjects = useMemo(() => projects.map(normalizeTaskProject), [projects]);
  const activeProject = normalizedProjects.find((project) => project.id === activeProjectId) ?? normalizedProjects[0];
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState(() => toDateInputValue(addDays(new Date(), 39)));
  const [projectGoalId, setProjectGoalId] = useState("");
  const [projectOutcome, setProjectOutcome] = useState("");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!activeProject && normalizedProjects[0]) onActiveProjectChange(normalizedProjects[0].id);
  }, [activeProject, normalizedProjects, onActiveProjectChange]);

  function resetProjectForm() {
    setProjectName("");
    setProjectGoalId("");
    setProjectOutcome("");
    resetProjectDates(setStartDate, setEndDate);
  }

  function addProject() {
    const project = createProject(projectName, startDate, endDate, projectGoalId || undefined, projectOutcome || undefined);
    if (!project) return;
    void taskProjectCrud.add(project);
    logActivityEvent({
      domain: "task",
      action: "created",
      entityId: project.id,
      entityTitle: project.name,
      source: "Task protocol",
      metadata: { kind: "project", deadlineDays: project.deadlineDays, goalId: project.goalId },
    });
    onActiveProjectChange(project.id);
    resetProjectForm();
  }

  if (!activeProject) {
    return (
      <HudCard className="task-protocol-card">
        <CardHeader title="Task Protocol" meta="0 objectives" />
        <ProjectCreateForm
          name={projectName}
          startDate={startDate}
          endDate={endDate}
          goals={goals}
          goalId={projectGoalId}
          outcome={projectOutcome}
          onNameChange={setProjectName}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onGoalIdChange={setProjectGoalId}
          onOutcomeChange={setProjectOutcome}
          onSubmit={addProject}
        />
      </HudCard>
    );
  }

  const projectStartDate = getProjectStartDate(activeProject);
  const projectEndDate = getProjectEndDate(activeProject);
  const projectDeadlineDays = getProjectDeadlineDays(activeProject);
  const activeDay = Math.min(Math.max(activeProject.currentDay || 1, 1), projectDeadlineDays);
  const activeDayDate = addDays(projectStartDate, activeDay - 1);
  const dayTasks = activeProject.tasksByDay[activeDay] ?? [];
  const projectTasks = Object.values(activeProject.tasksByDay).flat();
  const projectDone = projectTasks.filter((task) => task.done).length;
  const projectProgress = Math.round((projectDone / Math.max(projectTasks.length, 1)) * 100);
  const daysLeft = Math.max(projectDeadlineDays - activeDay, 0);
  const linkedGoal = goals.find((goal) => goal.id === activeProject.goalId);

  function deleteProject(projectId: string) {
    const next = normalizedProjects.filter((project) => project.id !== projectId);
    if (projectId === activeProject.id) {
      onActiveProjectChange(next[0]?.id ?? "");
    }
    void taskProjectCrud.delete(projectId);
    logActivityEvent({
      domain: "task",
      action: "deleted",
      entityId: projectId,
      entityTitle: normalizedProjects.find((project) => project.id === projectId)?.name ?? "Task project",
      source: "Task protocol",
      metadata: { kind: "project" },
    });
  }

  function setActiveDay(day: number) {
    void taskProjectCrud.setCurrentDay(activeProject.id, day);
  }

  function updateProjectDates(nextStartDate: string, nextEndDate: string) {
    const start = parseDateInput(nextStartDate) ?? projectStartDate;
    const endInput = parseDateInput(nextEndDate);
    const end = endInput && endInput >= start ? endInput : start;
    const normalizedStart = toDateInputValue(start);
    const normalizedEnd = toDateInputValue(end);
    void taskProjectCrud.updateDates(
      activeProject.id,
      normalizedStart,
      normalizedEnd,
      getDateRangeDays(normalizedStart, normalizedEnd),
    );
    logActivityEvent({
      domain: "task",
      action: "updated",
      entityId: activeProject.id,
      entityTitle: activeProject.name,
      source: "Task protocol",
      metadata: { kind: "project_dates", startDate: normalizedStart, endDate: normalizedEnd },
    });
  }

  function addTask() {
    const name = newTask.trim();
    if (!name) return;
    const task: ProjectTask = {
      id: `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      done: false,
    };
    void taskProjectCrud.addTask(activeProject.id, activeDay, task);
    logActivityEvent({
      domain: "task",
      action: "created",
      entityId: task.id,
      entityTitle: task.name,
      source: "Task protocol",
      metadata: { projectId: activeProject.id, projectName: activeProject.name, day: activeDay },
    });
    setNewTask("");
  }

  return (
    <>
      <HudCard className="task-protocol-card">
        <div className="task-tabs" role="tablist" aria-label="Task objectives">
          {normalizedProjects.map((project) => (
            <div className={`task-tab ${project.id === activeProject.id ? "active" : ""}`} key={project.id}>
              <button type="button" onClick={() => onActiveProjectChange(project.id)}>
                <span />
                <em>{project.name}</em>
                <i>{getProjectDeadlineDays(project)}d</i>
              </button>
              <button
                className="close-tab"
                type="button"
                onClick={() => deleteProject(project.id)}
                aria-label={`Delete ${project.name} tab`}
              >
                ×
              </button>
            </div>
          ))}
          <ProjectCreateForm
            compact
            name={projectName}
            startDate={startDate}
            endDate={endDate}
            goals={goals}
            goalId={projectGoalId}
            outcome={projectOutcome}
            onNameChange={setProjectName}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onGoalIdChange={setProjectGoalId}
            onOutcomeChange={setProjectOutcome}
            onSubmit={addProject}
          />
        </div>

        <section className="task-project-head">
          <div>
            <h2>{activeProject.name}</h2>
            <p>
              {formatTaskDate(projectStartDate)} - {formatTaskDate(projectEndDate)} - {projectDeadlineDays} days -
              currently D{activeDay} ({formatTaskDate(activeDayDate)})
            </p>
            <div className="project-goal-chip-row">
              {linkedGoal ? (
                <span className="project-goal-chip">
                  Linked goal: {linkedGoal.title}
                </span>
              ) : (
                <span className="project-goal-empty">No linked goal</span>
              )}
              {activeProject.outcome && <span className="project-outcome">{activeProject.outcome}</span>}
            </div>
            <div className="project-date-controls" aria-label="Project schedule">
              <label>
                <span>Start</span>
                <input
                  type="date"
                  value={toDateInputValue(projectStartDate)}
                  onChange={(event) => updateProjectDates(event.target.value, toDateInputValue(projectEndDate))}
                />
              </label>
              <label>
                <span>End</span>
                <input
                  type="date"
                  value={toDateInputValue(projectEndDate)}
                  onChange={(event) => updateProjectDates(toDateInputValue(projectStartDate), event.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="task-project-stats">
            <MetricBadge value={`${projectDone}/${Math.max(projectTasks.length, 1)}`} label="subtasks" />
            <MetricBadge value={String(daysLeft)} label="days left" />
            <MetricBadge value={`${projectProgress}%`} label="progress" />
          </div>
        </section>
        <ProgressBar value={projectProgress} />

        <section className="day-section">
          <CardHeader title="Day Planner" meta={`D${activeDay} - ${formatTaskDate(activeDayDate)}`} />
          <div className="day-grid" role="list" aria-label={`${projectDeadlineDays} planned days`}>
            {Array.from({ length: projectDeadlineDays }, (_, index) => {
              const day = index + 1;
              const date = addDays(projectStartDate, index);
              const tasks = activeProject.tasksByDay[day] ?? [];
              const isDone = tasks.length > 0 && tasks.every((task) => task.done);
              return (
                <button
                  className={[
                    "day-cell",
                    day === activeDay ? "active" : "",
                    tasks.length ? "planned" : "",
                    isDone ? "complete" : "",
                  ].join(" ")}
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                >
                  <strong>D{day}</strong>
                  <em>{formatTaskDate(date)}</em>
                  <span>{tasks.length ? `${tasks.filter((task) => task.done).length}/${tasks.length}` : "open"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="day-task-panel">
          <CardHeader
            title={`D${String(activeDay).padStart(2, "0")} - ${formatTaskDate(activeDayDate)} - ${dayTasks.length} Tasks`}
            meta={`${dayTasks.filter((task) => task.done).length} / ${dayTasks.length} complete`}
          />
          <div className="day-task-list">
            {dayTasks.map((task) => (
              <div className={`day-task-row ${task.done ? "done" : ""}`} key={task.id}>
                <button
                  className="checkbox"
                  type="button"
                  onClick={() => {
                    void taskProjectCrud.updateTask(activeProject.id, activeDay, task.id, (item) => ({
                        ...item,
                        done: !item.done,
                      }));
                    logActivityEvent({
                      domain: "task",
                      action: task.done ? "reopened" : "completed",
                      entityId: task.id,
                      entityTitle: task.name,
                      source: "Task protocol",
                      metadata: { projectId: activeProject.id, projectName: activeProject.name, day: activeDay },
                    });
                  }}
                  aria-label={`${task.done ? "Mark incomplete" : "Mark complete"} ${task.name}`}
                >
                  {task.done && <Check />}
                </button>
                <span>{task.name}</span>
                <button
                  className="delete-goal"
                  type="button"
                  onClick={() => {
                    void taskProjectCrud.deleteTask(activeProject.id, activeDay, task.id);
                    logActivityEvent({
                      domain: "task",
                      action: "deleted",
                      entityId: task.id,
                      entityTitle: task.name,
                      source: "Task protocol",
                      metadata: { projectId: activeProject.id, projectName: activeProject.name, day: activeDay },
                    });
                  }}
                  aria-label={`Delete ${task.name}`}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <div className="add-day-task">
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
              placeholder={`// add a task for D${activeDay} - press Enter`}
            />
            <button type="button" onClick={addTask}>+ Add</button>
          </div>
        </section>
      </HudCard>

      <svg className="bottom-scan" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,24 42,21 88,23 132,20 178,25 222,19 268,24 312,18 356,22 402,16 448,21 490,17 536,23 578,20 624,24 668,18 714,22 760,17 804,25 850,21 896,23 940,18 986,24 1032,21 1076,19 1122,23 1168,20 1200,22" />
      </svg>
      <footer className="sysline">
        <span>// System synchronized</span>
        <strong>All nodes operational</strong>
        <span>Task protocol online</span>
      </footer>
    </>
  );
}

function KanbanView({
  cards,
  activity,
  projects,
}: {
  cards: KanbanCard[];
  activity: KanbanActivity[];
  projects: TaskProject[];
}) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("high");
  const [columnId, setColumnId] = useState<KanbanColumnId>("backlog");
  const [linkedTaskProjectId, setLinkedTaskProjectId] = useState("");
  const [linkedDay, setLinkedDay] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [labelColor, setLabelColor] = useState<KanbanLabelColor>("cyan");
  const [estimateHours, setEstimateHours] = useState("");
  const [blockedBy, setBlockedBy] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState("");
  const [newAttachment, setNewAttachment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [columns, setColumns] = useState<KanbanColumnConfig[]>(loadKanbanColumns);
  const [sortMode, setSortMode] = useState<KanbanSortMode>("manual");
  const [swimlaneMode, setSwimlaneMode] = useState<KanbanSwimlaneMode>("none");
  const [archiveDays, setArchiveDays] = useState(14);
  const [showArchived, setShowArchived] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterTag, setFilterTag] = useState("");
  const [filterDue, setFilterDue] = useState<KanbanDueFilter>("all");
  const [boardMode, setBoardMode] = useState<KanbanBoardMode>("board");
  const [focusMode, setFocusMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const sortedCards = useMemo(
    () => cards.map(normalizeKanbanCard).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [cards],
  );
  const visibleCards = useMemo(
    () => sortedCards.filter((card) => showArchived || !card.archivedAt),
    [showArchived, sortedCards],
  );
  const boardCards = useMemo(
    () => filterKanbanCards(visibleCards, { searchQuery, filterPriority, filterTag, filterDue, focusMode }),
    [filterDue, filterPriority, filterTag, focusMode, searchQuery, visibleCards],
  );
  const boardStats = useMemo(() => getKanbanBoardStats(boardCards, activity), [activity, boardCards]);
  const availableTags = useMemo(
    () => Array.from(new Set(visibleCards.flatMap((card) => card.tags))).sort((a, b) => a.localeCompare(b)),
    [visibleCards],
  );
  const selectedCard = sortedCards.find((card) => card.id === selectedCardId) ?? null;
  const recentActivity = useMemo(
    () => [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [activity],
  );
  const activeCards = boardCards.filter((card) => card.columnId !== "done").length;
  const doneCards = boardCards.filter((card) => card.columnId === "done").length;

  useEffect(() => {
    window.localStorage.setItem("ziftinity-kanban-columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    if (archiveDays <= 0) return;
    const cutoff = Date.now() - archiveDays * 24 * 60 * 60 * 1000;
    sortedCards
      .filter((card) => card.columnId === "done" && !card.archivedAt)
      .forEach((card) => {
        const doneAt = getCardDoneTime(card, activity);
        if (doneAt && new Date(doneAt).getTime() < cutoff) {
          void kanbanCrud.update(card.id, { archivedAt: new Date().toISOString() });
          logActivityEvent({
            domain: "kanban",
            action: "archived",
            entityId: card.id,
            entityTitle: card.title,
            source: "Kanban auto-archive",
            metadata: { columnId: card.columnId, doneAt },
          });
        }
      });
  }, [activity, archiveDays, sortedCards]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isFormField = target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA";
      if (event.key === "Escape") {
        setSelectedCardId(null);
        setShowShortcuts(false);
        return;
      }
      if (isFormField) return;
      if (event.key.toLowerCase() === "n") {
        titleInputRef.current?.focus();
      }
      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === "?") {
        setShowShortcuts((value) => !value);
      }
      if (selectedCard && event.key === "ArrowLeft") {
        moveCard(selectedCard, -1);
      }
      if (selectedCard && event.key === "ArrowRight") {
        moveCard(selectedCard, 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function addCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const columnCards = sortedCards.filter((card) => card.columnId === columnId);

    const card: KanbanCard = {
      id: `${Date.now()}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: cleanTitle,
      description: description.trim(),
      columnId,
      priority,
      linkedTaskProjectId: linkedTaskProjectId || undefined,
      linkedDay: linkedDay ? Number(linkedDay) : undefined,
      dueDate: dueDate || undefined,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      labels: tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 2).map((tag) => ({ name: tag, color: labelColor })),
      subtasks: [],
      estimateMinutes: estimateHours ? Math.max(0, Math.round(Number(estimateHours) * 60)) : undefined,
      trackedMinutes: 0,
      attachments: [],
      comments: [],
      blockedBy: blockedBy.trim() || undefined,
      order: columnCards.length + 1,
    };

    void kanbanCrud.add(card);
    logKanbanActivity({
      card,
      action: "created",
      toColumnId: card.columnId,
    });

    setTitle("");
    setDescription("");
    setPriority("high");
    setColumnId("backlog");
    setLinkedTaskProjectId("");
    setLinkedDay("");
    setDueDate("");
    setTags("");
    setLabelColor("cyan");
    setEstimateHours("");
    setBlockedBy("");
  }

  function moveCard(card: KanbanCard, direction: -1 | 1) {
    const index = columns.findIndex((column) => column.id === card.columnId);
    const nextColumn = columns[index + direction];
    if (!nextColumn) return;
    const nextOrder = sortedCards.filter((item) => item.columnId === nextColumn.id).length + 1;
    void kanbanCrud.move(card.id, nextColumn.id, nextOrder);
    logKanbanActivity({
      card,
      action: "moved",
      fromColumnId: card.columnId,
      toColumnId: nextColumn.id,
    });
  }

  function moveCardToColumn(card: KanbanCard, nextColumnId: KanbanColumnId) {
    if (card.columnId === nextColumnId) return;
    const nextOrder = sortedCards.filter((item) => item.columnId === nextColumnId).length + 1;
    void kanbanCrud.move(card.id, nextColumnId, nextOrder);
    logKanbanActivity({
      card,
      action: "moved",
      fromColumnId: card.columnId,
      toColumnId: nextColumnId,
    });
  }

  function startDrag(event: DragEvent<HTMLElement>, card: KanbanCard) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
    setDraggingCardId(card.id);
    setSelectedCardId(card.id);
  }

  function allowColumnDrop(event: DragEvent<HTMLElement>, columnId: KanbanColumnId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function dropCard(event: DragEvent<HTMLElement>, columnId: KanbanColumnId) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain") || draggingCardId;
    const card = sortedCards.find((item) => item.id === cardId);
    if (card) moveCardToColumn(card, columnId);
    setDraggingCardId(null);
  }

  function updateColumn(columnId: KanbanColumnId, patch: Partial<KanbanColumnConfig>) {
    setColumns((items) => items.map((column) => column.id === columnId ? { ...column, ...patch } : column));
  }

  function reorderColumn(columnId: KanbanColumnId, direction: -1 | 1) {
    setColumns((items) => {
      const index = items.findIndex((column) => column.id === columnId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addColumn() {
    const cleanTitle = newColumnTitle.trim();
    if (!cleanTitle) return;
    const id = `${Date.now()}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    setColumns((items) => [...items, { id, title: cleanTitle, signal: "Custom", wipLimit: 5, collapsed: false }]);
    setColumnId(id);
    setNewColumnTitle("");
  }

  function deleteColumn(column: KanbanColumnConfig) {
    if (column.id === "backlog") return;
    sortedCards.filter((card) => card.columnId === column.id).forEach((card) => {
      void kanbanCrud.move(card.id, "backlog", sortedCards.filter((item) => item.columnId === "backlog").length + 1);
      logKanbanActivity({ card, action: "moved", fromColumnId: column.id, toColumnId: "backlog" });
    });
    setColumns((items) => items.filter((item) => item.id !== column.id));
    if (columnId === column.id) setColumnId("backlog");
  }

  function archiveDoneNow() {
    sortedCards
      .filter((card) => card.columnId === "done" && !card.archivedAt)
      .forEach((card) => {
        void kanbanCrud.update(card.id, { archivedAt: new Date().toISOString() });
        logActivityEvent({
          domain: "kanban",
          action: "archived",
          entityId: card.id,
          entityTitle: card.title,
          source: "Kanban board",
          metadata: { columnId: card.columnId },
        });
      });
  }

  function undoLastMove() {
    const lastMove = [...activity]
      .filter((event) => event.action === "moved" && event.fromColumnId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    if (!lastMove?.fromColumnId) return;
    const card = sortedCards.find((item) => item.id === lastMove.cardId);
    if (!card) return;
    const nextOrder = sortedCards.filter((item) => item.columnId === lastMove.fromColumnId).length + 1;
    void kanbanCrud.move(card.id, lastMove.fromColumnId, nextOrder);
    logKanbanActivity({
      card,
      action: "moved",
      fromColumnId: card.columnId,
      toColumnId: lastMove.fromColumnId,
    });
  }

  function deleteCard(card: KanbanCard) {
    logKanbanActivity({
      card,
      action: "deleted",
      fromColumnId: card.columnId,
    });
    void kanbanCrud.delete(card.id);
    if (selectedCardId === card.id) setSelectedCardId(null);
  }

  function toggleSubtask(card: KanbanCard, subtaskId: string) {
    const subtask = card.subtasks.find((item) => item.id === subtaskId);
    void kanbanCrud.update(card.id, {
      subtasks: card.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask),
    });
    if (subtask) {
      logActivityEvent({
        domain: "kanban",
        action: subtask.done ? "reopened" : "completed",
        entityId: subtask.id,
        entityTitle: subtask.title,
        source: "Kanban subtask",
        metadata: { cardId: card.id, cardTitle: card.title },
      });
    }
  }

  function addSubtask(card: KanbanCard) {
    const title = newSubtask.trim();
    if (!title) return;
    void kanbanCrud.update(card.id, {
      subtasks: [...card.subtasks, { id: `${Date.now()}-subtask`, title, done: false }],
    });
    logActivityEvent({
      domain: "kanban",
      action: "created",
      entityId: `${card.id}-${slugify(title)}`,
      entityTitle: title,
      source: "Kanban subtask",
      metadata: { cardId: card.id, cardTitle: card.title },
    });
    setNewSubtask("");
  }

  function addAttachment(card: KanbanCard) {
    const url = newAttachment.trim();
    if (!url) return;
    void kanbanCrud.update(card.id, {
      attachments: [...card.attachments, { id: `${Date.now()}-attachment`, name: getAttachmentName(url), url }],
    });
    logActivityEvent({
      domain: "kanban",
      action: "created",
      entityId: `${card.id}-${slugify(url)}`,
      entityTitle: getAttachmentName(url),
      source: "Kanban attachment",
      metadata: { cardId: card.id, cardTitle: card.title },
    });
    setNewAttachment("");
  }

  function addComment(card: KanbanCard) {
    const body = newComment.trim();
    if (!body) return;
    void kanbanCrud.update(card.id, {
      comments: [...card.comments, { id: `${Date.now()}-comment`, body, createdAt: new Date().toISOString() }],
    });
    logActivityEvent({
      domain: "kanban",
      action: "created",
      entityId: `${card.id}-${Date.now()}-comment`,
      entityTitle: `Comment on ${card.title}`,
      source: "Kanban comment",
      metadata: { cardId: card.id, cardTitle: card.title },
    });
    setNewComment("");
  }

  function updateTracked(card: KanbanCard, value: string) {
    void kanbanCrud.update(card.id, {
      trackedMinutes: Math.max(0, Math.round(Number(value || 0) * 60)),
    });
  }

  return (
    <>
      <HudCard className="kanban-command-card">
        <CardHeader title="Add Board Card" meta={`${activeCards} active - ${doneCards} complete`} />
        <form className="kanban-form" onSubmit={addCard}>
          <label>
            <span>Card</span>
            <input ref={titleInputRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Prepare beta checklist" />
          </label>
          <label>
            <span>Column</span>
            <select value={columnId} onChange={(event) => setColumnId(event.target.value as KanbanColumnId)}>
              {columns.map((column) => (
                <option value={column.id} key={column.id}>{column.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="ziftinity">Ziftinity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span>Due</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label>
            <span>Label</span>
            <select value={labelColor} onChange={(event) => setLabelColor(event.target.value as KanbanLabelColor)}>
              <option value="cyan">Cyan</option>
              <option value="violet">Violet</option>
              <option value="lime">Lime</option>
              <option value="amber">Amber</option>
              <option value="red">Red</option>
            </select>
          </label>
          <label>
            <span>Estimate</span>
            <input type="number" min="0" step="0.25" value={estimateHours} onChange={(event) => setEstimateHours(event.target.value)} placeholder="2h" />
          </label>
          <label>
            <span>Link</span>
            <select value={linkedTaskProjectId} onChange={(event) => setLinkedTaskProjectId(event.target.value)}>
              <option value="">No task link</option>
              {projects.map((project) => (
                <option value={project.id} key={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Day</span>
            <input type="number" min="1" value={linkedDay} onChange={(event) => setLinkedDay(event.target.value)} placeholder="D12" />
          </label>
          <label className="kanban-description-field">
            <span>Description</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What needs to move forward?" />
          </label>
          <label>
            <span>Tags</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="backend, beta" />
          </label>
          <label>
            <span>Blocked By</span>
            <input value={blockedBy} onChange={(event) => setBlockedBy(event.target.value)} placeholder="Waiting on..." />
          </label>
          <button className="submit-goal" type="submit">+ Add Card</button>
        </form>
      </HudCard>

      <HudCard className="kanban-board-command-card">
        <CardHeader title="Board Command" meta={`${boardStats.total} cards - ${boardStats.donePercent}% done - ${boardStats.overdue} overdue`} />
        <div className="kanban-filter-bar">
          <label className="kanban-search-field">
            <span>Global Search</span>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="type / then search cards..."
            />
          </label>
          <label>
            <span>Priority</span>
            <select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value as Priority | "all")}>
              <option value="all">All priorities</option>
              <option value="ziftinity">Ziftinity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span>Tag</span>
            <select value={filterTag} onChange={(event) => setFilterTag(event.target.value)}>
              <option value="">All tags</option>
              {availableTags.map((tag) => <option value={tag} key={tag}>{tag}</option>)}
            </select>
          </label>
          <label>
            <span>Due Signal</span>
            <select value={filterDue} onChange={(event) => setFilterDue(event.target.value as KanbanDueFilter)}>
              <option value="all">All dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due today</option>
              <option value="scheduled">Scheduled</option>
              <option value="none">No date</option>
            </select>
          </label>
          <div className="kanban-view-toggle" role="group" aria-label="Board view">
            {(["board", "list", "calendar"] as KanbanBoardMode[]).map((mode) => (
              <button className={boardMode === mode ? "active" : ""} type="button" onClick={() => setBoardMode(mode)} key={mode}>
                {mode}
              </button>
            ))}
          </div>
          <button className={focusMode ? "active" : ""} type="button" onClick={() => setFocusMode((value) => !value)}>
            Focus
          </button>
          <button type="button" onClick={undoLastMove} disabled={!activity.some((event) => event.action === "moved" && event.fromColumnId)}>
            Undo Move
          </button>
        </div>
        <div className="kanban-stats-bar">
          <span><strong>{boardStats.total}</strong> total</span>
          <span><strong>{boardStats.donePercent}%</strong> done</span>
          <span><strong>{boardStats.overdue}</strong> overdue</span>
          <span><strong>{boardStats.avgCycle}</strong> avg cycle</span>
          <span><strong>{boardStats.focusCount}</strong> focus cards</span>
          <button type="button" onClick={() => setShowShortcuts((value) => !value)}>
            {showShortcuts ? "Hide Keys" : "Shortcuts"}
          </button>
        </div>
        {showShortcuts && (
          <div className="kanban-shortcuts">
            <span>N new card</span>
            <span>/ search</span>
            <span>? help</span>
            <span>Esc close</span>
            <span>Arrow keys move selected card</span>
          </div>
        )}
        <div className="kanban-cycle-chart" aria-label="Cycle time by column">
          {columns.map((column) => {
            const value = getColumnCycleScore(column.id, boardCards, activity);
            return (
              <div className="cycle-column" key={column.id}>
                <span>{column.title}</span>
                <i style={{ height: `${Math.max(8, value)}%` }} />
              </div>
            );
          })}
        </div>
      </HudCard>

      <HudCard className="kanban-controls-card">
        <CardHeader title="Column Controls" meta={`${columns.length} columns`} />
        <div className="kanban-controls">
          <label>
            <span>New Column</span>
            <input value={newColumnTitle} onChange={(event) => setNewColumnTitle(event.target.value)} placeholder="QA" />
          </label>
          <button type="button" onClick={addColumn}>+ Column</button>
          <label>
            <span>Sort</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as KanbanSortMode)}>
              <option value="manual">Manual</option>
              <option value="priority">Priority</option>
              <option value="due">Due Date</option>
              <option value="title">Title</option>
            </select>
          </label>
          <label>
            <span>Swimlane</span>
            <select value={swimlaneMode} onChange={(event) => setSwimlaneMode(event.target.value as KanbanSwimlaneMode)}>
              <option value="none">None</option>
              <option value="priority">Priority</option>
              <option value="tag">Tag</option>
              <option value="project">Project</option>
            </select>
          </label>
          <label>
            <span>Archive Done</span>
            <input type="number" min="1" value={archiveDays} onChange={(event) => setArchiveDays(Number(event.target.value) || 1)} />
          </label>
          <button type="button" onClick={archiveDoneNow}>Archive Now</button>
          <button type="button" onClick={() => setShowArchived((value) => !value)}>
            {showArchived ? "Hide Archive" : "Show Archive"}
          </button>
        </div>
      </HudCard>

      {boardMode === "board" && (
        <div className="kanban-swimlanes">
        {getSwimlaneGroups(boardCards, swimlaneMode, projects).map((lane) => (
          <section className="kanban-swimlane" key={lane.id}>
            {swimlaneMode !== "none" && <div className="kanban-swimlane-title">{lane.title}</div>}
            <div className="kanban-board" aria-label={`${lane.title} execution board`}>
              {columns.map((column, columnIndex) => {
                const columnCards = sortKanbanCards(lane.cards.filter((card) => card.columnId === column.id), sortMode);
                const isOverLimit = columnCards.length > column.wipLimit;
                return (
                  <HudCard className={`kanban-column ${column.collapsed ? "collapsed" : ""} ${isOverLimit ? "over-limit" : ""}`} key={`${lane.id}-${column.id}`}>
                    <div
                      className="kanban-column-dropzone"
                      onDragOver={(event) => allowColumnDrop(event, column.id)}
                      onDrop={(event) => dropCard(event, column.id)}
                    >
                    <div className="kanban-column-head">
                      <input value={column.title} onChange={(event) => updateColumn(column.id, { title: event.target.value })} />
                      <span className={isOverLimit ? "over-limit" : ""}>{columnCards.length}/{column.wipLimit}</span>
                    </div>
                    <div className="kanban-column-controls">
                      <input
                        type="number"
                        min="1"
                        value={column.wipLimit}
                        aria-label={`${column.title} WIP limit`}
                        onChange={(event) => updateColumn(column.id, { wipLimit: Math.max(1, Number(event.target.value) || 1) })}
                      />
                      <button type="button" onClick={() => reorderColumn(column.id, -1)} disabled={columnIndex === 0}>‹</button>
                      <button type="button" onClick={() => reorderColumn(column.id, 1)} disabled={columnIndex === columns.length - 1}>›</button>
                      <button type="button" onClick={() => updateColumn(column.id, { collapsed: !column.collapsed })}>
                        {column.collapsed ? "Open" : "Fold"}
                      </button>
                      <button type="button" onClick={() => deleteColumn(column)} disabled={column.id === "backlog"}>Del</button>
                    </div>
                    <CardHeader title={column.signal} meta={`${columnCards.length} cards`} />
                    {!column.collapsed && (
                      <div className="kanban-card-list">
                        {columnCards.length === 0 ? (
                          <div className="kanban-empty">// no cards queued</div>
                        ) : (
                          columnCards.map((card) => (
                    <article
                      className={`kanban-card ${card.priority} ${card.blockedBy ? "blocked" : ""} ${getDueState(card.dueDate)} ${isKanbanSearchMatch(card, searchQuery) ? "search-match" : ""} ${draggingCardId === card.id ? "dragging" : ""}`}
                      key={card.id}
                      draggable
                      onClick={() => setSelectedCardId(card.id)}
                      onDragStart={(event) => startDrag(event, card)}
                      onDragEnd={() => {
                        setDraggingCardId(null);
                      }}
                    >
                      {card.labels.length > 0 && (
                        <div className="kanban-labels">
                          {card.labels.map((label) => <span className={label.color} key={`${card.id}-${label.name}`}>{label.name}</span>)}
                        </div>
                      )}
                      <div className="kanban-card-top">
                        <PriorityChip level={card.priority} />
                        {card.dueDate && <span className={`kanban-due ${getDueState(card.dueDate)}`}>{formatKanbanDate(card.dueDate)}</span>}
                      </div>
                      <strong>{card.title}</strong>
                      {card.description && <p>{card.description}</p>}
                      {card.subtasks.length > 0 && (
                        <div className="kanban-subtask-meter">
                          <ProgressBar value={getSubtaskProgress(card)} />
                          <span>{card.subtasks.filter((subtask) => subtask.done).length}/{card.subtasks.length} subtasks</span>
                        </div>
                      )}
                      <div className="kanban-card-meta">
                        {card.estimateMinutes ? <span>{formatMinutes(card.trackedMinutes ?? 0)} / {formatMinutes(card.estimateMinutes)}</span> : null}
                        {card.attachments.length > 0 && <span>{card.attachments.length} att</span>}
                        {card.comments.length > 0 && <span>{card.comments.length} notes</span>}
                        {card.blockedBy && <span className="blocked">blocked</span>}
                      </div>
                      {(card.linkedTaskProjectId || card.linkedDay) && (
                        <em>
                          {getProjectName(projects, card.linkedTaskProjectId)}
                          {card.linkedDay ? ` - D${card.linkedDay}` : ""}
                        </em>
                      )}
                      {card.tags.length > 0 && (
                        <div className="kanban-tags">
                          {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                      )}
                      <div className="kanban-card-actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); moveCard(card, -1); }} disabled={columnIndex === 0}>‹</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); moveCard(card, 1); }} disabled={columnIndex === columns.length - 1}>›</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); deleteCard(card); }} aria-label={`Delete ${card.title}`}>
                          <Trash2 />
                        </button>
                      </div>
                    </article>
                          ))
                        )}
                      </div>
                    )}
                    </div>
                  </HudCard>
                );
              })}
            </div>
          </section>
        ))}
        </div>
      )}

      {boardMode === "list" && (
        <HudCard className="kanban-list-view">
          <CardHeader title="List View" meta={`${boardCards.length} matching cards`} />
          <div className="kanban-list-rows">
            {sortKanbanCards(boardCards, sortMode).map((card) => (
              <button className={`kanban-list-row ${isKanbanSearchMatch(card, searchQuery) ? "search-match" : ""}`} type="button" onClick={() => setSelectedCardId(card.id)} key={card.id}>
                <PriorityChip level={card.priority} />
                <strong>{card.title}</strong>
                <span>{getKanbanColumnTitle(card.columnId)}</span>
                <em>{card.dueDate ? formatKanbanDate(card.dueDate) : "No date"}</em>
              </button>
            ))}
          </div>
        </HudCard>
      )}

      {boardMode === "calendar" && (
        <HudCard className="kanban-calendar-view">
          <CardHeader title="Card Calendar" meta="due date map" />
          <div className="kanban-card-calendar">
            {Array.from({ length: 14 }, (_, index) => addDays(new Date(), index)).map((date) => {
              const dayCards = boardCards.filter((card) => parseDateInput(card.dueDate)?.toDateString() === date.toDateString());
              return (
                <div className={dayCards.length ? "has-cards" : ""} key={date.toISOString()}>
                  <span>{formatUpcomingDate(date)}</span>
                  {dayCards.slice(0, 3).map((card) => <button type="button" onClick={() => setSelectedCardId(card.id)} key={card.id}>{card.title}</button>)}
                </div>
              );
            })}
          </div>
        </HudCard>
      )}

      {selectedCard && (
        <HudCard className="kanban-detail-card">
          <CardHeader title="Quick Detail" meta={getKanbanColumnTitle(selectedCard.columnId)} />
          <div className="kanban-detail-grid">
            <section>
              <div className="kanban-detail-head">
                <div>
                  <strong>{selectedCard.title}</strong>
                  <span>{selectedCard.description || "No description recorded"}</span>
                </div>
                <button type="button" onClick={() => setSelectedCardId(null)}>×</button>
              </div>
              {selectedCard.blockedBy && <div className="blocked-banner">Blocked by: {selectedCard.blockedBy}</div>}
              <div className="kanban-detail-stats">
                <span>Due {selectedCard.dueDate ? formatKanbanDate(selectedCard.dueDate) : "Unset"}</span>
                <span>{getSubtaskProgress(selectedCard)}% checklist</span>
                <label>
                  Tracked h
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={((selectedCard.trackedMinutes ?? 0) / 60).toString()}
                    onChange={(event) => updateTracked(selectedCard, event.target.value)}
                  />
                </label>
              </div>
              <div className="detail-input-row">
                <input value={newSubtask} onChange={(event) => setNewSubtask(event.target.value)} placeholder="Add checklist item" />
                <button type="button" onClick={() => addSubtask(selectedCard)}>+ Item</button>
              </div>
              <div className="detail-checklist">
                {selectedCard.subtasks.length === 0 ? (
                  <span>// no checklist items</span>
                ) : (
                  selectedCard.subtasks.map((subtask) => (
                    <button
                      className={subtask.done ? "done" : ""}
                      type="button"
                      key={subtask.id}
                      onClick={() => toggleSubtask(selectedCard, subtask.id)}
                    >
                      <i>{subtask.done && <Check />}</i>
                      {subtask.title}
                    </button>
                  ))
                )}
              </div>
            </section>
            <section>
              <div className="detail-input-row">
                <input value={newAttachment} onChange={(event) => setNewAttachment(event.target.value)} placeholder="Attachment URL" />
                <button type="button" onClick={() => addAttachment(selectedCard)}>+ Link</button>
              </div>
              <div className="detail-list">
                {selectedCard.attachments.length === 0 ? <span>// no attachments</span> : selectedCard.attachments.map((attachment) => (
                  <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.id}>{attachment.name}</a>
                ))}
              </div>
              <div className="detail-input-row">
                <input value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Progress note" />
                <button type="button" onClick={() => addComment(selectedCard)}>+ Note</button>
              </div>
              <div className="detail-list comments">
                {selectedCard.comments.length === 0 ? <span>// no comments</span> : selectedCard.comments.slice(-4).map((comment) => (
                  <p key={comment.id}>{comment.body}</p>
                ))}
              </div>
            </section>
          </div>
        </HudCard>
      )}

      <HudCard className="kanban-activity-card">
        <CardHeader title="Board History" meta={`${activity.length} events`} />
        <div className="kanban-activity-list">
          {recentActivity.length === 0 ? (
            <div className="kanban-empty">// no board events recorded</div>
          ) : (
            recentActivity.map((event) => (
              <div className="kanban-activity-row" key={event.id}>
                <span>{formatActivityTime(event.createdAt)}</span>
                <strong>{event.cardTitle}</strong>
                <em>{formatKanbanActivity(event)}</em>
              </div>
            ))
          )}
        </div>
      </HudCard>

      <SystemTrace label="Execution board online" />
    </>
  );
}

function NotesView({
  notes,
  folders,
  modeRequest,
}: {
  notes: StudyNote[];
  folders: StudyFolder[];
  modeRequest?: { mode: NotesMode; nonce: number } | null;
}) {
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id ?? "");
  const [mode, setMode] = useState<NotesMode>("home");
  const [filter, setFilter] = useState<"all" | "pinned" | "recent">("all");
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [folderInput, setFolderInput] = useState("");
  const [folderParentId, setFolderParentId] = useState(STUDY_FOLDER_ROOT_ID);
  const [folderCreateStatus, setFolderCreateStatus] = useState("");
  const [folderCreateBusy, setFolderCreateBusy] = useState(false);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());
  const [folderRenameInput, setFolderRenameInput] = useState("");
  const [folderMoveParentId, setFolderMoveParentId] = useState(STUDY_FOLDER_ROOT_ID);
  const [draggingNoteId, setDraggingNoteId] = useState("");
  const [activeCertificationId, setActiveCertificationId] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [certPlanStatus, setCertPlanStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [notesFullscreen, setNotesFullscreen] = useState(false);
  const [aiResult, setAiResult] = useState<ReturnType<typeof buildLocalAiStudyAnalysis> | null>(null);
  const [askInput, setAskInput] = useState("");
  const [queueRevealed, setQueueRevealed] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const textSaveRef = useRef<number | null>(null);
  const liveNotes = useMemo(() => notes.filter((note) => !note.deletedAt), [notes]);
  const trashedNotes = useMemo(() => sortStudyNotes(notes.filter((note) => note.deletedAt)), [notes]);
  const liveFolders = useMemo(() => folders.filter((folder) => !folder.deletedAt), [folders]);
  const trashedFolders = useMemo(
    () => folders.filter((folder) => folder.deletedAt).sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [folders],
  );
  const sortedNotes = useMemo(() => sortStudyNotes(liveNotes), [liveNotes]);
  const activeNote = liveNotes.find((note) => note.id === activeNoteId) ?? sortedNotes[0];
  const reviewCards = useMemo(() => buildStudyReviewCards(activeNote), [activeNote]);
  const savedFlashcards = activeNote?.flashcards ?? [];
  const askHistory = activeNote?.askHistory ?? [];
  const allSavedFlashcards = useMemo(() => getAllSavedFlashcards(liveNotes), [liveNotes]);
  const dueFlashcards = useMemo(() => getDueFlashcards(allSavedFlashcards), [allSavedFlashcards]);
  const nextScheduledCard = useMemo(() => getNextScheduledFlashcard(allSavedFlashcards), [allSavedFlashcards]);
  const activeQueueItem = dueFlashcards[0] ?? nextScheduledCard;
  const memoryQueue = useMemo(() => getMemoryQueueTelemetry(allSavedFlashcards), [allSavedFlashcards]);
  const continueReadingNote = useMemo(() => sortedNotes.find((note) => note.kind === "document") ?? sortedNotes[0], [sortedNotes]);
  const weakNotes = useMemo(() => getWeakStudyNotes(liveNotes), [liveNotes]);
  const reviewedToday = useMemo(() => allSavedFlashcards.filter((item) => item.card.lastReviewedAt && isToday(item.card.lastReviewedAt)).length, [allSavedFlashcards]);
  const recentStudyNotes = sortedNotes.slice(0, 4);
  const allTags = useMemo(() => Array.from(new Set(liveNotes.flatMap((note) => note.tags))).sort(), [liveNotes]);
  const folderIndex = useMemo(() => buildStudyFolderIndex(liveFolders, liveNotes), [liveFolders, liveNotes]);
  const allFolderIndex = useMemo(() => buildStudyFolderIndex(folders, notes), [folders, notes]);
  const folderTree = folderIndex.tree;
  const folderStructureKey = useMemo(
    () => folderTree.map((folder) => `${folder.id}:${folder.depth}:${folder.childCount}:${folder.parentId ?? STUDY_FOLDER_ROOT_ID}`).join("|"),
    [folderTree],
  );
  const visibleFolderTree = useMemo(
    () => folderTree.filter((folder) => folder.ancestorIds.every((ancestorId) => expandedFolderIds.has(ancestorId))),
    [expandedFolderIds, folderTree],
  );
  const selectedFolderParent = folderParentId === STUDY_FOLDER_ROOT_ID ? null : folderIndex.itemById.get(folderParentId) ?? null;
  const activeManagedFolder =
    activeFolderId !== "all" && activeFolderId !== STUDY_FOLDER_UNCATEGORIZED_ID && activeFolderId !== STUDY_FOLDER_TRASH_ID
      ? folderIndex.itemById.get(activeFolderId) ?? null
      : null;
  const activeManagedBranchIds = useMemo(
    () => (activeManagedFolder ? getStudyFolderBranchIdsFromIndex(folderIndex, activeManagedFolder.id) : []),
    [activeManagedFolder, folderIndex],
  );
  const folderMoveOptions = useMemo(
    () => folderTree.filter((folder) => !activeManagedBranchIds.includes(folder.id)),
    [activeManagedBranchIds, folderTree],
  );
  const certificationTracks = useMemo(() => getCertificationTracks(liveFolders, liveNotes, folderIndex), [folderIndex, liveFolders, liveNotes]);
  const activeCertification = certificationTracks.find((track) => track.folder.id === activeCertificationId) ?? certificationTracks[0];
  const activeCertificationPlan = useMemo(() => (activeCertification ? getCertificationStudyPlan(activeCertification) : []), [activeCertification]);
  const activeCertificationWeakTopics = useMemo(() => (activeCertification ? getCertificationWeakTopics(activeCertification) : []), [activeCertification]);
  const activeFolderScope = useMemo(
    () =>
      activeFolderId === "all" || activeFolderId === STUDY_FOLDER_UNCATEGORIZED_ID || activeFolderId === STUDY_FOLDER_TRASH_ID
        ? []
        : getStudyFolderBranchIdsFromIndex(folderIndex, activeFolderId),
    [activeFolderId, folderIndex],
  );
  const activeNoteFolder = activeNote?.folderId ? folderIndex.itemById.get(activeNote.folderId) ?? null : null;
  const activeNoteSignal = activeNote ? getNoteStudySignal(activeNote, activeNoteFolder) : null;
  const activeDraftSignal = activeNote ? getNoteStudySignal({ ...activeNote, title: draftTitle, body: draftBody }, activeNoteFolder) : null;
  const activeReadingProgress = Math.round(clamp(activeNote?.readingProgress ?? 0, 0, 100));
  const activeNoteOutline = useMemo(() => getStudyOutline(draftBody), [draftBody]);
  const activeNoteCockpit = activeNote && activeNoteSignal ? getNoteCockpitMetrics(activeNote, activeNoteSignal) : [];
  const activeNoteRadar = activeNoteCockpit.length ? getNoteCockpitRadar(activeNoteCockpit) : null;
  const activeNoteProtocols = activeNoteSignal ? getNoteProtocolStack(activeNoteSignal) : [];
  const activeNotePhases = activeNoteSignal ? getNotePhaseRail(activeNoteSignal) : [];
  const writingCommandDeck = activeDraftSignal ? getWritingCommandDeck(draftBody, activeDraftSignal) : [];
  const primaryWritingCommand = writingCommandDeck.find((command) => command.progress < 82) ?? writingCommandDeck[0];
  const readerImmersionNodes = activeNote && activeDraftSignal ? getReaderImmersionNodes(activeNote, activeDraftSignal, activeReadingProgress) : [];
  const primaryReaderNode = readerImmersionNodes.find((node) => node.progress < 80) ?? readerImmersionNodes[0];
  const reviewForge = activeDraftSignal ? getReviewForgeStats(reviewCards, savedFlashcards, activeDraftSignal) : null;
  const aiTutorMatrix = activeNote && activeDraftSignal ? getAiTutorMatrix(activeNote, activeDraftSignal, aiResult, askHistory, savedFlashcards) : null;
  const activeNoteBreadcrumbs = useMemo(
    () =>
      activeNoteFolder
        ? [
            ...activeNoteFolder.ancestorIds
              .map((folderId) => folderIndex.itemById.get(folderId))
              .filter((folder): folder is StudyFolderTreeItem => Boolean(folder)),
            activeNoteFolder,
          ]
        : [],
    [activeNoteFolder, folderIndex],
  );
  const filteredNotes = sortedNotes.filter((note) => {
    const matchesFilter = filter === "all" || (filter === "pinned" ? note.pinned : isRecentNote(note));
    const matchesFolder =
      activeFolderId === "all" ||
      (activeFolderId === STUDY_FOLDER_UNCATEGORIZED_ID ? !note.folderId : activeFolderScope.includes(note.folderId ?? ""));
    const matchesTag = !activeTag || note.tags.includes(activeTag);
    const haystack = `${note.title} ${note.body} ${note.extractedText ?? ""} ${note.tags.join(" ")}`.toLowerCase();
    return matchesFilter && matchesFolder && matchesTag && haystack.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    if (!activeNote && sortedNotes[0]) setActiveNoteId(sortedNotes[0].id);
  }, [activeNote, sortedNotes]);

  useEffect(() => {
    if (
      activeFolderId !== "all" &&
      activeFolderId !== STUDY_FOLDER_UNCATEGORIZED_ID &&
      activeFolderId !== STUDY_FOLDER_TRASH_ID &&
      !folderIndex.byId.has(activeFolderId)
    ) {
      setActiveFolderId("all");
    }
  }, [activeFolderId, folderIndex]);

  useEffect(() => {
    if (activeManagedFolder) {
      setFolderParentId(activeFolderId);
    }
  }, [activeFolderId, activeManagedFolder]);

  useEffect(() => {
    setFolderRenameInput(activeManagedFolder?.name ?? "");
    setFolderMoveParentId(activeManagedFolder?.parentId ?? STUDY_FOLDER_ROOT_ID);
  }, [activeManagedFolder?.id, activeManagedFolder?.name, activeManagedFolder?.parentId]);

  useEffect(() => {
    if (folderParentId !== STUDY_FOLDER_ROOT_ID && !folderIndex.byId.has(folderParentId)) {
      setFolderParentId(STUDY_FOLDER_ROOT_ID);
    }
  }, [folderIndex, folderParentId]);

  useEffect(() => {
    setExpandedFolderIds((current) => {
      const knownIds = new Set(folderTree.map((folder) => folder.id));
      const next = new Set([...current].filter((id) => knownIds.has(id)));
      folderTree.forEach((folder) => {
        if (folder.depth === 0 || folder.childCount > 0) {
          next.add(folder.id);
        }
      });
      if (next.size !== current.size || [...next].some((id) => !current.has(id))) return next;
      return current;
    });
  }, [folderStructureKey]);

  useEffect(() => {
    if (!activeCertification && activeCertificationId) {
      setActiveCertificationId("");
      return;
    }
    if (!activeCertificationId && activeCertification) {
      setActiveCertificationId(activeCertification.folder.id);
    }
  }, [activeCertification, activeCertificationId]);

  useEffect(() => {
    setDraftTitle(activeNote?.title ?? "");
    setDraftBody(activeNote?.body ?? "");
  }, [activeNote?.id]);

  useEffect(() => {
    if (modeRequest) setMode(modeRequest.mode);
  }, [modeRequest?.nonce]);

  useEffect(() => () => {
    if (textSaveRef.current) window.clearTimeout(textSaveRef.current);
  }, []);

  async function createNote(kind: StudyNote["kind"] = "note", seed?: Partial<StudyNote>) {
    const now = new Date().toISOString();
    const fallbackFolderId =
      activeFolderId !== "all" &&
      activeFolderId !== STUDY_FOLDER_UNCATEGORIZED_ID &&
      activeFolderId !== STUDY_FOLDER_TRASH_ID &&
      folderIndex.byId.has(activeFolderId)
        ? activeFolderId
        : folderParentId !== STUDY_FOLDER_ROOT_ID && folderIndex.byId.has(folderParentId)
          ? folderParentId
          : folderTree[0]?.id;
    const note: StudyNote = {
      id: `${Date.now()}-${kind}`,
      title: seed?.title ?? (kind === "document" ? "Uploaded document" : "Untitled study note"),
      body: seed?.body ?? "## Notes\n\nStart writing here.",
      tags: seed?.tags ?? (kind === "document" ? ["reading"] : ["study"]),
      pinned: false,
      kind,
      folderId: seed?.folderId ?? fallbackFolderId,
      sourceName: seed?.sourceName,
      mimeType: seed?.mimeType,
      fileDataUrl: seed?.fileDataUrl,
      extractedText: seed?.extractedText,
      flashcards: seed?.flashcards ?? [],
      askHistory: seed?.askHistory ?? [],
      readingProgress: seed?.readingProgress ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await studyNoteCrud.add(note);
    logActivityEvent({
      domain: "notes",
      action: "created",
      entityId: note.id,
      entityTitle: note.title,
      source: kind === "document" ? "Document upload" : "Study notes",
      metadata: { kind: note.kind, folderId: note.folderId, sourceName: note.sourceName },
    });
    setActiveNoteId(note.id);
    setMode(kind === "document" ? "reading" : "writing");
  }

  function expandFolderPath(folderId: string) {
    const folder = folderIndex.itemById.get(folderId);
    if (!folder) return;
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      folder.ancestorIds.forEach((ancestorId) => next.add(ancestorId));
      next.add(folderId);
      return next;
    });
  }

  function toggleFolderExpanded(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  function prepareChildFolder(parentId: string) {
    setFolderParentId(parentId);
    setActiveFolderId(parentId);
    expandFolderPath(parentId);
    const parent = folderIndex.itemById.get(parentId);
    setFolderCreateStatus(parent ? `Creating inside ${parent.path}` : "");
    requestAnimationFrame(() => folderInputRef.current?.focus());
  }

  function prepareRootFolder() {
    setFolderParentId(STUDY_FOLDER_ROOT_ID);
    setFolderCreateStatus("Creating at library root");
    requestAnimationFrame(() => folderInputRef.current?.focus());
  }

  async function createFolder() {
    const cleanName = folderInput.trim();
    if (!cleanName) return;
    if (folderCreateBusy) return;
    const parentId = folderParentId !== STUDY_FOLDER_ROOT_ID && folderIndex.byId.has(folderParentId) ? folderParentId : undefined;
    const parentKey = parentId ?? STUDY_FOLDER_ROOT_ID;
    const duplicate = (folderIndex.childrenByParentId.get(parentKey) ?? []).some(
      (folder) => folder.name.trim().toLowerCase() === cleanName.toLowerCase(),
    );
    if (duplicate) {
      setFolderCreateStatus(`Directory already exists under ${selectedFolderParent?.path ?? "root"}.`);
      return;
    }
    const folder: StudyFolder = {
      id: createStudyFolderId(cleanName, folderIndex.byId),
      name: cleanName,
      color: ["cyan", "violet", "lime", "amber", "red"][folders.length % 5] as KanbanLabelColor,
      parentId,
      createdAt: new Date().toISOString(),
    };
    setFolderCreateBusy(true);
    try {
      await studyFolderCrud.add(folder);
      logActivityEvent({
        domain: "notes",
        action: "created",
        entityId: folder.id,
        entityTitle: folder.name,
        source: "Notes directory",
        metadata: { kind: "folder", parentId: folder.parentId },
      });
      setFolderInput("");
      setActiveFolderId(folder.id);
      setFolderParentId(folder.id);
      setFolderCreateStatus(`Created ${folder.name} under ${selectedFolderParent?.path ?? "root"}.`);
      setExpandedFolderIds((current) => {
        const next = new Set(current);
        if (parentId) {
          const parent = folderIndex.itemById.get(parentId);
          parent?.ancestorIds.forEach((ancestorId) => next.add(ancestorId));
          next.add(parentId);
        }
        next.add(folder.id);
        return next;
      });
    } catch (error) {
      setFolderCreateStatus(`Could not create directory: ${error instanceof Error ? error.message : "save failed"}`);
    } finally {
      setFolderCreateBusy(false);
    }
  }

  function isDuplicateFolderName(name: string, parentId: string | undefined, ignoredFolderId?: string) {
    const parentKey = parentId ?? STUDY_FOLDER_ROOT_ID;
    return (folderIndex.childrenByParentId.get(parentKey) ?? []).some(
      (folder) => folder.id !== ignoredFolderId && folder.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  }

  async function renameActiveFolder() {
    if (!activeManagedFolder) return;
    const cleanName = folderRenameInput.trim();
    if (!cleanName || cleanName === activeManagedFolder.name) return;
    if (isDuplicateFolderName(cleanName, activeManagedFolder.parentId, activeManagedFolder.id)) {
      setFolderCreateStatus(`Directory already exists under ${activeManagedFolder.parentId ? folderIndex.itemById.get(activeManagedFolder.parentId)?.path ?? "root" : "root"}.`);
      return;
    }
    await studyFolderCrud.update(activeManagedFolder.id, { name: cleanName });
    logActivityEvent({
      domain: "notes",
      action: "updated",
      entityId: activeManagedFolder.id,
      entityTitle: cleanName,
      source: "Notes directory",
      metadata: { kind: "folder", previousName: activeManagedFolder.name },
    });
    setFolderCreateStatus(`Renamed directory to ${cleanName}.`);
  }

  async function moveActiveFolder() {
    if (!activeManagedFolder) return;
    const targetParentId = folderMoveParentId === STUDY_FOLDER_ROOT_ID ? undefined : folderMoveParentId;
    if (targetParentId === activeManagedFolder.id || (targetParentId && activeManagedBranchIds.includes(targetParentId))) {
      setFolderCreateStatus("Cannot move a directory inside itself.");
      return;
    }
    if (targetParentId && !folderIndex.byId.has(targetParentId)) {
      setFolderCreateStatus("Move target no longer exists.");
      return;
    }
    if (isDuplicateFolderName(activeManagedFolder.name, targetParentId, activeManagedFolder.id)) {
      setFolderCreateStatus(`Directory already exists under ${targetParentId ? folderIndex.itemById.get(targetParentId)?.path ?? "root" : "root"}.`);
      return;
    }
    await studyFolderCrud.update(activeManagedFolder.id, { parentId: targetParentId });
    logActivityEvent({
      domain: "notes",
      action: "moved",
      entityId: activeManagedFolder.id,
      entityTitle: activeManagedFolder.name,
      source: "Notes directory",
      metadata: { kind: "folder", fromParentId: activeManagedFolder.parentId, toParentId: targetParentId },
    });
    if (targetParentId) expandFolderPath(targetParentId);
    setFolderCreateStatus(`Moved ${activeManagedFolder.name} to ${targetParentId ? folderIndex.itemById.get(targetParentId)?.path ?? "selected directory" : "library root"}.`);
  }

  function startNoteDrag(event: DragEvent<HTMLButtonElement>, noteId: string) {
    setDraggingNoteId(noteId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", noteId);
  }

  async function moveDraggedNote(event: DragEvent<HTMLElement>, folderId?: string) {
    event.preventDefault();
    const noteId = event.dataTransfer.getData("text/plain") || draggingNoteId;
    const note = liveNotes.find((item) => item.id === noteId);
    if (!note) return;
    await studyNoteCrud.update(note.id, { folderId });
    logActivityEvent({
      domain: "notes",
      action: "moved",
      entityId: note.id,
      entityTitle: note.title || "Untitled note",
      source: "Notes directory",
      metadata: { kind: note.kind, fromFolderId: note.folderId, toFolderId: folderId },
    });
    setDraggingNoteId("");
    setFolderCreateStatus(`Moved ${note.title || "Untitled note"} to ${folderId ? folderIndex.itemById.get(folderId)?.path ?? "directory" : "Uncategorized"}.`);
  }

  async function trashFolder(folder: StudyFolderTreeItem) {
    const branchIds = getStudyFolderBranchIdsFromIndex(allFolderIndex, folder.id);
    const affectedNotes = liveNotes.filter((note) => note.folderId && branchIds.includes(note.folderId));
    const nestedDirectoryCount = Math.max(branchIds.length - 1, 0);
    const confirmMessage = [
      `Move "${folder.name}" directory to Trash?`,
      nestedDirectoryCount
        ? `${nestedDirectoryCount} nested director${nestedDirectoryCount === 1 ? "y" : "ies"} will move with it.`
        : "",
      affectedNotes.length
        ? `${affectedNotes.length} note${affectedNotes.length === 1 ? "" : "s"} inside this branch will also move to Trash.`
        : "No notes will move with it.",
      "You can restore items from Trash later.",
    ]
      .filter(Boolean)
      .join("\n\n");
    if (!window.confirm(confirmMessage)) return;
    const deletedAt = new Date().toISOString();
    setFolderCreateStatus(`Moving ${folder.name} to Trash...`);
    try {
      await Promise.all(branchIds.map((folderId) => studyFolderCrud.update(folderId, { deletedAt })));
      await Promise.all(affectedNotes.map((note) => studyNoteCrud.update(note.id, { deletedAt })));
      logActivityEvent({
        domain: "notes",
        action: "deleted",
        entityId: folder.id,
        entityTitle: folder.name,
        source: "Notes directory",
        metadata: { kind: "folder_trash", branchCount: branchIds.length, affectedNotes: affectedNotes.length },
      });
      if (activeNote && affectedNotes.some((note) => note.id === activeNote.id)) {
        setActiveNoteId(liveNotes.find((note) => !affectedNotes.some((affectedNote) => affectedNote.id === note.id))?.id ?? "");
      }
      if (branchIds.includes(activeFolderId)) setActiveFolderId("all");
      if (folderParentId !== STUDY_FOLDER_ROOT_ID && branchIds.includes(folderParentId)) {
        setFolderParentId(STUDY_FOLDER_ROOT_ID);
      }
      setExpandedFolderIds((current) => {
        const next = new Set(current);
        branchIds.forEach((folderId) => next.delete(folderId));
        return next;
      });
      setFolderCreateStatus(`Moved ${folder.name} to Trash.`);
    } catch (error) {
      setFolderCreateStatus(`Could not move directory to Trash: ${error instanceof Error ? error.message : "trash failed"}`);
    }
  }

  async function restoreFolder(folder: StudyFolder) {
    const branchIds = getStudyFolderBranchIdsFromIndex(allFolderIndex, folder.id);
    const branchSet = new Set(branchIds);
    const notesToRestore = notes.filter((note) => note.deletedAt && note.folderId && branchSet.has(note.folderId));
    await Promise.all(
      branchIds.map((folderId) => {
        const current = allFolderIndex.byId.get(folderId);
        if (!current) return Promise.resolve();
        const parentIsOutsideDeletedBranch = current.parentId && !branchSet.has(current.parentId) && !folderIndex.byId.has(current.parentId);
        return studyFolderCrud.update(folderId, {
          deletedAt: undefined,
          parentId: parentIsOutsideDeletedBranch ? undefined : current.parentId,
        });
      }),
    );
    await Promise.all(notesToRestore.map((note) => studyNoteCrud.update(note.id, { deletedAt: undefined })));
    logActivityEvent({
      domain: "notes",
      action: "updated",
      entityId: folder.id,
      entityTitle: folder.name,
      source: "Notes trash",
      metadata: { kind: "folder_restore", branchCount: branchIds.length, restoredNotes: notesToRestore.length },
    });
    setActiveFolderId(folder.id);
    expandFolderPath(folder.id);
    setFolderCreateStatus(`Restored ${folder.name}.`);
  }

  async function restoreNote(note: StudyNote) {
    await studyNoteCrud.update(note.id, {
      deletedAt: undefined,
      folderId: note.folderId && folderIndex.byId.has(note.folderId) ? note.folderId : undefined,
    });
    logActivityEvent({
      domain: "notes",
      action: "updated",
      entityId: note.id,
      entityTitle: note.title || "Untitled note",
      source: "Notes trash",
      metadata: { kind: "note_restore", folderId: note.folderId },
    });
    setActiveNoteId(note.id);
    setActiveFolderId(note.folderId && folderIndex.byId.has(note.folderId) ? note.folderId : STUDY_FOLDER_UNCATEGORIZED_ID);
    setFolderCreateStatus(`Restored ${note.title || "Untitled note"}.`);
  }

  async function emptyTrash() {
    const itemCount = trashedFolders.length + trashedNotes.length;
    if (itemCount === 0) return;
    if (!window.confirm(`Permanently delete ${itemCount} trashed item${itemCount === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const trashedFolderIds = trashedFolders
      .map((folder) => allFolderIndex.itemById.get(folder.id))
      .filter(Boolean)
      .sort((a, b) => (b?.depth ?? 0) - (a?.depth ?? 0))
      .map((folder) => folder?.id)
      .filter((id): id is string => Boolean(id));
    await Promise.all(trashedNotes.map((note) => studyNoteCrud.delete(note.id)));
    await Promise.all(trashedFolderIds.map((folderId) => studyFolderCrud.delete(folderId)));
    logActivityEvent({
      domain: "notes",
      action: "deleted",
      entityId: `trash-${Date.now()}`,
      entityTitle: "Empty notes trash",
      source: "Notes trash",
      metadata: { itemCount, folderCount: trashedFolderIds.length, noteCount: trashedNotes.length },
    });
    setFolderCreateStatus("Trash emptied.");
  }

  function updateActive(patch: Partial<Omit<StudyNote, "id" | "createdAt">>) {
    if (!activeNote) return;
    void studyNoteCrud.update(activeNote.id, patch);
  }

  function updateActiveReadingProgress(value: number) {
    if (!activeNote) return;
    const readingProgress = Math.round(clamp(value, 0, 100));
    updateActive({ readingProgress, updatedAt: new Date().toISOString() });
    logActivityEvent({
      domain: "notes",
      action: readingProgress >= 100 ? "reviewed" : "updated",
      entityId: activeNote.id,
      entityTitle: activeNote.title || "Untitled note",
      source: "Study session progress",
      metadata: { readingProgress, kind: activeNote.kind, folderId: activeNote.folderId },
    });
  }

  function jumpToOutlineItem(item: StudyOutlineItem) {
    setMode("writing");
    requestAnimationFrame(() => {
      const element = editorRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(item.offset, item.offset);
      element.scrollTop = Math.max(0, item.line * 26 - element.clientHeight * 0.2);
    });
  }

  function addOutlineSection(title: string) {
    const heading = title.trim() || "New Study Section";
    const prefix = draftBody.trim() ? "\n\n" : "";
    updateDraftBody(`${draftBody}${prefix}## ${heading}\n\n- `);
    setMode("writing");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function appendWritingCommand(command: WritingCommandCard) {
    const spacer = draftBody.trim() ? (draftBody.endsWith("\n") ? "\n" : "\n\n") : "";
    updateDraftBody(`${draftBody}${spacer}${command.insert}`);
    setMode("writing");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function appendReaderCapture(node: ReaderImmersionNode) {
    const spacer = draftBody.trim() ? (draftBody.endsWith("\n") ? "\n" : "\n\n") : "";
    updateDraftBody(`${draftBody}${spacer}${node.insert}`);
    setMode("reading");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function scheduleTextSave(noteId: string, patch: Partial<Pick<StudyNote, "title" | "body">>) {
    if (textSaveRef.current) window.clearTimeout(textSaveRef.current);
    textSaveRef.current = window.setTimeout(() => {
      void studyNoteCrud.update(noteId, patch);
      textSaveRef.current = null;
    }, 450);
  }

  function updateDraftTitle(value: string) {
    setDraftTitle(value);
    if (activeNote) scheduleTextSave(activeNote.id, { title: value });
  }

  function updateDraftBody(value: string) {
    setDraftBody(value);
    if (activeNote) scheduleTextSave(activeNote.id, { body: value });
  }

  function applyMarkdown(prefix: string, suffix = "") {
    if (!activeNote) return;
    const element = editorRef.current;
    if (!element) {
      updateDraftBody(`${draftBody}${prefix}${suffix}`);
      return;
    }
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = draftBody.slice(start, end);
    const inserted = `${prefix}${selected || "text"}${suffix}`;
    const nextBody = `${draftBody.slice(0, start)}${inserted}${draftBody.slice(end)}`;
    updateDraftBody(nextBody);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + prefix.length, start + prefix.length + (selected || "text").length);
    });
  }

  function addTag(value: string) {
    if (!activeNote) return;
    const clean = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    if (!clean || activeNote.tags.includes(clean)) return;
    updateActive({ tags: [...activeNote.tags, clean] });
    setTagInput("");
  }

  async function uploadDocuments(files: FileList | null) {
    if (!files) return;
    setUploadStatus(`extracting ${files.length} file${files.length === 1 ? "" : "s"}...`);
    for (const file of Array.from(files)) {
      try {
        const extracted = await readStudyFile(file);
        await createNote("document", {
          title: file.name.replace(/\.[^.]+$/, ""),
          body: extracted.body,
          tags: ["reading", extracted.kind, ...(extracted.extracted ? ["searchable"] : ["manual-notes"])],
          sourceName: file.name,
          mimeType: extracted.mimeType,
          fileDataUrl: extracted.fileDataUrl,
          extractedText: extracted.extractedText,
        });
      } catch (error) {
        await createNote("document", {
          title: file.name.replace(/\.[^.]+$/, ""),
          body: createUnsupportedDocumentBody(file.name, error instanceof Error ? error.message : "Extraction failed."),
          tags: ["reading", "needs-review"],
          sourceName: file.name,
        });
      }
    }
    setUploadStatus("upload extraction complete");
  }

  async function deleteActive() {
    if (!activeNote) return;
    if (!window.confirm(`Move "${activeNote.title}" to Trash? You can restore it later.`)) return;
    await studyNoteCrud.update(activeNote.id, { deletedAt: new Date().toISOString() });
    logActivityEvent({
      domain: "notes",
      action: "deleted",
      entityId: activeNote.id,
      entityTitle: activeNote.title || "Untitled note",
      source: "Study notes",
      metadata: { kind: "note_trash", folderId: activeNote.folderId },
    });
    setActiveNoteId(sortedNotes.find((note) => note.id !== activeNote.id)?.id ?? "");
  }

  function saveGeneratedFlashcards(cards = aiResult?.flashcards ?? reviewCards) {
    if (!activeNote || cards.length === 0) return;
    const existing = activeNote.flashcards ?? [];
    const existingKeys = new Set(existing.map((card) => slugify(card.question)));
    const now = new Date().toISOString();
    const nextCards = cards
      .filter((card) => !existingKeys.has(slugify(card.question)))
      .map((card, index) => ({
        id: `${Date.now()}-flashcard-${index}`,
        question: card.question,
        answer: card.answer,
        source: "source" in card && typeof card.source === "string" ? card.source : "ai study console",
        difficulty: "new" as const,
        reviewCount: 0,
        dueAt: now,
        createdAt: now,
      }));
    if (nextCards.length === 0) return;
    updateActive({ flashcards: [...existing, ...nextCards] });
    logActivityEvent({
      domain: "notes",
      action: "generated",
      entityId: activeNote.id,
      entityTitle: activeNote.title || "Untitled note",
      source: "Study flashcards",
      metadata: { cardCount: nextCards.length },
    });
  }

  function updateFlashcard(cardId: string, patch: Partial<NonNullable<StudyNote["flashcards"]>[number]>) {
    if (!activeNote) return;
    const card = (activeNote.flashcards ?? []).find((item) => item.id === cardId);
    updateActive({
      flashcards: (activeNote.flashcards ?? []).map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
    });
    if (card && typeof patch.reviewCount === "number") {
      logActivityEvent({
        domain: "notes",
        action: "reviewed",
        entityId: card.id,
        entityTitle: card.question,
        source: "Study flashcards",
        metadata: { noteId: activeNote.id, noteTitle: activeNote.title, rating: patch.difficulty },
      });
    }
  }

  function updateNoteFlashcard(noteId: string, cardId: string, patch: Partial<NonNullable<StudyNote["flashcards"]>[number]>) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    void studyNoteCrud.update(note.id, {
      flashcards: (note.flashcards ?? []).map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
    });
  }

  function deleteFlashcard(cardId: string) {
    if (!activeNote) return;
    updateActive({ flashcards: (activeNote.flashcards ?? []).filter((card) => card.id !== cardId) });
  }

  function reviewQueueCard(rating: "again" | "learning" | "known") {
    if (!activeQueueItem) return;
    const current = activeQueueItem.card;
    const reviewedAt = new Date().toISOString();
    const nextPatch =
      rating === "again"
        ? { difficulty: "learning" as const, dueAt: addMinutesIso(20), reviewCount: current.reviewCount + 1, lastReviewedAt: reviewedAt }
        : rating === "learning"
          ? { difficulty: "learning" as const, dueAt: addDaysIso(1), reviewCount: current.reviewCount + 1, lastReviewedAt: reviewedAt }
          : { difficulty: "known" as const, dueAt: addDaysIso(current.reviewCount > 2 ? 10 : 4), reviewCount: current.reviewCount + 1, lastReviewedAt: reviewedAt };
    updateNoteFlashcard(activeQueueItem.noteId, current.id, nextPatch);
    logActivityEvent({
      domain: "notes",
      action: "reviewed",
      entityId: current.id,
      entityTitle: current.question,
      source: "Study flashcard queue",
      metadata: { noteId: activeQueueItem.noteId, noteTitle: activeQueueItem.noteTitle, rating },
    });
    setQueueRevealed(false);
  }

  function jumpToQueueSource() {
    if (!activeQueueItem) return;
    setActiveNoteId(activeQueueItem.noteId);
    setMode("ai");
  }

  function askActiveNote() {
    if (!activeNote) return;
    const question = askInput.trim();
    if (!question) return;
    const answer = answerStudyQuestion(activeNote, question);
    const message = {
      id: `${Date.now()}-ask`,
      question,
      answer,
      createdAt: new Date().toISOString(),
    };
    updateActive({ askHistory: [...(activeNote.askHistory ?? []), message] });
    setAskInput("");
  }

  function updateCertificationObjectives(folder: StudyFolder, objectives: StudyObjective[]) {
    void studyFolderCrud.update(folder.id, { objectives });
  }

  function toggleCertificationObjective(folder: StudyFolder, objectiveId: string) {
    const currentObjectives = getFolderObjectives(folder);
    const targetObjective = currentObjectives.find((objective) => objective.id === objectiveId);
    const objectives = currentObjectives.map((objective) =>
      objective.id === objectiveId ? { ...objective, done: !objective.done } : objective,
    );
    if (targetObjective) {
      setCertPlanStatus(`${folder.name}: ${targetObjective.title} ${targetObjective.done ? "reopened" : "completed"}.`);
    }
    updateCertificationObjectives(folder, objectives);
  }

  function addCertificationObjective() {
    if (!activeCertification) return;
    const title = objectiveInput.trim();
    if (!title) return;
    const objectives = getFolderObjectives(activeCertification.folder);
    updateCertificationObjectives(activeCertification.folder, [
      ...objectives,
      {
        id: `${Date.now()}-${slugify(title)}`,
        title,
        done: false,
        weight: 12,
      },
    ]);
    setObjectiveInput("");
  }

  function createCertificationStudyPlan(track: CertificationTrack) {
    const today = new Date();
    const examDate = parseDateInput(track.folder.examDate);
    const endDate = examDate && examDate >= today ? examDate : addDays(today, 29);
    const startDateValue = toDateInputValue(today);
    const endDateValue = toDateInputValue(endDate);
    const days = getDateRangeDays(startDateValue, endDateValue);
    const planRows = getCertificationStudyPlan(track, Math.min(days, 14));
    const tasksByDay: Record<number, ProjectTask[]> = {};

    planRows.forEach((row, index) => {
      tasksByDay[index + 1] = [
        { id: `${Date.now()}-${index}-read`, name: row.focus, done: false },
        { id: `${Date.now()}-${index}-recall`, name: row.recall, done: false },
      ];
    });

    const project: TaskProject = {
      id: `${Date.now()}-${slugify(track.folder.name)}-study-sprint`,
      name: `${track.folder.name} study sprint`,
      startDate: startDateValue,
      endDate: endDateValue,
      deadlineDays: days,
      currentDay: 1,
      tasksByDay,
    };

    void taskProjectCrud.add(project);
    setCertPlanStatus(`${track.folder.name} task sprint created with ${planRows.length} planned days.`);
  }

  function openCertificationTrack(track: CertificationTrack) {
    setActiveCertificationId(track.folder.id);
    setActiveFolderId(track.folder.id);
  }

  useEffect(() => {
    const handleNotesShortcuts = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "/") {
        event.preventDefault();
        setLibraryCollapsed(false);
        requestAnimationFrame(() => searchRef.current?.focus());
        return;
      }
      const modeMap: Partial<Record<string, NotesMode>> = {
        h: "home",
        w: "writing",
        r: "reading",
        v: "review",
        q: "queue",
        c: "certifications",
        a: "ai",
      };
      if (key === "n") {
        event.preventDefault();
        void createNote("note");
        return;
      }
      if (key === "f") {
        event.preventDefault();
        setLibraryCollapsed((value) => !value);
        return;
      }
      const nextMode = modeMap[key];
      if (nextMode) {
        event.preventDefault();
        setMode(nextMode);
      }
    };

    window.addEventListener("keydown", handleNotesShortcuts);
    return () => window.removeEventListener("keydown", handleNotesShortcuts);
  }, [activeFolderId, folderIndex, folderParentId, folderTree]);

  return (
    <>
      <section className={`notes-workspace ${libraryCollapsed ? "library-collapsed" : ""} ${notesFullscreen ? "notes-fullscreen" : ""}`}>
        <HudCard className={`notes-sidebar ${libraryCollapsed ? "collapsed" : ""}`}>
          <div className="notes-library-head">
            {!libraryCollapsed && <CardHeader title="Study Library" meta={`${liveNotes.length} entries`} />}
            <button className="library-toggle" type="button" onClick={() => setLibraryCollapsed((value) => !value)} aria-label={libraryCollapsed ? "Open study library" : "Collapse study library"}>
              {libraryCollapsed ? "library" : "collapse"}
            </button>
          </div>
          {!libraryCollapsed && (
            <>
              <div className="folder-system">
                <div className="folder-system-head">
                  <span>Directories</span>
                  <strong>{folderIndex.tree.length}</strong>
                </div>
                <button className={activeFolderId === "all" ? "active" : ""} type="button" onClick={() => setActiveFolderId("all")}>
                  <span className="folder-dot cyan" /> All Notes <em>{liveNotes.length}</em>
                </button>
                {visibleFolderTree.map((folder) => {
                  const expanded = expandedFolderIds.has(folder.id);
                  return (
                    <div className={`folder-tree-row ${folder.isOrphan ? "orphan" : ""}`} style={{ "--depth": folder.depth } as CSSProperties} key={folder.id}>
                      <button
                        className="folder-toggle"
                        type="button"
                        disabled={folder.childCount === 0}
                        onClick={() => toggleFolderExpanded(folder.id)}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${folder.name}`}
                        aria-expanded={folder.childCount > 0 ? expanded : undefined}
                      >
                        {folder.childCount > 0 ? (expanded ? "-" : "+") : ""}
                      </button>
                      <button className={`folder-select-button ${activeFolderId === folder.id ? "active" : ""}`} type="button" onClick={() => {
                        setActiveFolderId(folder.id);
                        expandFolderPath(folder.id);
                      }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => void moveDraggedNote(event, folder.id)}>
                        <span className={`folder-dot ${folder.color}`} />
                        <span>
                          {folder.name}
                          <small>{folder.path}{folder.childCount > 0 ? ` - ${folder.childCount} dirs` : ""}</small>
                        </span>
                        <em>{folder.directNoteCount}/{folder.noteCount}</em>
                      </button>
                      <button
                        className="folder-child-trigger"
                        type="button"
                        onClick={() => prepareChildFolder(folder.id)}
                        aria-label={`Add child directory under ${folder.name}`}
                      >
                        +
                      </button>
                      <button
                        className="folder-delete-trigger"
                        type="button"
                        onClick={() => void trashFolder(folder)}
                        aria-label={`Move directory ${folder.name} to Trash`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  );
                })}
                <button
                  className={activeFolderId === STUDY_FOLDER_UNCATEGORIZED_ID ? "active" : ""}
                  type="button"
                  onClick={() => setActiveFolderId(STUDY_FOLDER_UNCATEGORIZED_ID)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => void moveDraggedNote(event)}
                >
                  <span className="folder-dot amber" /> Uncategorized <em>{liveNotes.filter((note) => !note.folderId).length}</em>
                </button>
                <button className={activeFolderId === STUDY_FOLDER_TRASH_ID ? "active danger" : "danger"} type="button" onClick={() => setActiveFolderId(STUDY_FOLDER_TRASH_ID)}>
                  <span className="folder-dot red" /> Trash <em>{trashedFolders.length + trashedNotes.length}</em>
                </button>
                {activeManagedFolder && (
                  <div className="folder-manager-panel">
                    <div className="folder-manager-head">
                      <span>Manage</span>
                      <strong>{activeManagedFolder.path}</strong>
                    </div>
                    <div className="folder-manager-row">
                      <input
                        value={folderRenameInput}
                        onChange={(event) => setFolderRenameInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void renameActiveFolder();
                          }
                        }}
                        aria-label={`Rename ${activeManagedFolder.name}`}
                      />
                      <button type="button" onClick={() => void renameActiveFolder()}>rename</button>
                    </div>
                    <div className="folder-manager-row">
                      <select value={folderMoveParentId} onChange={(event) => setFolderMoveParentId(event.target.value)} aria-label={`Move ${activeManagedFolder.name}`}>
                        <option value={STUDY_FOLDER_ROOT_ID}>root</option>
                        {folderMoveOptions.map((folder) => (
                          <option value={folder.id} key={folder.id}>
                            {getStudyFolderOptionLabel(folder)}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => void moveActiveFolder()}>move</button>
                    </div>
                  </div>
                )}
                {activeFolderId === STUDY_FOLDER_TRASH_ID && (
                  <div className="trash-panel">
                    <div className="trash-panel-head">
                      <span>Recoverable Trash</span>
                      <button type="button" onClick={() => void emptyTrash()} disabled={trashedFolders.length + trashedNotes.length === 0}>empty</button>
                    </div>
                    {trashedFolders.length + trashedNotes.length === 0 ? (
                      <div className="kanban-empty">// trash is empty</div>
                    ) : (
                      <>
                        {trashedFolders.map((folder) => (
                          <div className="trash-row" key={folder.id}>
                            <span>directory</span>
                            <strong>{allFolderIndex.itemById.get(folder.id)?.path ?? folder.name}</strong>
                            <button type="button" onClick={() => void restoreFolder(folder)}>restore</button>
                          </div>
                        ))}
                        {trashedNotes.map((note) => (
                          <div className="trash-row" key={note.id}>
                            <span>{note.kind}</span>
                            <strong>{note.title || "Untitled"}</strong>
                            <button type="button" onClick={() => void restoreNote(note)}>restore</button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
                <div className="folder-create-context">
                  <span>Create inside</span>
                  <strong>{selectedFolderParent?.path ?? "Library root"}</strong>
                  <button type="button" onClick={prepareRootFolder}>root</button>
                </div>
                <div className="folder-create">
                  <input ref={folderInputRef} value={folderInput} onChange={(event) => {
                    setFolderInput(event.target.value);
                    if (folderCreateStatus) setFolderCreateStatus("");
                  }} onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void createFolder();
                    }
                  }} placeholder="new directory" />
                  <select value={folderParentId} onChange={(event) => setFolderParentId(event.target.value)}>
                    <option value={STUDY_FOLDER_ROOT_ID}>root</option>
                    {folderTree.map((folder) => (
                      <option value={folder.id} key={folder.id}>
                        {getStudyFolderOptionLabel(folder)}
                      </option>
                    ))}
                  </select>
                  <button type="button" disabled={folderCreateBusy} onClick={() => void createFolder()}>
                    {folderCreateBusy ? "saving" : "add"}
                  </button>
                </div>
                {folderCreateStatus && <div className="folder-create-status">{folderCreateStatus}</div>}
              </div>
              <div className="notes-search">
                <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="// search notes, docs, tags" />
              </div>
              <div className="notes-tabs">
                {(["all", "pinned", "recent"] as const).map((item) => (
                  <button className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)} key={item}>{item}</button>
                ))}
              </div>
              <div className="notes-tags">
                <button className={!activeTag ? "active" : ""} type="button" onClick={() => setActiveTag("")}>all tags</button>
                {allTags.map((tag) => (
                  <button className={activeTag === tag ? "active" : ""} type="button" onClick={() => setActiveTag(tag)} key={tag}>{tag}</button>
                ))}
              </div>
              <div className="note-list">
                {filteredNotes.length === 0 ? (
                  <div className="kanban-empty">// no notes match current filter</div>
                ) : (
                  filteredNotes.map((note) => {
                    const noteWordCount = getWordCount(`${note.body}\n\n${note.extractedText ?? ""}`);
                    return (
                      <button
                        className={`note-list-item ${activeNote?.id === note.id ? "active" : ""} ${draggingNoteId === note.id ? "dragging" : ""}`}
                        type="button"
                        draggable
                        onDragStart={(event) => startNoteDrag(event, note.id)}
                        onDragEnd={() => setDraggingNoteId("")}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          logActivityEvent({
                            domain: "notes",
                            action: "opened",
                            entityId: note.id,
                            entityTitle: note.title || "Untitled note",
                            source: "Study library",
                            metadata: { kind: note.kind, folderId: note.folderId },
                          });
                        }}
                        key={note.id}
                      >
                        <span>{note.kind === "document" ? "document" : "note"}{note.pinned ? " / pinned" : ""}</span>
                        <strong>{note.title || "Untitled"}</strong>
                        <em>{noteWordCount} words · {formatActivityTime(note.updatedAt)}</em>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="notes-create-row">
                <button type="button" onClick={() => void createNote("note")}>+ note</button>
                <label>
                  <input type="file" multiple accept=".pdf,.docx,.md,.markdown,.txt,.csv,.json,.html,.css,.js,.ts,.tsx" onChange={(event) => void uploadDocuments(event.target.files)} />
                  + upload
                </label>
              </div>
              {uploadStatus && <div className="notes-upload-status">{uploadStatus}</div>}
            </>
          )}
        </HudCard>

        <HudCard className="notes-editor-card">
          {activeNote ? (
            <>
              <div className="notes-editor-head">
                <div className="notes-mode-toggle" role="tablist" aria-label="Notes mode">
                  <button className={mode === "home" ? "active" : ""} type="button" onClick={() => setMode("home")}>
                    <Home /> home
                  </button>
                  <button className={mode === "writing" ? "active" : ""} type="button" onClick={() => setMode("writing")}>
                    <NotebookText /> write
                  </button>
                  <button className={mode === "reading" ? "active" : ""} type="button" onClick={() => setMode("reading")}>
                    <Eye /> read
                  </button>
                  <button className={mode === "review" ? "active" : ""} type="button" onClick={() => setMode("review")}>
                    <Sparkles /> review
                  </button>
                  <button className={mode === "queue" ? "active" : ""} type="button" onClick={() => setMode("queue")}>
                    <ListTodo /> queue
                  </button>
                  <button className={mode === "certifications" ? "active" : ""} type="button" onClick={() => setMode("certifications")}>
                    <Target /> certs
                  </button>
                  <button className={mode === "ai" ? "active" : ""} type="button" onClick={() => setMode("ai")}>
                    <Bot /> ai
                  </button>
                </div>
                <div className="notes-actions">
                  <button type="button" onClick={() => setNotesFullscreen((value) => !value)}>{notesFullscreen ? "exit full" : "full screen"}</button>
                  <button type="button" onClick={() => updateActive({ pinned: !activeNote.pinned })}>{activeNote.pinned ? "unpin" : "pin"}</button>
                  <button type="button" onClick={() => void deleteActive()}>trash</button>
                </div>
              </div>

              {mode !== "certifications" && activeNoteSignal && (
                <section className={`notes-command-ribbon ${activeNoteSignal.tier}`}>
                  <div className="notes-ribbon-main">
                    <span>Active Study Signal</span>
                    <strong>{activeNoteSignal.headline}</strong>
                    <p>{activeNoteSignal.directive}</p>
                  </div>
                  <div className="notes-ribbon-meter" aria-label={`Study signal ${activeNoteSignal.score}%`}>
                    <span style={{ width: `${activeNoteSignal.score}%` }} />
                  </div>
                </section>
              )}

              {mode !== "certifications" && (
                <>
                  <input className="note-title-input" value={draftTitle} onChange={(event) => updateDraftTitle(event.target.value)} onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      editorRef.current?.focus();
                    }
                  }} />

                  <div className="note-breadcrumbs" aria-label="Note directory path">
                    <button type="button" onClick={() => setActiveFolderId("all")}>Library</button>
                    {activeNoteBreadcrumbs.length === 0 ? (
                      <button type="button" onClick={() => setActiveFolderId(STUDY_FOLDER_UNCATEGORIZED_ID)}>Uncategorized</button>
                    ) : (
                      activeNoteBreadcrumbs.map((folder) => (
                        <button type="button" onClick={() => {
                          setActiveFolderId(folder.id);
                          expandFolderPath(folder.id);
                        }} key={folder.id}>{folder.name}</button>
                      ))
                    )}
                  </div>

                  <div className="note-directory-row">
                    <span>Directory</span>
                    <select
                      value={activeNote.folderId && folderIndex.byId.has(activeNote.folderId) ? activeNote.folderId : STUDY_FOLDER_UNCATEGORIZED_ID}
                      onChange={(event) => updateActive({ folderId: event.target.value === STUDY_FOLDER_UNCATEGORIZED_ID ? undefined : event.target.value })}
                    >
                      <option value={STUDY_FOLDER_UNCATEGORIZED_ID}>Uncategorized</option>
                      {folderTree.map((folder) => (
                        <option value={folder.id} key={folder.id}>{getStudyFolderOptionLabel(folder)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="note-tag-editor">
                    {activeNote.tags.map((tag) => (
                      <button type="button" onClick={() => updateActive({ tags: activeNote.tags.filter((item) => item !== tag) })} key={tag}>{tag} ×</button>
                    ))}
                    <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag(tagInput);
                      }
                      if (event.key === "Backspace" && !tagInput && activeNote.tags.length > 0) {
                        updateActive({ tags: activeNote.tags.slice(0, -1) });
                      }
                    }} placeholder="add tag" />
                  </div>

                </>
              )}

              {mode === "home" ? (
                <div className="notes-home-mode">
                  <div className="notes-home-grid">
                    <section className="notes-home-panel continue-panel">
                      <div className="ask-note-head">
                        <span>Continue Reading</span>
                        <strong>{continueReadingNote?.kind ?? "none"}</strong>
                      </div>
                      {continueReadingNote ? (
                        <button type="button" onClick={() => {
                          setActiveNoteId(continueReadingNote.id);
                          setMode(continueReadingNote.kind === "document" ? "reading" : "writing");
                        }}>
                          <strong>{continueReadingNote.title}</strong>
                          <em>{getReadingMinutes(continueReadingNote.extractedText ?? continueReadingNote.body)} min read · {formatActivityTime(continueReadingNote.updatedAt)}</em>
                        </button>
                      ) : (
                        <div className="kanban-empty">// upload a document or create a note</div>
                      )}
                    </section>

                    <section className="notes-home-panel">
                      <div className="ask-note-head">
                        <span>Study Health</span>
                        <strong>{reviewedToday} reviewed today</strong>
                      </div>
                      <div className="notes-health-grid">
                        <div><strong>{liveNotes.length}</strong><span>notes</span></div>
                        <div><strong>{allSavedFlashcards.length}</strong><span>cards</span></div>
                        <div><strong>{weakNotes.length}</strong><span>weak</span></div>
                      </div>
                    </section>

                    <section className="notes-home-panel">
                      <div className="ask-note-head">
                        <span>Weak Notes</span>
                        <strong>{weakNotes.length} signals</strong>
                      </div>
                      <div className="notes-home-list">
                        {weakNotes.length === 0 ? (
                          <div className="kanban-empty">// no weak notes detected</div>
                        ) : (
                          weakNotes.slice(0, 4).map((item) => (
                            <button type="button" onClick={() => {
                              setActiveNoteId(item.note.id);
                              setMode("ai");
                            }} key={item.note.id}>
                              <strong>{item.note.title}</strong>
                              <em>{item.reason}</em>
                            </button>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="notes-home-panel">
                      <div className="ask-note-head">
                        <span>Recently Updated</span>
                        <strong>{recentStudyNotes.length} notes</strong>
                      </div>
                      <div className="notes-home-list">
                        {recentStudyNotes.map((note) => (
                          <button type="button" onClick={() => {
                            setActiveNoteId(note.id);
                            setMode(note.kind === "document" ? "reading" : "writing");
                          }} key={note.id}>
                            <strong>{note.title}</strong>
                            <em>{note.kind} · {getWordCount(note.body)} words · {formatActivityTime(note.updatedAt)}</em>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              ) : mode === "writing" ? (
                <div className="writing-studio">
                  {activeDraftSignal && primaryWritingCommand && (
                    <section className={`writing-command-deck ${activeDraftSignal.tier}`}>
                      <div className="writing-command-core">
                        <span>Draft Command Deck</span>
                        <strong>{primaryWritingCommand.command}</strong>
                        <p>{getWritingCommandDirective(activeDraftSignal, primaryWritingCommand)}</p>
                      </div>
                      <div className="writing-command-grid">
                        {writingCommandDeck.map((command) => (
                          <button className={command.tone} type="button" onClick={() => appendWritingCommand(command)} key={command.id}>
                            <span>{command.title}</span>
                            <strong>{command.command}</strong>
                            <em>{command.detail}</em>
                            <i aria-label={`${command.title} readiness ${command.progress}%`}><b style={{ width: `${command.progress}%` }} /></i>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  <div className="markdown-toolbar">
                    <button type="button" onClick={() => applyMarkdown("**", "**")}>B</button>
                    <button type="button" onClick={() => applyMarkdown("*", "*")}>I</button>
                    <button type="button" onClick={() => applyMarkdown("~~", "~~")}>S</button>
                    <button type="button" onClick={() => applyMarkdown("# ")}>H1</button>
                    <button type="button" onClick={() => applyMarkdown("## ")}>H2</button>
                    <button type="button" onClick={() => applyMarkdown("### ")}>H3</button>
                    <button type="button" onClick={() => applyMarkdown("- ")}>list</button>
                    <button type="button" onClick={() => applyMarkdown("> ")}>quote</button>
                    <button type="button" onClick={() => applyMarkdown("`", "`")}>code</button>
                    <button type="button" onClick={() => updateDraftBody(`${draftBody}\n\n---\n\n`)}>rule</button>
                    <button type="button" onClick={() => updateDraftBody(`${draftBody}\n\n## Summary\n\n\n## Key Ideas\n\n- \n\n## Questions\n\n- \n`)}>study block</button>
                  </div>
                  <div className="writing-layout">
                    <section className="writing-paper">
                      <div className="writing-paper-head">
                        <span>draft</span>
                        <strong>{getReadingMinutes(draftBody)} min read</strong>
                      </div>
                      <textarea ref={editorRef} className="note-body-editor" value={draftBody} onChange={(event) => updateDraftBody(event.target.value)} placeholder="Write study notes, summaries, questions, examples..." />
                    </section>
                    <aside className="writing-sidecar">
                      <div className="writing-stats">
                        <div><strong>{getWordCount(draftBody)}</strong><span>words</span></div>
                        <div><strong>{getHeadingCount(draftBody)}</strong><span>headings</span></div>
                        <div><strong>{getChecklistCount(draftBody)}</strong><span>bullets</span></div>
                      </div>
                      <StudyOutlinePanel outline={activeNoteOutline} onJump={jumpToOutlineItem} onAddSection={addOutlineSection} />
                      <div className="study-prompts">
                        <strong>Study Prompts</strong>
                        {["What is the main idea?", "What confused me?", "What would I test myself on?", "How does this connect to my goals?"].map((prompt) => (
                          <button type="button" onClick={() => updateDraftBody(`${draftBody}\n\n### ${prompt}\n\n`)} key={prompt}>{prompt}</button>
                        ))}
                      </div>
                      <div className="live-preview-panel">
                        <span>live preview</span>
                        <div className="markdown-preview compact">{renderMarkdownPreview(draftBody)}</div>
                      </div>
                    </aside>
                  </div>
                </div>
              ) : mode === "reading" ? (
                <div className="reading-mode">
                  <div className="reading-meta">
                    <FileText />
                    <span>{activeNote.sourceName ?? activeNote.kind}</span>
                    <strong>{getReadingMinutes(activeNote.extractedText ?? activeNote.body)} min read</strong>
                  </div>
                  {activeDraftSignal && primaryReaderNode && (
                    <section className={`reading-immersion-dock ${activeDraftSignal.tier}`}>
                      <div className="reading-immersion-core">
                        <span>Immersion Dock</span>
                        <strong>{primaryReaderNode.command}</strong>
                        <p>{getReaderImmersionDirective(activeReadingProgress, activeDraftSignal, primaryReaderNode)}</p>
                        <div className="reading-immersion-progress" aria-label={`Reading sync ${activeReadingProgress}%`}>
                          <i><b style={{ width: `${activeReadingProgress}%` }} /></i>
                          <div>
                            {[25, 50, 75, 100].map((mark) => (
                              <button className={activeReadingProgress === mark ? "active" : ""} type="button" onClick={() => updateActiveReadingProgress(mark)} key={mark}>
                                {mark}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="reading-immersion-grid">
                        {readerImmersionNodes.map((node) => (
                          <button className={node.tone} type="button" onClick={() => appendReaderCapture(node)} key={node.id}>
                            <span>{node.title}</span>
                            <strong>{node.command}</strong>
                            <em>{node.detail}</em>
                            <i aria-label={`${node.title} ${node.progress}%`}><b style={{ width: `${node.progress}%` }} /></i>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  <div className="reading-layout">
                    <section className="reading-document-pane">
                      {activeNote.mimeType === "application/pdf" && activeNote.fileDataUrl ? (
                        <PdfDocumentViewer title={activeNote.title} dataUrl={activeNote.fileDataUrl} />
                      ) : (
                        <div className="document-page">
                          <div className="markdown-preview">{renderMarkdownPreview(activeNote.body)}</div>
                        </div>
                      )}
                    </section>
                    <aside className="reading-capture-panel">
                      <div className="capture-head">
                        <strong>Capture Notes</strong>
                        <span>{getWordCount(draftBody)} words</span>
                      </div>
                      <StudyOutlinePanel outline={activeNoteOutline} compact onJump={jumpToOutlineItem} onAddSection={addOutlineSection} />
                      <textarea ref={editorRef} value={draftBody} onChange={(event) => updateDraftBody(event.target.value)} placeholder="Capture summaries, questions, formulas, examples, or follow-up tasks while reading..." />
                      <div className="capture-actions">
                        {["Key idea", "Question", "Definition", "Action item"].map((label) => (
                          <button type="button" onClick={() => updateDraftBody(`${draftBody}\n\n### ${label}\n\n- `)} key={label}>{label}</button>
                        ))}
                      </div>
                    </aside>
                  </div>
                </div>
              ) : mode === "review" ? (
                <div className="review-mode">
                  {reviewForge && (
                    <section className={`review-forge-panel ${activeDraftSignal?.tier ?? ""}`}>
                      <div className="review-forge-core">
                        <span>Recall Forge</span>
                        <strong>{reviewForge.command}</strong>
                        <p>{reviewForge.directive}</p>
                        <button type="button" onClick={() => saveGeneratedFlashcards(reviewCards)} disabled={reviewCards.length === 0 || reviewForge.unsavedCount === 0}>
                          forge {reviewForge.unsavedCount} cards
                        </button>
                      </div>
                      <div className="review-forge-meter" aria-label={`Recall forge readiness ${reviewForge.readiness}%`}>
                        <i style={{ "--forge-score": `${reviewForge.readiness}%` } as CSSProperties} />
                        <strong>{reviewForge.readiness}%</strong>
                        <span>forge signal</span>
                      </div>
                      <div className="review-forge-grid">
                        {reviewForge.nodes.map((node) => (
                          <button className={node.tone} type="button" onClick={() => setMode(node.mode)} key={node.id}>
                            <span>{node.title}</span>
                            <strong>{node.value}</strong>
                            <em>{node.detail}</em>
                            <i aria-label={`${node.title} ${node.progress}%`}><b style={{ width: `${node.progress}%` }} /></i>
                          </button>
                        ))}
                      </div>
                      <div className="review-forge-lane">
                        {reviewForge.preview.length === 0 ? (
                          <div className="kanban-empty">// forge lane waiting for structure</div>
                        ) : (
                          reviewForge.preview.map((card, index) => (
                            <div className={card.saved ? "saved" : ""} key={card.key}>
                              <span>Q{String(index + 1).padStart(2, "0")} / {card.saved ? "saved" : "new"}</span>
                              <strong>{card.question}</strong>
                              <em>{card.source}</em>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )}
                  <div className="review-brief">
                    <div>
                      <span>Active Recall Deck</span>
                      <strong>{reviewCards.length} cards generated</strong>
                    </div>
                    <button type="button" onClick={() => saveGeneratedFlashcards(reviewCards)}>
                      save cards
                    </button>
                  </div>
                  {reviewCards.length === 0 ? (
                    <div className="kanban-empty">// add headings, bullets, or extracted text to generate review cards</div>
                  ) : (
                    <div className="review-card-grid">
                      {reviewCards.map((card, index) => (
                        <details className="review-card" key={`${card.question}-${index}`}>
                          <summary>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <strong>{card.question}</strong>
                          </summary>
                          <p>{card.answer}</p>
                          <em>{card.source}</em>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              ) : mode === "queue" ? (
                <div className="review-queue-mode">
                  <section className={`memory-queue-console ${memoryQueue.state}`}>
                    <div className="memory-queue-core">
                      <span>Memory Queue</span>
                      <strong>{memoryQueue.command}</strong>
                      <p>{memoryQueue.directive}</p>
                      <div>
                        <button type="button" onClick={() => setQueueRevealed(false)} disabled={!activeQueueItem}>reset card</button>
                        <button type="button" onClick={jumpToQueueSource} disabled={!activeQueueItem}>open source</button>
                      </div>
                    </div>
                    <div className="memory-queue-orb" aria-label={`Memory queue load ${memoryQueue.load}%`}>
                      <i style={{ "--queue-load": `${memoryQueue.load}%` } as CSSProperties} />
                      <strong>{memoryQueue.load}%</strong>
                      <span>load</span>
                    </div>
                    <div className="memory-queue-grid">
                      {memoryQueue.bands.map((band) => (
                        <div className={band.tone} key={band.id}>
                          <span>{band.title}</span>
                          <strong>{band.value}</strong>
                          <em>{band.detail}</em>
                          <i aria-label={`${band.title} ${band.progress}%`}><b style={{ width: `${band.progress}%` }} /></i>
                        </div>
                      ))}
                    </div>
                    <div className="memory-queue-timeline" aria-label="Seven day memory load">
                      {memoryQueue.timeline.map((day) => (
                        <div className={day.tone} key={day.id}>
                          <span>{day.label}</span>
                          <i><b style={{ height: `${day.intensity}%` }} /></i>
                          <strong>{day.count}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="queue-stats">
                    <div>
                      <span>Due Now</span>
                      <strong>{dueFlashcards.length}</strong>
                    </div>
                    <div>
                      <span>Total Cards</span>
                      <strong>{allSavedFlashcards.length}</strong>
                    </div>
                    <div>
                      <span>Known</span>
                      <strong>{allSavedFlashcards.filter((item) => item.card.difficulty === "known").length}</strong>
                    </div>
                  </div>

                  {!activeQueueItem ? (
                    <div className="queue-empty">
                      <strong>No saved flashcards yet</strong>
                      <p>Generate cards from Review or AI mode, save them to a note, and they will appear here when due.</p>
                    </div>
                  ) : (
                    <section className="queue-session-card">
                      <div className="queue-session-head">
                        <div>
                          <span>{dueFlashcards.length > 0 ? "active due card" : "next scheduled card"}</span>
                          <strong>{activeQueueItem.noteTitle}</strong>
                        </div>
                        <button type="button" onClick={jumpToQueueSource}>open source</button>
                      </div>
                      <div className="queue-question">
                        <span>{activeQueueItem.card.difficulty} · due {formatShortDate(activeQueueItem.card.dueAt)} · reviewed {activeQueueItem.card.reviewCount}</span>
                        <strong>{activeQueueItem.card.question}</strong>
                      </div>
                      {queueRevealed ? (
                        <div className="queue-answer">
                          <p>{activeQueueItem.card.answer}</p>
                          <em>{activeQueueItem.card.source}</em>
                        </div>
                      ) : (
                        <button className="queue-reveal" type="button" onClick={() => setQueueRevealed(true)}>reveal answer</button>
                      )}
                      <div className="queue-actions">
                        <button type="button" onClick={() => reviewQueueCard("again")}>again</button>
                        <button type="button" onClick={() => reviewQueueCard("learning")}>learning</button>
                        <button type="button" onClick={() => reviewQueueCard("known")}>known</button>
                      </div>
                    </section>
                  )}

                  <section className="queue-upcoming">
                    <div className="ask-note-head">
                      <span>Upcoming Review Load</span>
                      <strong>{allSavedFlashcards.length} cards tracked</strong>
                    </div>
                    {allSavedFlashcards.length === 0 ? (
                      <div className="kanban-empty">// no cards saved yet</div>
                    ) : (
                      <div className="queue-upcoming-list">
                        {allSavedFlashcards.slice(0, 8).map((item) => (
                          <button type="button" onClick={() => {
                            setActiveNoteId(item.noteId);
                            setMode("ai");
                          }} key={`${item.noteId}-${item.card.id}`}>
                            <span>{formatShortDate(item.card.dueAt)}</span>
                            <strong>{item.card.question}</strong>
                            <em>{item.noteTitle}</em>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              ) : mode === "certifications" ? (
                <div className="certification-mode">
                  <section className="certification-hero">
                    <div>
                      <span>Certification Study System</span>
                      <strong>{activeCertification ? activeCertification.folder.name : "No tracks online"}</strong>
                      <p>{activeCertification ? activeCertification.summary : "Create folders under Certifications to start building exam-ready study tracks."}</p>
                    </div>
                    <div className="certification-hero-metrics">
                      <div>
                        <strong>{activeCertification?.readiness ?? 0}%</strong>
                        <span>readiness</span>
                      </div>
                      <div>
                        <strong>{activeCertification?.daysLeftLabel ?? "set"}</strong>
                        <span>exam window</span>
                      </div>
                      <button type="button" onClick={() => activeCertification && createCertificationStudyPlan(activeCertification)} disabled={!activeCertification}>
                        create task sprint
                      </button>
                    </div>
                  </section>

                  <div className="certification-track-grid">
                    {certificationTracks.length === 0 ? (
                      <div className="kanban-empty">// no certification folders detected</div>
                    ) : (
                      certificationTracks.map((track) => (
                        <button className={`cert-track-card ${activeCertification?.folder.id === track.folder.id ? "active" : ""}`} type="button" onClick={() => openCertificationTrack(track)} key={track.folder.id}>
                          <span className={`folder-dot ${track.folder.color}`} />
                          <strong>{track.folder.name}</strong>
                          <em>{track.daysLeftLabel} · {track.documentCount} docs · {track.flashcardCount} cards</em>
                          <div className="cert-track-meter"><span style={{ width: `${track.readiness}%` }} /></div>
                          <small>{track.readiness}% ready</small>
                        </button>
                      ))
                    )}
                  </div>

                  {activeCertification && (
                    <div className="certification-detail-grid">
                      <section className="cert-panel cert-exam-panel">
                        <div className="ask-note-head">
                          <span>Exam Control</span>
                          <strong>{activeCertification.folder.name}</strong>
                        </div>
                        <label className="cert-date-control">
                          <span>Exam date</span>
                          <input
                            type="date"
                            value={activeCertification.folder.examDate ?? ""}
                            onChange={(event) => void studyFolderCrud.update(activeCertification.folder.id, { examDate: event.target.value || undefined })}
                          />
                        </label>
                        <div className="cert-score-grid">
                          <div><strong>{activeCertification.objectiveProgress}%</strong><span>objectives</span></div>
                          <div><strong>{activeCertification.reviewLoad}</strong><span>due cards</span></div>
                          <div><strong>{activeCertification.readingMinutes}</strong><span>read mins</span></div>
                        </div>
                        {certPlanStatus && <p className="cert-plan-status">{certPlanStatus}</p>}
                      </section>

                      <section className="cert-panel">
                        <div className="ask-note-head">
                          <span>Objective Map</span>
                          <strong>{activeCertification.completedObjectives}/{activeCertification.objectives.length} done</strong>
                        </div>
                        <div className="cert-objective-list">
                          {activeCertification.objectives.map((objective) => (
                            <button className={objective.done ? "done" : ""} type="button" onClick={() => toggleCertificationObjective(activeCertification.folder, objective.id)} key={objective.id}>
                              <span>{objective.done ? <Check /> : null}</span>
                              <strong>{objective.title}</strong>
                              <em>{objective.weight}%</em>
                            </button>
                          ))}
                        </div>
                        <div className="cert-objective-add">
                          <input
                            value={objectiveInput}
                            onChange={(event) => setObjectiveInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addCertificationObjective();
                              }
                            }}
                            placeholder="// add objective"
                          />
                          <button type="button" onClick={addCertificationObjective}>add</button>
                        </div>
                      </section>

                      <section className="cert-panel">
                        <div className="ask-note-head">
                          <span>Next Study Blocks</span>
                          <strong>{activeCertificationPlan.length} days</strong>
                        </div>
                        <div className="cert-plan-list">
                          {activeCertificationPlan.map((row) => (
                            <article key={row.day}>
                              <span>D{String(row.day).padStart(2, "0")}</span>
                              <strong>{row.focus}</strong>
                              <em>{row.recall}</em>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className="cert-panel">
                        <div className="ask-note-head">
                          <span>Weak Topic Radar</span>
                          <strong>{activeCertificationWeakTopics.length} signals</strong>
                        </div>
                        <div className="cert-weak-list">
                          {activeCertificationWeakTopics.map((topic) => (
                            <span key={topic}>{topic}</span>
                          ))}
                        </div>
                      </section>

                      <section className="cert-panel cert-wide">
                        <div className="ask-note-head">
                          <span>Track Library</span>
                          <strong>{activeCertification.notes.length} entries</strong>
                        </div>
                        <div className="cert-note-list">
                          {activeCertification.notes.length === 0 ? (
                            <div className="kanban-empty">// move notes and PDFs into this certification folder</div>
                          ) : (
                            activeCertification.notes.map((note) => (
                              <button type="button" onClick={() => {
                                setActiveNoteId(note.id);
                                setMode(note.kind === "document" ? "reading" : "writing");
                              }} key={note.id}>
                                <span>{note.kind}</span>
                                <strong>{note.title}</strong>
                                <em>{getWordCount(note.extractedText ?? note.body)} words · {formatActivityTime(note.updatedAt)}</em>
                              </button>
                            ))
                          )}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ai-study-console">
                  <div className="ai-study-head">
                    <div>
                      <span>AI Study Console</span>
                      <strong>{activeNote.title}</strong>
                    </div>
                    <div className="ai-study-actions">
                      <button type="button" onClick={() => setAiResult(buildLocalAiStudyAnalysis(activeNote))}>analyze note</button>
                      <button type="button" onClick={() => saveGeneratedFlashcards()}>save cards</button>
                    </div>
                  </div>
                  {aiTutorMatrix && (
                    <section className={`ai-tutor-matrix ${activeDraftSignal?.tier ?? ""}`}>
                      <div className="ai-tutor-core">
                        <span>Tutor Matrix</span>
                        <strong>{aiTutorMatrix.command}</strong>
                        <p>{aiTutorMatrix.directive}</p>
                        <div>
                          <button type="button" onClick={() => setAiResult(buildLocalAiStudyAnalysis(activeNote))}>run analysis</button>
                          <button type="button" onClick={() => setAskInput(aiTutorMatrix.primaryPrompt)}>prime ask</button>
                        </div>
                      </div>
                      <div className="ai-tutor-orb" aria-label={`Tutor matrix signal ${aiTutorMatrix.signal}%`}>
                        <i style={{ "--ai-signal": `${aiTutorMatrix.signal}%` } as CSSProperties} />
                        <strong>{aiTutorMatrix.signal}%</strong>
                        <span>signal</span>
                      </div>
                      <div className="ai-tutor-grid">
                        {aiTutorMatrix.nodes.map((node) => (
                          <button className={node.tone} type="button" onClick={() => setAskInput(node.prompt)} key={node.id}>
                            <span>{node.title}</span>
                            <strong>{node.value}</strong>
                            <em>{node.detail}</em>
                            <i aria-label={`${node.title} ${node.progress}%`}><b style={{ width: `${node.progress}%` }} /></i>
                          </button>
                        ))}
                      </div>
                      <div className="ai-tutor-prompts">
                        {aiTutorMatrix.prompts.map((prompt) => (
                          <button type="button" onClick={() => setAskInput(prompt)} key={prompt}>{prompt}</button>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="ask-note-panel">
                    <div className="ask-note-head">
                      <span>Ask Note</span>
                      <strong>{askHistory.length} exchanges</strong>
                    </div>
                    <div className="ask-note-input">
                      <input
                        value={askInput}
                        onChange={(event) => setAskInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            askActiveNote();
                          }
                        }}
                        placeholder="// ask this note or document"
                      />
                      <button type="button" onClick={askActiveNote}>ask</button>
                    </div>
                    <div className="ask-suggestions">
                      {["Summarize this for an exam", "What should I memorize?", "Make practice questions"].map((prompt) => (
                        <button type="button" onClick={() => setAskInput(prompt)} key={prompt}>{prompt}</button>
                      ))}
                    </div>
                    <div className="ask-history">
                      {askHistory.length === 0 ? (
                        <div className="kanban-empty">// ask a question to generate a study answer from this note</div>
                      ) : (
                        askHistory.slice(-4).reverse().map((message) => (
                          <article key={message.id}>
                            <span>{formatActivityTime(message.createdAt)}</span>
                            <strong>{message.question}</strong>
                            <p>{message.answer}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                  {!aiResult ? (
                    <div className="ai-empty-state">
                      <strong>Ready to analyze</strong>
                      <p>Generate summary, key terms, weak areas, flashcards, quiz questions, and action items from this note or uploaded document text.</p>
                    </div>
                  ) : (
                    <div className="ai-study-grid">
                      <section>
                        <span>Summary</span>
                        <p>{aiResult.summary}</p>
                      </section>
                      <section>
                        <span>Key Terms</span>
                        <div className="ai-chip-list">{aiResult.keyTerms.map((term) => <em key={term}>{term}</em>)}</div>
                      </section>
                      <section>
                        <span>Weak Areas</span>
                        <ul>{aiResult.weakAreas.map((item) => <li key={item}>{item}</li>)}</ul>
                      </section>
                      <section>
                        <span>Action Items</span>
                        <ul>{aiResult.actions.map((item) => <li key={item}>{item}</li>)}</ul>
                      </section>
                      <section className="ai-wide">
                        <span>Flashcards</span>
                        <div className="ai-flashcards">
                          {aiResult.flashcards.map((card) => (
                            <details key={card.question}>
                              <summary>{card.question}</summary>
                              <p>{card.answer}</p>
                            </details>
                          ))}
                        </div>
                      </section>
                      <section className="ai-wide">
                        <span>Quiz</span>
                        <ol>{aiResult.quiz.map((question) => <li key={question}>{question}</li>)}</ol>
                      </section>
                      <div className="ai-save-row">
                        <button className="ai-save-output" type="button" onClick={() => updateActive({ body: `${activeNote.body}\n\n${formatAiStudyAnalysis(aiResult)}` })}>save analysis to note</button>
                        <button className="ai-save-output" type="button" onClick={() => saveGeneratedFlashcards(aiResult.flashcards)}>save flashcards to deck</button>
                      </div>
                    </div>
                  )}
                  <section className="saved-flashcards-panel">
                    <div className="ask-note-head">
                      <span>Saved Flashcards</span>
                      <strong>{savedFlashcards.length} cards</strong>
                    </div>
                    {savedFlashcards.length === 0 ? (
                      <div className="kanban-empty">// save generated cards to start a review deck</div>
                    ) : (
                      <div className="saved-flashcards-grid">
                        {savedFlashcards.map((card) => (
                          <details className={`saved-flashcard ${card.difficulty}`} key={card.id}>
                            <summary>
                              <span>{card.difficulty}</span>
                              <strong>{card.question}</strong>
                            </summary>
                            <p>{card.answer}</p>
                            <div className="flashcard-controls">
                              <button type="button" onClick={() => updateFlashcard(card.id, { difficulty: "learning", reviewCount: card.reviewCount + 1, dueAt: addDaysIso(1) })}>learning</button>
                              <button type="button" onClick={() => updateFlashcard(card.id, { difficulty: "known", reviewCount: card.reviewCount + 1, dueAt: addDaysIso(4) })}>known</button>
                              <button type="button" onClick={() => deleteFlashcard(card.id)}>delete</button>
                            </div>
                            <em>{card.source} · due {formatShortDate(card.dueAt)} · reviewed {card.reviewCount}</em>
                          </details>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              <footer className="notes-status">
                <span>{getWordCount(activeNote.body)} words</span>
                <span>{activeNote.kind}</span>
                <span>saved {formatActivityTime(activeNote.updatedAt)}</span>
              </footer>
            </>
          ) : (
            <div className="kanban-empty">// create a note or upload a study document</div>
          )}
        </HudCard>
      </section>
      <SystemTrace label="Study notes online" />
    </>
  );
}

type StudyOutlineItem = {
  id: string;
  title: string;
  level: number;
  line: number;
  offset: number;
  words: number;
  bullets: number;
  preview: string;
  signal: number;
};

type NoteCockpitMetric = {
  id: "structure" | "recall" | "depth" | "sync";
  title: string;
  value: string;
  detail: string;
  score: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  mode: NotesMode;
};

type NoteCockpitRadar = {
  score: number;
  style: CSSProperties;
};

type NoteProtocolCard = {
  id: "structure" | "recall" | "session";
  title: string;
  command: string;
  directive: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  mode: NotesMode;
};

type NotePhaseStep = {
  id: "capture" | "structure" | "recall" | "mastery";
  title: string;
  command: string;
  progress: number;
  status: "complete" | "active" | "locked";
  tone: "cyan" | "violet" | "lime" | "amber";
  mode: NotesMode;
};

type WritingCommandCard = {
  id: "summary" | "concept-map" | "question-bank" | "recall-seed";
  title: string;
  command: string;
  detail: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  insert: string;
};

type ReaderImmersionNode = {
  id: "scan" | "capture" | "questions" | "recall";
  title: string;
  command: string;
  detail: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  insert: string;
};

type ReviewForgeNode = {
  id: "generated" | "deck" | "pressure" | "mastery";
  title: string;
  value: string;
  detail: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  mode: NotesMode;
};

type ReviewForgeStats = {
  readiness: number;
  command: string;
  directive: string;
  unsavedCount: number;
  nodes: ReviewForgeNode[];
  preview: Array<{
    key: string;
    question: string;
    source: string;
    saved: boolean;
  }>;
};

type MemoryQueueBand = {
  id: "due" | "learning" | "new" | "known";
  title: string;
  value: string;
  detail: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
};

type MemoryQueueTelemetry = {
  state: "offline" | "clear" | "pressure" | "learning";
  load: number;
  command: string;
  directive: string;
  bands: MemoryQueueBand[];
  timeline: Array<{
    id: string;
    label: string;
    count: number;
    intensity: number;
    tone: "cyan" | "violet" | "lime" | "amber";
  }>;
};

type AiTutorNode = {
  id: "context" | "questions" | "analysis" | "cards";
  title: string;
  value: string;
  detail: string;
  progress: number;
  tone: "cyan" | "violet" | "lime" | "amber";
  prompt: string;
};

type AiTutorMatrix = {
  signal: number;
  command: string;
  directive: string;
  primaryPrompt: string;
  nodes: AiTutorNode[];
  prompts: string[];
};

function StudyOutlinePanel({
  outline,
  compact = false,
  onJump,
  onAddSection,
}: {
  outline: StudyOutlineItem[];
  compact?: boolean;
  onJump: (item: StudyOutlineItem) => void;
  onAddSection: (title: string) => void;
}) {
  const templates = compact ? ["Summary", "Questions"] : ["Summary", "Key Ideas", "Practice Questions", "Weak Areas"];
  const averageSignal = outline.length ? Math.round(outline.reduce((total, item) => total + item.signal, 0) / outline.length) : 0;

  return (
    <section className={`study-outline-panel ${compact ? "compact" : ""}`}>
      <div className="study-outline-head">
        <div>
          <span>Neural Outline</span>
          <strong>{outline.length ? `${outline.length} nodes mapped` : "Waiting for structure"}</strong>
        </div>
        <em>{averageSignal}%</em>
      </div>
      {outline.length === 0 ? (
        <div className="study-outline-empty">// add headings to generate jump nodes</div>
      ) : (
        <div className="study-outline-list">
          {outline.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onJump(item)}
              style={{ "--depth": Math.min(Math.max(item.level - 1, 0), 3) } as CSSProperties}
            >
              <span>D{String(item.line + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.preview}</p>
                <small>{item.words} words · {item.bullets} bullets</small>
              </div>
              <i aria-hidden="true">
                <b style={{ width: `${item.signal}%` }} />
              </i>
            </button>
          ))}
        </div>
      )}
      <div className="study-outline-actions">
        {templates.map((template) => (
          <button type="button" onClick={() => onAddSection(template)} key={template}>+ {template}</button>
        ))}
      </div>
    </section>
  );
}

type StudyFolderTreeItem = StudyFolder & {
  depth: number;
  path: string;
  ancestorIds: string[];
  childCount: number;
  directNoteCount: number;
  noteCount: number;
  isOrphan: boolean;
};

type StudyFolderIndex = {
  tree: StudyFolderTreeItem[];
  byId: Map<string, StudyFolder>;
  itemById: Map<string, StudyFolderTreeItem>;
  childrenByParentId: Map<string, StudyFolder[]>;
  descendantIdsById: Map<string, string[]>;
  directNoteIdsByFolderId: Map<string, string[]>;
};

function buildStudyFolderIndex(folders: StudyFolder[], notes: StudyNote[]): StudyFolderIndex {
  const sortedFolders = [...folders].sort(compareStudyFolders);
  const byId = new Map(sortedFolders.map((folder) => [folder.id, folder]));
  const childrenByParentId = new Map<string, StudyFolder[]>();
  const directNoteIdsByFolderId = new Map<string, string[]>();

  notes.forEach((note) => {
    if (!note.folderId || !byId.has(note.folderId)) return;
    directNoteIdsByFolderId.set(note.folderId, [...(directNoteIdsByFolderId.get(note.folderId) ?? []), note.id]);
  });

  sortedFolders.forEach((folder) => {
    const parentId = getNormalizedStudyFolderParentId(folder, byId);
    childrenByParentId.set(parentId, [...(childrenByParentId.get(parentId) ?? []), folder]);
  });
  childrenByParentId.forEach((items) => items.sort(compareStudyFolders));

  const descendantIdsById = new Map<string, string[]>();
  function collectDescendants(folderId: string, stack = new Set<string>()): string[] {
    if (descendantIdsById.has(folderId)) return descendantIdsById.get(folderId) ?? [folderId];
    if (stack.has(folderId)) return [folderId];
    stack.add(folderId);
    const ids = new Set<string>([folderId]);
    (childrenByParentId.get(folderId) ?? []).forEach((child) => {
      if (child.id === folderId) return;
      collectDescendants(child.id, new Set(stack)).forEach((id) => ids.add(id));
    });
    const result = [...ids];
    descendantIdsById.set(folderId, result);
    return result;
  }

  sortedFolders.forEach((folder) => collectDescendants(folder.id));
  const noteCountByFolderId = new Map<string, number>();
  sortedFolders.forEach((folder) => {
    const branchIds = descendantIdsById.get(folder.id) ?? [folder.id];
    noteCountByFolderId.set(
      folder.id,
      branchIds.reduce((total, id) => total + (directNoteIdsByFolderId.get(id)?.length ?? 0), 0),
    );
  });

  const tree: StudyFolderTreeItem[] = [];
  const itemById = new Map<string, StudyFolderTreeItem>();
  const visited = new Set<string>();

  function appendFolder(folder: StudyFolder, depth: number, ancestorIds: string[], pathParts: string[], isOrphan: boolean) {
    if (visited.has(folder.id)) return;
    visited.add(folder.id);
    const nextPathParts = [...pathParts, folder.name];
    const item: StudyFolderTreeItem = {
      ...folder,
      depth,
      ancestorIds,
      path: nextPathParts.join(" / "),
      childCount: (childrenByParentId.get(folder.id) ?? []).length,
      directNoteCount: directNoteIdsByFolderId.get(folder.id)?.length ?? 0,
      noteCount: noteCountByFolderId.get(folder.id) ?? 0,
      isOrphan,
    };
    tree.push(item);
    itemById.set(folder.id, item);
    (childrenByParentId.get(folder.id) ?? []).forEach((child) => {
      appendFolder(child, depth + 1, [...ancestorIds, folder.id], nextPathParts, isOrphan);
    });
  }

  (childrenByParentId.get(STUDY_FOLDER_ROOT_ID) ?? []).forEach((folder) => appendFolder(folder, 0, [], [], false));
  sortedFolders.forEach((folder) => {
    if (!visited.has(folder.id)) appendFolder(folder, 0, [], [], true);
  });

  return { tree, byId, itemById, childrenByParentId, descendantIdsById, directNoteIdsByFolderId };
}

function getStudyFolderTree(folders: StudyFolder[], notes: StudyNote[]): StudyFolderTreeItem[] {
  return buildStudyFolderIndex(folders, notes).tree;
}

function getStudyFolderBranchIdsFromIndex(index: StudyFolderIndex, folderId: string) {
  return index.descendantIdsById.get(folderId) ?? (index.byId.has(folderId) ? [folderId] : []);
}

function getStudyFolderBranchIds(folders: StudyFolder[], folderId: string) {
  return getStudyFolderBranchIdsFromIndex(buildStudyFolderIndex(folders, []), folderId);
}

function getStudyFolderNoteCount(folders: StudyFolder[], notes: StudyNote[], folderId: string) {
  return buildStudyFolderIndex(folders, notes).itemById.get(folderId)?.noteCount ?? 0;
}

function getNormalizedStudyFolderParentId(folder: StudyFolder, foldersById: Map<string, StudyFolder>) {
  if (!folder.parentId || folder.parentId === folder.id || !foldersById.has(folder.parentId)) return STUDY_FOLDER_ROOT_ID;
  return folder.parentId;
}

function compareStudyFolders(a: StudyFolder, b: StudyFolder) {
  return a.name.localeCompare(b.name) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

function createStudyFolderId(name: string, foldersById: Map<string, StudyFolder>) {
  const base = `${Date.now()}-${slugify(name)}`;
  if (!foldersById.has(base)) return base;
  let index = 2;
  while (foldersById.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function getStudyFolderOptionLabel(folder: StudyFolderTreeItem) {
  return `${"  ".repeat(folder.depth)}${folder.depth ? "- " : ""}${folder.name}`;
}

type CertificationPlanRow = {
  day: number;
  focus: string;
  recall: string;
};

type CertificationTrack = {
  folder: StudyFolder;
  notes: StudyNote[];
  objectives: StudyObjective[];
  objectiveProgress: number;
  completedObjectives: number;
  documentCount: number;
  flashcardCount: number;
  reviewLoad: number;
  readingMinutes: number;
  readiness: number;
  daysLeftLabel: string;
  summary: string;
};

function getCertificationTracks(folders: StudyFolder[], notes: StudyNote[], existingIndex?: StudyFolderIndex): CertificationTrack[] {
  const folderIndex = existingIndex ?? buildStudyFolderIndex(folders, notes);
  const certificationRootIds = new Set(
    folders.filter((folder) => folder.name.toLowerCase().includes("certification")).map((folder) => folder.id),
  );
  const trackFolders = folders.filter((folder) => {
    const hasTrackData = Boolean(folder.examDate || folder.objectives?.length);
    const ancestors = folderIndex.itemById.get(folder.id)?.ancestorIds ?? [];
    const isCertificationChild = ancestors.some((ancestorId) => certificationRootIds.has(ancestorId));
    return hasTrackData || isCertificationChild;
  });

  return trackFolders
    .map((folder) => {
      const branchIds = new Set(getStudyFolderBranchIdsFromIndex(folderIndex, folder.id));
      const trackNotes = notes.filter((note) => note.folderId && branchIds.has(note.folderId));
      const objectives = getFolderObjectives(folder);
      const objectiveProgress = getObjectiveProgress(objectives);
      const completedObjectives = objectives.filter((objective) => objective.done).length;
      const flashcards = trackNotes.flatMap((note) => note.flashcards ?? []);
      const dueCards = flashcards.filter((card) => new Date(card.dueAt).getTime() <= Date.now() && card.difficulty !== "known");
      const knownCards = flashcards.filter((card) => card.difficulty === "known").length;
      const documentCount = trackNotes.filter((note) => note.kind === "document").length;
      const readingMinutes = trackNotes.reduce((total, note) => total + getReadingMinutes(note.extractedText ?? note.body), 0);
      const cardReadiness = flashcards.length ? Math.round((knownCards / flashcards.length) * 100) : 0;
      const libraryReadiness = Math.min(100, documentCount * 24 + Math.min(readingMinutes, 240) / 4);
      const freshnessReadiness = getFreshnessReadiness(trackNotes);
      const readiness = Math.round(objectiveProgress * 0.54 + cardReadiness * 0.24 + libraryReadiness * 0.14 + freshnessReadiness * 0.08);
      const daysLeftLabel = getExamWindowLabel(folder.examDate);

      return {
        folder,
        notes: trackNotes,
        objectives,
        objectiveProgress,
        completedObjectives,
        documentCount,
        flashcardCount: flashcards.length,
        reviewLoad: dueCards.length,
        readingMinutes,
        readiness: clamp(readiness, 0, 100),
        daysLeftLabel,
        summary: getCertificationSummary(folder, objectiveProgress, dueCards.length, trackNotes.length),
      };
    })
    .sort((a, b) => b.readiness - a.readiness || a.folder.name.localeCompare(b.folder.name));
}

function getFolderObjectives(folder: StudyFolder): StudyObjective[] {
  const objectives = folder.objectives?.length ? folder.objectives : getDefaultCertificationObjectives(folder.name);
  return objectives.map((objective, index) => ({
    id: objective.id || `objective-${index + 1}-${slugify(objective.title)}`,
    title: objective.title,
    done: Boolean(objective.done),
    weight: clamp(Math.round(objective.weight || 12), 1, 100),
  }));
}

function getDefaultCertificationObjectives(name: string): StudyObjective[] {
  const lower = name.toLowerCase();
  if (lower.includes("network")) {
    return makeStudyObjectives([
      ["Networking fundamentals", 24],
      ["IP addressing and subnetting", 22],
      ["Network implementations", 20],
      ["Operations and troubleshooting", 18],
      ["Security concepts", 16],
    ]);
  }
  if (lower.includes("security")) {
    return makeStudyObjectives([
      ["General security concepts", 22],
      ["Threats, vulnerabilities, and mitigations", 22],
      ["Security architecture", 20],
      ["Security operations", 20],
      ["Governance, risk, and compliance", 16],
    ]);
  }
  if (lower.includes("prompt")) {
    return makeStudyObjectives([
      ["Prompt patterns", 20],
      ["Evaluation loops", 22],
      ["Tool use and agents", 22],
      ["Retrieval workflows", 18],
      ["Safety and guardrails", 18],
    ]);
  }
  return makeStudyObjectives([
    ["Core vocabulary", 20],
    ["Concept map", 20],
    ["Practice questions", 20],
    ["Weak-topic review", 20],
    ["Timed review", 20],
  ]);
}

function getObjectiveProgress(objectives: StudyObjective[]) {
  const totalWeight = objectives.reduce((total, objective) => total + objective.weight, 0);
  if (totalWeight === 0) return 0;
  const completedWeight = objectives.filter((objective) => objective.done).reduce((total, objective) => total + objective.weight, 0);
  return Math.round((completedWeight / totalWeight) * 100);
}

function getExamWindowLabel(examDate?: string) {
  const parsed = parseDateInput(examDate);
  if (!parsed) return "set date";
  const daysLeft = daysBetween(new Date(), parsed);
  if (daysLeft < 0) return "past due";
  if (daysLeft === 0) return "today";
  return `${daysLeft}d left`;
}

function getFreshnessReadiness(notes: StudyNote[]) {
  if (notes.length === 0) return 0;
  const now = Date.now();
  const freshNotes = notes.filter((note) => now - new Date(note.updatedAt).getTime() <= 10 * 86400000).length;
  return Math.round((freshNotes / notes.length) * 100);
}

function getCertificationSummary(folder: StudyFolder, objectiveProgress: number, reviewLoad: number, noteCount: number) {
  if (reviewLoad > 0) return `${reviewLoad} review cards need attention before the next deep study block.`;
  if (objectiveProgress >= 80) return "Readiness is high. Shift into timed review, recall drills, and weak-topic cleanup.";
  if (noteCount === 0) return `Start by adding readings, PDFs, and handwritten notes to ${folder.name}.`;
  return "Build coverage first, then convert weak sections into flashcards and daily recall blocks.";
}

function getCertificationWeakTopics(track: CertificationTrack) {
  const objectiveSignals = track.objectives
    .filter((objective) => !objective.done)
    .sort((a, b) => b.weight - a.weight)
    .map((objective) => objective.title);
  const learningSignals = track.notes
    .flatMap((note) => (note.flashcards ?? []).filter((card) => card.difficulty !== "known").map((card) => card.source || note.title))
    .filter(Boolean);
  return Array.from(new Set([...objectiveSignals, ...learningSignals])).slice(0, 8);
}

function getCertificationStudyPlan(track: CertificationTrack, limit = 7): CertificationPlanRow[] {
  const focusPool = track.objectives.filter((objective) => !objective.done);
  const objectives = focusPool.length ? focusPool : track.objectives;
  const days = Math.max(3, Math.min(limit, Math.max(objectives.length, 3)));

  return Array.from({ length: days }, (_, index) => {
    const objective = objectives[index % Math.max(objectives.length, 1)];
    const title = objective?.title ?? "Mixed exam review";
    const documentCue = track.documentCount > 0 ? "reference one saved document" : "capture one new source";
    return {
      day: index + 1,
      focus: `${title}: read, summarize, and mark confusion points`,
      recall: `Create 5 recall prompts, ${documentCue}, then review due cards`,
    };
  });
}

type PlanningSource = {
  id: string;
  type: "certification" | "goal";
  goalId?: string;
  kindLabel: string;
  title: string;
  summary: string;
  progress: number;
  priority: Priority;
  dueDate?: Date;
  dueLabel: string;
  focusAreas: string[];
};

type PlannerRow = {
  day: number;
  date: Date;
  focus: string;
  recall: string;
  intensity: string;
  minutes: number;
};

type UnifiedPlan = {
  source: PlanningSource;
  rows: PlannerRow[];
  pressure: number;
  taskCount: number;
  calendarCount: number;
};

function getPlanningSources(goals: Goal[], folders: StudyFolder[], notes: StudyNote[]): PlanningSource[] {
  const certSources = getCertificationTracks(folders, notes).map((track): PlanningSource => {
    const weakTopics = getCertificationWeakTopics(track);
    return {
      id: `certification:${track.folder.id}`,
      type: "certification",
      kindLabel: "Certification",
      title: track.folder.name,
      summary: `${track.daysLeftLabel}. ${track.summary}`,
      progress: track.readiness,
      priority: track.readiness < 35 ? "high" : "medium",
      dueDate: parseDateInput(track.folder.examDate) ?? undefined,
      dueLabel: track.daysLeftLabel,
      focusAreas: weakTopics.length ? weakTopics : track.objectives.map((objective) => objective.title),
    };
  });

  const goalSources = sortGoals(goals).map((goal): PlanningSource => {
    const dueDate = parseGoalDueDate(goal.due) ?? undefined;
    const dueLabel = dueDate ? `${Math.max(daysBetween(new Date(), dueDate), 0)}d left` : goal.due || "no date";
    return {
      id: `goal:${goal.id}`,
      type: "goal",
      goalId: goal.id,
      kindLabel: "Goal",
      title: goal.title,
      summary: `${goal.progress}% complete. Planner will convert this objective into visible daily proof blocks.`,
      progress: goal.progress,
      priority: goal.level,
      dueDate,
      dueLabel,
      focusAreas: getGoalPlanningFocusAreas(goal),
    };
  });

  return [...certSources, ...goalSources].sort((a, b) => getPlanningPressure(b) - getPlanningPressure(a) || priorityRank[a.priority] - priorityRank[b.priority]);
}

function getGoalPlanningFocusAreas(goal: Goal) {
  const base = goal.title;
  const openMilestones = getGoalMilestones(goal).filter((milestone) => !milestone.done);
  if (openMilestones.length) {
    return openMilestones.map((milestone) => `${base}: ${milestone.title}`);
  }
  const proof = goal.progress < 35 ? "Define the smallest measurable milestone" : "Ship one visible progress artifact";
  return [
    `${base}: ${proof}`,
    `${base}: remove the next blocker`,
    `${base}: document proof of progress`,
    `${base}: review metrics and adjust scope`,
    `${base}: prepare next public or private checkpoint`,
  ];
}

function buildUnifiedPlan(source: PlanningSource, horizon: number, dailyMinutes: number): UnifiedPlan {
  const start = new Date();
  const maxByDeadline = source.dueDate ? clamp(daysBetween(start, source.dueDate) + 1, 1, horizon) : horizon;
  const rowCount = Math.max(3, Math.min(horizon, maxByDeadline));
  const pressure = getPlanningPressure(source);
  const minutes = Math.max(20, Math.min(180, dailyMinutes));
  const focusAreas = source.focusAreas.length ? source.focusAreas : ["Define next action", "Work the highest-risk blocker", "Document visible progress"];
  const rows = Array.from({ length: rowCount }, (_, index): PlannerRow => {
    const date = addDays(start, index);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const highPressure = pressure >= 70;
    const area = focusAreas[index % focusAreas.length];
    const intensity = weekend && !highPressure ? "review" : highPressure ? "deep block" : "steady build";
    const rowMinutes = intensity === "review" ? Math.max(25, Math.round(minutes * 0.55)) : minutes;
    return {
      day: index + 1,
      date,
      focus: `${source.title}: ${area}`,
      recall: getPlannerRecallPrompt(source, area, intensity),
      intensity,
      minutes: rowMinutes,
    };
  });

  return {
    source,
    rows,
    pressure,
    taskCount: rows.length * 2,
    calendarCount: rows.length,
  };
}

function getPlanningPressure(source: PlanningSource) {
  const daysLeft = source.dueDate ? Math.max(daysBetween(new Date(), source.dueDate), 0) : 45;
  const deadlinePressure = daysLeft <= 7 ? 100 : daysLeft <= 14 ? 86 : daysLeft <= 30 ? 70 : daysLeft <= 60 ? 48 : 28;
  const progressPressure = 100 - source.progress;
  const priorityPressure = source.priority === "ziftinity" ? 96 : source.priority === "high" ? 78 : source.priority === "medium" ? 52 : 34;
  return weightedScore([
    [deadlinePressure, 0.38],
    [progressPressure, 0.36],
    [priorityPressure, 0.26],
  ]);
}

function getPlannerRecallPrompt(source: PlanningSource, area: string, intensity: string) {
  if (source.type === "certification") {
    return intensity === "review"
      ? `Run recall on ${area}, update weak notes, and review due cards.`
      : `Read one source, create 5 recall prompts for ${area}, and mark one objective signal.`;
  }
  return intensity === "review"
    ? "Review progress evidence, trim scope, and choose the next visible checkpoint."
    : "Complete one measurable block, log proof, and write the next blocker.";
}

function createTaskProjectFromPlan(plan: UnifiedPlan, timestamp: number): TaskProject {
  const startDate = toDateInputValue(plan.rows[0]?.date ?? new Date());
  const endDate = toDateInputValue(plan.rows[plan.rows.length - 1]?.date ?? new Date());
  const tasksByDay = plan.rows.reduce<Record<number, ProjectTask[]>>((tasks, row) => {
    tasks[row.day] = [
      { id: `${timestamp}-${row.day}-focus`, name: row.focus, done: false },
      { id: `${timestamp}-${row.day}-recall`, name: row.recall, done: false },
    ];
    return tasks;
  }, {});

  return {
    id: `${timestamp}-${slugify(plan.source.title)}-planner-sprint`,
    name: `${plan.source.title} planner sprint`,
    goalId: plan.source.goalId,
    outcome: plan.source.type === "goal" ? `Advance ${plan.source.title} through a generated execution sprint` : undefined,
    startDate,
    endDate,
    deadlineDays: getDateRangeDays(startDate, endDate),
    currentDay: 1,
    tasksByDay,
  };
}

function createCalendarEventFromPlan(row: PlannerRow, source: PlanningSource, time: string, idSeed: number): CalendarEvent {
  return {
    id: `${idSeed}-${slugify(source.title)}-planner-d${row.day}`,
    date: toDateInputValue(row.date),
    day: row.date.getDate(),
    title: `Focus: ${source.title} D${row.day} - ${row.intensity}`,
    kind: "project",
    time,
  };
}

function createKanbanCardFromPlan(plan: UnifiedPlan, timestamp: number, linkTaskProject: boolean): KanbanCard {
  const dueDate = toDateInputValue(plan.rows[plan.rows.length - 1]?.date ?? new Date());
  return {
    id: `${timestamp}-${slugify(plan.source.title)}-planner-card`,
    title: `${plan.source.title} execution sprint`,
    description: `Planner generated ${plan.rows.length} days from ${plan.source.kindLabel.toLowerCase()} pressure ${plan.pressure}%. Use this card as the visible control point while tasks and calendar blocks carry daily execution.`,
    columnId: "planned",
    priority: plan.source.priority,
    linkedTaskProjectId: linkTaskProject ? `${timestamp}-${slugify(plan.source.title)}-planner-sprint` : undefined,
    dueDate,
    tags: ["planner", plan.source.type, slugify(plan.source.title), plan.source.goalId ?? ""].filter(Boolean),
    labels: [
      { name: "Planner", color: "violet" },
      { name: plan.source.kindLabel, color: plan.source.type === "certification" ? "cyan" : "lime" },
    ],
    subtasks: plan.rows.slice(0, 10).map((row) => ({
      id: `${timestamp}-${row.day}-subtask`,
      title: `D${row.day}: ${row.focus}`,
      done: false,
    })),
    estimateMinutes: plan.rows.reduce((total, row) => total + row.minutes, 0),
    trackedMinutes: 0,
    attachments: [],
    comments: [
      {
        id: `${timestamp}-planner-comment`,
        body: `Generated by Focus Planner on ${formatActivityTime(new Date().toISOString())}.`,
        createdAt: new Date().toISOString(),
      },
    ],
    order: timestamp,
  };
}

function sortStudyNotes(notes: StudyNote[]) {
  return [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}

function getAllSavedFlashcards(notes: StudyNote[]) {
  return notes
    .flatMap((note) =>
      (note.flashcards ?? []).map((card) => ({
        noteId: note.id,
        noteTitle: note.title || "Untitled note",
        card,
      })),
    )
    .sort((a, b) => new Date(a.card.dueAt).getTime() - new Date(b.card.dueAt).getTime());
}

function getDueFlashcards(items: ReturnType<typeof getAllSavedFlashcards>) {
  const now = Date.now();
  return items.filter((item) => new Date(item.card.dueAt).getTime() <= now);
}

function getNextScheduledFlashcard(items: ReturnType<typeof getAllSavedFlashcards>) {
  const now = Date.now();
  return items.find((item) => new Date(item.card.dueAt).getTime() > now);
}

function getMemoryQueueTelemetry(items: ReturnType<typeof getAllSavedFlashcards>): MemoryQueueTelemetry {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  const total = items.length;
  const dueNow = items.filter((item) => new Date(item.card.dueAt).getTime() <= now && item.card.difficulty !== "known").length;
  const learningCount = items.filter((item) => item.card.difficulty === "learning").length;
  const newCount = items.filter((item) => item.card.difficulty === "new").length;
  const knownCount = items.filter((item) => item.card.difficulty === "known").length;
  const reviewedTodayCount = items.filter((item) => item.card.lastReviewedAt && isToday(item.card.lastReviewedAt)).length;
  const next24Count = items.filter((item) => {
    const dueAt = new Date(item.card.dueAt).getTime();
    return dueAt > now && dueAt <= now + dayMs && item.card.difficulty !== "known";
  }).length;
  const activeCount = Math.max(total - knownCount, 0);
  const load = Math.round(clamp(dueNow * 15 + learningCount * 7 + newCount * 4 + next24Count * 4 - reviewedTodayCount * 3, 0, 100));
  const state: MemoryQueueTelemetry["state"] =
    total === 0 ? "offline" : dueNow > 0 ? "pressure" : learningCount > 0 ? "learning" : "clear";
  const command =
    state === "offline"
      ? "memory deck offline"
      : state === "pressure"
        ? "recall pressure active"
        : state === "learning"
          ? "learning loop stabilizing"
          : "memory field clear";
  const directive =
    state === "offline"
      ? "Save generated cards from Review or AI mode to bring the spaced recall system online."
      : dueNow > 0
        ? `${dueNow} card${dueNow === 1 ? "" : "s"} need recall now. Clear pressure before adding more capture.`
        : learningCount > 0
          ? "No due cards right now. Keep learning cards warm and return when the next wave unlocks."
          : "Queue is calm. Use this window to forge new cards from weak notes or continue reading.";
  const timeline = Array.from({ length: 7 }, (_, index) => {
    const start = startOfToday.getTime() + index * dayMs;
    const end = start + dayMs;
    const count = items.filter((item) => {
      const dueAt = new Date(item.card.dueAt).getTime();
      return dueAt >= start && dueAt < end && item.card.difficulty !== "known";
    }).length;
    return {
      id: `queue-day-${index}`,
      label: index === 0 ? "Today" : `D+${index}`,
      count,
      intensity: Math.round(clamp(count * 18 + (index === 0 ? dueNow * 7 : 0), 8, 100)),
      tone: count >= 5 ? "amber" : count >= 2 ? "violet" : count === 1 ? "cyan" : "lime",
    } as MemoryQueueTelemetry["timeline"][number];
  });

  return {
    state,
    load,
    command,
    directive,
    bands: [
      {
        id: "due",
        title: "Due Now",
        value: `${dueNow}`,
        detail: `${next24Count} next 24h`,
        progress: Math.round(clamp(dueNow * 18, 0, 100)),
        tone: dueNow > 3 ? "amber" : dueNow > 0 ? "violet" : "lime",
      },
      {
        id: "learning",
        title: "Learning",
        value: `${learningCount}`,
        detail: `${reviewedTodayCount} reviewed today`,
        progress: Math.round(clamp(learningCount * 14 + reviewedTodayCount * 8, 0, 100)),
        tone: learningCount > 4 ? "amber" : learningCount > 0 ? "violet" : "cyan",
      },
      {
        id: "new",
        title: "New Cards",
        value: `${newCount}`,
        detail: `${activeCount} active`,
        progress: Math.round(clamp(newCount * 12, 0, 100)),
        tone: newCount > 6 ? "amber" : newCount > 0 ? "cyan" : "lime",
      },
      {
        id: "known",
        title: "Known",
        value: `${knownCount}`,
        detail: total ? `${Math.round((knownCount / total) * 100)}% mastered` : "no deck",
        progress: total ? Math.round((knownCount / total) * 100) : 0,
        tone: total && knownCount / total >= 0.7 ? "lime" : "cyan",
      },
    ],
    timeline,
  };
}

function getWeakStudyNotes(notes: StudyNote[]) {
  const now = Date.now();
  return notes
    .map((note) => {
      const cards = note.flashcards ?? [];
      const overdue = cards.filter((card) => new Date(card.dueAt).getTime() <= now && card.difficulty !== "known").length;
      const learning = cards.filter((card) => card.difficulty === "learning").length;
      const structureGaps = getHeadingCount(note.body) < 2 || getChecklistCount(note.body) < 2;
      const reason = overdue > 0
        ? `${overdue} overdue learning card${overdue === 1 ? "" : "s"}`
        : learning > 2
          ? `${learning} cards still learning`
          : structureGaps
            ? "low structure for review"
            : "";
      const score = overdue * 3 + learning + (structureGaps ? 1 : 0);
      return { note, reason, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.note.updatedAt.localeCompare(a.note.updatedAt));
}

function PdfDocumentViewer({ title, dataUrl }: { title: string; dataUrl: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("rendering pdf...");
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;
    const renderTarget = container;
    renderTarget.innerHTML = "";
    setPageCount(0);
    setStatus("rendering pdf...");

    async function renderPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const bytes = await dataUrlToUint8Array(dataUrl);
        const pdfDocument = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;
        setPageCount(pdfDocument.numPages);
        const fitWidth = Math.max(520, Math.min(renderTarget.clientWidth - 40, 980));
        const targetWidth = fitWidth * zoom;

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.max(0.7, targetWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const pageShell = document.createElement("div");
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          pageShell.className = "pdf-page-shell";
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          pageShell.appendChild(canvas);
          if (!cancelled) renderTarget.appendChild(pageShell);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (cancelled) return;
        }
        setStatus(`${pdfDocument.numPages} page${pdfDocument.numPages === 1 ? "" : "s"} rendered`);
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "PDF render failed");
      }
    }

    void renderPdf();
    return () => {
      cancelled = true;
      renderTarget.innerHTML = "";
    };
  }, [dataUrl, zoom]);

  function adjustZoom(delta: number) {
    setZoom((value) => Math.round(clamp(value + delta, 0.7, 1.6) * 10) / 10);
  }

  return (
    <div className="pdf-document-viewer" aria-label={title}>
      <div className="pdf-viewer-toolbar">
        <div>
          <span>Document Render</span>
          <strong>{title}</strong>
          <em>{status}</em>
        </div>
        <div className="pdf-viewer-controls">
          <button type="button" onClick={() => adjustZoom(-0.1)} aria-label="Zoom out">-</button>
          <strong>{Math.round(zoom * 100)}%</strong>
          <button type="button" onClick={() => adjustZoom(0.1)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => setZoom(1)}>fit</button>
        </div>
        <div className="pdf-viewer-stats">
          <span>{pageCount || "--"} pages</span>
          <span>{Math.round(zoom * 100)} scale</span>
        </div>
      </div>
      <div className="pdf-pages" ref={containerRef} />
    </div>
  );
}

function getNoteStudySignal(note: StudyNote, folder?: Pick<StudyFolderTreeItem, "path"> | null) {
  const corpus = `${note.body}\n\n${note.extractedText ?? ""}`;
  const wordCount = getWordCount(corpus);
  const headingCount = getHeadingCount(note.body);
  const bulletCount = getChecklistCount(note.body);
  const cards = note.flashcards?.length ?? 0;
  const askCount = note.askHistory?.length ?? 0;
  const progress = Math.round(clamp(note.readingProgress ?? 0, 0, 100));
  const readingMins = getReadingMinutes(corpus);
  const structureScore = Math.min(24, headingCount * 7 + bulletCount * 1.35);
  const recallScore = Math.min(30, cards * 5 + askCount * 3);
  const depthScore = Math.min(24, wordCount / 55);
  const documentScore = note.kind === "document" ? 10 : 5;
  const freshnessScore = isRecentNote(note) ? 12 : 4;
  const progressScore = Math.min(10, progress / 10);
  const score = Math.round(clamp(structureScore + recallScore + depthScore + documentScore + freshnessScore + progressScore, 6, 100));
  const tier = score >= 78 ? "prime" : score >= 52 ? "building" : "thin";
  const headline =
    tier === "prime"
      ? "Exam-ready study packet"
      : tier === "building"
        ? "Knowledge node is forming"
        : note.kind === "document"
          ? "Document needs capture work"
          : "Thin note needs structure";
  const directive =
    tier === "prime"
      ? "This note has enough structure and recall material to support review sessions."
      : cards === 0
        ? "Add flashcards from Review or AI mode so this material can enter the spaced recall queue."
        : headingCount === 0
          ? "Add headings to turn the raw note into a scannable study map."
          : "Add a summary, definitions, or questions to strengthen the next review cycle.";

  return {
    score,
    tier,
    headline,
    directive,
    folderPath: folder?.path ?? "Uncategorized",
    wordCount,
    readingMins,
    progress,
    headings: headingCount,
    bullets: bulletCount,
    cards,
    askCount,
  };
}

function getNoteCockpitProtocol(signal: ReturnType<typeof getNoteStudySignal>) {
  if (signal.tier === "prime") return "Review-ready protocol";
  if (signal.cards === 0) return "Recall construction needed";
  if (signal.headings === 0) return "Structure pass required";
  if (signal.progress < 50) return "Deep-read sync open";
  return "Strengthen weak concepts";
}

function getNoteCockpitMetrics(note: StudyNote, signal: ReturnType<typeof getNoteStudySignal>): NoteCockpitMetric[] {
  const structureScore = Math.round(clamp(signal.headings * 18 + signal.bullets * 4, 0, 100));
  const recallScore = Math.round(clamp(signal.cards * 14 + signal.askCount * 9, 0, 100));
  const depthScore = Math.round(clamp(signal.wordCount / 9 + (note.kind === "document" ? 12 : 0), 0, 100));
  return [
    {
      id: "structure",
      title: "Structure",
      value: `${signal.headings}/${signal.bullets}`,
      detail: "heads / bullets",
      score: structureScore,
      tone: structureScore >= 70 ? "lime" : structureScore >= 36 ? "cyan" : "amber",
      mode: "writing",
    },
    {
      id: "recall",
      title: "Recall",
      value: `${signal.cards}`,
      detail: `${signal.askCount} asks logged`,
      score: recallScore,
      tone: recallScore >= 70 ? "lime" : recallScore >= 32 ? "violet" : "amber",
      mode: signal.cards > 0 ? "queue" : "review",
    },
    {
      id: "depth",
      title: "Depth",
      value: `${signal.readingMins}m`,
      detail: `${signal.wordCount} words`,
      score: depthScore,
      tone: depthScore >= 70 ? "lime" : "cyan",
      mode: note.kind === "document" ? "reading" : "writing",
    },
    {
      id: "sync",
      title: "Session",
      value: `${signal.progress}%`,
      detail: signal.progress >= 100 ? "sealed pass" : "sync progress",
      score: signal.progress,
      tone: signal.progress >= 75 ? "lime" : signal.progress >= 35 ? "violet" : "cyan",
      mode: "reading",
    },
  ];
}

function getNoteCockpitRadar(metrics: NoteCockpitMetric[]): NoteCockpitRadar {
  const scoreById = new Map(metrics.map((metric) => [metric.id, metric.score]));
  const radius = 0.42;
  const structure = scoreById.get("structure") ?? 0;
  const recall = scoreById.get("recall") ?? 0;
  const depth = scoreById.get("depth") ?? 0;
  const sync = scoreById.get("sync") ?? 0;
  const points = [
    `50% ${50 - structure * radius}%`,
    `${50 + recall * radius}% 50%`,
    `50% ${50 + depth * radius}%`,
    `${50 - sync * radius}% 50%`,
  ].join(", ");

  return {
    score: Math.round(metrics.reduce((total, metric) => total + metric.score, 0) / Math.max(metrics.length, 1)),
    style: { clipPath: `polygon(${points})` },
  };
}

function getNoteProtocolStack(signal: ReturnType<typeof getNoteStudySignal>): NoteProtocolCard[] {
  const structureProgress = Math.round(clamp(signal.headings * 18 + signal.bullets * 4, 0, 100));
  const recallProgress = Math.round(clamp(signal.cards * 14 + signal.askCount * 9, 0, 100));
  return [
    {
      id: "structure",
      title: "Structure Protocol",
      command: signal.headings === 0 ? "map skeleton" : signal.bullets < 3 ? "add anchors" : "tighten map",
      directive:
        signal.headings === 0
          ? "Create clear headings before this note enters serious review."
          : signal.bullets < 3
            ? "Add bullet anchors for definitions, examples, and weak terms."
            : "Structure is usable. Add summaries where sections feel thin.",
      progress: structureProgress,
      tone: structureProgress >= 70 ? "lime" : structureProgress >= 36 ? "cyan" : "amber",
      mode: "writing",
    },
    {
      id: "recall",
      title: "Recall Protocol",
      command: signal.cards === 0 ? "forge cards" : signal.askCount === 0 ? "ask note" : "run review",
      directive:
        signal.cards === 0
          ? "Turn the strongest headings and bullets into flashcards."
          : signal.askCount === 0
            ? "Ask this note one focused question to expose fuzzy areas."
            : "Recall loop is online. Push this material through queue mode.",
      progress: recallProgress,
      tone: recallProgress >= 70 ? "lime" : recallProgress >= 32 ? "violet" : "amber",
      mode: signal.cards === 0 ? "review" : signal.askCount === 0 ? "ai" : "queue",
    },
    {
      id: "session",
      title: "Session Protocol",
      command: signal.progress >= 100 ? "seal packet" : signal.progress >= 50 ? "close pass" : "sync read",
      directive:
        signal.progress >= 100
          ? "Study pass is sealed. Keep it warm through recall queue."
          : signal.progress >= 50
            ? "Capture the last weak concept before marking this session complete."
            : "Run a focused reading pass and update session progress.",
      progress: signal.progress,
      tone: signal.progress >= 75 ? "lime" : signal.progress >= 35 ? "violet" : "cyan",
      mode: signal.progress >= 100 ? "queue" : "reading",
    },
  ];
}

function getNotePhaseRail(signal: ReturnType<typeof getNoteStudySignal>): NotePhaseStep[] {
  const captureProgress = Math.round(clamp(signal.wordCount / 4 + signal.progress * 0.35, 0, 100));
  const structureProgress = Math.round(clamp(signal.headings * 20 + signal.bullets * 7, 0, 100));
  const recallProgress = Math.round(clamp(signal.cards * 16 + signal.askCount * 11, 0, 100));
  const masteryProgress = Math.round(clamp(signal.score * 0.72 + signal.progress * 0.28, 0, 100));
  const stages: NotePhaseStep[] = [
    {
      id: "capture",
      title: "Capture",
      command: signal.wordCount > 0 ? "signal acquired" : "capture source",
      progress: captureProgress,
      status: captureProgress >= 25 ? "complete" : "active",
      tone: "cyan",
      mode: "writing",
    },
    {
      id: "structure",
      title: "Structure",
      command: structureProgress >= 70 ? "map stable" : "shape note",
      progress: structureProgress,
      status: structureProgress >= 70 ? "complete" : captureProgress >= 25 ? "active" : "locked",
      tone: structureProgress >= 70 ? "lime" : "amber",
      mode: "writing",
    },
    {
      id: "recall",
      title: "Recall",
      command: recallProgress >= 55 ? "recall loop" : "forge memory",
      progress: recallProgress,
      status: recallProgress >= 55 ? "complete" : structureProgress >= 36 ? "active" : "locked",
      tone: recallProgress >= 55 ? "lime" : "violet",
      mode: signal.cards > 0 ? "queue" : "review",
    },
    {
      id: "mastery",
      title: "Mastery",
      command: signal.tier === "prime" || signal.progress >= 100 ? "packet sealed" : "raise signal",
      progress: masteryProgress,
      status: signal.tier === "prime" || signal.progress >= 100 ? "complete" : recallProgress >= 30 || signal.score >= 52 ? "active" : "locked",
      tone: signal.tier === "prime" || signal.progress >= 100 ? "lime" : "cyan",
      mode: "queue",
    },
  ];

  const firstActive = stages.findIndex((stage) => stage.status === "active");
  if (firstActive === -1) return stages;
  return stages.map((stage, index) => (index > firstActive && stage.status !== "complete" ? { ...stage, status: "locked" } : stage));
}

function getWritingCommandDeck(body: string, signal: ReturnType<typeof getNoteStudySignal>): WritingCommandCard[] {
  const hasSummary = /^#{1,3}\s+summary\b/im.test(body);
  const hasQuestionSection = /^#{1,3}\s+(questions|practice questions|question bank)\b/im.test(body);
  const hasRecallSection = /^#{1,3}\s+(recall|active recall|recall cards|flashcards)\b/im.test(body);
  const questionCount = (body.match(/\?/g) ?? []).length + signal.askCount;
  const definitionSignals = (body.match(/\b(definition|means|refers to|example|because|therefore)\b/gi) ?? []).length;
  const summaryProgress = Math.round(hasSummary ? 100 : clamp(signal.wordCount / 2.2 + signal.progress * 0.18, 8, 86));
  const conceptProgress = Math.round(clamp(signal.headings * 22 + signal.bullets * 5 + definitionSignals * 7, 0, 100));
  const questionProgress = Math.round(clamp(questionCount * 18 + (hasQuestionSection ? 28 : 0), 0, 100));
  const recallProgress = Math.round(clamp(signal.cards * 20 + questionCount * 5 + (hasRecallSection ? 34 : 0), 0, 100));

  return [
    {
      id: "summary",
      title: "Summary Core",
      command: hasSummary ? "summary online" : "write signal core",
      detail: hasSummary ? "opening synthesis is mapped" : "pin the note into a compact memory hook",
      progress: summaryProgress,
      tone: summaryProgress >= 82 ? "lime" : "cyan",
      insert: "## Summary\n\n- Main signal:\n- Why it matters:\n- Memory hook:",
    },
    {
      id: "concept-map",
      title: "Concept Map",
      command: conceptProgress >= 72 ? "map reinforced" : "build concept grid",
      detail: conceptProgress >= 72 ? "structure is ready for review" : "add terms, examples, and relations",
      progress: conceptProgress,
      tone: conceptProgress >= 72 ? "lime" : "amber",
      insert: "## Concept Map\n\n- Term:\n  - Meaning:\n  - Example:\n  - Connected idea:",
    },
    {
      id: "question-bank",
      title: "Question Bank",
      command: questionProgress >= 70 ? "questions armed" : "generate prompts",
      detail: questionProgress >= 70 ? "self-test surface is active" : "turn weak concepts into testable questions",
      progress: questionProgress,
      tone: questionProgress >= 70 ? "lime" : "violet",
      insert: "## Questions\n\n- What is the core idea?\n- Why does it matter?\n- How would I recognize it in a real scenario?\n- What could confuse me later?",
    },
    {
      id: "recall-seed",
      title: "Recall Seed",
      command: recallProgress >= 68 ? "recall loop ready" : "seed active recall",
      detail: recallProgress >= 68 ? "material can enter review mode" : "shape Q/A atoms before saving cards",
      progress: recallProgress,
      tone: recallProgress >= 68 ? "lime" : "cyan",
      insert: "## Recall Seeds\n\nQ: \nA: \nSource: \n\nQ: \nA: \nSource:",
    },
  ];
}

function getWritingCommandDirective(signal: ReturnType<typeof getNoteStudySignal>, command: WritingCommandCard) {
  if (signal.wordCount < 70) return "Capture enough raw material first, then use the command deck to turn it into review-ready structure.";
  if (command.id === "summary") return "Compress this note into a high-signal opening block before expanding deeper sections.";
  if (command.id === "concept-map") return "The next upgrade is structure: make each idea scannable, connected, and easy to revisit.";
  if (command.id === "question-bank") return "Convert uncertainty into questions so the note starts training recall instead of only storing text.";
  return "Recall seeds are the bridge into review mode. Add Q/A atoms here, then generate or save cards.";
}

function getReaderImmersionNodes(note: StudyNote, signal: ReturnType<typeof getNoteStudySignal>, readingProgress: number): ReaderImmersionNode[] {
  const questionCount = (note.body.match(/\?/g) ?? []).length + signal.askCount;
  const captureProgress = Math.round(clamp(signal.headings * 16 + signal.bullets * 5 + signal.wordCount / 16, 0, 100));
  const questionProgress = Math.round(clamp(questionCount * 18 + signal.cards * 6, 0, 100));
  const recallProgress = Math.round(clamp(signal.cards * 22 + readingProgress * 0.34 + questionCount * 6, 0, 100));
  const scanProgress = Math.round(clamp(readingProgress + (note.kind === "document" ? 10 : 0), 0, 100));
  const sourceLabel = (note.sourceName ?? note.title) || "active source";

  return [
    {
      id: "scan",
      title: "Scan Pass",
      command: scanProgress >= 75 ? "deep scan stable" : "continue scan",
      detail: `${signal.readingMins} min source / ${readingProgress}% synced`,
      progress: scanProgress,
      tone: scanProgress >= 75 ? "lime" : "cyan",
      insert: `### Reading Checkpoint\n\n- Source: ${sourceLabel}\n- Progress: ${readingProgress}%\n- What I understand:\n- What still feels unclear:`,
    },
    {
      id: "capture",
      title: "Capture Density",
      command: captureProgress >= 70 ? "capture field dense" : "capture key signals",
      detail: `${signal.headings} heads / ${signal.bullets} anchors`,
      progress: captureProgress,
      tone: captureProgress >= 70 ? "lime" : "amber",
      insert: "### Key Signals\n\n- Concept:\n- Evidence or example:\n- Why it matters:\n- Connected topic:",
    },
    {
      id: "questions",
      title: "Question Charge",
      command: questionProgress >= 70 ? "questions live" : "extract questions",
      detail: `${questionCount} questions detected`,
      progress: questionProgress,
      tone: questionProgress >= 70 ? "lime" : "violet",
      insert: "### Reading Questions\n\n- What would I be tested on here?\n- Which term needs a cleaner definition?\n- What example proves I understand it?",
    },
    {
      id: "recall",
      title: "Recall Bridge",
      command: recallProgress >= 70 ? "recall bridge online" : "bridge to recall",
      detail: `${signal.cards} saved cards / ${signal.askCount} asks`,
      progress: recallProgress,
      tone: recallProgress >= 70 ? "lime" : "cyan",
      insert: "### Recall Bridge\n\nQ: \nA: \nSource: reading pass\n\nQ: \nA: \nSource: reading pass",
    },
  ];
}

function getReaderImmersionDirective(progress: number, signal: ReturnType<typeof getNoteStudySignal>, node: ReaderImmersionNode) {
  if (progress >= 100) return "Reading pass is sealed. Convert the strongest captures into review cards before moving on.";
  if (node.id === "scan") return signal.wordCount < 120 ? "Use the first pass to collect raw signal, then lock the source into checkpoints." : "Keep scanning, but mark checkpoints so the document does not become passive reading.";
  if (node.id === "capture") return "The next upgrade is density: extract terms, examples, and relations while the source is still open.";
  if (node.id === "questions") return "Questions turn reading into pressure. Capture what you would test yourself on later.";
  return "Bridge the reading session into recall now so the material survives beyond today.";
}

function getReviewForgeStats(
  cards: ReturnType<typeof buildStudyReviewCards>,
  savedCards: NonNullable<StudyNote["flashcards"]>,
  signal: ReturnType<typeof getNoteStudySignal>,
): ReviewForgeStats {
  const savedKeys = new Set(savedCards.map((card) => slugify(card.question)));
  const unsavedCount = cards.filter((card) => !savedKeys.has(slugify(card.question))).length;
  const dueNow = savedCards.filter((card) => new Date(card.dueAt).getTime() <= Date.now() && card.difficulty !== "known").length;
  const learningCount = savedCards.filter((card) => card.difficulty === "learning").length;
  const knownCount = savedCards.filter((card) => card.difficulty === "known").length;
  const generatedScore = Math.round(clamp(cards.length * 8, 0, 100));
  const deckScore = Math.round(clamp(savedCards.length * 10, 0, 100));
  const pressureScore = Math.round(clamp(100 - dueNow * 14 - learningCount * 3, 0, 100));
  const masteryScore = savedCards.length ? Math.round((knownCount / savedCards.length) * 100) : 0;
  const readiness = weightedScore([
    [signal.score, 0.28],
    [generatedScore, 0.24],
    [deckScore, 0.2],
    [pressureScore, 0.16],
    [masteryScore, 0.12],
  ]);
  const command =
    cards.length === 0
      ? "structure recall source"
      : unsavedCount > 0
        ? "forge recall deck"
        : dueNow > 0
          ? "pressure queue active"
          : masteryScore >= 70
            ? "mastery signal stable"
            : "train learning loop";
  const directive =
    cards.length === 0
      ? "Add headings, bullets, or dense notes so the forge can generate recall prompts."
      : unsavedCount > 0
        ? `${unsavedCount} generated card${unsavedCount === 1 ? "" : "s"} can be saved into the deck now.`
        : dueNow > 0
          ? `${dueNow} saved card${dueNow === 1 ? "" : "s"} need queue pressure before new capture.`
          : masteryScore >= 70
            ? "Most saved cards are known. Keep the deck warm with spaced queue passes."
            : "The deck exists. Push learning cards through queue mode until mastery rises.";

  return {
    readiness,
    command,
    directive,
    unsavedCount,
    nodes: [
      {
        id: "generated",
        title: "Generated",
        value: `${cards.length}`,
        detail: `${unsavedCount} unsaved`,
        progress: generatedScore,
        tone: cards.length >= 8 ? "lime" : cards.length >= 4 ? "cyan" : "amber",
        mode: "review",
      },
      {
        id: "deck",
        title: "Deck Mass",
        value: `${savedCards.length}`,
        detail: `${learningCount} learning`,
        progress: deckScore,
        tone: savedCards.length >= 8 ? "lime" : savedCards.length >= 3 ? "violet" : "cyan",
        mode: "queue",
      },
      {
        id: "pressure",
        title: "Queue Pressure",
        value: `${dueNow}`,
        detail: dueNow > 0 ? "due now" : "clear",
        progress: pressureScore,
        tone: dueNow > 3 ? "amber" : dueNow > 0 ? "violet" : "lime",
        mode: "queue",
      },
      {
        id: "mastery",
        title: "Mastery",
        value: `${masteryScore}%`,
        detail: `${knownCount} known`,
        progress: masteryScore,
        tone: masteryScore >= 70 ? "lime" : masteryScore >= 34 ? "cyan" : "amber",
        mode: "queue",
      },
    ],
    preview: cards.slice(0, 6).map((card) => {
      const key = slugify(card.question);
      return {
        key,
        question: truncateText(card.question, 96),
        source: card.source,
        saved: savedKeys.has(key),
      };
    }),
  };
}

function isRecentNote(note: StudyNote) {
  return Date.now() - new Date(note.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 7;
}

function getWordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function getReadingMinutes(value: string) {
  return Math.max(1, Math.ceil(getWordCount(value) / 220));
}

function getHeadingCount(value: string) {
  return value.split("\n").filter((line) => /^#{1,6}\s/.test(line.trim())).length;
}

function getChecklistCount(value: string) {
  return value.split("\n").filter((line) => /^[-*]\s/.test(line.trim())).length;
}

function getStudyOutline(value: string): StudyOutlineItem[] {
  const lines = value.split("\n");
  const headings: Array<{ title: string; level: number; line: number; offset: number }> = [];
  let offset = 0;

  lines.forEach((line, index) => {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (match) {
      headings.push({
        title: match[2].trim(),
        level: match[1].length,
        line: index,
        offset,
      });
    }
    offset += line.length + 1;
  });

  if (!headings.length) {
    const words = getWordCount(value);
    if (!words) return [];
    const bullets = getChecklistCount(value);
    return [{
      id: "outline-unstructured-capture",
      title: "Unstructured capture",
      level: 2,
      line: 0,
      offset: 0,
      words,
      bullets,
      preview: truncateText(stripMarkdown(value), 110) || "No preview yet",
      signal: Math.round(clamp(words / 4 + bullets * 10, 0, 100)),
    }];
  }

  return headings.map((heading, index) => {
    const next = headings[index + 1];
    const sectionText = lines.slice(heading.line + 1, next?.line ?? lines.length).join("\n");
    const words = getWordCount(sectionText);
    const bullets = getChecklistCount(sectionText);
    return {
      id: `outline-${heading.line}-${slugify(heading.title)}`,
      ...heading,
      words,
      bullets,
      preview: truncateText(stripMarkdown(sectionText), 110) || "Section waiting for notes",
      signal: Math.round(clamp(words / 3 + bullets * 12 + (heading.level <= 2 ? 8 : 0), 0, 100)),
    };
  }).slice(0, 12);
}

function buildStudyReviewCards(note?: StudyNote) {
  if (!note) return [];
  const source = stripMarkdown(`${note.body}\n\n${note.extractedText ?? ""}`);
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 45 && sentence.length < 260);
  const headings = note.body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,4}\s/.test(line))
    .map((line) => line.replace(/^#{1,4}\s/, ""));
  const bullets = note.body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s/.test(line))
    .map((line) => line.replace(/^[-*]\s/, ""));

  const cards = [
    ...headings.slice(0, 8).map((heading) => ({
      question: `Explain "${heading}" without looking.`,
      answer: findBestSupportingSentence(heading, sentences) || "Use your notes to answer, then tighten this section if it feels vague.",
      source: "heading recall",
    })),
    ...bullets.slice(0, 8).map((bullet) => ({
      question: `Why does this matter: ${truncateText(bullet, 72)}?`,
      answer: bullet,
      source: "bullet recall",
    })),
    ...sentences.slice(0, 8).map((sentence) => ({
      question: `What is the key takeaway from: ${truncateText(sentence, 76)}?`,
      answer: sentence,
      source: note.extractedText?.includes(sentence) ? "document text" : "note text",
    })),
  ];

  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = slugify(card.question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 14);
}

function buildLocalAiStudyAnalysis(note: StudyNote) {
  const source = stripMarkdown(`${note.body}\n\n${note.extractedText ?? ""}`);
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 35);
  const keyTerms = extractKeyTerms(source).slice(0, 10);
  const flashcards = buildStudyReviewCards(note).slice(0, 8).map((card) => ({ question: card.question, answer: card.answer }));
  const summary = sentences.slice(0, 3).join(" ") || "Add more notes or extracted document text to generate a stronger summary.";
  const weakAreas = [
    getHeadingCount(note.body) < 2 ? "Add clearer headings so the note has a study structure." : "",
    getChecklistCount(note.body) < 3 ? "Add more bullet-point takeaways for faster review." : "",
    flashcards.length < 4 ? "Add definitions, examples, or summary sections to create stronger recall cards." : "",
  ].filter(Boolean);
  return {
    summary,
    keyTerms,
    weakAreas: weakAreas.length ? weakAreas : ["Structure looks usable. Next improvement: add examples and self-test questions."],
    actions: [
      "Write a 3 sentence summary in your own words.",
      "Mark 3 concepts you could explain without looking.",
      "Turn unclear sections into questions before the next review.",
    ],
    flashcards,
    quiz: flashcards.slice(0, 6).map((card) => card.question),
  };
}

function getAiTutorMatrix(
  note: StudyNote,
  signal: ReturnType<typeof getNoteStudySignal>,
  analysis: ReturnType<typeof buildLocalAiStudyAnalysis> | null,
  askItems: NonNullable<StudyNote["askHistory"]>,
  savedCards: NonNullable<StudyNote["flashcards"]>,
): AiTutorMatrix {
  const contextProgress = Math.round(clamp(signal.wordCount / 9 + signal.headings * 10 + signal.bullets * 4, 0, 100));
  const questionProgress = Math.round(clamp(askItems.length * 18 + signal.askCount * 4, 0, 100));
  const analysisProgress = analysis
    ? Math.round(clamp(analysis.keyTerms.length * 8 + analysis.flashcards.length * 5 + analysis.weakAreas.length * 10, 0, 100))
    : 0;
  const cardProgress = Math.round(clamp(savedCards.length * 11 + signal.cards * 4, 0, 100));
  const signalScore = weightedScore([
    [signal.score, 0.28],
    [contextProgress, 0.24],
    [questionProgress, 0.16],
    [analysisProgress, 0.18],
    [cardProgress, 0.14],
  ]);
  const sourceLabel = (note.sourceName ?? note.title) || "active note";
  const primaryPrompt =
    signal.wordCount < 120
      ? "What context is missing before this note can become useful for review?"
      : analysis
        ? "What should I do next based on this analysis?"
        : "Analyze this note and identify the highest-value study moves.";
  const command =
    signal.wordCount < 80
      ? "context uplink weak"
      : !analysis
        ? "analysis pass pending"
        : askItems.length === 0
          ? "interrogation loop idle"
          : savedCards.length === 0
            ? "recall export pending"
            : "tutor matrix online";
  const directive =
    signal.wordCount < 80
      ? "Add more source text or capture notes before asking complex questions."
      : !analysis
        ? "Run analysis to extract weak areas, key terms, actions, and flashcards."
        : askItems.length === 0
          ? "Prime the ask loop with a targeted question so the note starts answering back."
          : savedCards.length === 0
            ? "Save useful AI flashcards into the deck so this insight enters spaced recall."
            : "AI study loop is active. Keep asking sharper questions and feeding the queue.";

  return {
    signal: signalScore,
    command,
    directive,
    primaryPrompt,
    nodes: [
      {
        id: "context",
        title: "Context",
        value: `${signal.readingMins}m`,
        detail: `${signal.wordCount} words / ${signal.headings} heads`,
        progress: contextProgress,
        tone: contextProgress >= 70 ? "lime" : contextProgress >= 35 ? "cyan" : "amber",
        prompt: `Summarize the strongest context from ${sourceLabel} in exam-ready language.`,
      },
      {
        id: "questions",
        title: "Ask Loop",
        value: `${askItems.length}`,
        detail: "exchanges",
        progress: questionProgress,
        tone: questionProgress >= 70 ? "lime" : questionProgress > 0 ? "violet" : "cyan",
        prompt: "Ask me one hard question from this note and explain why it matters.",
      },
      {
        id: "analysis",
        title: "Analysis",
        value: analysis ? `${analysis.keyTerms.length}` : "off",
        detail: analysis ? "terms mapped" : "not run",
        progress: analysisProgress,
        tone: analysisProgress >= 70 ? "lime" : analysis ? "violet" : "amber",
        prompt: "What are the weak areas and action items I should focus on next?",
      },
      {
        id: "cards",
        title: "Card Export",
        value: `${savedCards.length}`,
        detail: `${signal.cards} saved`,
        progress: cardProgress,
        tone: cardProgress >= 70 ? "lime" : cardProgress > 0 ? "cyan" : "amber",
        prompt: "Create five high-quality flashcards from this note with concise answers.",
      },
    ],
    prompts: [
      "Explain this like I will be tested tomorrow.",
      "Find the weakest concept and drill it.",
      "Turn this into scenario-based questions.",
      "Give me a memory hook for the top terms.",
    ],
  };
}

function answerStudyQuestion(note: StudyNote, question: string) {
  const source = stripMarkdown(`${note.body}\n\n${note.extractedText ?? ""}`);
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30 && sentence.length < 320);
  const questionTerms = question
    .toLowerCase()
    .match(/\b[a-z][a-z0-9-]{3,}\b/g)
    ?.filter((term) => !["what", "when", "where", "which", "should", "could", "would", "this", "that", "from"].includes(term)) ?? [];
  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score: questionTerms.reduce((total, term) => total + (sentence.toLowerCase().includes(term) ? 2 : 0), 0) + (sentence.includes("?") ? -1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  const strongest = ranked.filter((item) => item.score > 0).slice(0, 4).map((item) => item.sentence);
  const fallback = sentences.slice(0, 4);
  const evidence = strongest.length ? strongest : fallback;
  if (evidence.length === 0) {
    return "I need more note text or extracted document content before I can answer this well. Add a summary, paste a section, or upload a readable document.";
  }
  const keyTerms = extractKeyTerms(evidence.join(" ")).slice(0, 5);
  const directAnswer = evidence.join(" ");
  return [
    truncateText(directAnswer, 720),
    keyTerms.length ? `Focus terms: ${keyTerms.join(", ")}.` : "",
    "Study move: turn this answer into one flashcard and one example you can explain without looking.",
  ].filter(Boolean).join("\n\n");
}

function addDaysIso(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function addMinutesIso(minutes: number) {
  const next = new Date();
  next.setMinutes(next.getMinutes() + minutes);
  return next.toISOString();
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function extractKeyTerms(value: string) {
  const stop = new Set(["this", "that", "with", "from", "have", "will", "your", "about", "which", "their", "there", "when", "what", "where", "these", "those", "into", "notes", "study", "document"]);
  const counts = new Map<string, number>();
  value.toLowerCase().match(/\b[a-z][a-z0-9-]{3,}\b/g)?.forEach((word) => {
    if (stop.has(word)) return;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([word]) => word);
}

function formatAiStudyAnalysis(analysis: ReturnType<typeof buildLocalAiStudyAnalysis>) {
  return [
    "## AI Study Analysis",
    "",
    "### Summary",
    analysis.summary,
    "",
    "### Key Terms",
    ...analysis.keyTerms.map((term) => `- ${term}`),
    "",
    "### Weak Areas",
    ...analysis.weakAreas.map((area) => `- ${area}`),
    "",
    "### Action Items",
    ...analysis.actions.map((action) => `- ${action}`),
    "",
    "### Flashcards",
    ...analysis.flashcards.map((card) => `- Q: ${card.question}\n  A: ${card.answer}`),
    "",
  ].join("\n");
}

function findBestSupportingSentence(topic: string, sentences: string[]) {
  const terms = topic.toLowerCase().split(/\s+/).filter((term) => term.length > 3);
  return sentences
    .map((sentence) => ({
      sentence,
      score: terms.reduce((total, term) => total + (sentence.toLowerCase().includes(term) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.sentence;
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_~\-[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}...` : value;
}

async function readStudyFile(file: File) {
  const extension = getFileExtension(file.name);
  if (extension === "pdf" || file.type === "application/pdf") {
    const [fileDataUrl, extractedText] = await Promise.all([readFileAsDataUrl(file), extractPdfPlainText(file)]);
    return {
      kind: "pdf",
      extracted: true,
      mimeType: "application/pdf",
      fileDataUrl,
      extractedText,
      body: createPdfDocumentBody(file.name, extractedText),
    };
  }
  if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const extractedText = await extractDocxPlainText(file);
    return {
      kind: "docx",
      extracted: true,
      mimeType: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extractedText,
      body: createExtractedDocumentBody(file.name, extractedText, []),
    };
  }
  const textLike = file.type.startsWith("text/") || /\.(md|markdown|txt|csv|json|html|css|js|ts|tsx)$/i.test(file.name);
  if (!textLike) {
    return {
      kind: extension || "document",
      extracted: false,
      mimeType: file.type,
      body: createUnsupportedDocumentBody(file.name, "Preview extraction is available for PDF, DOCX, text, and markdown files right now."),
    };
  }
  const text = await file.text();
  return {
    kind: extension || "text",
    extracted: true,
    mimeType: file.type || "text/plain",
    extractedText: text,
    body: createExtractedDocumentBody(file.name, text, []),
  };
}

async function extractPdfPlainText(file: File) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const buffer = await file.arrayBuffer();
  const document = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) pageTexts.push(`### Page ${pageNumber}\n${text}`);
  }
  return pageTexts.join("\n\n");
}

async function extractDocxPlainText(file: File) {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

function createPdfDocumentBody(fileName: string, extractedText: string) {
  const searchNote = extractedText ? `\n\n<!-- Search text extracted from PDF and stored separately. -->` : "";
  return `# ${fileName}\n\n## Study Notes\n\n- \n\n## Summary\n\nWrite a short summary here.${searchNote}`;
}

function createExtractedDocumentBody(fileName: string, text: string, messages: string[]) {
  const cleanText = text.trim();
  const warnings = messages.length ? `\n\n## Extraction Notes\n${messages.map((message) => `- ${message}`).join("\n")}` : "";
  return `# ${fileName}\n\n## Study Notes\n\n- \n\n## Summary\n\nWrite a short summary here.\n\n## Extracted Text\n\n${cleanText || "_No readable text was found in this document._"}${warnings}`;
}

function createUnsupportedDocumentBody(fileName: string, reason: string) {
  return `# ${fileName}\n\nDocument uploaded for reading.\n\n> ${reason}\n\n## Study Notes\n\n- \n\n## Summary\n\nAdd your reading summary here.\n\n## Manual Highlights\n\n- `;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToUint8Array(dataUrl: string) {
  const response = await fetch(dataUrl);
  return new Uint8Array(await response.arrayBuffer());
}

function renderMarkdownPreview(markdown: string) {
  const lines = markdown.split("\n");
  const blocks: JSX.Element[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {listItems.map((item) => (
          <li dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} key={item} />
        ))}
      </ul>,
    );
    listItems = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList();
    if (!trimmed) return;
    if (trimmed === "---") {
      blocks.push(<hr key={`hr-${index}`} />);
    } else if (trimmed.startsWith("### ")) {
      blocks.push(<h3 dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed.slice(4)) }} key={index} />);
    } else if (trimmed.startsWith("## ")) {
      blocks.push(<h2 dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed.slice(3)) }} key={index} />);
    } else if (trimmed.startsWith("# ")) {
      blocks.push(<h1 dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed.slice(2)) }} key={index} />);
    } else if (trimmed.startsWith("> ")) {
      blocks.push(<blockquote dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed.slice(2)) }} key={index} />);
    } else {
      blocks.push(<p dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed) }} key={index} />);
    }
  });
  flushList();
  return blocks;
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function CalendarView({
  events,
}: {
  events: CalendarEvent[];
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = toDateInputValue(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CalendarEvent["kind"]>("meeting");
  const [time, setTime] = useState("09:00");
  const [eventDate, setEventDate] = useState(todayKey);
  const [calendarStatus, setCalendarStatus] = useState("");
  const activeDate = parseDateInput(eventDate) ?? today;
  const activeDateKey = toDateInputValue(activeDate);
  const selectedDateLocked = isPastCalendarDate(activeDate, today);
  const visibleMonthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(visibleMonth);
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const totalCalendarCells = Math.ceil((leadingEmptyDays + daysInMonth) / 7) * 7;
  const visibleMonthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const key = toDateInputValue(getEventDate(event));
      map.set(key, [...(map.get(key) ?? []), event].sort((a, b) => a.time.localeCompare(b.time)));
    });
    return map;
  }, [events]);
  const selectedEvents = eventsByDate.get(activeDateKey) ?? [];
  const visibleMonthEventCount = useMemo(
    () =>
      events.filter((event) => {
        const date = getEventDate(event);
        return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth();
      }).length,
    [events, visibleMonth],
  );
  const upcomingVisibleEvents = useMemo(() => getUpcomingEvents(events, today).slice(0, 4), [events, today]);

  function addEvent() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setCalendarStatus("Add a title before scheduling.");
      return;
    }
    const resolvedDate = parseDateInput(eventDate) ?? today;
    if (isPastCalendarDate(resolvedDate, today)) {
      setCalendarStatus("Past dates are locked. Choose today or a future date.");
      return;
    }
    const event: CalendarEvent = {
      id: `${Date.now()}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      date: toDateInputValue(resolvedDate),
      day: resolvedDate.getDate(),
      title: cleanTitle,
      kind,
      time,
    };
    void calendarCrud.add(event);
    logActivityEvent({
      domain: "calendar",
      action: "created",
      entityId: event.id,
      entityTitle: event.title,
      source: "Calendar",
      metadata: { kind: event.kind, date: event.date, time: event.time },
    });
    setTitle("");
    setCalendarStatus(`Scheduled ${cleanTitle} on ${formatUpcomingDate(resolvedDate)}.`);
  }

  function changeVisibleMonth(direction: -1 | 1) {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));
  }

  function selectCalendarDate(date: Date) {
    setEventDate(toDateInputValue(date));
    setCalendarStatus(isPastCalendarDate(date, today) ? "Viewing locked past date. New events require today or later." : "");
  }

  function handleDateInput(value: string) {
    const nextDate = parseDateInput(value);
    if (!nextDate) return;
    setEventDate(toDateInputValue(nextDate));
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setCalendarStatus(isPastCalendarDate(nextDate, today) ? "Past dates are locked. Choose today or a future date." : "");
  }

  return (
    <>
      <section className="calendar-layout">
        <HudCard className="calendar-card">
          <div className="calendar-toolbar">
            <div>
              <button type="button" onClick={() => changeVisibleMonth(-1)} aria-label="Previous month">‹</button>
              <button type="button" onClick={() => changeVisibleMonth(1)} aria-label="Next month">›</button>
              <button type="button" onClick={() => {
                setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                selectCalendarDate(today);
              }}>today</button>
              <strong>{visibleMonthLabel}</strong>
            </div>
            <span>{visibleMonthEventCount} events this month</span>
          </div>
          <div className="calendar-signal-strip">
            <span>{upcomingVisibleEvents.length} next-14-day signals</span>
            <strong>{selectedDateLocked ? "selected date locked" : "future scheduling open"}</strong>
          </div>
          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: leadingEmptyDays }, (_, index) => (
              <span className="calendar-empty" key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const gridDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const gridDateKey = toDateInputValue(gridDate);
              const dayEvents = eventsByDate.get(gridDateKey) ?? [];
              const activity = Math.min(dayEvents.length / 4, 1);
              const eventKinds = Array.from(new Set(dayEvents.map((event) => event.kind)));
              const isPast = isPastCalendarDate(gridDate, today);
              const isToday = gridDateKey === todayKey;
              const isActive = gridDateKey === activeDateKey;
              return (
                <button
                  className={`calendar-day ${isActive ? "active" : ""} ${dayEvents.length ? "has-events" : ""} ${isPast ? "past" : ""} ${isToday ? "today" : ""}`}
                  key={gridDateKey}
                  style={{ "--intensity": activity } as CSSProperties}
                  type="button"
                  onClick={() => selectCalendarDate(gridDate)}
                  aria-label={`${formatUpcomingDate(gridDate)}${isPast ? " locked" : ""}`}
                >
                  <span className="calendar-day-number">{day}</span>
                  {isPast && <span className="calendar-lock">locked</span>}
                  {isToday && <span className="calendar-today">today</span>}
                  {dayEvents.length > 0 && <em className="calendar-event-count">{dayEvents.length}</em>}
                  {eventKinds.length > 0 && (
                    <div className="calendar-event-markers" aria-label={`${dayEvents.length} events`}>
                      {eventKinds.slice(0, 5).map((eventKind) => (
                        <i className={eventKind} key={eventKind} />
                      ))}
                    </div>
                  )}
                  <div className="calendar-event-preview">
                    {dayEvents.slice(0, 2).map((event) => (
                      <small className={event.kind} key={event.id}>
                        {event.title}
                      </small>
                    ))}
                  </div>
                </button>
              );
            })}
            {Array.from({ length: totalCalendarCells - leadingEmptyDays - daysInMonth }, (_, index) => (
              <span className="calendar-empty" key={`${visibleMonthKey}-tail-${index}`} />
            ))}
          </div>
          <div className="calendar-legend">
            {["meeting", "deadline", "appointment", "project", "personal"].map((item) => (
              <span key={item}><i className={item} />{item}</span>
            ))}
          </div>
        </HudCard>

        <HudCard className="selected-day-card">
          <CardHeader title="Selected Day" meta={`${formatUpcomingDate(activeDate)}${selectedDateLocked ? " - locked" : ""}`} />
          <div className="selected-events">
            {selectedEvents.length === 0 ? (
              <p>// no events scheduled</p>
            ) : (
              selectedEvents.map((event) => (
                <div className="selected-event" key={event.id}>
                  <span>{event.time}</span>
                  <strong>{event.title}</strong>
                  <em>{event.kind}</em>
                  <button
                    type="button"
                    onClick={() => {
                      void calendarCrud.delete(event.id);
                      logActivityEvent({
                        domain: "calendar",
                        action: "deleted",
                        entityId: event.id,
                        entityTitle: event.title,
                        source: "Calendar",
                        metadata: { kind: event.kind, date: event.date, time: event.time },
                      });
                    }}
                    aria-label={`Delete ${event.title}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          {selectedDateLocked && <div className="selected-day-lock">// past date locked - create events on today or a future date</div>}
          {calendarStatus && <div className="calendar-status">{calendarStatus}</div>}
          <div className={`event-form ${selectedDateLocked ? "locked" : ""}`}>
            <input value={title} disabled={selectedDateLocked} onChange={(event) => setTitle(event.target.value)} placeholder="// new event title..." />
            <select value={kind} disabled={selectedDateLocked} onChange={(event) => setKind(event.target.value as CalendarEvent["kind"])}>
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="appointment">Appointment</option>
              <option value="project">Project</option>
              <option value="personal">Personal</option>
            </select>
            <input type="date" min={todayKey} value={eventDate} onChange={(event) => handleDateInput(event.target.value)} />
            <input value={time} disabled={selectedDateLocked} onChange={(event) => setTime(event.target.value)} placeholder="HH:MM" />
            <button type="button" disabled={selectedDateLocked} onClick={addEvent}>+ Add Event</button>
          </div>
        </HudCard>
      </section>
      <SystemTrace label="Calendar online" />
    </>
  );
}

function ProgressView({
  events,
  projects,
  calendarEvents,
  kanbanCards,
  onNavigate,
  onOpenProject,
}: {
  events: ActivityEvent[];
  projects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  onNavigate: (view: View) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const metrics = useMemo(() => getActivityDashboard(events), [events]);
  const review = useMemo(() => getWeeklyReview(events), [events]);
  const [reviewStatus, setReviewStatus] = useState("");

  async function createWeeklyReviewNote() {
    const timestamp = new Date().toISOString();
    const note: StudyNote = {
      id: `${Date.now()}-weekly-review-${slugify(review.weekLabel)}`,
      title: `Weekly Review - ${review.weekLabel}`,
      body: formatWeeklyReviewNote(review),
      tags: ["weekly-review", "activity-ledger", "reflection"],
      pinned: true,
      kind: "note",
      flashcards: [],
      askHistory: [],
      readingProgress: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await studyNoteCrud.add(note);
    logActivityEvent({
      domain: "notes",
      action: "created",
      entityId: note.id,
      entityTitle: note.title,
      source: "Weekly review engine",
      metadata: { score: review.score, eventCount: review.eventCount, productiveCount: review.productiveCount },
    });
    setReviewStatus(`Saved ${note.title} to Notes.`);
    onNavigate("notes");
  }

  async function commitWeeklyProtocol() {
    const projectName = `Weekly Protocol - ${review.weekLabel}`;
    const existing = projects.find((project) => project.name === projectName);
    const now = new Date();
    const timestamp = Date.now();
    const id = existing?.id ?? `${timestamp}-weekly-protocol-${slugify(review.weekLabel)}`;
    const startDate = parseDateInput(existing?.startDate) ?? now;
    const endDate = parseDateInput(existing?.endDate) ?? addDays(startDate, 6);
    const generatedTasksByDay: Record<number, ProjectTask[]> = {
      1: review.nextActions.map((action, index) => ({
        id: `${id}-d1-${index + 1}`,
        name: action,
        done: false,
      })),
      2: [{ id: `${id}-d2-review`, name: "Check protocol progress and remove one blocker.", done: false }],
      3: [{ id: `${id}-d3-proof`, name: "Capture visible proof from the strongest execution block.", done: false }],
      4: [{ id: `${id}-d4-friction`, name: "Resolve or shrink the biggest friction signal.", done: false }],
      5: [{ id: `${id}-d5-stack`, name: "Repeat the strongest productive domain pairing.", done: false }],
      6: [{ id: `${id}-d6-cleanup`, name: "Clear stale work from Today, Kanban, or Notes.", done: false }],
      7: [{ id: `${id}-d7-review`, name: "Run the next weekly review and save a reflection note.", done: false }],
    };
    const tasksByDay = existing?.tasksByDay ?? generatedTasksByDay;
    const project: TaskProject =
      existing ?? {
        id,
        name: projectName,
        outcome: review.headline,
        startDate: toDateInputValue(startDate),
        endDate: toDateInputValue(endDate),
        deadlineDays: 7,
        currentDay: 1,
        tasksByDay,
      };
    const protocolEvents: CalendarEvent[] = Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      const date = addDays(parseDateInput(project.startDate) ?? startDate, index);
      const dayTasks = tasksByDay[day] ?? [];
      const focus = dayTasks[0]?.name ?? "Run the weekly execution protocol.";
      return {
        id: `${id}-calendar-d${day}`,
        date: toDateInputValue(date),
        day: date.getDate(),
        title: `Protocol D${day}: ${focus}`,
        kind: day === 7 ? "deadline" : "project",
        time: day === 7 ? "17:30" : "08:30",
      };
    });
    const boardCard: KanbanCard = {
      id: `${id}-control-card`,
      title: `${projectName} control card`,
      description: `${review.headline}\n\n${review.summary}\n\nThis card tracks the weekly operating packet generated from the activity ledger. Use the linked task project for daily execution and the calendar anchors for scheduled follow-through.`,
      columnId: "planned",
      priority: review.score < 42 ? "ziftinity" : review.frictionCount > 2 ? "high" : "medium",
      linkedTaskProjectId: project.id,
      linkedDay: 1,
      dueDate: project.endDate,
      tags: ["weekly-protocol", "activity-ledger", "review"],
      labels: [
        { name: "Weekly Protocol", color: "violet" },
        { name: "Activity Ledger", color: "cyan" },
      ],
      subtasks: Object.entries(tasksByDay).flatMap(([day, tasks]) =>
        tasks.map((task) => ({
          id: `${id}-board-d${day}-${task.id}`,
          title: `D${day}: ${task.name}`,
          done: false,
        })),
      ),
      estimateMinutes: 7 * 45,
      trackedMinutes: 0,
      attachments: [],
      comments: [
        {
          id: `${id}-comment-origin`,
          body: `Generated from Weekly Review Engine with review score ${review.score}.`,
          createdAt: now.toISOString(),
        },
      ],
      order: kanbanCards.filter((card) => card.columnId === "planned" && !card.archivedAt).length + 1,
    };
    const missingEvents = protocolEvents.filter((event) => !calendarEvents.some((item) => item.id === event.id));
    const hasBoardCard = kanbanCards.some((card) => card.id === boardCard.id);
    const writes: Promise<unknown>[] = [];

    if (!existing) writes.push(taskProjectCrud.add(project));
    writes.push(...missingEvents.map((event) => calendarCrud.add(event)));
    if (!hasBoardCard) writes.push(kanbanCrud.add(boardCard));

    await Promise.all(writes);
    if (!existing || missingEvents.length > 0 || !hasBoardCard) {
      logActivityEvent({
        domain: "task",
        action: existing ? "updated" : "generated",
        entityId: project.id,
        entityTitle: project.name,
        source: "Weekly review engine",
        metadata: {
          score: review.score,
          weekLabel: review.weekLabel,
          dayCount: project.deadlineDays,
          taskCount: Object.values(tasksByDay).reduce((total, tasks) => total + tasks.length, 0),
          sidecarSync: Boolean(existing),
        },
      });
    }
    if (missingEvents.length > 0) {
      logActivityEvent({
        domain: "calendar",
        action: "generated",
        entityId: `${project.id}-calendar-anchors`,
        entityTitle: `${project.name} calendar anchors`,
        source: "Weekly review engine",
        metadata: {
          weekLabel: review.weekLabel,
          eventCount: missingEvents.length,
          startDate: project.startDate,
          endDate: project.endDate,
        },
      });
    }
    if (!hasBoardCard) logKanbanActivity({ card: boardCard, action: "created", toColumnId: boardCard.columnId });

    const destinations = [
      existing ? "existing task project" : "task project",
      missingEvents.length > 0 ? `${missingEvents.length} calendar anchors` : "",
      !hasBoardCard ? "Kanban control card" : "",
    ].filter(Boolean);
    setReviewStatus(destinations.length ? `${projectName} synced to ${destinations.join(", ")}.` : `${projectName} is already fully synced.`);
    onOpenProject(project.id);
  }

  return (
    <>
      <section className="metric-grid">
        <MetricPanel title="Activity Streak" value={String(metrics.streak)} suffix="days">
          {metrics.streak > 0 ? "Consecutive days with completed work, reviews, or accepted agent actions." : "Complete a task, habit, or flashcard review today to start the streak."}
        </MetricPanel>
        <MetricPanel title="Execution Signals" value={String(metrics.last7Count)} suffix="7d">
          {metrics.last7Count} logged actions this week across {metrics.activeDomains} active domains.
        </MetricPanel>
        <MetricPanel title="Momentum" value={metrics.momentumLabel} suffix="%">
          {metrics.momentum >= 0 ? "Behavior volume is up compared with the previous 7-day window." : "Behavior volume is down compared with the previous 7-day window."}
        </MetricPanel>
      </section>
      <section className="activity-command-grid">
        <HudCard className="activity-ledger-card">
          <CardHeader title="Activity Ledger" meta={`${events.length} total signals`} />
          <div className="activity-timeline">
            {metrics.recent.length === 0 ? (
              <div className="kanban-empty">// activity will appear after tasks, notes, calendar, board, and agents change</div>
            ) : (
              metrics.recent.map((event) => (
                <div className={`activity-row ${event.domain}`} key={event.id}>
                  <span>{formatActivityTime(event.timestamp)}</span>
                  <div>
                    <strong>{event.entityTitle}</strong>
                    <em>{formatActivityDomain(event.domain)} - {formatActivityAction(event.action)} - {event.source}</em>
                  </div>
                </div>
              ))
            )}
          </div>
        </HudCard>
        <HudCard className="activity-domain-card">
          <CardHeader title="Domain Load" meta={metrics.busiestDomain} />
          <div className="activity-domain-list">
            {metrics.domainRows.map((row) => (
              <div className="activity-domain-row" key={row.domain}>
                <span>{formatActivityDomain(row.domain)}</span>
                <strong>{row.count}</strong>
                <ProgressBar value={row.percent} />
              </div>
            ))}
          </div>
        </HudCard>
      </section>
      <HudCard className="weekly-review-card" active>
        <CardHeader title="Weekly Review Engine" meta={review.weekLabel} />
        <div className="weekly-review-hero">
          <div className="weekly-review-score">
            <strong>{review.score}</strong>
            <span>review score</span>
          </div>
          <div>
            <span className="today-eyebrow">Coach synthesis</span>
            <strong>{review.headline}</strong>
            <p>{review.summary}</p>
            <div className="weekly-review-actions">
              <button type="button" onClick={() => void createWeeklyReviewNote()}>Create Review Note</button>
              <button type="button" onClick={() => void commitWeeklyProtocol()}>Commit Protocol</button>
              <button type="button" onClick={() => onNavigate("today")}>Open Today</button>
              <button type="button" onClick={() => onNavigate("agents")}>Run Agents</button>
            </div>
            {reviewStatus && <em>{reviewStatus}</em>}
          </div>
        </div>
        <div className="weekly-review-grid">
          <section>
            <span>Wins</span>
            {review.wins.map((item) => <p key={item}>{item}</p>)}
          </section>
          <section>
            <span>Friction</span>
            {review.friction.map((item) => <p key={item}>{item}</p>)}
          </section>
          <section>
            <span>Next Protocol</span>
            {review.nextActions.map((item) => <p key={item}>{item}</p>)}
          </section>
        </div>
        <div className="weekly-day-strip" aria-label="Weekly activity distribution">
          {review.days.map((day) => (
            <div className={day.total === 0 ? "quiet" : ""} key={day.key}>
              <span>{day.label}</span>
              <strong>{day.total}</strong>
              <em>{day.productive} wins / {day.friction} slips</em>
            </div>
          ))}
        </div>
      </HudCard>
      <SystemTrace label="Progress metrics online" />
    </>
  );
}

function InsightsView({
  events,
  projects,
  calendarEvents,
  kanbanCards,
}: {
  events: ActivityEvent[];
  projects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
}) {
  const insights = useMemo(() => getBehaviorInsights(events), [events]);
  const protocolMemory = useMemo(() => getProtocolMemory(events), [events]);
  const forecastMemory = useMemo(() => getForecastBalanceMemory(events), [events]);
  const forecast = useMemo(
    () => getLoadForecast({ projects, calendarEvents, kanbanCards }),
    [calendarEvents, kanbanCards, projects],
  );

  return (
    <>
      <section className="metric-grid">
        <MetricPanel title="Best Day" value={insights.bestDay.value} suffix={insights.bestDay.suffix}>
          {insights.bestDay.copy}
        </MetricPanel>
        <MetricPanel title="Drift Source" value={insights.drift.value} suffix={insights.drift.suffix}>
          {insights.drift.copy}
        </MetricPanel>
        <MetricPanel title="Top Pair" value={insights.topPair.value} suffix={insights.topPair.suffix}>
          {insights.topPair.copy}
        </MetricPanel>
      </section>
      <HudCard className="activity-insight-card">
        <CardHeader title="Behavior Recommendations" meta={`${insights.recommendations.length} generated`} />
        <div className="activity-insight-list">
          {insights.recommendations.map((item) => (
            <article key={item.title}>
              <span>{item.signal}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </HudCard>
      <HudCard className="protocol-memory-card" active>
        <CardHeader title="Protocol Memory" meta={`${protocolMemory.shutdownCount} shutdowns`} />
        <div className="protocol-memory-hero">
          <div className="protocol-memory-score">
            <strong>{protocolMemory.score}</strong>
            <span>memory score</span>
          </div>
          <div>
            <span className="today-eyebrow">Shutdown intelligence</span>
            <strong>{protocolMemory.headline}</strong>
            <p>{protocolMemory.summary}</p>
          </div>
        </div>
        <div className="protocol-memory-grid">
          <section>
            <span>Close Rate</span>
            <strong>{protocolMemory.averageProgress}%</strong>
            <p>{protocolMemory.closedDays} sealed day{protocolMemory.closedDays === 1 ? "" : "s"} captured.</p>
          </section>
          <section>
            <span>Carry Forward</span>
            <strong>{protocolMemory.carryForwardCount}</strong>
            <p>{protocolMemory.openLoopCount} open loop{protocolMemory.openLoopCount === 1 ? "" : "s"} recorded at shutdown.</p>
          </section>
          <section>
            <span>Cadence</span>
            <strong>{protocolMemory.last7Shutdowns}</strong>
            <p>Shutdown review{protocolMemory.last7Shutdowns === 1 ? "" : "s"} logged in the last 7 days.</p>
          </section>
        </div>
        <div className="protocol-memory-list">
          {protocolMemory.recent.length === 0 ? (
            <div className="kanban-empty">// seal protocol days from Today to build memory</div>
          ) : (
            protocolMemory.recent.map((item) => (
              <div className="protocol-memory-row" key={item.id}>
                <span>{item.date}</span>
                <strong>{item.title}</strong>
                <em>{item.progress}% closed - {item.openTasks} open</em>
              </div>
            ))
          )}
        </div>
      </HudCard>
      <LoadForecastPanel forecast={forecast} compact />
      <HudCard className="protocol-memory-card forecast-memory-card" active>
        <CardHeader title="Forecast Balance Memory" meta={`${forecastMemory.balanceCount} moves`} />
        <div className="protocol-memory-hero">
          <div className="protocol-memory-score">
            <strong>{forecastMemory.score}</strong>
            <span>trust score</span>
          </div>
          <div>
            <span className="today-eyebrow">Balancer intelligence</span>
            <strong>{forecastMemory.headline}</strong>
            <p>{forecastMemory.summary}</p>
          </div>
        </div>
        <div className="protocol-memory-grid">
          <section>
            <span>Net Relief</span>
            <strong>{forecastMemory.netMoves}</strong>
            <p>{forecastMemory.balanceCount} stabilizing move{forecastMemory.balanceCount === 1 ? "" : "s"} recorded.</p>
          </section>
          <section>
            <span>Undo Rate</span>
            <strong>{forecastMemory.undoRate}%</strong>
            <p>{forecastMemory.undoCount} undo signal{forecastMemory.undoCount === 1 ? "" : "s"} from manual correction.</p>
          </section>
          <section>
            <span>7-Day Use</span>
            <strong>{forecastMemory.last7Moves}</strong>
            <p>{forecastMemory.taskMoves} task move{forecastMemory.taskMoves === 1 ? "" : "s"} and {forecastMemory.cardMoves} card shift{forecastMemory.cardMoves === 1 ? "" : "s"}.</p>
          </section>
        </div>
        <div className="protocol-memory-list">
          {forecastMemory.recent.length === 0 ? (
            <div className="kanban-empty">// use Stabilize Peak from Today to build forecast memory</div>
          ) : (
            forecastMemory.recent.map((item) => (
              <div className="protocol-memory-row" key={item.id}>
                <span>{item.date}</span>
                <strong>{item.title}</strong>
                <em>{item.type}</em>
              </div>
            ))
          )}
        </div>
      </HudCard>
      <SystemTrace label="Pattern analysis online" />
    </>
  );
}

function getActivityDashboard(events: ActivityEvent[], now = new Date()) {
  const sorted = sortActivityEvents(events);
  const currentStart = startOfDay(addDays(now, -6));
  const previousStart = startOfDay(addDays(now, -13));
  const previousEnd = startOfDay(addDays(now, -7));
  const last7 = sorted.filter((event) => new Date(event.timestamp) >= currentStart);
  const previous7 = sorted.filter((event) => {
    const date = new Date(event.timestamp);
    return date >= previousStart && date <= previousEnd;
  });
  const productiveDays = new Set(
    sorted
      .filter((event) => isProductiveActivity(event))
      .map((event) => event.dayKey),
  );
  const streak = getActivityStreak(productiveDays, now);
  const domainCounts = countBy(last7, (event) => event.domain);
  const maxDomainCount = Math.max(...Array.from(domainCounts.values()), 1);
  const domainRows = (["task", "habit", "kanban", "calendar", "notes", "agent", "goal"] as ActivityEventDomain[])
    .map((domain) => ({
      domain,
      count: domainCounts.get(domain) ?? 0,
      percent: Math.round(((domainCounts.get(domain) ?? 0) / maxDomainCount) * 100),
    }))
    .filter((row) => row.count > 0);
  const busiest = [...domainRows].sort((a, b) => b.count - a.count)[0];
  const momentum = previous7.length === 0 ? (last7.length > 0 ? 100 : 0) : Math.round(((last7.length - previous7.length) / Math.max(previous7.length, 1)) * 100);

  return {
    streak,
    last7Count: last7.length,
    activeDomains: domainRows.length,
    momentum,
    momentumLabel: `${momentum >= 0 ? "+" : ""}${momentum}`,
    recent: sorted.slice(0, 12),
    domainRows,
    busiestDomain: busiest ? formatActivityDomain(busiest.domain) : "no activity",
  };
}

function getBehaviorInsights(events: ActivityEvent[]) {
  const sorted = sortActivityEvents(events);
  const productive = sorted.filter(isProductiveActivity);
  const byWeekday = countBy(productive, (event) => new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(event.timestamp)));
  const bestDayEntry = [...byWeekday.entries()].sort((a, b) => b[1] - a[1])[0];
  const driftEvents = sorted.filter((event) => ["deferred", "reopened", "deleted"].includes(event.action));
  const driftDomain = [...countBy(driftEvents, (event) => event.domain).entries()].sort((a, b) => b[1] - a[1])[0];
  const pair = getTopActivityPair(sorted);
  const reviewCount = sorted.filter((event) => event.domain === "notes" && event.action === "reviewed").length;
  const taskCompletionCount = sorted.filter((event) => event.domain === "task" && event.action === "completed").length;
  const deferCount = sorted.filter((event) => event.action === "deferred").length;

  return {
    bestDay: {
      value: bestDayEntry?.[0] ?? "--",
      suffix: bestDayEntry ? `${bestDayEntry[1]} wins` : "no data",
      copy: bestDayEntry ? `${bestDayEntry[0]} has the strongest completion signal. Keep important work near that rhythm.` : "Complete work for a few days and this will identify your strongest day.",
    },
    drift: {
      value: driftDomain ? formatActivityDomain(driftDomain[0]).slice(0, 8) : "None",
      suffix: driftDomain ? `${driftDomain[1]} slips` : "0 slips",
      copy: driftDomain ? `${formatActivityDomain(driftDomain[0])} has the most defer/delete/reopen signals. That is where planning friction is showing up.` : "No drift source detected yet. That is exactly the kind of quiet we like.",
    },
    topPair: {
      value: pair ? pair.label : "--",
      suffix: pair ? `${pair.count} days` : "no pair",
      copy: pair ? `${pair.label} appears together most often. Build routines that intentionally stack those domains.` : "Once multiple domains happen on the same day, the strongest pair will appear here.",
    },
    recommendations: [
      {
        signal: "execution",
        title: taskCompletionCount >= reviewCount ? "Protect the task-finishing window" : "Convert study momentum into tasks",
        body: taskCompletionCount >= reviewCount
          ? "Task completion is leading the system. Add short review blocks after task wins so knowledge work keeps pace."
          : "Study reviews are active. Attach one daily task to each serious note so learning turns into shipped work.",
      },
      {
        signal: "drift",
        title: deferCount > 2 ? "Reduce tomorrow carry-forward" : "Keep deferrals scarce",
        body: deferCount > 2
          ? "Deferrals are accumulating. Split large tasks into a first visible proof step before moving them forward again."
          : "Deferrals are controlled. Keep using the Today queue as the decision point before work spreads out.",
      },
      {
        signal: "agents",
        title: "Feed this ledger into coaching",
        body: "Agent recommendations now have a behavior trail to learn from: completions, reviews, moves, deferrals, and accepted plans.",
      },
    ],
  };
}

function getProtocolMemory(events: ActivityEvent[], now = new Date()) {
  const sorted = sortActivityEvents(events);
  const shutdowns = sorted.filter((event) => event.source === "Today protocol shutdown" && event.domain === "notes");
  const carryEvents = sorted.filter((event) => event.source === "Today protocol shutdown" && event.domain === "task" && event.action === "deferred");
  const recentShutdowns = shutdowns.filter((event) => daysBetween(new Date(event.timestamp), now) <= 30);
  const last7Shutdowns = shutdowns.filter((event) => daysBetween(new Date(event.timestamp), now) <= 7).length;
  const progressValues = recentShutdowns.map((event) => getActivityNumber(event, "progress")).filter((value) => Number.isFinite(value));
  const averageProgress = Math.round(progressValues.reduce((total, value) => total + value, 0) / Math.max(progressValues.length, 1));
  const openLoopCount = recentShutdowns.reduce((total, event) => total + getActivityNumber(event, "openTasks"), 0);
  const carryForwardCount = carryEvents.reduce((total, event) => total + Math.max(1, getActivityNumber(event, "taskCount")), 0);
  const closedDays = recentShutdowns.filter((event) => getActivityNumber(event, "progress") >= 100).length;
  const score = Math.round(clamp(averageProgress * 0.54 + Math.min(last7Shutdowns, 7) * 8 - carryForwardCount * 5 - openLoopCount * 2, 0, 100));
  const headline =
    shutdowns.length === 0
      ? "No protocol memory captured yet."
      : score >= 72
        ? "Shutdown rhythm is protecting execution."
        : score >= 44
          ? "Protocol memory shows useful but leaky follow-through."
          : "Carry-forward pressure is becoming the pattern.";
  const summary =
    shutdowns.length === 0
      ? "Use Seal Day from Today to capture close rate, open loops, and tomorrow carry-forward. Those signals will train the next review cycle."
      : `${recentShutdowns.length} shutdown review${recentShutdowns.length === 1 ? "" : "s"} were captured in the last 30 days with ${averageProgress}% average close rate and ${carryForwardCount} carry-forward signal${carryForwardCount === 1 ? "" : "s"}.`;

  return {
    shutdownCount: shutdowns.length,
    recentCount: recentShutdowns.length,
    last7Shutdowns,
    averageProgress,
    openLoopCount,
    carryForwardCount,
    closedDays,
    score,
    headline,
    summary,
    recent: recentShutdowns.slice(0, 5).map((event) => ({
      id: event.id,
      title: event.entityTitle,
      date: formatTaskDate(new Date(event.timestamp)),
      progress: getActivityNumber(event, "progress"),
      openTasks: getActivityNumber(event, "openTasks"),
      projectId: String(event.metadata?.projectId ?? ""),
    })),
  };
}

function getActivityNumber(event: ActivityEvent, key: string) {
  const value = event.metadata?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getForecastBalanceMemory(events: ActivityEvent[], now = new Date()) {
  const sorted = sortActivityEvents(events);
  const balanceEvents = sorted.filter((event) => event.source === "Forecast load balancer");
  const undoEvents = sorted.filter((event) => event.source === "Forecast load balancer undo");
  const last7Start = startOfDay(addDays(now, -6));
  const last7Moves = balanceEvents.filter((event) => new Date(event.timestamp) >= last7Start).length;
  const taskMoves = balanceEvents.filter((event) => event.domain === "task").length;
  const cardMoves = balanceEvents.filter((event) => event.domain === "kanban").length;
  const balanceCount = balanceEvents.length;
  const undoCount = undoEvents.length;
  const netMoves = Math.max(0, balanceCount - undoCount);
  const undoRate = Math.round((undoCount / Math.max(balanceCount, 1)) * 100);
  const score = Math.round(clamp(58 + netMoves * 9 + Math.min(last7Moves, 5) * 4 - undoCount * 22 - Math.max(0, undoRate - 35) * 0.5, 0, 100));
  const headline =
    balanceCount === 0
      ? "No forecast balancing memory yet."
      : undoRate >= 50
        ? "Forecast automation needs calibration."
        : score >= 72
          ? "Forecast balancing is earning trust."
          : "Forecast balancing is useful but still experimental.";
  const summary =
    balanceCount === 0
      ? "Use Stabilize Peak from Today to let the app record whether automatic task/card moves actually reduce schedule pressure."
      : `${balanceCount} forecast move${balanceCount === 1 ? "" : "s"} and ${undoCount} undo signal${undoCount === 1 ? "" : "s"} are recorded. Undo rate is ${undoRate}%, with ${last7Moves} move${last7Moves === 1 ? "" : "s"} in the last 7 days.`;

  return {
    balanceCount,
    undoCount,
    undoRate,
    netMoves,
    last7Moves,
    taskMoves,
    cardMoves,
    score,
    headline,
    summary,
    recent: [...balanceEvents, ...undoEvents]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 6)
      .map((event) => ({
        id: event.id,
        date: formatTaskDate(new Date(event.timestamp)),
        title: event.entityTitle,
        type: event.source === "Forecast load balancer undo" ? "undo" : `${formatActivityDomain(event.domain)} balance`,
      })),
  };
}

type LoadForecastTone = "calm" | "active" | "loaded" | "collision";
type LoadForecastProjectSignal = {
  projectId: string;
  projectName: string;
  day: number;
  openTaskCount: number;
  totalTaskCount: number;
  openTasks: Array<{ id: string; name: string }>;
};
type LoadForecastCardSignal = {
  cardId: string;
  title: string;
  priority: Priority;
  dueDate?: string;
};
type LoadForecastDay = {
  key: string;
  date: Date;
  label: string;
  weekday: string;
  dayLabel: string;
  load: number;
  tone: LoadForecastTone;
  primaryView: View;
  openTaskCount: number;
  totalTaskCount: number;
  eventCount: number;
  dueCardCount: number;
  scheduledCount: number;
  projectSignals: LoadForecastProjectSignal[];
  cardSignals: LoadForecastCardSignal[];
  topSignals: string[];
};
type LoadForecastMitigation = {
  hasAction: boolean;
  title: string;
  summary: string;
  buttonLabel: string;
  loadReduction: number;
  peakLoadAfter: number;
  targetLoadAfter: number;
  targetDayLabel: string;
  task?: {
    projectId: string;
    projectName: string;
    taskId: string;
    taskName: string;
    fromDay: number;
    toDay: number;
    fromDate: string;
    toDate: string;
  };
  card?: {
    cardId: string;
    cardTitle: string;
    fromDate?: string;
    toDate: string;
  };
};

function getLoadForecast({
  projects,
  calendarEvents,
  kanbanCards,
  now = new Date(),
  windowDays = 14,
}: {
  projects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  now?: Date;
  windowDays?: number;
}) {
  const start = startOfDay(now);
  const normalizedProjects = projects.map(normalizeTaskProject);
  const openCards = kanbanCards.map(normalizeKanbanCard).filter((card) => card.columnId !== "done" && !card.archivedAt);
  const days: LoadForecastDay[] = Array.from({ length: windowDays }, (_, index) => {
    const date = addDays(start, index);
    const key = toDateInputValue(date);
    const projectSignals: LoadForecastProjectSignal[] = normalizedProjects
      .map((project) => {
        const day = getProjectDayForDate(project, date);
        if (!day) return null;
        const tasks = project.tasksByDay[day] ?? [];
        const openTasks = tasks.filter((task) => !task.done);
        if (tasks.length === 0 && project.currentDay !== day) return null;
        return {
          projectId: project.id,
          projectName: project.name,
          day,
          openTaskCount: openTasks.length,
          totalTaskCount: tasks.length,
          openTasks: openTasks.map((task) => ({ id: task.id, name: task.name })),
        };
      })
      .filter((signal): signal is LoadForecastProjectSignal => Boolean(signal));
    const dayEvents = calendarEvents
      .map((event) => ({ event, date: getEventDate(event) }))
      .filter((item) => toDateInputValue(item.date) === key);
    const dueCards = openCards.filter((card) => {
      const due = parseDateInput(card.dueDate);
      if (!due) return false;
      const dueKey = toDateInputValue(due);
      return dueKey === key || (index === 0 && startOfDay(due).getTime() < start.getTime());
    });
    const openTaskCount = projectSignals.reduce((total, signal) => total + signal.openTaskCount, 0);
    const totalTaskCount = projectSignals.reduce((total, signal) => total + signal.totalTaskCount, 0);
    const eventWeight = dayEvents.reduce((total, item) => total + getCalendarLoadWeight(item.event.kind), 0);
    const cardWeight = dueCards.reduce((total, card) => {
      const overdueBoost = getDueState(card.dueDate) === "overdue" ? 20 : 0;
      return total + 10 + priorityToScore(card.priority) * 0.16 + overdueBoost + (card.blockedBy ? 12 : 0);
    }, 0);
    const taskWeight = openTaskCount * 13 + Math.max(0, totalTaskCount - openTaskCount) * 2 + projectSignals.length * 3;
    const load = Math.round(clamp(taskWeight + eventWeight + cardWeight, 0, 100));
    const tone = getLoadForecastTone(load);
    const primaryView: View = cardWeight > taskWeight && cardWeight >= eventWeight ? "kanban" : eventWeight > taskWeight ? "calendar" : "tasks";
    const cardSignals = dueCards.map((card) => ({
      cardId: card.id,
      title: card.title,
      priority: card.priority,
      dueDate: card.dueDate,
    }));
    const topSignals = [
      openTaskCount ? `${openTaskCount} open task${openTaskCount === 1 ? "" : "s"}` : "",
      dayEvents.length ? `${dayEvents.length} calendar signal${dayEvents.length === 1 ? "" : "s"}` : "",
      dueCards.length ? `${dueCards.length} board due signal${dueCards.length === 1 ? "" : "s"}` : "",
      projectSignals.some((signal) => signal.projectName.startsWith("Weekly Protocol -")) ? "weekly protocol active" : "",
    ].filter(Boolean);

    return {
      key,
      date,
      label: formatUpcomingDate(date),
      weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      dayLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
      load,
      tone,
      primaryView,
      openTaskCount,
      totalTaskCount,
      eventCount: dayEvents.length,
      dueCardCount: dueCards.length,
      scheduledCount: openTaskCount + dayEvents.length + dueCards.length,
      projectSignals,
      cardSignals,
      topSignals: topSignals.length ? topSignals : ["maintenance window"],
    };
  });
  const peakDay = [...days].sort((a, b) => b.load - a.load || a.date.getTime() - b.date.getTime())[0] ?? makeEmptyForecastDay(start);
  const recoveryDay =
    days
      .filter((day) => day.key !== peakDay.key)
      .sort((a, b) => a.load - b.load || a.date.getTime() - b.date.getTime())[0] ?? peakDay;
  const averageLoad = Math.round(days.reduce((total, day) => total + day.load, 0) / Math.max(days.length, 1));
  const collisionDays = days.filter((day) => day.load >= 75).length;
  const openTaskCount = days.reduce((total, day) => total + day.openTaskCount, 0);
  const scheduledCount = days.reduce((total, day) => total + day.eventCount + day.dueCardCount, 0);
  const headline = getLoadForecastHeadline(peakDay, collisionDays, averageLoad);
  const mitigation = getLoadForecastMitigation(days, normalizedProjects, peakDay, recoveryDay);
  const nextActionTitle =
    peakDay.load >= 75
      ? `Pre-clear ${peakDay.dayLabel}`
      : averageLoad >= 55
        ? "Balance the week"
        : "Keep capacity open";
  const nextActionBody =
    peakDay.load >= 75
      ? `Move or finish one flexible item before ${peakDay.label}; that is the next predicted collision point.`
      : averageLoad >= 55
        ? `The next 14 days are moderately loaded. Use ${recoveryDay.label} as the recovery or review window.`
        : `No heavy collision is visible yet. Keep ${recoveryDay.label} protected for review and note synthesis.`;

  return {
    days,
    peakDay,
    recoveryDay,
    averageLoad,
    collisionDays,
    openTaskCount,
    scheduledCount,
    headline,
    directive: getLoadForecastDirective(peakDay, collisionDays, averageLoad),
    mitigation,
    nextActionTitle,
    nextActionBody,
  };
}

function makeEmptyForecastDay(date: Date): LoadForecastDay {
  return {
    key: toDateInputValue(date),
    date,
    label: formatUpcomingDate(date),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
    dayLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
    load: 0,
    tone: "calm" as LoadForecastTone,
    primaryView: "calendar" as View,
    openTaskCount: 0,
    totalTaskCount: 0,
    eventCount: 0,
    dueCardCount: 0,
    scheduledCount: 0,
    projectSignals: [],
    cardSignals: [],
    topSignals: ["maintenance window"],
  };
}

function getLoadForecastMitigation(
  days: LoadForecastDay[],
  projects: TaskProject[],
  peakDay: LoadForecastDay,
  recoveryDay: LoadForecastDay,
): LoadForecastMitigation {
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const taskCandidate = [...peakDay.projectSignals]
    .filter((signal) => signal.openTasks.length > 0)
    .sort((a, b) => b.openTaskCount - a.openTaskCount || b.totalTaskCount - a.totalTaskCount)[0];
  const taskTarget = taskCandidate
    ? getForecastTaskTargetDay(days, projectById.get(taskCandidate.projectId), peakDay, recoveryDay)
    : null;
  const task =
    taskCandidate && taskTarget
      ? {
          projectId: taskCandidate.projectId,
          projectName: taskCandidate.projectName,
          taskId: taskCandidate.openTasks[0].id,
          taskName: taskCandidate.openTasks[0].name,
          fromDay: taskCandidate.day,
          toDay: taskTarget.projectDay,
          fromDate: peakDay.key,
          toDate: taskTarget.day.key,
        }
      : undefined;
  const cardTarget = getForecastCardTargetDay(days, peakDay, recoveryDay);
  const cardSignal = peakDay.cardSignals[0];
  const card =
    cardSignal && cardTarget
      ? {
          cardId: cardSignal.cardId,
          cardTitle: cardSignal.title,
          fromDate: cardSignal.dueDate,
          toDate: cardTarget.key,
        }
      : undefined;
  const taskRelief = task ? 13 : 0;
  const cardRelief = cardSignal && card ? getForecastCardRelief(cardSignal) : 0;
  const loadReduction = Math.min(peakDay.load, taskRelief + cardRelief);
  const targetLoadAfter = Math.round(clamp(
    Math.max(
      task && taskTarget ? taskTarget.day.load + taskRelief : 0,
      card && cardTarget ? cardTarget.load + cardRelief : 0,
      recoveryDay.load,
    ),
    0,
    100,
  ));
  const hasAction = Boolean(task || card);
  const title = hasAction
    ? `Stabilize ${peakDay.dayLabel}`
    : "No load move needed";
  const summary = task && card
    ? `Move "${task.taskName}" to D${task.toDay} and shift "${card.cardTitle}" to ${formatShortDate(card.toDate)}.`
    : task
      ? `Move "${task.taskName}" from D${task.fromDay} to D${task.toDay}, the lowest-load project day in range.`
      : card
        ? `Shift "${card.cardTitle}" to ${formatShortDate(card.toDate)} to reduce the peak day board pressure.`
        : "The current forecast has no flexible task or due card available for automatic balancing.";

  return {
    hasAction,
    title,
    summary,
    buttonLabel: hasAction ? "Stabilize Peak" : "No Move",
    loadReduction,
    peakLoadAfter: Math.round(clamp(peakDay.load - loadReduction, 0, 100)),
    targetLoadAfter,
    targetDayLabel: task && taskTarget ? taskTarget.day.dayLabel : cardTarget.dayLabel,
    task,
    card,
  };
}

function getForecastCardRelief(card: LoadForecastCardSignal) {
  const overdueBoost = card.dueDate && getDueState(card.dueDate) === "overdue" ? 20 : 0;
  return Math.round(10 + priorityToScore(card.priority) * 0.16 + overdueBoost);
}

function getForecastTaskTargetDay(
  days: LoadForecastDay[],
  project: TaskProject | undefined,
  peakDay: LoadForecastDay,
  recoveryDay: LoadForecastDay,
) {
  if (!project) return null;
  const candidates = days
    .filter((day) => day.key !== peakDay.key)
    .map((day) => ({ day, projectDay: getProjectDayForDate(project, day.date) }))
    .filter((item): item is { day: LoadForecastDay; projectDay: number } => Boolean(item.projectDay))
    .sort((a, b) => {
      const aIsRecovery = a.day.key === recoveryDay.key ? -10 : 0;
      const bIsRecovery = b.day.key === recoveryDay.key ? -10 : 0;
      return a.day.load + aIsRecovery - (b.day.load + bIsRecovery) || Math.abs(daysBetween(peakDay.date, a.day.date)) - Math.abs(daysBetween(peakDay.date, b.day.date));
    });
  return candidates.find((item) => item.day.load <= Math.max(peakDay.load - 20, 35)) ?? candidates[0] ?? null;
}

function getForecastCardTargetDay(days: LoadForecastDay[], peakDay: LoadForecastDay, recoveryDay: LoadForecastDay) {
  const futureCandidates = days
    .filter((day) => day.key !== peakDay.key && day.date > peakDay.date)
    .sort((a, b) => a.load - b.load || a.date.getTime() - b.date.getTime());
  return futureCandidates.find((day) => day.load <= Math.max(peakDay.load - 18, 35)) ?? recoveryDay;
}

function getProjectDayForDate(project: TaskProject, date: Date) {
  const start = getProjectStartDate(project);
  const end = getProjectEndDate(project);
  if (date < startOfDay(start) || date > startOfDay(end)) return null;
  const day = daysBetween(start, date) + 1;
  const deadline = getProjectDeadlineDays(project);
  return day >= 1 && day <= deadline ? day : null;
}

function getCalendarLoadWeight(kind: CalendarEvent["kind"]) {
  if (kind === "deadline") return 28;
  if (kind === "project") return 20;
  if (kind === "meeting") return 17;
  if (kind === "appointment") return 16;
  return 10;
}

function getLoadForecastTone(load: number): LoadForecastTone {
  if (load >= 75) return "collision";
  if (load >= 55) return "loaded";
  if (load >= 30) return "active";
  return "calm";
}

function getLoadForecastHeadline(peakDay: LoadForecastDay, collisionDays: number, averageLoad: number) {
  if (collisionDays > 1) return `${collisionDays} load collisions visible in the next 14 days.`;
  if (peakDay.load >= 75) return `${peakDay.label} is the next schedule collision.`;
  if (averageLoad >= 55) return "The next two weeks are active but manageable.";
  return "Capacity is available if it stays protected.";
}

function getLoadForecastDirective(peakDay: LoadForecastDay, collisionDays: number, averageLoad: number) {
  if (collisionDays > 1) {
    return "Reduce scope before the overloaded days arrive: close small tasks early, move flexible board cards, and keep calendar anchors realistic.";
  }
  if (peakDay.load >= 75) {
    return `${peakDay.label} combines ${peakDay.topSignals.join(", ")}. Treat it as a protected execution day, not a place to add more work.`;
  }
  if (averageLoad >= 55) {
    return "Load is spread across the window. Keep task creation tied to existing goals so the week does not become noisy.";
  }
  return "The forecast is quiet. Use the slack for study review, cleanup, and one durable progress artifact.";
}

function getWeeklyReview(events: ActivityEvent[], now = new Date()) {
  const start = startOfDay(addDays(now, -6));
  const sorted = sortActivityEvents(events).filter((event) => new Date(event.timestamp) >= start);
  const productive = sorted.filter(isProductiveActivity);
  const frictionEvents = sorted.filter((event) => ["deferred", "reopened", "deleted"].includes(event.action));
  const domainCounts = countBy(sorted, (event) => event.domain);
  const strongestDomain = [...domainCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const productiveDomains = countBy(productive, (event) => event.domain);
  const strongestProductiveDomain = [...productiveDomains.entries()].sort((a, b) => b[1] - a[1])[0];
  const frictionDomain = [...countBy(frictionEvents, (event) => event.domain).entries()].sort((a, b) => b[1] - a[1])[0];
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const key = toDateInputValue(date);
    const dayEvents = sorted.filter((event) => event.dayKey === key);
    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      total: dayEvents.length,
      productive: dayEvents.filter(isProductiveActivity).length,
      friction: dayEvents.filter((event) => ["deferred", "reopened", "deleted"].includes(event.action)).length,
    };
  });
  const quietDays = days.filter((day) => day.total === 0).length;
  const score = Math.round(clamp(productive.length * 12 + sorted.length * 2 - frictionEvents.length * 8 - quietDays * 5, 0, 100));
  const weekLabel = `${formatTaskDate(start)} - ${formatTaskDate(now)}`;
  const headline =
    sorted.length === 0
      ? "No behavior data captured yet."
      : score >= 72
        ? "Strong execution week. Keep the operating rhythm."
        : score >= 42
          ? "Mixed week. Tighten the handoff between plans and proof."
          : "Recovery week. Reduce surface area and rebuild momentum.";
  const summary =
    sorted.length === 0
      ? "The review engine is waiting for ledger signals. Complete tasks, review notes, move cards, or accept agent actions to generate a meaningful recap."
      : `${sorted.length} events were logged, including ${productive.length} productive signals and ${frictionEvents.length} friction signals. ${strongestDomain ? formatActivityDomain(strongestDomain[0]) : "No domain"} carried the most activity.`;
  const wins = [
    productive.length > 0 ? `${productive.length} productive signal${productive.length === 1 ? "" : "s"} logged this week.` : "No productive signals logged yet.",
    strongestProductiveDomain ? `${formatActivityDomain(strongestProductiveDomain[0])} produced the most wins.` : "No strongest productive domain yet.",
    quietDays < 3 ? `${7 - quietDays} active day${7 - quietDays === 1 ? "" : "s"} in the week.` : "The week has several quiet days, which gives a clean baseline.",
  ];
  const friction = [
    frictionEvents.length > 0 ? `${frictionEvents.length} friction signal${frictionEvents.length === 1 ? "" : "s"} detected.` : "No defer/reopen/delete friction logged.",
    frictionDomain ? `${formatActivityDomain(frictionDomain[0])} is the main friction domain.` : "No single friction domain stands out.",
    quietDays > 0 ? `${quietDays} quiet day${quietDays === 1 ? "" : "s"} with no captured behavior.` : "No quiet days in this review window.",
  ];
  const nextActions = [
    frictionEvents.length > 2 ? "Pick one repeated deferral and shrink it into a 15-minute proof step." : "Keep deferrals rare by making Today the only place work is carried forward.",
    strongestProductiveDomain ? `Schedule one protected ${formatActivityDomain(strongestProductiveDomain[0]).toLowerCase()} block early in the day.` : "Create one small completion signal today.",
    quietDays > 2 ? "Add one daily shutdown review so low-activity days still create useful data." : "Save this review note and let agents use it as memory.",
  ];

  return {
    weekLabel,
    score,
    headline,
    summary,
    wins,
    friction,
    nextActions,
    days,
    eventCount: sorted.length,
    productiveCount: productive.length,
    frictionCount: frictionEvents.length,
  };
}

function formatWeeklyReviewNote(review: ReturnType<typeof getWeeklyReview>) {
  return [
    `# Weekly Review - ${review.weekLabel}`,
    "",
    `**Review score:** ${review.score}`,
    "",
    `## Summary`,
    "",
    review.summary,
    "",
    `## Wins`,
    ...review.wins.map((item) => `- ${item}`),
    "",
    `## Friction`,
    ...review.friction.map((item) => `- ${item}`),
    "",
    `## Next Protocol`,
    ...review.nextActions.map((item) => `- ${item}`),
    "",
    `## Day Signals`,
    ...review.days.map((day) => `- ${day.label}: ${day.total} events, ${day.productive} wins, ${day.friction} slips`),
    "",
    `## Reflection`,
    "",
    "- What did I protect well?",
    "- What kept getting moved forward?",
    "- What is the smallest proof step for tomorrow?",
  ].join("\n");
}

function sortActivityEvents(events: ActivityEvent[]) {
  return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function isProductiveActivity(event: ActivityEvent) {
  return event.action === "completed" || event.action === "reviewed" || event.action === "accepted" || event.action === "generated";
}

function getActivityStreak(dayKeys: Set<string>, now: Date) {
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const key = toDateInputValue(addDays(now, -offset));
    if (!dayKeys.has(key)) break;
    streak += 1;
  }
  return streak;
}

function getTopActivityPair(events: ActivityEvent[]) {
  const byDay = new Map<string, Set<ActivityEventDomain>>();
  events.forEach((event) => {
    if (!byDay.has(event.dayKey)) byDay.set(event.dayKey, new Set());
    byDay.get(event.dayKey)?.add(event.domain);
  });
  const pairs = new Map<string, { label: string; count: number }>();
  byDay.forEach((domains) => {
    const ordered = Array.from(domains).sort();
    for (let index = 0; index < ordered.length; index += 1) {
      for (let next = index + 1; next < ordered.length; next += 1) {
        const key = `${ordered[index]}-${ordered[next]}`;
        const label = `${formatActivityDomain(ordered[index])} > ${formatActivityDomain(ordered[next])}`;
        pairs.set(key, { label, count: (pairs.get(key)?.count ?? 0) + 1 });
      }
    }
  });
  return [...pairs.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0];
}

function countBy<T, K>(items: T[], getKey: (item: T) => K) {
  return items.reduce<Map<K, number>>((map, item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map<K, number>());
}

function formatActivityDomain(domain: ActivityEventDomain) {
  if (domain === "kanban") return "Board";
  if (domain === "notes") return "Notes";
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function formatActivityAction(action: ActivityEventAction) {
  return action.replace(/-/g, " ");
}

const agentProfiles: Array<{ id: AgentId; name: string; signal: string; description: string }> = [
  { id: "planner", name: "Planner Agent", signal: "Daily execution", description: "Breaks goals and project tabs into next actions." },
  { id: "reviewer", name: "Reviewer Agent", signal: "Weak spots", description: "Finds vague tasks, thin notes, and unfinished loops." },
  { id: "motivation", name: "Motivation Agent", signal: "Recovery", description: "Creates recovery prompts when momentum drops." },
  { id: "project", name: "Project Agent", signal: "Portfolio", description: "Suggests buildable portfolio moves from current goals." },
  { id: "discipline", name: "Discipline Agent", signal: "Drift watch", description: "Flags overdue cards, missed habits, and stale priorities." },
];

function getAgentLearningMemory(recommendations: AgentRecommendation[], activityEvents: ActivityEvent[], now = new Date()) {
  const agentEvents = activityEvents.filter((event) => event.domain === "agent");
  const runEvents = agentEvents.filter((event) => event.source === "Agents command" && event.action === "generated");
  const actionEvents = agentEvents.filter((event) => ["accepted", "dismissed"].includes(event.action));
  const outcomeImpacts = getAgentOutcomeImpacts(activityEvents, now);
  const recentStart = startOfDay(addDays(now, -13));

  const rows = agentProfiles.map((profile) => {
    const ownRecommendations = recommendations
      .filter((recommendation) => recommendation.agentId === profile.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pending = ownRecommendations.filter((recommendation) => recommendation.status === "pending").length;
    const accepted = ownRecommendations.filter((recommendation) => recommendation.status === "accepted").length;
    const dismissed = ownRecommendations.filter((recommendation) => recommendation.status === "dismissed").length;
    const actioned = accepted + dismissed;
    const precision = actioned === 0 ? 50 : Math.round((accepted / actioned) * 100);
    const scored = ownRecommendations.filter((recommendation) => typeof recommendation.score === "number");
    const confident = ownRecommendations.filter((recommendation) => typeof recommendation.confidence === "number");
    const avgScore = scored.length ? Math.round(scored.reduce((total, recommendation) => total + (recommendation.score ?? 0), 0) / scored.length) : 50;
    const avgConfidence = confident.length ? Math.round(confident.reduce((total, recommendation) => total + (recommendation.confidence ?? 0), 0) / confident.length) : 50;
    const recent = ownRecommendations.filter((recommendation) => new Date(recommendation.createdAt) >= recentStart);
    const recentAccepted = recent.filter((recommendation) => recommendation.status === "accepted").length;
    const recentDismissed = recent.filter((recommendation) => recommendation.status === "dismissed").length;
    const acceptedSources = ownRecommendations.filter((recommendation) => recommendation.status === "accepted").map((recommendation) => recommendation.source);
    const topSource = [...countBy(acceptedSources, (source) => source).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? profile.signal;
    const ownImpacts = outcomeImpacts.filter((impact) => impact.agentId === profile.id);
    const deployed = ownImpacts.length;
    const outcomes = ownImpacts.filter((impact) => impact.resolved).length;
    const staleOutcomes = ownImpacts.filter((impact) => impact.stale).length;
    const impactRate = deployed === 0 ? 50 : Math.round((outcomes / deployed) * 100);
    const recencyBoost = recent.length === 0 ? 0 : Math.min(recent.length * 5, 16);
    const noisePenalty = Math.max(0, dismissed - accepted) * 8 + Math.max(0, pending - 3) * 4;
    const outcomeAdjustment = deployed === 0 ? 0 : (impactRate - 50) * 0.18 + Math.min(outcomes * 6, 18) - staleOutcomes * 9;
    const trustScore = ownRecommendations.length === 0
      ? 56
      : Math.round(clamp(precision * 0.32 + avgConfidence * 0.18 + avgScore * 0.16 + impactRate * 0.16 + recencyBoost + recentAccepted * 8 - recentDismissed * 7 - noisePenalty + outcomeAdjustment, 0, 100));
    const state = (() => {
      if (ownRecommendations.length === 0) return "calibrating";
      if (staleOutcomes > 0) return "follow-up debt";
      if (outcomes > 0 && impactRate >= 75) return "outcome proven";
      if (trustScore >= 76) return "trusted";
      if (pending >= 4) return "queue heavy";
      if (trustScore < 42 && dismissed > accepted) return "too noisy";
      return "learning";
    })();
    const tuning = (() => {
      if (ownRecommendations.length === 0) return "Needs a few runs before the model can judge signal quality.";
      if (staleOutcomes > 0) return `${staleOutcomes} deployed action${staleOutcomes === 1 ? "" : "s"} need follow-through before trust should rise.`;
      if (outcomes > 0 && impactRate >= 75) return `${outcomes} deployed action${outcomes === 1 ? "" : "s"} produced visible follow-through.`;
      if (state === "trusted") return `Accepted signals cluster around ${topSource}; keep this agent active.`;
      if (state === "queue heavy") return "Review or dismiss old reports before asking for more output.";
      if (state === "too noisy") return "Tighten thresholds before this agent writes more work.";
      return "Keep watching acceptance and dismissal patterns.";
    })();

    return {
      id: profile.id,
      name: profile.name,
      signal: profile.signal,
      pending,
      accepted,
      dismissed,
      actioned,
      precision,
      avgScore,
      avgConfidence,
      deployed,
      outcomes,
      staleOutcomes,
      impactRate,
      trustScore,
      state,
      tuning,
      topSource,
      lastSignal: ownRecommendations[0] ? formatActivityTime(ownRecommendations[0].createdAt) : "no reports",
    };
  });

  const actionedRecommendations = recommendations.filter((recommendation) => recommendation.status !== "pending");
  const acceptedCount = actionedRecommendations.filter((recommendation) => recommendation.status === "accepted").length;
  const dismissedCount = actionedRecommendations.filter((recommendation) => recommendation.status === "dismissed").length;
  const deployedCount = outcomeImpacts.length;
  const outcomeCount = outcomeImpacts.filter((impact) => impact.resolved).length;
  const staleOutcomeCount = outcomeImpacts.filter((impact) => impact.stale).length;
  const impactRate = deployedCount === 0 ? 0 : Math.round((outcomeCount / deployedCount) * 100);
  const totalTrust = Math.round(rows.reduce((total, row) => total + row.trustScore, 0) / Math.max(rows.length, 1));
  const strongest = [...rows].sort((a, b) => b.trustScore - a.trustScore || b.accepted - a.accepted)[0];
  const weakest = [...rows].sort((a, b) => a.trustScore - b.trustScore || b.dismissed - a.dismissed)[0];
  const recentActions = actionEvents
    .filter((event) => new Date(event.timestamp) >= recentStart)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      label: `${formatActivityAction(event.action)} - ${event.entityTitle}`,
      meta: `${event.metadata?.agent ?? "Agent"} - ${formatActivityTime(event.timestamp)}`,
    }));
  const recentOutcomes = outcomeImpacts
    .filter((impact) => impact.resolved)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);
  const followUpDebt = outcomeImpacts
    .filter((impact) => impact.stale)
    .sort((a, b) => b.ageDays - a.ageDays || a.title.localeCompare(b.title))
    .slice(0, 6);

  return {
    rows,
    totalTrust,
    runCount: runEvents.length,
    acceptedCount,
    dismissedCount,
    deployedCount,
    outcomeCount,
    staleOutcomeCount,
    impactRate,
    pendingCount: recommendations.filter((recommendation) => recommendation.status === "pending").length,
    actionRate: Math.round((actionedRecommendations.length / Math.max(recommendations.length, 1)) * 100),
    strongest,
    weakest,
    recentActions,
    recentOutcomes,
    followUpDebt,
    headline:
      recommendations.length === 0
        ? "Agent learning memory is waiting for the first run."
        : staleOutcomeCount > 0
          ? "Accepted agent work needs visible follow-through."
          : deployedCount > 0 && impactRate >= 70
            ? "Agent advice is producing real execution outcomes."
            : totalTrust >= 72
              ? "Agent output is becoming reliable enough to trust faster."
              : totalTrust <= 42
                ? "Agent output needs tighter review before automation expands."
                : "Agent learning is active and still calibrating.",
    summary:
      recommendations.length === 0
        ? "Run the agents, then accept or dismiss reports so the system learns which recommendations deserve weight."
        : deployedCount > 0
          ? `${acceptedCount} accepted reports created ${deployedCount} work item${deployedCount === 1 ? "" : "s"}, with ${impactRate}% showing follow-through. ${strongest.name} is strongest; ${weakest.name} needs the most calibration.`
          : `${acceptedCount} accepted and ${dismissedCount} dismissed recommendations are shaping agent trust. ${strongest.name} is strongest; ${weakest.name} needs the most calibration.`,
  };
}

type AgentOutcomeImpact = {
  id: string;
  entityId: string;
  agentId: AgentId;
  agentName: string;
  title: string;
  domain: ActivityEventDomain;
  timestamp: string;
  ageDays: number;
  resolved: boolean;
  stale: boolean;
  outcomeLabel: string;
  meta: string;
};

function getAgentOutcomeImpacts(events: ActivityEvent[], now: Date): AgentOutcomeImpact[] {
  const sorted = sortActivityEvents(events).reverse();
  return sorted
    .filter((event) => event.source === "Agent action" && event.action === "created")
    .map((event) => {
      const agentId = String(event.metadata?.originAgentId ?? "");
      const profile = agentProfiles.find((agent) => agent.id === agentId);
      if (!profile) return undefined;
      const createdAt = new Date(event.timestamp);
      const ageDays = Math.max(0, daysBetween(createdAt, now));
      const outcome = sorted.find((candidate) => {
        if (candidate.id === event.id || candidate.entityId !== event.entityId || candidate.domain !== event.domain) return false;
        if (new Date(candidate.timestamp) <= createdAt) return false;
        return isAgentOutcomeEvent(candidate);
      });
      const resolved = event.domain === "calendar" || Boolean(outcome);
      const stale = !resolved && daysBetween(createdAt, now) >= 7;
      const outcomeLabel = event.domain === "calendar"
        ? "scheduled"
        : outcome
          ? formatActivityAction(outcome.action)
          : stale
            ? "stale"
            : "waiting";

      return {
        id: event.id,
        entityId: event.entityId,
        agentId: profile.id,
        agentName: profile.name,
        title: event.entityTitle,
        domain: event.domain,
        timestamp: outcome?.timestamp ?? event.timestamp,
        ageDays,
        resolved,
        stale,
        outcomeLabel,
        meta: `${formatActivityDomain(event.domain)} - ${formatActivityTime(outcome?.timestamp ?? event.timestamp)}`,
      } satisfies AgentOutcomeImpact;
    })
    .filter((impact): impact is AgentOutcomeImpact => Boolean(impact));
}

function isAgentOutcomeEvent(event: ActivityEvent) {
  if (["completed", "reviewed", "accepted"].includes(event.action)) return true;
  if (event.domain === "kanban" && event.action === "moved" && event.metadata?.toColumnId === "done") return true;
  if (event.domain === "kanban" && event.action === "archived") return true;
  return false;
}

function getAgentOutcomeView(domain: ActivityEventDomain): View {
  if (domain === "task") return "tasks";
  if (domain === "kanban") return "kanban";
  if (domain === "calendar") return "calendar";
  if (domain === "notes") return "notes";
  if (domain === "goal") return "goals";
  if (domain === "habit") return "habits";
  if (domain === "agent") return "agents";
  return "progress";
}

function getAgentOutcomeRescueSlot(now = new Date()) {
  const sameDaySlot = new Date(now);
  sameDaySlot.setHours(16, 30, 0, 0);
  if (sameDaySlot.getTime() > now.getTime()) return sameDaySlot;
  const nextDaySlot = addDays(startOfDay(now), 1);
  nextDaySlot.setHours(9, 30, 0, 0);
  return nextDaySlot;
}

function getAgentOutcomeRescueTitle(item: AgentOutcomeImpact) {
  return `Outcome rescue: ${item.title}`;
}

async function scheduleAgentOutcomeRescue(
  item: AgentOutcomeImpact,
  calendarEvents: CalendarEvent[],
  source: string,
) {
  const slot = getAgentOutcomeRescueSlot();
  const date = toDateInputValue(slot);
  const title = getAgentOutcomeRescueTitle(item);
  const alreadyScheduled = calendarEvents.find((event) => event.date === date && event.title === title);
  if (alreadyScheduled) {
    return {
      event: alreadyScheduled,
      created: false,
      message: `${item.title} already has a rescue checkpoint at ${alreadyScheduled.time}.`,
    };
  }

  const event: CalendarEvent = {
    id: `${Date.now()}-outcome-rescue-${slugify(item.title)}`,
    date,
    day: slot.getDate(),
    title,
    kind: "project",
    time: toTimeInputValue(slot),
  };
  await calendarCrud.add(event);
  logAgentOutcomeRescue(item, event, source);
  return {
    event,
    created: true,
    message: `Scheduled rescue checkpoint for ${item.title} on ${formatShortDate(event.date)} at ${event.time}.`,
  };
}

function logAgentOutcomeRescue(item: AgentOutcomeImpact, event: CalendarEvent, source: string) {
  logActivityEvent({
    domain: "calendar",
    action: "created",
    entityId: event.id,
    entityTitle: event.title,
    source,
    metadata: {
      agentId: item.agentId,
      agent: item.agentName,
      sourceDomain: item.domain,
      sourceEntityId: item.entityId,
      sourceEntityTitle: item.title,
      ageDays: item.ageDays,
    },
  });
}

function logAgentOutcomeReviewed(item: AgentOutcomeImpact, source: string) {
  logActivityEvent({
    domain: item.domain,
    action: "reviewed",
    entityId: item.entityId,
    entityTitle: item.title,
    source,
    metadata: {
      agentId: item.agentId,
      agent: item.agentName,
      ageDays: item.ageDays,
      outcomeLabel: item.outcomeLabel,
    },
  });
}

function getTrustedCoachReport(recommendations: AgentRecommendation[], memory: ReturnType<typeof getAgentLearningMemory>) {
  const trustByAgent = new Map(memory.rows.map((row) => [row.id, row]));
  return recommendations
    .filter((recommendation) => recommendation.status === "pending")
    .map((recommendation) => {
      const trust = trustByAgent.get(recommendation.agentId)?.trustScore ?? 50;
      const confidence = recommendation.confidence ?? 50;
      const score = recommendation.score ?? 50;
      const urgency = priorityToScore(agentSeverityToPriority(recommendation.severity));
      const rescueBoost = recommendation.source === "agent-outcome model" ? 18 : 0;
      return {
        recommendation,
        rank: trust * 0.38 + confidence * 0.24 + score * 0.24 + urgency * 0.14 + rescueBoost,
      };
    })
    .filter(({ rank }) => rank >= 58)
    .sort((a, b) => b.rank - a.rank || b.recommendation.createdAt.localeCompare(a.recommendation.createdAt))[0]?.recommendation;
}

function getTodayCoachHeadline(memory: ReturnType<typeof getAgentLearningMemory>, report?: AgentRecommendation) {
  if (memory.staleOutcomeCount > 0) return "Accepted agent work needs rescue.";
  if (report) return `Trusted report ready: ${report.agentName}`;
  if (memory.pendingCount >= 4) return "Agent queue needs a decision pass.";
  if (memory.totalTrust >= 72) return "Coach memory is healthy and ready to guide Today.";
  if (memory.totalTrust <= 42) return "Coach memory is asking for tighter calibration.";
  return "Coach memory is learning from your decisions.";
}

function getTodayCoachDirective(memory: ReturnType<typeof getAgentLearningMemory>, report?: AgentRecommendation) {
  if (memory.staleOutcomeCount > 0) {
    return `${memory.staleOutcomeCount} accepted agent-created item${memory.staleOutcomeCount === 1 ? "" : "s"} have not produced visible follow-through yet. Schedule a rescue checkpoint or clear the matching queue item before generating more advice.`;
  }
  if (report) {
    return `${report.agentName} has a pending recommendation strong enough to surface inside Today. Accept it if the next step still fits the day, or open Agents for deeper review.`;
  }
  if (memory.pendingCount >= 4) {
    return `There are ${memory.pendingCount} pending reports. Clear old recommendations before generating more so the system learns from real accept/dismiss signals.`;
  }
  if (memory.totalTrust >= 72) {
    return `${memory.strongest.name} is the strongest signal right now. Refresh the coach brief when the daily queue changes materially.`;
  }
  if (memory.totalTrust <= 42) {
    return `${memory.weakest.name} is pulling trust down. Dismiss weak reports or accept useful ones before expanding automation.`;
  }
  return "Use Refresh Coach Brief after major task, calendar, or board changes so recommendations stay attached to the current operating state.";
}

function AgentsView({
  goals,
  habits,
  projects,
  dashboardTasks,
  calendarEvents,
  kanbanCards,
  activityEvents,
  recommendations,
  onNavigate,
}: {
  goals: Goal[];
  habits: Habit[];
  projects: TaskProject[];
  dashboardTasks: ReturnType<typeof getDashboardTasks>;
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  activityEvents: ActivityEvent[];
  recommendations: AgentRecommendation[];
  onNavigate: (view: View) => void;
}) {
  const sortedRecommendations = [...recommendations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pendingRecommendations = sortedRecommendations.filter((recommendation) => recommendation.status === "pending");
  const acceptedCount = recommendations.filter((recommendation) => recommendation.status === "accepted").length;
  const dismissedCount = recommendations.filter((recommendation) => recommendation.status === "dismissed").length;
  const [followUpStatus, setFollowUpStatus] = useState("");
  const learningMemory = useMemo(
    () => getAgentLearningMemory(recommendations, activityEvents),
    [activityEvents, recommendations],
  );

  function runAgents() {
    const generated = generateAgentRecommendations({
      goals,
      habits,
      projects,
      dashboardTasks,
      calendarEvents,
      kanbanCards,
      activityEvents,
      existing: recommendations,
    });
    generated.forEach((recommendation) => void agentRecommendationCrud.add(recommendation));
    if (generated.length > 0) {
      logActivityEvent({
        domain: "agent",
        action: "generated",
        entityId: `agent-run-${Date.now()}`,
        entityTitle: "Agent recommendation run",
        source: "Agents command",
        metadata: { count: generated.length },
      });
    }
  }

  async function scheduleOutcomeRescue(item: AgentOutcomeImpact) {
    const result = await scheduleAgentOutcomeRescue(item, calendarEvents, "Agent follow-up debt");
    setFollowUpStatus(result.message);
  }

  function markOutcomeReviewed(item: AgentOutcomeImpact) {
    logAgentOutcomeReviewed(item, "Agent follow-up debt");
    setFollowUpStatus(`${item.title} marked reviewed in the activity ledger.`);
  }

  async function acceptRecommendation(recommendation: AgentRecommendation) {
    let outcome: AgentActionResult | undefined;
    if (recommendation.action) {
      outcome = await executeAgentAction(recommendation.action, recommendation);
    }
    await agentRecommendationCrud.update(recommendation.id, { status: "accepted" });
    logActivityEvent({
      domain: "agent",
      action: "accepted",
      entityId: recommendation.id,
      entityTitle: recommendation.title,
      source: "Agents command",
      metadata: {
        agent: recommendation.agentName,
        agentId: recommendation.agentId,
        severity: recommendation.severity,
        actionType: recommendation.action?.type,
        outcomeDomain: outcome?.domain,
        outcomeEntityId: outcome?.entityId,
        outcomeEntityTitle: outcome?.entityTitle,
      },
    });
  }

  return (
    <>
      <section className="agents-overview">
        <HudCard className="agent-command-card" active>
          <CardHeader title="Autonomous Coach Agents" meta={`${pendingRecommendations.length} pending`} />
          <div className="agent-command-copy">
            <strong>{recommendations.length}</strong>
            <span>total recommendations</span>
            <p>Agents read your live goals, habits, task tabs, calendar, and Kanban history. They write recommendations first; you decide what becomes real work.</p>
          </div>
          <div className="agent-actions">
            <button type="button" onClick={runAgents}>Run Agents Now</button>
            <span>{acceptedCount} accepted</span>
            <span>{dismissedCount} dismissed</span>
          </div>
        </HudCard>

        <div className="agent-roster">
          {agentProfiles.map((agent) => {
            const count = pendingRecommendations.filter((recommendation) => recommendation.agentId === agent.id).length;
            return (
              <HudCard className="agent-roster-card" key={agent.id}>
                <CardHeader title={agent.name} meta={count ? `${count} active` : "standby"} />
                <strong>{agent.signal}</strong>
                <p>{agent.description}</p>
              </HudCard>
            );
          })}
        </div>
      </section>

      <HudCard className="agent-learning-card" active>
        <CardHeader title="Agent Learning Memory" meta={`${learningMemory.totalTrust}% trust`} />
        <div className="agent-learning-hero">
          <div className="agent-learning-score">
            <strong>{learningMemory.totalTrust}</strong>
            <span>trust index</span>
          </div>
          <div>
            <span className="today-eyebrow">Feedback-weighted coaching</span>
            <strong>{learningMemory.headline}</strong>
            <p>{learningMemory.summary}</p>
          </div>
        </div>
        <div className="agent-learning-metrics">
          <section>
            <span>Action Rate</span>
            <strong>{learningMemory.actionRate}%</strong>
            <p>{learningMemory.pendingCount} pending report{learningMemory.pendingCount === 1 ? "" : "s"} still need a decision.</p>
          </section>
          <section>
            <span>Accepted</span>
            <strong>{learningMemory.acceptedCount}</strong>
            <p>Reports converted into real tasks, calendar items, or board cards.</p>
          </section>
          <section>
            <span>Outcome Impact</span>
            <strong>{learningMemory.impactRate}%</strong>
            <p>{learningMemory.outcomeCount}/{learningMemory.deployedCount} deployed action{learningMemory.deployedCount === 1 ? "" : "s"} show follow-through; {learningMemory.staleOutcomeCount} need rescue.</p>
          </section>
          <section>
            <span>Runs</span>
            <strong>{learningMemory.runCount}</strong>
            <p>Agent command cycles recorded in the activity ledger.</p>
          </section>
        </div>
        <div className="agent-learning-list">
          {learningMemory.rows.map((row) => (
            <article className={`agent-learning-row ${row.state.replace(/\s+/g, "-")}`} key={row.id}>
              <div>
                <span>{row.name}</span>
                <strong>{row.trustScore}%</strong>
              </div>
              <div className="agent-learning-bar">
                <i style={{ width: `${row.trustScore}%` }} />
              </div>
              <p>{row.tuning}</p>
              <div className="agent-learning-meta">
                <span>{row.state}</span>
                <span>{row.precision}% precision</span>
                <span>{row.impactRate}% impact</span>
                <span>{row.avgConfidence}% confidence</span>
                <span>{row.lastSignal}</span>
              </div>
            </article>
          ))}
        </div>
        {learningMemory.recentOutcomes.length > 0 && (
          <div className="agent-learning-outcomes">
            {learningMemory.recentOutcomes.map((item) => (
              <span key={item.id}>
                <strong>{item.title}</strong>
                <em>{item.agentName} - {item.outcomeLabel} - {item.meta}</em>
              </span>
            ))}
          </div>
        )}
        {learningMemory.recentActions.length > 0 && (
          <div className="agent-learning-actions">
            {learningMemory.recentActions.map((item) => (
              <span key={item.id}>
                <strong>{item.label}</strong>
                <em>{item.meta}</em>
              </span>
            ))}
          </div>
        )}
      </HudCard>

      <HudCard className="agent-followup-card" active={learningMemory.followUpDebt.length > 0}>
        <CardHeader title="Follow-Up Debt" meta={`${learningMemory.followUpDebt.length} stale`} />
        <div className="agent-followup-list">
          {learningMemory.followUpDebt.length === 0 ? (
            <div className="kanban-empty">// no stale accepted agent-created work</div>
          ) : (
            learningMemory.followUpDebt.map((item) => (
              <article className="agent-followup-item" key={item.id}>
                <div>
                  <span>{item.agentName}</span>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                </div>
                <div className="agent-followup-age">
                  <strong>{item.ageDays}d</strong>
                  <span>{item.outcomeLabel}</span>
                </div>
                <div className="agent-followup-actions">
                  <button type="button" onClick={() => onNavigate(getAgentOutcomeView(item.domain))}>Open</button>
                  <button type="button" onClick={() => void scheduleOutcomeRescue(item)}>Schedule Rescue</button>
                  <button type="button" onClick={() => markOutcomeReviewed(item)}>Mark Reviewed</button>
                </div>
              </article>
            ))
          )}
        </div>
        {followUpStatus && <div className="agent-followup-status">{followUpStatus}</div>}
      </HudCard>

      <HudCard className="agent-recommendations-card">
        <CardHeader title="Agent Reports" meta={`${pendingRecommendations.length} actionable`} />
        <div className="agent-report-list">
          {sortedRecommendations.length === 0 ? (
            <div className="kanban-empty">// run agents to generate coach reports</div>
          ) : (
            sortedRecommendations.map((recommendation) => (
              <article className={`agent-report ${recommendation.severity} ${recommendation.status}`} key={recommendation.id}>
                <div className="agent-report-head">
                  <span>{recommendation.agentName}</span>
                  <PriorityChip level={agentSeverityToPriority(recommendation.severity)} />
                  <em>{formatActivityTime(recommendation.createdAt)}</em>
                </div>
                <strong>{recommendation.title}</strong>
                <p>{recommendation.body}</p>
                <div className="agent-report-meta">
                  <span>{recommendation.source}</span>
                  {typeof recommendation.score === "number" && <span>score {recommendation.score}</span>}
                  {typeof recommendation.confidence === "number" && <span>{recommendation.confidence}% confidence</span>}
                  {recommendation.action && <span>{recommendation.action.label}</span>}
                  <span>{recommendation.status}</span>
                </div>
                {recommendation.evidence && recommendation.evidence.length > 0 && (
                  <ul className="agent-evidence">
                    {recommendation.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {recommendation.status === "pending" && (
                  <div className="agent-report-actions">
                    {recommendation.action && (
                      <button type="button" onClick={() => void acceptRecommendation(recommendation)}>
                        Accept
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        void agentRecommendationCrud.update(recommendation.id, { status: "dismissed" });
                        logActivityEvent({
                          domain: "agent",
                          action: "dismissed",
                          entityId: recommendation.id,
                          entityTitle: recommendation.title,
                          source: "Agents command",
                          metadata: { agent: recommendation.agentName, severity: recommendation.severity },
                        });
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </HudCard>
      <SystemTrace label="Agent command online" />
    </>
  );
}

function MetricPanel({
  title,
  value,
  suffix,
  children,
}: {
  title: string;
  value: string;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <HudCard className="metric-panel">
      <CardHeader title={title} />
      <div className="metric-value">
        <strong>{value}</strong>
        <span>{suffix}</span>
      </div>
      <p>{children}</p>
    </HudCard>
  );
}

function SystemTrace({ label }: { label: string }) {
  return (
    <>
      <svg className="bottom-scan" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,24 42,21 88,23 132,20 178,25 222,19 268,24 312,18 356,22 402,16 448,21 490,17 536,23 578,20 624,24 668,18 714,22 760,17 804,25 850,21 896,23 940,18 986,24 1032,21 1076,19 1122,23 1168,20 1200,22" />
      </svg>
      <footer className="sysline">
        <span>// System synchronized</span>
        <strong>All nodes operational</strong>
        <span>{label}</span>
      </footer>
    </>
  );
}

function ProjectCreateForm({
  compact = false,
  name,
  startDate,
  endDate,
  goals = [],
  goalId = "",
  outcome = "",
  onNameChange,
  onStartDateChange,
  onEndDateChange,
  onGoalIdChange,
  onOutcomeChange,
  onSubmit,
}: {
  compact?: boolean;
  name: string;
  startDate: string;
  endDate: string;
  goals?: Goal[];
  goalId?: string;
  outcome?: string;
  onNameChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onGoalIdChange?: (value: string) => void;
  onOutcomeChange?: (value: string) => void;
  onSubmit: () => void;
}) {
  const rangeDays = getDateRangeDays(startDate, endDate);

  return (
    <form
      className={compact ? "project-create compact" : "project-create"}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="New objective tab" />
      {goals.length > 0 && (
        <select value={goalId} onChange={(event) => onGoalIdChange?.(event.target.value)} aria-label="Linked goal">
          <option value="">No linked goal</option>
          {goals.map((goal) => (
            <option value={goal.id} key={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      )}
      <input
        type="date"
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
        aria-label="Start date"
      />
      <input
        type="date"
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
        aria-label="End date"
      />
      {!compact && (
        <input
          value={outcome}
          onChange={(event) => onOutcomeChange?.(event.target.value)}
          placeholder="Outcome signal"
        />
      )}
      <span className="project-range">{rangeDays}d</span>
      <button type="submit">+</button>
    </form>
  );
}

function MetricBadge({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MonthlyGoals({
  projects,
  objectives,
}: {
  projects: TaskProject[];
  objectives: ReturnType<typeof getCurrentObjectives>;
}) {
  return (
    <HudCard className="monthly-card">
      <CardHeader title="Current Objectives" meta={`${projects.length} tabs`} />
      <div className="monthly-list">
        {objectives.length === 0 ? (
          <div className="empty-calendar-band">// create a task tab to populate this panel</div>
        ) : (
          objectives.map((objective) => (
          <div className={`monthly-row ${objective.done ? "done" : ""}`} key={objective.id}>
            <span className="checkbox">{objective.done && <Check />}</span>
            <span>{objective.name}</span>
            <strong>{objective.value}</strong>
          </div>
          ))
        )}
      </div>
      <CommandLink>View Task Protocol</CommandLink>
    </HudCard>
  );
}

function YearlyGoals({ goals }: { goals: Goal[] }) {
  const circumference = 2 * Math.PI * 64;
  const averageProgress = Math.round(goals.reduce((total, goal) => total + goal.progress, 0) / Math.max(goals.length, 1));
  const completed = goals.filter((goal) => goal.progress >= 100).length;
  const remaining = Math.max(goals.length - completed, 0);
  const offset = circumference * (1 - averageProgress / 100);

  return (
    <HudCard className="yearly-card">
      <CardHeader title="Goal System" meta={`${goals.length} active`} />
      <div className="yearly-body">
        <div className="yearly-ring">
          <svg viewBox="0 0 160 160">
            <circle className="ring-track" cx="80" cy="80" r="64" />
            <circle
              className="ring-value"
              cx="80"
              cy="80"
              r="64"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div>
            <strong>{averageProgress}<span>%</span></strong>
            <em>{completed} / {goals.length}</em>
          </div>
        </div>
        <div className="yearly-stats">
          <span>Completed</span>
          <strong>{completed}</strong>
          <span>Remaining</span>
          <strong className="violet">{remaining}</strong>
        </div>
      </div>
      <CommandLink>View Goal Registry</CommandLink>
    </HudCard>
  );
}

function TimelineCard({
  goals,
  events,
}: {
  goals: Goal[];
  events: ReturnType<typeof getUpcomingEvents>;
}) {
  const timeline = getDashboardTimeline(goals, events);

  return (
    <HudCard className="timeline-card">
      <CardHeader title="Timeline" meta={`${timeline.length} signals`} />
      <div className="timeline-list">
        {timeline.map((item) => (
          <div className="timeline-row" key={`${item.date}-${item.name}`}>
            <div className="timeline-date">
              <strong>{item.month}</strong>
              <span>{item.year}</span>
            </div>
            <div className="timeline-rail">
              <i className={item.tone} />
            </div>
            <div>
              <strong>{item.name}</strong>
              <span>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
      <CommandLink>Open Calendar</CommandLink>
    </HudCard>
  );
}

function ReflectionCard({ reflection }: { reflection: ReturnType<typeof getDashboardReflection> }) {
  return (
    <HudCard className="reflection-card">
      <CardHeader title="Daily Readout" />
      <button className="add-note" aria-label="Add note">+</button>
      <p>{reflection.body}</p>
      <div className="reflection-author">- FOCUS//OS <span>{reflection.stamp}</span></div>
      <div className="reflection-tags">
        {reflection.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
      </div>
    </HudCard>
  );
}

function Sidebar({
  activeView,
  goalsCount,
  habitsDone,
  habitsTotal,
  taskProjectCount,
  onNavigate,
}: {
  activeView: View;
  goalsCount: number;
  habitsDone: number;
  habitsTotal: number;
  taskProjectCount: number;
  onNavigate: (view: View) => void;
}) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <HudCard className="brand-card">
        <div className="brand-mark" />
        <div>
          <strong>FOCUS//OS</strong>
          <span>v0.1.0</span>
        </div>
      </HudCard>

      <HudCard className="avatar-card">
        <div className="avatar-frame">ZF</div>
        <strong>ZIFTINITY</strong>
        <span>Level 7 - Focus Mode</span>
        <div className="avatar-meter">
          <ProgressBar value={72} />
          <em>72%</em>
        </div>
      </HudCard>

      <HudCard className="nav-card">
        <nav>
          {navItems.map(({ Icon, ...item }) => (
            <button
              className={item.id === activeView ? "active" : ""}
              key={item.label}
              onClick={() => {
                if (isView(item.id)) {
                  onNavigate(item.id);
                }
              }}
            >
              <Icon />
              <span>{item.label}</span>
              {(item.id === "goals" || item.id === "habits" || item.id === "tasks" || item.count) && (
                <em>
                  {item.id === "goals"
                    ? goalsCount
                    : item.id === "habits"
                      ? `${habitsDone}/${habitsTotal}`
                      : item.id === "tasks"
                        ? taskProjectCount
                        : item.count}
                </em>
              )}
            </button>
          ))}
        </nav>
      </HudCard>

      <HudCard className="status-card">
        <div className="status-row">
          <span>System Status</span>
          <strong>Optimal</strong>
        </div>
        <svg viewBox="0 0 120 24" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            points="0,18 8,16 16,17 24,12 32,14 40,10 48,12 56,8 64,11 72,6 80,9 88,4 96,8 104,6 112,3 120,5"
          />
        </svg>
      </HudCard>

      <HudCard className="focus-card">
        <span>&gt;_</span>
        <strong>Stay Focused</strong>
      </HudCard>
    </aside>
  );
}

function HudCard({
  children,
  className = "",
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={`hud-wrap ${active ? "active" : ""}`}>
      <div className={`hud ${className}`}>
        <div className="brackets" />
        {children}
      </div>
    </div>
  );
}

function CardHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="card-header">
      <span>{title}</span>
      {meta && <em>{meta}</em>}
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: "cyan" | "violet" | "dim";
  label: string;
  value: string;
}) {
  return (
    <div>
      <i className={color} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" aria-hidden="true">
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

function PriorityChip({ level }: { level: Priority }) {
  return <span className={`chip ${level}`}>{level === "ziftinity" ? "Ziftinity" : level}</span>;
}

function CommandLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="command-link" type="button" onClick={onClick}>
      <span>{children}</span>
      <Sparkles />
    </button>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = iconMap[goal.iconKey] ?? Target;

  return (
    <HudCard className="goal-card">
      <div className="goal-top">
        <div className="goal-icon">
          <Icon />
        </div>
        <div>
          <strong>{goal.title}</strong>
          <span>{goal.due}</span>
        </div>
      </div>
      <PriorityChip level={goal.level} />
      <div className="goal-percent">{goal.progress}%</div>
      <p>{goal.meta}</p>
      <MiniChart type={goal.chart} progress={goal.progress} />
    </HudCard>
  );
}

function MiniChart({ type, progress }: { type: Goal["chart"]; progress: number }) {
  if (type === "bars") {
    const bars = [24, 52, 38, 44, 50, 32, 56, 42, 36, 48, 28, 46, 40, 34, 45, 26];
    return (
      <div className="mini-bars">
        {bars.map((bar, index) => (
          <i key={index} style={{ height: `${bar}%` }} />
        ))}
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className="dot-grid">
        {Array.from({ length: 30 }, (_, index) => (
          <i key={index} className={index < 24 ? (index === 23 ? "today" : "on") : ""} />
        ))}
      </div>
    );
  }

  if (type === "blocks") {
    return (
      <div className="block-chart">
        <ProgressBar value={progress} />
        <div>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
      </div>
    );
  }

  return (
    <svg className="mini-line" viewBox="0 0 160 40" preserveAspectRatio="none">
      <path d="M0 31 C20 24 36 22 55 25 S91 31 111 23 S139 13 160 17" />
    </svg>
  );
}

function makeNoise() {
  const alphabet = "0123456789ABCDEF";
  return Array.from({ length: 80 }, () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(""),
  ).join("  ");
}

function sortGoals(items: Goal[]) {
  return [...items].sort((a, b) => priorityRank[a.level] - priorityRank[b.level] || b.progress - a.progress);
}

function sortHabits(items: Habit[]) {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
}

function normalizeTaskProject(project: TaskProject): TaskProject {
  const fallbackStart = parseDateInput(project.startDate) ?? new Date(2026, 4, 1);
  const fallbackDays = Math.max(1, Math.min(365, Math.round(project.deadlineDays || 1)));
  const fallbackEnd = parseDateInput(project.endDate) ?? addDays(fallbackStart, fallbackDays - 1);
  const startDate = toDateInputValue(fallbackStart);
  const endDate = toDateInputValue(fallbackEnd >= fallbackStart ? fallbackEnd : fallbackStart);
  const deadlineDays = getDateRangeDays(startDate, endDate);
  const currentDay = Math.min(Math.max(Math.round(project.currentDay || 1), 1), deadlineDays);

  return {
    ...project,
    startDate,
    endDate,
    deadlineDays,
    currentDay,
    tasksByDay: project.tasksByDay ?? {},
  };
}

function createProject(
  name: string,
  startDateValue: string,
  endDateValue: string,
  goalId?: string,
  outcome?: string,
): TaskProject | null {
  const cleanName = name.trim();
  if (!cleanName) return null;
  const start = parseDateInput(startDateValue) ?? new Date();
  const endInput = parseDateInput(endDateValue);
  const end = endInput && endInput >= start ? endInput : start;
  const days = getDateRangeDays(toDateInputValue(start), toDateInputValue(end));

  return {
    id: `${Date.now()}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: cleanName,
    goalId,
    outcome: outcome?.trim() || undefined,
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
    deadlineDays: days,
    currentDay: 1,
    tasksByDay: {},
  };
}

function resetProjectDates(setStartDate: (value: string) => void, setEndDate: (value: string) => void) {
  const start = new Date();
  setStartDate(toDateInputValue(start));
  setEndDate(toDateInputValue(addDays(start, 39)));
}

function getProjectStartDate(project: TaskProject) {
  return parseDateInput(project.startDate) ?? new Date();
}

function getProjectEndDate(project: TaskProject) {
  const fallback = addDays(getProjectStartDate(project), Math.max(project.deadlineDays, 1) - 1);
  return parseDateInput(project.endDate) ?? fallback;
}

function getProjectDeadlineDays(project: TaskProject) {
  return getDateRangeDays(toDateInputValue(getProjectStartDate(project)), toDateInputValue(getProjectEndDate(project)));
}

type GoalExecutionMap = {
  milestones: GoalMilestone[];
  projects: TaskProject[];
  cards: KanbanCard[];
  events: Array<{ event: CalendarEvent; date: Date }>;
  milestoneProgress: number;
  taskProgress: number;
  boardProgress: number;
  computedProgress: number;
  statusLine: string;
};

function getGoalExecutionMap(
  goal: Goal,
  projects: TaskProject[],
  events: CalendarEvent[],
  cards: KanbanCard[],
): GoalExecutionMap {
  const milestones = getGoalMilestones(goal);
  const linkedProjects = projects.map(normalizeTaskProject).filter((project) => isProjectLinkedToGoal(project, goal));
  const linkedProjectIds = new Set(linkedProjects.map((project) => project.id));
  const linkedCards = cards.map(normalizeKanbanCard).filter((card) => isCardLinkedToGoal(card, goal, linkedProjectIds));
  const linkedEvents = getGoalUpcomingSignals(goal, linkedProjects, events);
  const milestoneProgress = getMilestoneProgress(milestones);
  const taskProgress = getLinkedProjectsProgress(linkedProjects);
  const boardProgress = getLinkedCardsProgress(linkedCards);
  const progressParts = [
    [milestoneProgress, milestones.length ? 0.35 : 0],
    [taskProgress, linkedProjects.length ? 0.45 : 0],
    [boardProgress, linkedCards.length ? 0.2 : 0],
  ].filter((part): part is [number, number] => part[1] > 0);
  const computedProgress = progressParts.length ? weightedScore(progressParts) : clamp(Math.round(goal.progress), 0, 100);
  const statusLine = [
    `${linkedProjects.length} linked task ${linkedProjects.length === 1 ? "plan" : "plans"}`,
    `${linkedCards.length} board ${linkedCards.length === 1 ? "card" : "cards"}`,
    `${linkedEvents.length} calendar ${linkedEvents.length === 1 ? "signal" : "signals"}`,
  ].join(" - ");

  return {
    milestones,
    projects: linkedProjects,
    cards: linkedCards,
    events: linkedEvents,
    milestoneProgress,
    taskProgress,
    boardProgress,
    computedProgress,
    statusLine,
  };
}

function getGoalMilestones(goal: Goal) {
  if (goal.milestones?.length) return goal.milestones;
  return makeGoalMilestones([
    ["Define measurable outcome", goal.progress >= 15, 20],
    ["Create execution plan", goal.progress >= 30, 25],
    ["Ship visible progress", goal.progress >= 60, 30],
    ["Close goal or reset target", goal.progress >= 95, 25],
  ]);
}

function getMilestoneProgress(milestones: GoalMilestone[]) {
  if (milestones.length === 0) return 0;
  const totalWeight = milestones.reduce((total, milestone) => total + Math.max(milestone.weight || 0, 1), 0);
  const doneWeight = milestones
    .filter((milestone) => milestone.done)
    .reduce((total, milestone) => total + Math.max(milestone.weight || 0, 1), 0);
  return Math.round((doneWeight / Math.max(totalWeight, 1)) * 100);
}

function getTaskProjectProgress(project: TaskProject) {
  const allTasks = Object.values(project.tasksByDay ?? {}).flat();
  if (allTasks.length === 0) return 0;
  return Math.round((allTasks.filter((task) => task.done).length / allTasks.length) * 100);
}

function getLinkedProjectsProgress(projects: TaskProject[]) {
  if (projects.length === 0) return 0;
  return Math.round(projects.reduce((total, project) => total + getTaskProjectProgress(project), 0) / projects.length);
}

function getLinkedCardsProgress(cards: KanbanCard[]) {
  if (cards.length === 0) return 0;
  return Math.round(
    cards.reduce((total, card) => {
      if (card.columnId === "done") return total + 100;
      if (card.subtasks.length) return total + getSubtaskProgress(card);
      return total + (card.columnId === "review" ? 72 : card.columnId === "in-progress" ? 48 : card.columnId === "planned" ? 24 : 8);
    }, 0) / cards.length,
  );
}

function isProjectLinkedToGoal(project: TaskProject, goal: Goal) {
  return project.goalId === goal.id || isGoalTextMatch(`${project.name} ${project.outcome ?? ""}`, goal);
}

function isCardLinkedToGoal(card: KanbanCard, goal: Goal, linkedProjectIds: Set<string>) {
  if (card.linkedTaskProjectId && linkedProjectIds.has(card.linkedTaskProjectId)) return true;
  return isGoalTextMatch(`${card.title} ${card.description} ${card.tags.join(" ")} ${card.labels.map((label) => label.name).join(" ")}`, goal);
}

function getGoalUpcomingSignals(goal: Goal, projects: TaskProject[], events: CalendarEvent[]) {
  const projectText = projects.map((project) => project.name).join(" ");
  const dueDate = parseGoalDueDate(goal.due);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = addDays(start, 14);
  return events
    .map((event) => ({ event, date: getEventDate(event) }))
    .filter(({ event, date }) => {
      if (date < start || date > end) return false;
      const sameDueDate = dueDate ? date.toDateString() === dueDate.toDateString() : false;
      return sameDueDate || isGoalTextMatch(`${event.title} ${event.kind} ${projectText}`, goal);
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.event.time.localeCompare(b.event.time))
    .slice(0, 5);
}

function isGoalTextMatch(value: string, goal: Goal) {
  const text = value.toLowerCase();
  const title = goal.title.toLowerCase();
  const goalKey = slugify(goal.title);
  const tokens = title.split(/[^a-z0-9]+/).filter((token) => token.length > 3);
  return text.includes(goal.id.toLowerCase()) || text.includes(goalKey) || text.includes(title) || tokens.some((token) => text.includes(token));
}

function createGoalExecutionProject(goal: Goal, seed: number): TaskProject {
  const start = new Date();
  const dueDate = parseGoalDueDate(goal.due);
  const end = dueDate && dueDate > start && daysBetween(start, dueDate) <= 45 ? dueDate : addDays(start, 13);
  const startDate = toDateInputValue(start);
  const endDate = toDateInputValue(end);
  const deadlineDays = getDateRangeDays(startDate, endDate);
  const timestamp = Date.now();
  const projectId = `${timestamp}-${seed}-${slugify(goal.title)}-execution`;
  const openMilestones = getGoalMilestones(goal).filter((milestone) => !milestone.done);
  const focusMilestones = openMilestones.length ? openMilestones : getGoalMilestones(goal);
  const tasksByDay = Array.from({ length: deadlineDays }).reduce<Record<number, ProjectTask[]>>((tasks, _, index) => {
    const day = index + 1;
    const milestone = focusMilestones[index % Math.max(focusMilestones.length, 1)];
    tasks[day] = [
      {
        id: `${projectId}-d${day}-build`,
        name: milestone ? `${goal.title}: ${milestone.title}` : `${goal.title}: ship one visible proof block`,
        done: false,
      },
      {
        id: `${projectId}-d${day}-proof`,
        name: `Log proof, blocker, and next action for ${goal.title}`,
        done: false,
      },
    ];
    return tasks;
  }, {});

  return {
    id: projectId,
    name: `${goal.title} execution sprint`,
    goalId: goal.id,
    outcome: `Move ${goal.title} from ${goal.progress}% toward completion with daily proof`,
    startDate,
    endDate,
    deadlineDays,
    currentDay: 1,
    tasksByDay,
  };
}

function getDateRangeDays(startDateValue: string, endDateValue: string) {
  const start = parseDateInput(startDateValue) ?? new Date();
  const endInput = parseDateInput(endDateValue);
  const end = endInput && endInput >= start ? endInput : start;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.min(365, Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1));
}

function formatKanbanDate(value: string) {
  const date = parseDateInput(value);
  return date ? formatTaskDate(date) : value;
}

function normalizeKanbanCard(card: KanbanCard): KanbanCard {
  return {
    ...card,
    labels: card.labels ?? [],
    subtasks: card.subtasks ?? [],
    attachments: card.attachments ?? [],
    comments: card.comments ?? [],
    tags: card.tags ?? [],
    trackedMinutes: card.trackedMinutes ?? 0,
  };
}

function loadKanbanColumns(): KanbanColumnConfig[] {
  try {
    const rawColumns = window.localStorage.getItem("ziftinity-kanban-columns");
    if (!rawColumns) return defaultKanbanColumns;
    const parsed = JSON.parse(rawColumns) as Partial<KanbanColumnConfig>[];
    const normalized = parsed
      .filter((column): column is Partial<KanbanColumnConfig> & { id: string; title: string } => Boolean(column.id && column.title))
      .map((column) => ({
        id: column.id,
        title: column.title,
        signal: column.signal ?? "Custom",
        wipLimit: Math.max(1, Number(column.wipLimit) || 5),
        collapsed: Boolean(column.collapsed),
      }));

    return normalized.length ? normalized : defaultKanbanColumns;
  } catch {
    return defaultKanbanColumns;
  }
}

function sortKanbanCards(cards: KanbanCard[], sortMode: KanbanSortMode) {
  const ordered = [...cards];
  if (sortMode === "priority") {
    return ordered.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.order - b.order || a.title.localeCompare(b.title));
  }
  if (sortMode === "due") {
    return ordered.sort((a, b) => {
      const aTime = parseDateInput(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = parseDateInput(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime || priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title);
    });
  }
  if (sortMode === "title") {
    return ordered.sort((a, b) => a.title.localeCompare(b.title));
  }
  return ordered.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function getSwimlaneGroups(cards: KanbanCard[], mode: KanbanSwimlaneMode, projects: TaskProject[]) {
  if (mode === "none") return [{ id: "all", title: "All Cards", cards }];

  const groups = new Map<string, { id: string; title: string; cards: KanbanCard[] }>();
  cards.forEach((card) => {
    const key = getSwimlaneKey(card, mode, projects);
    if (!groups.has(key.id)) groups.set(key.id, { ...key, cards: [] });
    groups.get(key.id)?.cards.push(card);
  });

  return Array.from(groups.values()).sort((a, b) => {
    if (mode === "priority") {
      return priorityRank[a.id as Priority] - priorityRank[b.id as Priority];
    }
    return a.title.localeCompare(b.title);
  });
}

function getSwimlaneKey(card: KanbanCard, mode: Exclude<KanbanSwimlaneMode, "none">, projects: TaskProject[]) {
  if (mode === "priority") return { id: card.priority, title: `${priorityLabel[card.priority]} Priority` };
  if (mode === "tag") {
    const tag = card.tags[0] ?? "untagged";
    return { id: tag, title: tag === "untagged" ? "Untagged" : `#${tag}` };
  }
  const projectName = getProjectName(projects, card.linkedTaskProjectId);
  return { id: card.linkedTaskProjectId ?? "unlinked", title: projectName === "Task link" ? "Unlinked Cards" : projectName };
}

function getCardDoneTime(card: KanbanCard, activity: KanbanActivity[]) {
  return activity
    .filter((event) => event.cardId === card.id && event.action === "moved" && event.toColumnId === "done")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt;
}

function filterKanbanCards(
  cards: KanbanCard[],
  filters: {
    searchQuery: string;
    filterPriority: Priority | "all";
    filterTag: string;
    filterDue: KanbanDueFilter;
    focusMode: boolean;
  },
) {
  const query = filters.searchQuery.trim().toLowerCase();
  return cards.filter((card) => {
    const dueState = getDueState(card.dueDate);
    const matchesSearch = !query || getKanbanSearchText(card).includes(query);
    const matchesPriority = filters.filterPriority === "all" || card.priority === filters.filterPriority;
    const matchesTag = !filters.filterTag || card.tags.includes(filters.filterTag);
    const matchesDue =
      filters.filterDue === "all" ||
      (filters.filterDue === "none" && !card.dueDate) ||
      (filters.filterDue === "today" && dueState === "due-today") ||
      (filters.filterDue === "overdue" && dueState === "overdue") ||
      (filters.filterDue === "scheduled" && dueState === "scheduled");
    const matchesFocus = !filters.focusMode || card.priority === "ziftinity" || card.priority === "high" || dueState === "due-today" || dueState === "overdue";
    return matchesSearch && matchesPriority && matchesTag && matchesDue && matchesFocus;
  });
}

function getKanbanSearchText(card: KanbanCard) {
  return [
    card.title,
    card.description,
    card.priority,
    card.dueDate,
    card.blockedBy,
    ...card.tags,
    ...card.labels.map((label) => label.name),
    ...card.subtasks.map((subtask) => subtask.title),
    ...card.comments.map((comment) => comment.body),
  ].filter(Boolean).join(" ").toLowerCase();
}

function isKanbanSearchMatch(card: KanbanCard, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  return Boolean(query && getKanbanSearchText(card).includes(query));
}

function getKanbanBoardStats(cards: KanbanCard[], activity: KanbanActivity[]) {
  const total = cards.length;
  const done = cards.filter((card) => card.columnId === "done").length;
  const overdue = cards.filter((card) => getDueState(card.dueDate) === "overdue").length;
  const focusCount = cards.filter((card) => card.priority === "ziftinity" || card.priority === "high" || ["overdue", "due-today"].includes(getDueState(card.dueDate))).length;
  const cycles = cards
    .map((card) => getCardCycleHours(card, activity))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const avgCycleHours = cycles.length ? cycles.reduce((totalHours, value) => totalHours + value, 0) / cycles.length : 0;
  return {
    total,
    donePercent: Math.round((done / Math.max(total, 1)) * 100),
    overdue,
    focusCount,
    avgCycle: avgCycleHours ? `${avgCycleHours < 24 ? avgCycleHours.toFixed(1) : (avgCycleHours / 24).toFixed(1)}${avgCycleHours < 24 ? "h" : "d"}` : "n/a",
  };
}

function getCardCycleHours(card: KanbanCard, activity: KanbanActivity[]) {
  const created = activity
    .filter((event) => event.cardId === card.id && event.action === "created")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]?.createdAt;
  const done = getCardDoneTime(card, activity);
  if (!created || !done) return undefined;
  return Math.max(0, (new Date(done).getTime() - new Date(created).getTime()) / 36e5);
}

function getColumnCycleScore(columnId: KanbanColumnId, cards: KanbanCard[], activity: KanbanActivity[]) {
  const cardCount = cards.filter((card) => card.columnId === columnId).length;
  const moveCount = activity.filter((event) => event.toColumnId === columnId).length;
  return Math.min(100, cardCount * 18 + moveCount * 6);
}

function getSubtaskProgress(card: KanbanCard) {
  if (card.subtasks.length === 0) return 0;
  return Math.round((card.subtasks.filter((subtask) => subtask.done).length / card.subtasks.length) * 100);
}

function getDueState(value?: string) {
  const date = parseDateInput(value);
  if (!date) return "";
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date < start) return "overdue";
  if (date.toDateString() === start.toDateString()) return "due-today";
  return "scheduled";
}

function formatMinutes(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function getAttachmentName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 28);
  }
}

function logKanbanActivity({
  card,
  action,
  fromColumnId,
  toColumnId,
}: {
  card: KanbanCard;
  action: KanbanActivity["action"];
  fromColumnId?: KanbanColumnId;
  toColumnId?: KanbanColumnId;
}) {
  const createdAt = new Date().toISOString();
  void kanbanActivityCrud.add({
    id: `${Date.now()}-${card.id}-${action}`,
    cardId: card.id,
    cardTitle: card.title,
    action,
    fromColumnId,
    toColumnId,
    createdAt,
  });
  logActivityEvent({
    domain: "kanban",
    action,
    entityId: card.id,
    entityTitle: card.title,
    source: "Kanban board",
    timestamp: createdAt,
    metadata: {
      priority: card.priority,
      fromColumnId,
      toColumnId,
      dueDate: card.dueDate,
      linkedTaskProjectId: card.linkedTaskProjectId,
    },
  });
}

function logActivityEvent({
  domain,
  action,
  entityId,
  entityTitle,
  source,
  timestamp = new Date().toISOString(),
  metadata,
}: {
  domain: ActivityEventDomain;
  action: ActivityEventAction;
  entityId: string;
  entityTitle: string;
  source: string;
  timestamp?: string;
  metadata?: ActivityEventMetadata;
}) {
  const date = new Date(timestamp);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const idSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  void activityEventCrud.add({
    id: `${idSeed}-${domain}-${action}-${slugify(entityId || entityTitle)}`,
    domain,
    action,
    entityId,
    entityTitle,
    source,
    dayKey: toDateInputValue(safeDate),
    timestamp: safeDate.toISOString(),
    metadata,
  }).catch((error) => {
    console.warn("Activity event log failed", error);
  });
}

function formatKanbanActivity(event: KanbanActivity) {
  if (event.action === "moved") {
    return `${getKanbanColumnTitle(event.fromColumnId)} -> ${getKanbanColumnTitle(event.toColumnId)}`;
  }
  if (event.action === "created") return `created in ${getKanbanColumnTitle(event.toColumnId)}`;
  return `deleted from ${getKanbanColumnTitle(event.fromColumnId)}`;
}

function getKanbanColumnTitle(columnId?: KanbanColumnId) {
  const defaultTitle = defaultKanbanColumns.find((column) => column.id === columnId)?.title;
  if (defaultTitle) return defaultTitle;
  if (!columnId) return "Unknown";
  return columnId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getProjectName(projects: TaskProject[], projectId?: string) {
  if (!projectId) return "Task link";
  return projects.find((project) => project.id === projectId)?.name ?? "Task link";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatTaskDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDashboardTasks(projects: TaskProject[]) {
  return projects.flatMap((project) =>
    (project.tasksByDay[project.currentDay] ?? []).map((task) => ({
      ...task,
      projectId: project.id,
      projectName: project.name,
      day: project.currentDay,
    })),
  );
}

function generateAgentRecommendations({
  goals,
  habits,
  projects,
  dashboardTasks,
  calendarEvents,
  kanbanCards,
  activityEvents = [],
  existing,
}: {
  goals: Goal[];
  habits: Habit[];
  projects: TaskProject[];
  dashboardTasks: ReturnType<typeof getDashboardTasks>;
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  activityEvents?: ActivityEvent[];
  existing: AgentRecommendation[];
}) {
  const now = new Date();
  const context = buildAgentContext({ goals, habits, projects, dashboardTasks, calendarEvents, kanbanCards, activityEvents, now });
  const learningMemory = getAgentLearningMemory(existing, activityEvents, now);
  const learningRows = new Map(learningMemory.rows.map((row) => [row.id, row]));
  const recommendations = [
    ...runPlannerAgent(context),
    ...runReviewerAgent(context),
    ...runMotivationAgent(context),
    ...runProjectAgent(context),
    ...runDisciplineAgent(context),
  ].map((recommendation) => {
    const memory = learningRows.get(recommendation.agentId);
    if (!memory) return recommendation;
    const trustAdjustment = (memory.trustScore - 58) * 0.12 - Math.max(0, memory.pending - 2) * 2;
    const confidenceAdjustment = (memory.precision - 50) * 0.08;
    return {
      ...recommendation,
      score: Math.round(clamp(recommendation.score + trustAdjustment, 0, 100)),
      confidence: Math.round(clamp(recommendation.confidence + confidenceAdjustment, 35, 98)),
    };
  });

  const existingKeys = new Set(existing.map((recommendation) => getAgentRecommendationKey(recommendation)));
  return recommendations
    .filter((recommendation) => recommendation.score >= 35)
    .filter((recommendation) => !existingKeys.has(getAgentRecommendationKey(recommendation)))
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence)
    .slice(0, 8)
    .map((recommendation, index) => ({
      ...recommendation,
      id: `${Date.now()}-${index}-${recommendation.agentId}-${slugify(recommendation.title)}`,
      status: "pending" as const,
      createdAt: now.toISOString(),
    }));
}

type AgentDraft = Omit<AgentRecommendation, "id" | "createdAt" | "status"> & {
  score: number;
  confidence: number;
  evidence: string[];
};

type AgentContext = {
  now: Date;
  goals: Goal[];
  projects: TaskProject[];
  dashboardTasks: ReturnType<typeof getDashboardTasks>;
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  activityEvents: ActivityEvent[];
  activityDashboard: ReturnType<typeof getActivityDashboard>;
  behaviorInsights: ReturnType<typeof getBehaviorInsights>;
  protocolMemory: ReturnType<typeof getProtocolMemory>;
  forecastMemory: ReturnType<typeof getForecastBalanceMemory>;
  agentOutcomeImpacts: AgentOutcomeImpact[];
  staleAgentOutcomes: AgentOutcomeImpact[];
  loadForecast: ReturnType<typeof getLoadForecast>;
  topGoal?: Goal;
  activeProject?: TaskProject;
  overdueCards: KanbanCard[];
  dueSoonCards: KanbanCard[];
  highOpenCards: KanbanCard[];
  blockedCards: KanbanCard[];
  staleCards: KanbanCard[];
  upcomingEvents: ReturnType<typeof getUpcomingEvents>;
  incompleteTasks: ReturnType<typeof getDashboardTasks>;
  missedHabits: Habit[];
  habitCompletion: number;
  dailyTaskCompletion: number;
  avgGoalProgress: number;
  projectPressure: number;
  calendarPressure: number;
  kanbanPressure: number;
  driftScore: number;
  executionLoad: number;
};

function buildAgentContext({
  goals,
  habits,
  projects,
  dashboardTasks,
  calendarEvents,
  kanbanCards,
  activityEvents = [],
  now,
}: {
  goals: Goal[];
  habits: Habit[];
  projects: TaskProject[];
  dashboardTasks: ReturnType<typeof getDashboardTasks>;
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  activityEvents?: ActivityEvent[];
  now: Date;
}): AgentContext {
  const openCards = kanbanCards.filter((card) => card.columnId !== "done" && !card.archivedAt);
  const overdueCards = openCards.filter((card) => getDueState(card.dueDate) === "overdue");
  const dueSoonCards = openCards.filter((card) => {
    const due = parseDateInput(card.dueDate);
    return due ? daysBetween(now, due) >= 0 && daysBetween(now, due) <= 3 : false;
  });
  const highOpenCards = openCards.filter((card) => ["ziftinity", "high"].includes(card.priority));
  const blockedCards = openCards.filter((card) => Boolean(card.blockedBy));
  const staleCards = openCards.filter((card) => card.subtasks.length > 0 && getSubtaskProgress(card) === 0 && ["planned", "in-progress", "review"].includes(card.columnId));
  const incompleteTasks = dashboardTasks.filter((task) => !task.done);
  const missedHabits = habits.filter((habit) => !habit.done);
  const upcomingEvents = getUpcomingEvents(calendarEvents, now);
  const avgGoalProgress = goals.reduce((total, goal) => total + goal.progress, 0) / Math.max(goals.length, 1);
  const habitCompletion = ((habits.length - missedHabits.length) / Math.max(habits.length, 1)) * 100;
  const dailyTaskCompletion = ((dashboardTasks.length - incompleteTasks.length) / Math.max(dashboardTasks.length, 1)) * 100;
  const projectPressure = projects.reduce((total, project) => total + getProjectPressure(project, now), 0) / Math.max(projects.length, 1);
  const calendarPressure = clamp(upcomingEvents.length * 8 + dueSoonCards.length * 12, 0, 100);
  const kanbanPressure = clamp(overdueCards.length * 24 + blockedCards.length * 18 + highOpenCards.length * 10 + staleCards.length * 8, 0, 100);
  const executionLoad = clamp(incompleteTasks.length * 12 + missedHabits.length * 8 + openCards.length * 5 + upcomingEvents.length * 4, 0, 100);
  const driftScore = clamp((100 - dailyTaskCompletion) * 0.28 + (100 - habitCompletion) * 0.32 + kanbanPressure * 0.28 + Math.max(0, projectPressure - avgGoalProgress) * 0.12, 0, 100);
  const activityDashboard = getActivityDashboard(activityEvents, now);
  const behaviorInsights = getBehaviorInsights(activityEvents);
  const protocolMemory = getProtocolMemory(activityEvents, now);
  const forecastMemory = getForecastBalanceMemory(activityEvents, now);
  const agentOutcomeImpacts = getAgentOutcomeImpacts(activityEvents, now);
  const staleAgentOutcomes = agentOutcomeImpacts.filter((impact) => impact.stale);
  const loadForecast = getLoadForecast({ projects, calendarEvents, kanbanCards, now });

  return {
    now,
    goals,
    projects,
    dashboardTasks,
    calendarEvents,
    kanbanCards,
    activityEvents,
    activityDashboard,
    behaviorInsights,
    protocolMemory,
    forecastMemory,
    agentOutcomeImpacts,
    staleAgentOutcomes,
    loadForecast,
    topGoal: sortGoals(goals)[0],
    activeProject: projects.map((project) => ({ project, pressure: getProjectPressure(project, now) })).sort((a, b) => b.pressure - a.pressure)[0]?.project,
    overdueCards,
    dueSoonCards,
    highOpenCards,
    blockedCards,
    staleCards,
    upcomingEvents,
    incompleteTasks,
    missedHabits,
    habitCompletion,
    dailyTaskCompletion,
    avgGoalProgress,
    projectPressure,
    calendarPressure,
    kanbanPressure,
    driftScore,
    executionLoad,
  };
}

function getTodayReadiness(context: AgentContext) {
  return Math.round(clamp(
    context.habitCompletion * 0.24 +
      context.dailyTaskCompletion * 0.24 +
      (100 - context.executionLoad) * 0.2 +
      (100 - context.driftScore) * 0.2 +
      (100 - context.kanbanPressure) * 0.12,
    0,
    100,
  ));
}

function getTodayReadinessLabel(score: number) {
  if (score >= 78) return "Prime";
  if (score >= 58) return "Stable";
  if (score >= 40) return "Loaded";
  return "Rescue";
}

function getTodayHeadline(context: AgentContext, eventCount: number) {
  if (context.overdueCards.length > 0) return "Stabilize overdue work before adding new commitments.";
  if (context.executionLoad >= 75) return "Heavy day detected. Keep the plan narrow.";
  if (eventCount >= 3) return "Calendar pressure is active. Protect the focus block.";
  if (context.incompleteTasks.length > 0) return "Execution path is clear. Start with the first unfinished task.";
  return "Low-friction day. Use the surplus for maintenance and review.";
}

function getTodayDirective(context: AgentContext, focusItem: TodayFocusItem | undefined, eventCount: number) {
  if (context.blockedCards.length > 0) {
    return `Clear or re-scope ${context.blockedCards[0].title} before it keeps leaking attention into the rest of the plan.`;
  }
  if (context.overdueCards.length > 0) {
    return `Start with ${context.overdueCards[0].title}; the board is carrying overdue pressure that will distort today's priorities.`;
  }
  if (focusItem) {
    return `Make ${focusItem.title} the first measurable win, then reassess the remaining load from the brief.`;
  }
  if (eventCount > 0) {
    return "Calendar is the primary constraint today. Keep tasks lightweight around scheduled commitments.";
  }
  return "No urgent pressure detected. Use this window to finish open loops or deepen study notes.";
}

function getTodayFocusItems(context: AgentContext, goals: Goal[], urgentCards: KanbanCard[]): TodayFocusItem[] {
  const taskItems: TodayFocusItem[] = context.incompleteTasks.map((task, index) => ({
    id: `task-${task.projectId}-${task.day}-${task.id}`,
    title: task.name,
    source: `${task.projectName} - D${task.day}`,
    meta: "daily execution",
    score: 82 - index * 3 + context.projectPressure * 0.12,
    priority: context.projectPressure >= 72 ? "ziftinity" : "high",
    view: "tasks",
  }));

  const cardItems: TodayFocusItem[] = urgentCards.map((card) => ({
    id: `card-${card.id}`,
    title: card.title,
    source: getKanbanColumnTitle(card.columnId),
    meta: getTodayCardMeta(card),
    score: getTodayCardScore(card, context.now),
    priority: card.priority,
    progress: getSubtaskProgress(card),
    view: "kanban",
  }));

  const goalItems: TodayFocusItem[] = sortGoals(goals)
    .filter((goal) => goal.progress < 100)
    .slice(0, 3)
    .map((goal) => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      source: priorityLabel[goal.level],
      meta: `${goal.progress}% complete`,
      score: priorityToScore(goal.level) * 0.58 + (100 - goal.progress) * 0.28 + context.projectPressure * 0.14,
      priority: goal.level,
      progress: goal.progress,
      view: "goals",
    }));

  return [...taskItems, ...cardItems, ...goalItems]
    .sort((a, b) => b.score - a.score || priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title))
    .slice(0, 5);
}

function getTodayCardScore(card: KanbanCard, now: Date) {
  return getCardRiskScore(card, now) + (getDueState(card.dueDate) === "overdue" ? 18 : getDueState(card.dueDate) === "due-today" ? 12 : 0);
}

function getTodayCardMeta(card: KanbanCard) {
  const dueState = getDueState(card.dueDate);
  const dueDate = parseDateInput(card.dueDate);
  if (dueState === "overdue") return dueDate ? `overdue since ${formatShortDate(card.dueDate ?? "")}` : "overdue";
  if (dueState === "due-today") return "due today";
  return dueDate ? `due ${formatShortDate(card.dueDate ?? "")}` : priorityLabel[card.priority];
}

function runPlannerAgent(context: AgentContext): AgentDraft[] {
  const { activeProject, topGoal, incompleteTasks, projectPressure, dailyTaskCompletion, executionLoad } = context;
  const drafts: AgentDraft[] = [];

  if (activeProject && topGoal) {
    const dayTasks = activeProject.tasksByDay[activeProject.currentDay] ?? [];
    const dayHasGoalTask = dayTasks.some((task) => task.name.toLowerCase().includes(topGoal.title.toLowerCase().split(" ")[0] ?? ""));
    const score = weightedScore([
      [projectPressure, 0.36],
      [100 - dailyTaskCompletion, 0.26],
      [executionLoad, 0.18],
      [dayHasGoalTask ? 10 : 78, 0.2],
    ]);

    drafts.push({
      agentId: "planner",
      agentName: "Planner Agent",
      title: `Convert ${topGoal.title} into today's execution block`,
      body: `Planning score is high because schedule pressure and unfinished daily work are converging. Create one measurable D${activeProject.currentDay} action so the goal moves from intent to execution.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([projectPressure, 100 - dailyTaskCompletion, executionLoad]),
      source: `${Math.round(projectPressure)} project pressure`,
      evidence: [
        `${activeProject.name}: D${activeProject.currentDay}/${activeProject.deadlineDays}`,
        `${Math.round(dailyTaskCompletion)}% daily task completion`,
        `${incompleteTasks.length} open task${incompleteTasks.length === 1 ? "" : "s"} today`,
      ],
      action: {
        type: "create_task",
        label: "Create weighted next action",
        projectId: activeProject.id,
        day: activeProject.currentDay,
        taskName: `Advance ${topGoal.title}: 25-minute measurable block`,
      },
    });
  }

  const peakProject = [...context.loadForecast.peakDay.projectSignals].sort((a, b) => b.openTaskCount - a.openTaskCount)[0];
  if (peakProject && context.loadForecast.peakDay.load >= 68) {
    const score = clamp(context.loadForecast.peakDay.load + context.loadForecast.collisionDays * 6 + peakProject.openTaskCount * 4, 45, 96);
    drafts.push({
      agentId: "planner",
      agentName: "Planner Agent",
      title: `Pre-clear load before ${context.loadForecast.peakDay.dayLabel}`,
      body: `The forecast model sees ${context.loadForecast.peakDay.label} becoming crowded. Add one preparation task now so that day starts with fewer decisions and less carry-forward pressure.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.loadForecast.peakDay.load, peakProject.openTaskCount * 16, context.loadForecast.collisionDays * 18]),
      source: "two-week load forecast",
      evidence: [
        `${context.loadForecast.peakDay.load}% forecast peak`,
        `${peakProject.projectName}: D${peakProject.day}`,
        `${context.loadForecast.peakDay.topSignals.join(", ")}`,
      ],
      action: {
        type: "create_task",
        label: "Create pre-clear task",
        projectId: peakProject.projectId,
        day: peakProject.day,
        taskName: `Pre-clear ${context.loadForecast.peakDay.dayLabel}: close or move one flexible item`,
      },
    });
  }

  return drafts;
}

function runReviewerAgent(context: AgentContext): AgentDraft[] {
  const fuzzyTasks = context.incompleteTasks
    .map((task) => ({ task, score: getTaskAmbiguityScore(task.name) }))
    .filter(({ score }) => score >= 35)
    .sort((a, b) => b.score - a.score);
  const staleCard = context.staleCards.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])[0];
  const drafts: AgentDraft[] = [];

  if (fuzzyTasks[0]) {
    const { task, score: ambiguity } = fuzzyTasks[0];
    const score = weightedScore([[ambiguity, 0.5], [100 - context.dailyTaskCompletion, 0.22], [context.executionLoad, 0.28]]);
    drafts.push({
      agentId: "reviewer",
      agentName: "Reviewer Agent",
      title: `Decompose ambiguous task: ${task.name}`,
      body: `This task reads like a direction, not a finishable unit. Split it into a concrete verb, artifact, and completion test before it burns attention.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([ambiguity, context.executionLoad, 100 - context.dailyTaskCompletion]),
      source: `${task.projectName} - D${task.day}`,
      evidence: [`ambiguity index ${Math.round(ambiguity)}`, `${context.incompleteTasks.length} unfinished daily tasks`, `load index ${Math.round(context.executionLoad)}`],
      action: {
        type: "create_kanban",
        label: "Create decomposition card",
        title: `Decompose: ${task.name}`,
        description: `Rewrite ${task.name} as: verb + artifact + finish condition. Then attach the smallest next subtask.`,
        priority: score >= 70 ? "high" : "medium",
        tags: ["review", "decompose"],
      },
    });
  }

  if (staleCard) {
    const score = weightedScore([[context.kanbanPressure, 0.45], [100 - getSubtaskProgress(staleCard), 0.35], [priorityToScore(staleCard.priority), 0.2]]);
    drafts.push({
      agentId: "reviewer",
      agentName: "Reviewer Agent",
      title: `Inspect stalled card: ${staleCard.title}`,
      body: `The card is active but its checklist has not moved. Review the definition of done and decide whether the next step is unclear, blocked, or too large.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.kanbanPressure, priorityToScore(staleCard.priority), 100 - getSubtaskProgress(staleCard)]),
      source: getKanbanColumnTitle(staleCard.columnId),
      evidence: [`${getSubtaskProgress(staleCard)}% subtask completion`, `${priorityLabel[staleCard.priority]} priority`, `${getKanbanColumnTitle(staleCard.columnId)} column`],
      action: {
        type: "create_kanban",
        label: "Create review checkpoint",
        title: `Review stalled card: ${staleCard.title}`,
        description: `Audit blockers, completion criteria, and the next smallest action for ${staleCard.title}.`,
        priority: staleCard.priority,
        tags: ["review", "stalled"],
      },
    });
  }

  if (context.forecastMemory.balanceCount >= 2 && context.forecastMemory.undoRate >= 50) {
    const score = clamp(48 + context.forecastMemory.undoRate * 0.36 + context.forecastMemory.undoCount * 12, 52, 92);
    drafts.push({
      agentId: "reviewer",
      agentName: "Reviewer Agent",
      title: "Calibrate forecast balancer rules",
      body: "Forecast balancing is being undone often enough that the automation should be reviewed. Compare the moved tasks/cards against what you actually wanted protected, then tighten what counts as flexible.",
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.forecastMemory.undoRate, context.forecastMemory.undoCount * 22, context.forecastMemory.balanceCount * 12]),
      source: "forecast-memory model",
      evidence: [
        `${context.forecastMemory.undoRate}% forecast undo rate`,
        `${context.forecastMemory.undoCount} undo signal${context.forecastMemory.undoCount === 1 ? "" : "s"}`,
        `${context.forecastMemory.balanceCount} balance move${context.forecastMemory.balanceCount === 1 ? "" : "s"}`,
      ],
      action: {
        type: "create_kanban",
        label: "Create calibration card",
        title: "Calibrate forecast load balancer",
        description: "Review the last forecast balance moves. Mark which task/card types are safe to move automatically and which should require manual review.",
        priority: context.forecastMemory.undoRate >= 70 ? "high" : "medium",
        tags: ["forecast", "automation", "review"],
      },
    });
  }

  return drafts;
}

function runMotivationAgent(context: AgentContext): AgentDraft[] {
  const drafts: AgentDraft[] = [];
  const recoveryNeed = weightedScore([
    [100 - context.habitCompletion, 0.42],
    [100 - context.dailyTaskCompletion, 0.24],
    [context.executionLoad, 0.2],
    [context.calendarPressure, 0.14],
  ]);
  const easiestHabit = context.missedHabits.sort((a, b) => getHabitFriction(a) - getHabitFriction(b))[0];

  if (context.missedHabits.length > 0 || recoveryNeed >= 35) {
    drafts.push({
      agentId: "motivation",
      agentName: "Motivation Agent",
      title: easiestHabit ? `Recovery ladder: start with ${easiestHabit.name}` : "Protect momentum before the day fragments",
      body: `The recovery model is choosing the lowest-friction win first. Complete one small loop, then re-open the heavier work after the system sees proof of motion.`,
      severity: severityFromScore(recoveryNeed),
      score: recoveryNeed,
      confidence: confidenceFromSignals([100 - context.habitCompletion, context.executionLoad, context.missedHabits.length * 18]),
      source: `${Math.round(context.habitCompletion)}% habit completion`,
      evidence: [
        `${context.missedHabits.length} missed habit${context.missedHabits.length === 1 ? "" : "s"}`,
        `${Math.round(context.executionLoad)} execution load`,
        easiestHabit ? `${easiestHabit.time} suggested start` : "habit loop stable",
      ],
    });
  }

  if (context.protocolMemory.shutdownCount > 0 && context.protocolMemory.averageProgress < 60) {
    const score = weightedScore([
      [100 - context.protocolMemory.averageProgress, 0.48],
      [Math.min(context.protocolMemory.carryForwardCount * 18, 100), 0.34],
      [context.executionLoad, 0.18],
    ]);
    drafts.push({
      agentId: "motivation",
      agentName: "Motivation Agent",
      title: "Lower the shutdown threshold",
      body: "Protocol memory shows the day is being sealed, but too much remains open. Tomorrow should begin with a smaller first promise so the shutdown review records proof instead of carry-forward.",
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([100 - context.protocolMemory.averageProgress, context.protocolMemory.carryForwardCount * 18, context.protocolMemory.last7Shutdowns * 12]),
      source: "protocol-memory model",
      evidence: [
        `${context.protocolMemory.averageProgress}% average protocol close rate`,
        `${context.protocolMemory.carryForwardCount} carry-forward signal${context.protocolMemory.carryForwardCount === 1 ? "" : "s"}`,
        `${context.protocolMemory.last7Shutdowns} shutdown review${context.protocolMemory.last7Shutdowns === 1 ? "" : "s"} in 7 days`,
      ],
    });
  }

  return drafts;
}

function runProjectAgent(context: AgentContext): AgentDraft[] {
  const publicProofGap = context.goals
    .map((goal) => ({
      goal,
      score: weightedScore([[priorityToScore(goal.level), 0.34], [goal.progress, 0.22], [hasPortfolioCard(context.kanbanCards, goal) ? 0 : 100, 0.44]]),
    }))
    .sort((a, b) => b.score - a.score)[0];
  if (!publicProofGap) return [];

  return [
    {
      agentId: "project",
      agentName: "Project Agent",
      title: `Turn ${publicProofGap.goal.title} into proof of work`,
      body: `Portfolio value is high because this objective has priority weight but not enough visible artifact coverage. Ship a small proof unit: demo, case note, repo entry, or before/after snapshot.`,
      severity: severityFromScore(publicProofGap.score),
      score: publicProofGap.score,
      confidence: confidenceFromSignals([priorityToScore(publicProofGap.goal.level), publicProofGap.goal.progress, 70]),
      source: "artifact gap model",
      evidence: [
        `${priorityLabel[publicProofGap.goal.level]} goal priority`,
        `${publicProofGap.goal.progress}% goal progress`,
        hasPortfolioCard(context.kanbanCards, publicProofGap.goal) ? "portfolio card already exists" : "no matching portfolio card found",
      ],
      action: {
        type: "create_kanban",
        label: "Create proof artifact",
        title: `Proof artifact: ${publicProofGap.goal.title}`,
        description: `Create a visible artifact for ${publicProofGap.goal.title}: demo, write-up, repo update, or measurable progress snapshot.`,
        priority: publicProofGap.goal.level === "low" ? "medium" : publicProofGap.goal.level,
        tags: ["portfolio", "proof", "artifact"],
        dueDate: toDateInputValue(addDays(context.now, 7)),
      },
    },
  ];
}

function runDisciplineAgent(context: AgentContext): AgentDraft[] {
  const drafts: AgentDraft[] = [];
  const riskyCard = [...context.overdueCards, ...context.blockedCards, ...context.highOpenCards].sort(
    (a, b) => getCardRiskScore(b, context.now) - getCardRiskScore(a, context.now),
  )[0];
  const recentDeferrals = context.activityEvents.filter((event) => event.action === "deferred" && daysBetween(new Date(event.timestamp), context.now) <= 7);
  const staleAgentOutcome = [...context.staleAgentOutcomes].sort((a, b) => b.ageDays - a.ageDays || a.title.localeCompare(b.title))[0];

  if (riskyCard) {
    const risk = getCardRiskScore(riskyCard, context.now);
    const score = weightedScore([[risk, 0.5], [context.driftScore, 0.3], [context.kanbanPressure, 0.2]]);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: `Intervention required: ${riskyCard.title}`,
      body: `The drift model sees priority, due-date pressure, and board congestion crossing the intervention threshold. Decide whether this card gets finished, reduced, delegated, or removed from active attention.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([risk, context.driftScore, context.kanbanPressure]),
      source: `${Math.round(context.driftScore)} drift score`,
      evidence: [
        `${priorityLabel[riskyCard.priority]} priority`,
        riskyCard.dueDate ? `${getDueState(riskyCard.dueDate) || "scheduled"} due state` : "no due date",
        riskyCard.blockedBy ? `blocked by ${riskyCard.blockedBy}` : `${getKanbanColumnTitle(riskyCard.columnId)} column`,
      ],
      action: {
        type: "create_calendar",
        label: "Schedule intervention",
        title: `Intervention: ${riskyCard.title}`,
        date: toDateInputValue(context.now),
        time: "18:00",
        kind: "project",
      },
    });
  }

  if (staleAgentOutcome) {
    const score = clamp(56 + staleAgentOutcome.ageDays * 4 + context.staleAgentOutcomes.length * 8 + context.driftScore * 0.14, 58, 96);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: `Rescue stale agent outcome: ${staleAgentOutcome.title}`,
      body: "An accepted agent recommendation created work, but the activity ledger has not seen follow-through. Schedule a short rescue checkpoint: finish it, shrink it, or explicitly retire it so agent trust reflects reality.",
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([staleAgentOutcome.ageDays * 12, context.staleAgentOutcomes.length * 18, context.driftScore]),
      source: "agent-outcome model",
      evidence: [
        `${staleAgentOutcome.agentName} created ${staleAgentOutcome.title}`,
        `${staleAgentOutcome.ageDays} day${staleAgentOutcome.ageDays === 1 ? "" : "s"} without visible follow-through`,
        `${context.staleAgentOutcomes.length} stale agent outcome${context.staleAgentOutcomes.length === 1 ? "" : "s"}`,
      ],
      action: {
        type: "create_calendar",
        label: "Schedule outcome rescue",
        title: `Outcome rescue: ${staleAgentOutcome.title}`,
        date: toDateInputValue(context.now),
        time: "16:30",
        kind: "project",
      },
    });
  }

  if (recentDeferrals.length >= 2) {
    const topDeferredDomain = [...countBy(recentDeferrals, (event) => event.domain).entries()].sort((a, b) => b[1] - a[1])[0];
    const score = clamp(48 + recentDeferrals.length * 9 + context.driftScore * 0.2, 45, 92);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: `Deferral pattern detected in ${formatActivityDomain(topDeferredDomain?.[0] ?? "task")}`,
      body: `The activity ledger shows repeated carry-forward decisions this week. This is usually a scope problem, not a discipline problem: shrink the next action until it can be completed in one sitting.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([recentDeferrals.length * 18, context.driftScore, context.executionLoad]),
      source: "activity-ledger model",
      evidence: [
        `${recentDeferrals.length} deferral signal${recentDeferrals.length === 1 ? "" : "s"} in 7 days`,
        `${context.activityDashboard.last7Count} total ledger events this week`,
        `${context.behaviorInsights.drift.value} current drift source`,
      ],
      action: {
        type: "create_calendar",
        label: "Schedule scope reset",
        title: "Scope reset: reduce carry-forward",
        date: toDateInputValue(context.now),
        time: "17:30",
        kind: "project",
      },
    });
  }

  if (context.protocolMemory.carryForwardCount >= 2) {
    const score = clamp(52 + context.protocolMemory.carryForwardCount * 8 + (100 - context.protocolMemory.averageProgress) * 0.22, 48, 94);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: "Protocol carry-forward loop detected",
      body: "Shutdown memory shows repeated carry-forward inside the weekly protocol. Reduce tomorrow's packet before execution starts: one proof task, one recovery task, and no extra expansion until the proof task is closed.",
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.protocolMemory.carryForwardCount * 16, 100 - context.protocolMemory.averageProgress, context.protocolMemory.openLoopCount * 10]),
      source: "protocol-memory model",
      evidence: [
        `${context.protocolMemory.carryForwardCount} carried protocol task${context.protocolMemory.carryForwardCount === 1 ? "" : "s"}`,
        `${context.protocolMemory.openLoopCount} open loop${context.protocolMemory.openLoopCount === 1 ? "" : "s"} at shutdown`,
        `${context.protocolMemory.averageProgress}% average close rate`,
      ],
      action: {
        type: "create_calendar",
        label: "Schedule protocol reset",
        title: "Protocol reset: reduce tomorrow packet",
        date: toDateInputValue(addDays(context.now, 1)),
        time: "08:15",
        kind: "project",
      },
    });
  }

  if (context.loadForecast.collisionDays >= 2 || context.loadForecast.peakDay.load >= 85) {
    const score = clamp(context.loadForecast.peakDay.load + context.loadForecast.collisionDays * 7, 58, 98);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: `Schedule load intervention for ${context.loadForecast.peakDay.dayLabel}`,
      body: "The two-week forecast shows a likely load collision. Protect the peak day by making a calendar checkpoint before it arrives, then move one flexible item out of the collision window.",
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.loadForecast.peakDay.load, context.loadForecast.collisionDays * 20, context.executionLoad]),
      source: "forecast-collision model",
      evidence: [
        `${context.loadForecast.peakDay.load}% peak load`,
        `${context.loadForecast.collisionDays} collision day${context.loadForecast.collisionDays === 1 ? "" : "s"}`,
        `${context.loadForecast.peakDay.topSignals.join(", ")}`,
      ],
      action: {
        type: "create_calendar",
        label: "Schedule load intervention",
        title: `Load intervention: ${context.loadForecast.peakDay.dayLabel}`,
        date: toDateInputValue(
          context.loadForecast.peakDay.date <= startOfDay(context.now)
            ? context.now
            : addDays(context.loadForecast.peakDay.date, -1),
        ),
        time: "17:00",
        kind: "project",
      },
    });
  }

  if (context.upcomingEvents.length === 0 && context.activeProject) {
    const score = weightedScore([[context.projectPressure, 0.45], [100 - context.calendarPressure, 0.35], [context.executionLoad, 0.2]]);
    drafts.push({
      agentId: "discipline",
      agentName: "Discipline Agent",
      title: `Add accountability checkpoint for ${context.activeProject.name}`,
      body: `The calendar is not applying pressure to the most active project. A checkpoint creates an external review moment before drift becomes invisible.`,
      severity: severityFromScore(score),
      score,
      confidence: confidenceFromSignals([context.projectPressure, 100 - context.calendarPressure, context.executionLoad]),
      source: "calendar-pressure model",
      evidence: [`0 events in next 14 days`, `${Math.round(context.projectPressure)} project pressure`, `${context.activeProject.deadlineDays - context.activeProject.currentDay} days remaining`],
      action: {
        type: "create_calendar",
        label: "Create accountability checkpoint",
        title: `Checkpoint: ${context.activeProject.name}`,
        date: toDateInputValue(addDays(context.now, 3)),
        time: "09:00",
        kind: "project",
      },
    });
  }

  return drafts;
}

type AgentActionResult = {
  domain: ActivityEventDomain;
  entityId: string;
  entityTitle: string;
  actionType: NonNullable<AgentRecommendation["action"]>["type"];
};

function getAgentActionOriginMetadata(action: NonNullable<AgentRecommendation["action"]>, recommendation?: AgentRecommendation): ActivityEventMetadata {
  return {
    actionType: action.type,
    originRecommendationId: recommendation?.id,
    originRecommendationTitle: recommendation?.title,
    originAgentId: recommendation?.agentId,
    originAgentName: recommendation?.agentName,
    originSeverity: recommendation?.severity,
  };
}

async function executeAgentAction(action: NonNullable<AgentRecommendation["action"]>, recommendation?: AgentRecommendation): Promise<AgentActionResult> {
  const originMetadata = getAgentActionOriginMetadata(action, recommendation);

  if (action.type === "create_task") {
    const task: ProjectTask = {
      id: `${Date.now()}-${action.taskName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: action.taskName,
      done: false,
    };
    await taskProjectCrud.addTask(action.projectId, action.day, task);
    logActivityEvent({
      domain: "task",
      action: "created",
      entityId: task.id,
      entityTitle: task.name,
      source: "Agent action",
      metadata: { ...originMetadata, projectId: action.projectId, day: action.day },
    });
    return { domain: "task", entityId: task.id, entityTitle: task.name, actionType: action.type };
  }

  if (action.type === "create_kanban") {
    const card: KanbanCard = {
      id: `${Date.now()}-${action.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: action.title,
      description: action.description,
      columnId: "backlog",
      priority: action.priority,
      tags: action.tags,
      labels: action.tags.slice(0, 2).map((tag) => ({ name: tag, color: "cyan" })),
      subtasks: [],
      trackedMinutes: 0,
      attachments: [],
      comments: [],
      dueDate: action.dueDate,
      order: Date.now(),
    };
    await kanbanCrud.add(card);
    logKanbanActivity({ card, action: "created", toColumnId: card.columnId });
    logActivityEvent({
      domain: "kanban",
      action: "created",
      entityId: card.id,
      entityTitle: card.title,
      source: "Agent action",
      metadata: { ...originMetadata, priority: card.priority, dueDate: card.dueDate, toColumnId: card.columnId },
    });
    return { domain: "kanban", entityId: card.id, entityTitle: card.title, actionType: action.type };
  }

  const event: CalendarEvent = {
    id: `${Date.now()}-${action.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    date: action.date,
    day: parseDateInput(action.date)?.getDate() ?? new Date().getDate(),
    title: action.title,
    kind: action.kind,
    time: action.time,
  };
  await calendarCrud.add(event);
  logActivityEvent({
    domain: "calendar",
    action: "created",
    entityId: event.id,
    entityTitle: event.title,
    source: "Agent action",
    metadata: { ...originMetadata, kind: event.kind, date: event.date, time: event.time },
  });
  return { domain: "calendar", entityId: event.id, entityTitle: event.title, actionType: action.type };
}

function agentSeverityToPriority(severity: AgentRecommendation["severity"]): Priority {
  if (severity === "critical") return "ziftinity";
  if (severity === "warning") return "high";
  if (severity === "notice") return "medium";
  return "low";
}

function weightedScore(parts: Array<[number, number]>) {
  const weight = parts.reduce((total, [, itemWeight]) => total + itemWeight, 0) || 1;
  return Math.round(clamp(parts.reduce((total, [value, itemWeight]) => total + clamp(value, 0, 100) * itemWeight, 0) / weight, 0, 100));
}

function confidenceFromSignals(signals: number[]) {
  if (signals.length === 0) return 50;
  const average = signals.reduce((total, signal) => total + clamp(signal, 0, 100), 0) / signals.length;
  const spread = Math.max(...signals) - Math.min(...signals);
  return Math.round(clamp(52 + average * 0.38 - spread * 0.12 + signals.length * 4, 35, 96));
}

function severityFromScore(score: number): AgentRecommendation["severity"] {
  if (score >= 82) return "critical";
  if (score >= 65) return "warning";
  if (score >= 48) return "notice";
  return "info";
}

function priorityToScore(priority: Priority) {
  if (priority === "ziftinity") return 100;
  if (priority === "high") return 78;
  if (priority === "medium") return 52;
  return 28;
}

function getProjectPressure(project: TaskProject, now: Date) {
  const start = getProjectStartDate(project);
  const end = getProjectEndDate(project);
  const totalDays = Math.max(getDateRangeDays(toDateInputValue(start), toDateInputValue(end)), 1);
  const elapsedDays = clamp(daysBetween(start, now) + 1, 1, totalDays);
  const expectedProgress = (elapsedDays / totalDays) * 100;
  const actualProgress = getProjectCompletion(project);
  const remainingRatio = 100 - (daysBetween(now, end) / totalDays) * 100;
  return clamp((expectedProgress - actualProgress) * 0.62 + remainingRatio * 0.26 + getOpenProjectTasks(project) * 4, 0, 100);
}

function getProjectCompletion(project: TaskProject) {
  const tasks = Object.values(project.tasksByDay ?? {}).flat();
  if (tasks.length === 0) return 0;
  return (tasks.filter((task) => task.done).length / tasks.length) * 100;
}

function getOpenProjectTasks(project: TaskProject) {
  return Object.values(project.tasksByDay ?? {}).flat().filter((task) => !task.done).length;
}

function getTaskAmbiguityScore(name: string) {
  const words = name.toLowerCase().split(/\s+/).filter(Boolean);
  const weakVerbs = ["work", "fix", "handle", "do", "make", "improve", "update", "review", "start", "continue"];
  const measurableTerms = ["submit", "publish", "ship", "write", "record", "send", "create", "finish", "test", "deploy", "call", "book"];
  const hasWeakVerb = words.some((word) => weakVerbs.includes(word));
  const hasMeasurableTerm = words.some((word) => measurableTerms.includes(word));
  const lengthPenalty = words.length <= 2 ? 24 : words.length >= 8 ? -8 : 8;
  return clamp(42 + (hasWeakVerb ? 24 : 0) + (hasMeasurableTerm ? -20 : 12) + lengthPenalty, 0, 100);
}

function getHabitFriction(habit: Habit) {
  const time = Number(habit.time.split(":")[0] ?? 12);
  const durationText = habit.duration.toLowerCase();
  const durationPenalty = durationText.includes("min") ? Number(durationText.match(/\d+/)?.[0] ?? 15) : durationText.includes("reflection") ? 12 : 20;
  return durationPenalty + (time >= 20 ? 8 : 0) + (habit.name.length > 18 ? 6 : 0);
}

function hasPortfolioCard(cards: KanbanCard[], goal: Goal) {
  const goalTokens = goal.title.toLowerCase().split(/\s+/).filter((token) => token.length > 2);
  return cards.some((card) => {
    const haystack = `${card.title} ${card.description} ${card.tags.join(" ")}`.toLowerCase();
    return haystack.includes("portfolio") || haystack.includes("artifact") || goalTokens.some((token) => haystack.includes(token));
  });
}

function getCardRiskScore(card: KanbanCard, now: Date) {
  const due = parseDateInput(card.dueDate);
  const duePressure = due ? clamp(70 - daysBetween(now, due) * 12, 0, 100) : 24;
  const blockedPressure = card.blockedBy ? 86 : 0;
  const progressPressure = card.subtasks.length ? 100 - getSubtaskProgress(card) : 36;
  const columnPressure = card.columnId === "in-progress" ? 72 : card.columnId === "review" ? 58 : card.columnId === "planned" ? 46 : 32;
  return weightedScore([
    [priorityToScore(card.priority), 0.24],
    [duePressure, 0.28],
    [blockedPressure, 0.2],
    [progressPressure, 0.16],
    [columnPressure, 0.12],
  ]);
}

function getAgentRecommendationKey(recommendation: Pick<AgentRecommendation, "agentId" | "title" | "source">) {
  return `${recommendation.agentId}:${slugify(recommendation.title)}:${slugify(recommendation.source)}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "signal";
}

function daysBetween(start: Date, end: Date) {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((endDay - startDay) / 86400000);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCurrentObjectives(projects: TaskProject[]) {
  return projects
    .map((project) => {
      const allTasks = Object.values(project.tasksByDay ?? {}).flat();
      const complete = allTasks.filter((task) => task.done).length;
      const progress = Math.round((complete / Math.max(allTasks.length, 1)) * 100);
      return {
        id: project.id,
        name: project.name,
        value: `D${project.currentDay} / ${project.deadlineDays}`,
        done: progress >= 100,
        progress,
      };
    })
    .sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name))
    .slice(0, 4);
}

function getDashboardTimeline(goals: Goal[], events: ReturnType<typeof getUpcomingEvents>) {
  const goalItems = goals.map((goal) => {
    const dueDate = parseGoalDueDate(goal.due);
    return {
      date: dueDate,
      month: dueDate ? new Intl.DateTimeFormat("en-US", { month: "short" }).format(dueDate) : "Goal",
      year: dueDate ? String(dueDate.getFullYear()) : "",
      name: goal.title,
      status: `${goal.progress}% - ${priorityLabel[goal.level]}`,
      tone: goal.level === "ziftinity" || goal.level === "high" ? "violet" : "cyan",
    };
  });

  const eventItems = events.map(({ event, date }) => ({
    date,
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    year: String(date.getFullYear()),
    name: event.title,
    status: `${event.kind} - ${event.time}`,
    tone: event.kind === "deadline" || event.kind === "project" ? "violet" : "cyan",
  }));

  return [...eventItems, ...goalItems]
    .sort((a, b) => (a.date?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.date?.getTime() ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 4);
}

function getDashboardReflection({
  goals,
  habits,
  dashboardTasks,
  upcomingEvents,
}: {
  goals: Goal[];
  habits: Habit[];
  dashboardTasks: ReturnType<typeof getDashboardTasks>;
  upcomingEvents: ReturnType<typeof getUpcomingEvents>;
}) {
  const completedHabits = habits.filter((habit) => habit.done).length;
  const completedTasks = dashboardTasks.filter((task) => task.done).length;
  const averageGoal = Math.round(goals.reduce((total, goal) => total + goal.progress, 0) / Math.max(goals.length, 1));
  const nextEvent = upcomingEvents[0];
  const body = [
    `${completedHabits}/${habits.length} habits are complete`,
    `${completedTasks}/${dashboardTasks.length} daily tasks are cleared`,
    `goal momentum is at ${averageGoal}%`,
    nextEvent ? `next signal: ${nextEvent.event.title} on ${formatUpcomingDate(nextEvent.date)}` : "no calendar pressure in the next 14 days",
  ].join(". ");

  return {
    body: `${body}.`,
    stamp: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    tags: [
      completedHabits === habits.length ? "Habits Clear" : "Habits Open",
      completedTasks === dashboardTasks.length ? "Tasks Clear" : "Tasks Open",
      averageGoal >= 70 ? "Momentum" : "Recalibrate",
    ],
  };
}

function parseGoalDueDate(value: string) {
  const withYear = /\d{4}/.test(value) ? value : `${value}, ${new Date().getFullYear()}`;
  const date = new Date(withYear);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makeCalendarDate(day: number) {
  return new Date(calendarYear, calendarMonth, day);
}

function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toTimeInputValue(date: Date) {
  return [String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0")].join(":");
}

function parseDateInput(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isPastCalendarDate(date: Date, today = startOfDay(new Date())) {
  return startOfDay(date).getTime() < today.getTime();
}

function getEventDate(event: CalendarEvent) {
  if (event.date) {
    const [year, month, day] = event.date.split("-").map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }
  return makeCalendarDate(event.day);
}

function getUpcomingEvents(events: CalendarEvent[], now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 14);

  return events
    .map((event) => ({ event, date: getEventDate(event) }))
    .filter(({ date }) => date >= start && date <= end)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.event.time.localeCompare(b.event.time));
}

function formatUpcomingDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default App;
