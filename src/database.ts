import Dexie, { type Table } from "dexie";
import type { ActivityEvent, AgentRecommendation, CalendarEvent, Goal, Habit, KanbanActivity, KanbanCard, KanbanColumnId, ProjectTask, SkillRecord, StudyFolder, StudyNote, TaskProject } from "./types";

export class ProgressTrackerDatabase extends Dexie {
  goals!: Table<Goal, string>;
  habits!: Table<Habit, string>;
  taskProjects!: Table<TaskProject, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  kanbanCards!: Table<KanbanCard, string>;
  kanbanActivity!: Table<KanbanActivity, string>;
  activityEvents!: Table<ActivityEvent, string>;
  agentRecommendations!: Table<AgentRecommendation, string>;
  skillRecords!: Table<SkillRecord, string>;
  studyNotes!: Table<StudyNote, string>;
  studyFolders!: Table<StudyFolder, string>;

  constructor() {
    super("ziftinity-progress-tracker");
    this.version(1).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
    });
    this.version(2).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
    });
    this.version(3).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
    });
    this.version(4).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
    });
    this.version(5).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, updatedAt",
    });
    this.version(6).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, name, createdAt",
    });
    this.version(7).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, parentId, name, createdAt",
    });
    this.version(8).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, parentId, examDate, name, createdAt",
    });
    this.version(9).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, goalId, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, parentId, examDate, name, createdAt",
    });
    this.version(10).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, goalId, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      activityEvents: "id, domain, action, entityId, dayKey, timestamp",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, parentId, examDate, name, createdAt",
    });
    this.version(11).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, goalId, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
      kanbanCards: "id, columnId, priority, order",
      kanbanActivity: "id, cardId, action, createdAt",
      activityEvents: "id, domain, action, entityId, dayKey, timestamp",
      agentRecommendations: "id, agentId, status, severity, createdAt",
      skillRecords: "id, domain, route, career, status, updatedAt",
      studyNotes: "id, kind, pinned, folderId, updatedAt",
      studyFolders: "id, parentId, examDate, name, createdAt",
    });
  }
}

export const db = new ProgressTrackerDatabase();

export async function seedDatabase(seed: {
  goals: Goal[];
  habits: Habit[];
  taskProjects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  skillRecords: SkillRecord[];
  studyNotes: StudyNote[];
  studyFolders: StudyFolder[];
}) {
  const [goalCount, habitCount, projectCount, eventCount, kanbanCount, skillCount, noteCount, folderCount] = await Promise.all([
    db.goals.count(),
    db.habits.count(),
    db.taskProjects.count(),
    db.calendarEvents.count(),
    db.kanbanCards.count(),
    db.skillRecords.count(),
    db.studyNotes.count(),
    db.studyFolders.count(),
  ]);

  await db.transaction("rw", [db.goals, db.habits, db.taskProjects, db.calendarEvents, db.kanbanCards, db.skillRecords, db.studyNotes, db.studyFolders], async () => {
    if (goalCount === 0) await db.goals.bulkPut(seed.goals);
    if (habitCount === 0) await db.habits.bulkPut(seed.habits);
    if (projectCount === 0) await db.taskProjects.bulkPut(seed.taskProjects);
    if (eventCount === 0) await db.calendarEvents.bulkPut(seed.calendarEvents);
    if (kanbanCount === 0) await db.kanbanCards.bulkPut(seed.kanbanCards);
    if (skillCount === 0) {
      await db.skillRecords.bulkPut(seed.skillRecords);
    } else {
      const existingSkillIds = new Set((await db.skillRecords.toArray()).map((record) => record.id));
      const missingSkills = seed.skillRecords.filter((record) => !existingSkillIds.has(record.id));
      if (missingSkills.length > 0) await db.skillRecords.bulkPut(missingSkills);
    }
    if (noteCount === 0) await db.studyNotes.bulkPut(seed.studyNotes);
    if (folderCount === 0) {
      await db.studyFolders.bulkPut(seed.studyFolders);
    } else {
      const existingFolderIds = new Set((await db.studyFolders.toArray()).map((folder) => folder.id));
      const missingFolders = seed.studyFolders.filter((folder) => !existingFolderIds.has(folder.id));
      if (missingFolders.length > 0) await db.studyFolders.bulkPut(missingFolders);
    }
  });
}

export const goalCrud = {
  add(goal: Goal) {
    return db.goals.put(goal);
  },
  update(id: string, patch: Partial<Omit<Goal, "id">>) {
    return db.goals.update(id, patch);
  },
  delete(id: string) {
    return db.goals.delete(id);
  },
};

export const habitCrud = {
  add(habit: Habit) {
    return db.habits.put(habit);
  },
  update(id: string, patch: Partial<Omit<Habit, "id">>) {
    return db.habits.update(id, patch);
  },
  async toggle(id: string) {
    const habit = await db.habits.get(id);
    if (!habit) return 0;
    return db.habits.update(id, { done: !habit.done });
  },
  delete(id: string) {
    return db.habits.delete(id);
  },
};

export const calendarCrud = {
  add(event: CalendarEvent) {
    return db.calendarEvents.put(event);
  },
  addMany(events: CalendarEvent[]) {
    return db.calendarEvents.bulkPut(events);
  },
  delete(id: string) {
    return db.calendarEvents.delete(id);
  },
  deleteMany(ids: string[]) {
    return db.calendarEvents.bulkDelete(ids);
  },
};

export const kanbanCrud = {
  add(card: KanbanCard) {
    return db.kanbanCards.put(card);
  },
  update(id: string, patch: Partial<Omit<KanbanCard, "id">>) {
    return db.kanbanCards.update(id, patch);
  },
  async move(id: string, columnId: KanbanColumnId, order: number) {
    return db.kanbanCards.update(id, { columnId, order });
  },
  delete(id: string) {
    return db.kanbanCards.delete(id);
  },
};

export const kanbanActivityCrud = {
  add(activity: KanbanActivity) {
    return db.kanbanActivity.put(activity);
  },
};

export const activityEventCrud = {
  add(event: ActivityEvent) {
    return db.activityEvents.put(event);
  },
  delete(id: string) {
    return db.activityEvents.delete(id);
  },
  clear() {
    return db.activityEvents.clear();
  },
};

export const agentRecommendationCrud = {
  add(recommendation: AgentRecommendation) {
    return db.agentRecommendations.put(recommendation);
  },
  update(id: string, patch: Partial<Omit<AgentRecommendation, "id">>) {
    return db.agentRecommendations.update(id, patch);
  },
  delete(id: string) {
    return db.agentRecommendations.delete(id);
  },
};

export const skillRecordCrud = {
  add(record: SkillRecord) {
    return db.skillRecords.put(record);
  },
  update(id: string, patch: Partial<Omit<SkillRecord, "id">>) {
    return db.skillRecords.update(id, patch);
  },
  delete(id: string) {
    return db.skillRecords.delete(id);
  },
};

export const studyNoteCrud = {
  add(note: StudyNote) {
    return db.studyNotes.put(note);
  },
  update(id: string, patch: Partial<Omit<StudyNote, "id">>) {
    return db.studyNotes.update(id, patch);
  },
  delete(id: string) {
    return db.studyNotes.delete(id);
  },
};

export const studyFolderCrud = {
  add(folder: StudyFolder) {
    return db.studyFolders.put(folder);
  },
  update(id: string, patch: Partial<Omit<StudyFolder, "id">>) {
    return db.studyFolders.update(id, patch);
  },
  delete(id: string) {
    return db.studyFolders.delete(id);
  },
};

export const taskProjectCrud = {
  add(project: TaskProject) {
    return db.taskProjects.put(project);
  },
  delete(id: string) {
    return db.taskProjects.delete(id);
  },
  async setCurrentDay(projectId: string, day: number) {
    return db.taskProjects.update(projectId, { currentDay: day });
  },
  async updateDates(projectId: string, startDate: string, endDate: string, deadlineDays: number) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    return db.taskProjects.update(projectId, {
      startDate,
      endDate,
      deadlineDays,
      currentDay: Math.min(project.currentDay, deadlineDays),
    });
  },
  async addTask(projectId: string, day: number, task: ProjectTask) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...(project.tasksByDay ?? {}),
        [day]: [...((project.tasksByDay ?? {})[day] ?? []), task],
      },
    });
  },
  async updateTask(projectId: string, day: number, taskId: string, updater: (task: ProjectTask) => ProjectTask) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...(project.tasksByDay ?? {}),
        [day]: ((project.tasksByDay ?? {})[day] ?? []).map((task) => (task.id === taskId ? updater(task) : task)),
      },
    });
  },
  async deleteTask(projectId: string, day: number, taskId: string) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...(project.tasksByDay ?? {}),
        [day]: ((project.tasksByDay ?? {})[day] ?? []).filter((task) => task.id !== taskId),
      },
    });
  },
};
