import Dexie, { type Table } from "dexie";
import type { CalendarEvent, Goal, Habit, ProjectTask, TaskProject } from "./types";

export class ProgressTrackerDatabase extends Dexie {
  goals!: Table<Goal, string>;
  habits!: Table<Habit, string>;
  taskProjects!: Table<TaskProject, string>;
  calendarEvents!: Table<CalendarEvent, string>;

  constructor() {
    super("ziftinity-progress-tracker");
    this.version(1).stores({
      goals: "id, level, progress",
      habits: "id, time, done",
      taskProjects: "id, currentDay, deadlineDays",
      calendarEvents: "id, day, kind, time",
    });
  }
}

export const db = new ProgressTrackerDatabase();

export async function seedDatabase(seed: {
  goals: Goal[];
  habits: Habit[];
  taskProjects: TaskProject[];
  calendarEvents: CalendarEvent[];
}) {
  const [goalCount, habitCount, projectCount, eventCount] = await Promise.all([
    db.goals.count(),
    db.habits.count(),
    db.taskProjects.count(),
    db.calendarEvents.count(),
  ]);

  await db.transaction("rw", db.goals, db.habits, db.taskProjects, db.calendarEvents, async () => {
    if (goalCount === 0) await db.goals.bulkPut(seed.goals);
    if (habitCount === 0) await db.habits.bulkPut(seed.habits);
    if (projectCount === 0) await db.taskProjects.bulkPut(seed.taskProjects);
    if (eventCount === 0) await db.calendarEvents.bulkPut(seed.calendarEvents);
  });
}

export const goalCrud = {
  add(goal: Goal) {
    return db.goals.put(goal);
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
  delete(id: string) {
    return db.calendarEvents.delete(id);
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
  async addTask(projectId: string, day: number, task: ProjectTask) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...project.tasksByDay,
        [day]: [...(project.tasksByDay[day] ?? []), task],
      },
    });
  },
  async updateTask(projectId: string, day: number, taskId: string, updater: (task: ProjectTask) => ProjectTask) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...project.tasksByDay,
        [day]: (project.tasksByDay[day] ?? []).map((task) => (task.id === taskId ? updater(task) : task)),
      },
    });
  },
  async deleteTask(projectId: string, day: number, taskId: string) {
    const project = await db.taskProjects.get(projectId);
    if (!project) return;
    await db.taskProjects.put({
      ...project,
      tasksByDay: {
        ...project.tasksByDay,
        [day]: (project.tasksByDay[day] ?? []).filter((task) => task.id !== taskId),
      },
    });
  },
};
