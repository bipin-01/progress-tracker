import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import {
  calendarCrud as localCalendarCrud,
  db,
  goalCrud as localGoalCrud,
  habitCrud as localHabitCrud,
  taskProjectCrud as localTaskProjectCrud,
} from "./database";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import type { CalendarEvent, Goal, Habit, ProjectTask, TaskProject } from "./types";

type TableName = "goals" | "habits" | "task_projects" | "calendar_events";
type StoreMap = {
  goals: Goal;
  habits: Habit;
  task_projects: TaskProject;
  calendar_events: CalendarEvent;
};
type RemoteRow<T> = { id: string; data: T };

function useRemoteTable<T extends StoreMap[TableName]>(table: TableName, fallback: T[]) {
  const [records, setRecords] = useState<T[]>(fallback);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    async function load() {
      const { data, error } = await client.from(table).select("id,data");
      if (!active) return;
      if (error) {
        console.error(`Failed to load ${table}`, error);
        return;
      }
      setRecords((data as RemoteRow<T>[]).map((row) => row.data));
    }

    void load();
    const channel = client
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void load();
      })
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [fallback, table]);

  return records;
}

export function useGoalsData(seed: Goal[]) {
  const local = useLiveQuery(() => db.goals.toArray(), []) ?? seed;
  return useRemoteTable("goals", local);
}

export async function seedRemoteDatabase(seed: {
  goals: Goal[];
  habits: Habit[];
  taskProjects: TaskProject[];
  calendarEvents: CalendarEvent[];
}) {
  if (!supabase) return;
  const [{ count: goalCount }, { count: habitCount }, { count: projectCount }, { count: eventCount }] = await Promise.all([
    supabase.from("goals").select("id", { count: "exact", head: true }),
    supabase.from("habits").select("id", { count: "exact", head: true }),
    supabase.from("task_projects").select("id", { count: "exact", head: true }),
    supabase.from("calendar_events").select("id", { count: "exact", head: true }),
  ]);

  await Promise.all([
    goalCount === 0 ? supabase.from("goals").upsert(seed.goals.map((record) => ({ id: record.id, data: record }))) : null,
    habitCount === 0 ? supabase.from("habits").upsert(seed.habits.map((record) => ({ id: record.id, data: record }))) : null,
    projectCount === 0
      ? supabase.from("task_projects").upsert(seed.taskProjects.map((record) => ({ id: record.id, data: record })))
      : null,
    eventCount === 0
      ? supabase.from("calendar_events").upsert(seed.calendarEvents.map((record) => ({ id: record.id, data: record })))
      : null,
  ]);
}

export function useHabitsData(seed: Habit[]) {
  const local = useLiveQuery(() => db.habits.toArray(), []) ?? seed;
  return useRemoteTable("habits", local);
}

export function useTaskProjectsData(seed: TaskProject[]) {
  const local = useLiveQuery(() => db.taskProjects.toArray(), []) ?? seed;
  return useRemoteTable("task_projects", local);
}

export function useCalendarEventsData(seed: CalendarEvent[]) {
  const local = useLiveQuery(() => db.calendarEvents.toArray(), []) ?? seed;
  return useRemoteTable("calendar_events", local);
}

async function remoteUpsert<T extends { id: string }>(table: TableName, record: T) {
  if (!supabase) return;
  const { error } = await supabase.from(table).upsert({ id: record.id, data: record });
  if (error) throw error;
}

async function remoteDelete(table: TableName, id: string) {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

async function getRemoteRecord<T>(table: TableName, id: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("id,data").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? ((data as RemoteRow<T>).data as T) : null;
}

export const goalCrud = {
  async add(goal: Goal) {
    if (isSupabaseConfigured) return remoteUpsert("goals", goal);
    return localGoalCrud.add(goal);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("goals", id);
    return localGoalCrud.delete(id);
  },
};

export const habitCrud = {
  async add(habit: Habit) {
    if (isSupabaseConfigured) return remoteUpsert("habits", habit);
    return localHabitCrud.add(habit);
  },
  async update(id: string, patch: Partial<Omit<Habit, "id">>) {
    if (isSupabaseConfigured) {
      const habit = await getRemoteRecord<Habit>("habits", id);
      if (!habit) return;
      return remoteUpsert("habits", { ...habit, ...patch });
    }
    return localHabitCrud.update(id, patch);
  },
  async toggle(id: string) {
    if (isSupabaseConfigured) {
      const habit = await getRemoteRecord<Habit>("habits", id);
      if (!habit) return;
      return remoteUpsert("habits", { ...habit, done: !habit.done });
    }
    return localHabitCrud.toggle(id);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("habits", id);
    return localHabitCrud.delete(id);
  },
};

export const calendarCrud = {
  async add(event: CalendarEvent) {
    if (isSupabaseConfigured) return remoteUpsert("calendar_events", event);
    return localCalendarCrud.add(event);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("calendar_events", id);
    return localCalendarCrud.delete(id);
  },
};

export const taskProjectCrud = {
  async add(project: TaskProject) {
    if (isSupabaseConfigured) return remoteUpsert("task_projects", project);
    return localTaskProjectCrud.add(project);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("task_projects", id);
    return localTaskProjectCrud.delete(id);
  },
  async setCurrentDay(projectId: string, day: number) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsert("task_projects", { ...project, currentDay: day });
    }
    return localTaskProjectCrud.setCurrentDay(projectId, day);
  },
  async addTask(projectId: string, day: number, task: ProjectTask) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsert("task_projects", {
        ...project,
        tasksByDay: {
          ...project.tasksByDay,
          [day]: [...(project.tasksByDay[day] ?? []), task],
        },
      });
    }
    return localTaskProjectCrud.addTask(projectId, day, task);
  },
  async updateTask(projectId: string, day: number, taskId: string, updater: (task: ProjectTask) => ProjectTask) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsert("task_projects", {
        ...project,
        tasksByDay: {
          ...project.tasksByDay,
          [day]: (project.tasksByDay[day] ?? []).map((task) => (task.id === taskId ? updater(task) : task)),
        },
      });
    }
    return localTaskProjectCrud.updateTask(projectId, day, taskId, updater);
  },
  async deleteTask(projectId: string, day: number, taskId: string) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsert("task_projects", {
        ...project,
        tasksByDay: {
          ...project.tasksByDay,
          [day]: (project.tasksByDay[day] ?? []).filter((task) => task.id !== taskId),
        },
      });
    }
    return localTaskProjectCrud.deleteTask(projectId, day, taskId);
  },
};

export function useDataBackendLabel() {
  return useMemo(() => (isSupabaseConfigured ? "Supabase realtime" : "IndexedDB local"), []);
}
