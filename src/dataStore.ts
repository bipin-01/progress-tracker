import { useLiveQuery } from "dexie-react-hooks";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
  calendarCrud as localCalendarCrud,
  agentRecommendationCrud as localAgentRecommendationCrud,
  db,
  goalCrud as localGoalCrud,
  habitCrud as localHabitCrud,
  kanbanActivityCrud as localKanbanActivityCrud,
  kanbanCrud as localKanbanCrud,
  studyFolderCrud as localStudyFolderCrud,
  studyNoteCrud as localStudyNoteCrud,
  taskProjectCrud as localTaskProjectCrud,
} from "./database";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import type { AgentRecommendation, CalendarEvent, Goal, Habit, KanbanActivity, KanbanCard, KanbanColumnId, ProjectTask, StudyFolder, StudyNote, TaskProject } from "./types";

type TableName = "goals" | "habits" | "task_projects" | "calendar_events" | "kanban_cards" | "kanban_activity" | "agent_recommendations" | "study_notes" | "study_folders";
type StoreMap = {
  goals: Goal;
  habits: Habit;
  task_projects: TaskProject;
  calendar_events: CalendarEvent;
  kanban_cards: KanbanCard;
  kanban_activity: KanbanActivity;
  agent_recommendations: AgentRecommendation;
  study_notes: StudyNote;
  study_folders: StudyFolder;
};
type RemoteRow<T> = { id: string; user_id: string; data: T };
type BackendStatus = {
  label: string;
  error: string | null;
};

let currentUserId: string | null = null;
const backendStatusListeners = new Set<(status: BackendStatus) => void>();
let backendStatus: BackendStatus = {
  label: isSupabaseConfigured ? "Supabase realtime" : "IndexedDB local",
  error: isSupabaseConfigured ? null : "Supabase env vars missing; using local IndexedDB.",
};

function setBackendStatus(patch: Partial<BackendStatus>) {
  backendStatus = { ...backendStatus, ...patch };
  backendStatusListeners.forEach((listener) => listener(backendStatus));
}

function useRemoteTable<T extends StoreMap[TableName]>(table: TableName, fallback: T[], refreshKey = 0) {
  const [records, setRecords] = useState<T[]>(fallback);
  const { user, loading } = useSupabaseAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!supabase || loading || !userId) {
      setRecords(fallback);
      return;
    }
    const client = supabase;
    let active = true;

    async function load() {
      const { data, error } = await client.from(table).select("id,user_id,data").eq("user_id", userId);
      if (!active) return;
      if (error) {
        console.error(`Failed to load ${table}`, error);
        setBackendStatus({ error: `Supabase load failed for ${table}: ${error.message}` });
        return;
      }
      setBackendStatus({ label: "Supabase realtime", error: null });
      setRecords((data as RemoteRow<T>[]).map((row) => row.data));
    }

    void load();
    const channel = client
      .channel(`${table}-${userId}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` }, () => {
        void load();
      })
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [fallback, loading, refreshKey, table, userId]);

  return records;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      currentUserId = null;
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      currentUserId = data.user?.id ?? null;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      currentUserId = session?.user.id ?? null;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isConfigured: isSupabaseConfigured };
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) return;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useGoalsData(seed: Goal[], refreshKey = 0) {
  const local = useLiveQuery(() => db.goals.toArray(), []) ?? seed;
  return useRemoteTable("goals", local, refreshKey);
}

export async function seedRemoteDatabase(seed: {
  goals: Goal[];
  habits: Habit[];
  taskProjects: TaskProject[];
  calendarEvents: CalendarEvent[];
  kanbanCards: KanbanCard[];
  studyNotes: StudyNote[];
  studyFolders: StudyFolder[];
}, userId = currentUserId) {
  if (!supabase) return;
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }
  if (!userId) return;
  currentUserId = userId;
  const [{ count: goalCount }, { count: habitCount }, { count: projectCount }, { count: eventCount }, { count: kanbanCount }, { count: noteCount }, { count: folderCount }] = await Promise.all([
    supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("task_projects").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("calendar_events").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("kanban_cards").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("study_notes").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("study_folders").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const missingStudyFoldersPromise = folderCount && folderCount > 0
    ? supabase.from("study_folders").select("id").eq("user_id", userId).then(({ data }) => {
        const existingFolderIds = new Set((data ?? []).map((row) => row.id));
        return seed.studyFolders.filter((folder) => !existingFolderIds.has(folder.id));
      })
    : Promise.resolve(seed.studyFolders);
  const missingStudyFolders = await missingStudyFoldersPromise;

  await Promise.all([
    goalCount === 0 ? supabase.from("goals").upsert(seed.goals.map((record) => toGoalRow(record, userId))) : null,
    habitCount === 0 ? supabase.from("habits").upsert(seed.habits.map((record) => toRemoteRow(record, userId))) : null,
    projectCount === 0
      ? supabase.from("task_projects").upsert(seed.taskProjects.map((record) => toTaskProjectRow(record, userId)))
      : null,
    eventCount === 0
      ? supabase.from("calendar_events").upsert(seed.calendarEvents.map((record) => toRemoteRow(record, userId)))
      : null,
    kanbanCount === 0 ? remoteUpsertKanbanCards(seed.kanbanCards, userId) : null,
    noteCount === 0 ? supabase.from("study_notes").upsert(seed.studyNotes.map((record) => toStudyNoteRow(record, userId))) : null,
    missingStudyFolders.length > 0 ? supabase.from("study_folders").upsert(missingStudyFolders.map((record) => toStudyFolderRow(record, userId))) : null,
  ]);
}

export function useHabitsData(seed: Habit[], refreshKey = 0) {
  const local = useLiveQuery(() => db.habits.toArray(), []) ?? seed;
  return useRemoteTable("habits", local, refreshKey);
}

export function useTaskProjectsData(seed: TaskProject[], refreshKey = 0) {
  const local = useLiveQuery(() => db.taskProjects.toArray(), []) ?? seed;
  return useRemoteTable("task_projects", local, refreshKey);
}

export function useCalendarEventsData(seed: CalendarEvent[], refreshKey = 0) {
  const local = useLiveQuery(() => db.calendarEvents.toArray(), []) ?? seed;
  return useRemoteTable("calendar_events", local, refreshKey);
}

export function useKanbanCardsData(seed: KanbanCard[], refreshKey = 0) {
  const local = useLiveQuery(() => db.kanbanCards.toArray(), []) ?? seed;
  return useRemoteTable("kanban_cards", local, refreshKey);
}

export function useKanbanActivityData(refreshKey = 0) {
  const local = useLiveQuery(() => db.kanbanActivity.toArray(), []) ?? [];
  return useRemoteTable("kanban_activity", local, refreshKey);
}

export function useAgentRecommendationsData(refreshKey = 0) {
  const local = useLiveQuery(() => db.agentRecommendations.toArray(), []) ?? [];
  return useRemoteTable("agent_recommendations", local, refreshKey);
}

export function useStudyNotesData(seed: StudyNote[], refreshKey = 0) {
  const local = useLiveQuery(() => db.studyNotes.toArray(), []) ?? seed;
  return useRemoteTable("study_notes", local, refreshKey);
}

export function useStudyFoldersData(seed: StudyFolder[], refreshKey = 0) {
  const local = useLiveQuery(() => db.studyFolders.toArray(), []) ?? seed;
  return useRemoteTable("study_folders", local, refreshKey);
}

async function remoteUpsert<T extends { id: string }>(table: TableName, record: T) {
  if (!supabase || !currentUserId) return;
  const { error } = await supabase.from(table).upsert(toRemoteRow(record));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for ${table}: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function remoteDelete(table: TableName, id: string) {
  if (!supabase || !currentUserId) return;
  const { error } = await supabase.from(table).delete().eq("user_id", currentUserId).eq("id", id);
  if (error) {
    setBackendStatus({ error: `Supabase delete failed for ${table}: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function getRemoteRecord<T>(table: TableName, id: string) {
  if (!supabase || !currentUserId) return null;
  const { data, error } = await supabase.from(table).select("id,user_id,data").eq("user_id", currentUserId).eq("id", id).maybeSingle();
  if (error) {
    setBackendStatus({ error: `Supabase read failed for ${table}: ${error.message}` });
    throw error;
  }
  return data ? ((data as RemoteRow<T>).data as T) : null;
}

function toRemoteRow<T extends { id: string }>(record: T, userId = currentUserId) {
  return { id: record.id, user_id: userId, data: record };
}

function toGoalRow(goal: Goal, userId = currentUserId) {
  return {
    ...toRemoteRow(goal, userId),
    title: goal.title,
    due: goal.due,
    level: goal.level,
    progress: goal.progress,
    milestones: goal.milestones ?? [],
  };
}

function toTaskProjectRow(project: TaskProject, userId = currentUserId) {
  return {
    ...toRemoteRow(project, userId),
    name: project.name,
    goal_id: project.goalId ?? null,
    outcome: project.outcome ?? null,
    start_date: project.startDate,
    end_date: project.endDate,
    current_day: project.currentDay,
    deadline_days: project.deadlineDays,
  };
}

function toKanbanCardRow(card: KanbanCard, userId = currentUserId) {
  return {
    ...toRemoteRow(card, userId),
    title: card.title,
    description: card.description,
    column_id: card.columnId,
    priority: card.priority,
    linked_task_project_id: card.linkedTaskProjectId ?? null,
    linked_day: card.linkedDay ?? null,
    due_date: card.dueDate ?? null,
    tags: card.tags ?? [],
    estimate_minutes: card.estimateMinutes ?? null,
    tracked_minutes: card.trackedMinutes ?? 0,
    blocked_by: card.blockedBy ?? null,
    archived_at: card.archivedAt ?? null,
    card_order: card.order,
  };
}

function toKanbanActivityRow(activity: KanbanActivity, userId = currentUserId) {
  return {
    ...toRemoteRow(activity, userId),
    card_id: activity.cardId,
    card_title: activity.cardTitle,
    action: activity.action,
    from_column_id: activity.fromColumnId ?? null,
    to_column_id: activity.toColumnId ?? null,
    created_at: activity.createdAt,
  };
}

async function remoteUpsertKanbanCards(cards: KanbanCard[], userId = currentUserId) {
  await Promise.all(cards.map((card) => remoteUpsertKanbanCard(card, userId)));
}

async function remoteUpsertGoal(goal: Goal, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("goals").upsert(toGoalRow(goal, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for goals: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function remoteUpsertTaskProject(project: TaskProject, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("task_projects").upsert(toTaskProjectRow(project, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for task_projects: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function remoteUpsertKanbanCard(card: KanbanCard, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("kanban_cards").upsert(toKanbanCardRow(card, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for kanban_cards: ${error.message}` });
    throw error;
  }
  await syncKanbanCardChildren(card, userId);
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function syncKanbanCardChildren(card: KanbanCard, userId: string) {
  if (!supabase) return;
  const childDeletes = [
    supabase.from("kanban_card_labels").delete().eq("user_id", userId).eq("card_id", card.id),
    supabase.from("kanban_card_subtasks").delete().eq("user_id", userId).eq("card_id", card.id),
    supabase.from("kanban_card_attachments").delete().eq("user_id", userId).eq("card_id", card.id),
    supabase.from("kanban_card_comments").delete().eq("user_id", userId).eq("card_id", card.id),
  ];
  const deleteResults = await Promise.all(childDeletes);
  const deleteError = deleteResults.find((result) => result.error)?.error;
  if (deleteError) {
    setBackendStatus({ error: `Supabase Kanban child sync failed: ${deleteError.message}` });
    throw deleteError;
  }

  const writes = [];
  if (card.labels.length) {
    writes.push(supabase.from("kanban_card_labels").upsert(card.labels.map((label, index) => ({
          user_id: userId,
          card_id: card.id,
          name: label.name,
          color: label.color,
          label_order: index,
        }))));
  }
  if (card.subtasks.length) {
    writes.push(supabase.from("kanban_card_subtasks").upsert(card.subtasks.map((subtask, index) => ({
          user_id: userId,
          card_id: card.id,
          id: subtask.id,
          title: subtask.title,
          done: subtask.done,
          subtask_order: index,
        }))));
  }
  if (card.attachments.length) {
    writes.push(supabase.from("kanban_card_attachments").upsert(card.attachments.map((attachment, index) => ({
          user_id: userId,
          card_id: card.id,
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          attachment_order: index,
        }))));
  }
  if (card.comments.length) {
    writes.push(supabase.from("kanban_card_comments").upsert(card.comments.map((comment, index) => ({
          user_id: userId,
          card_id: card.id,
          id: comment.id,
          body: comment.body,
          created_at: comment.createdAt,
          comment_order: index,
        }))));
  }

  const writeResults = await Promise.all(writes);
  const writeError = writeResults.find((result) => result.error)?.error;
  if (writeError) {
    setBackendStatus({ error: `Supabase Kanban child write failed: ${writeError.message}` });
    throw writeError;
  }
}

async function remoteUpsertKanbanActivity(activity: KanbanActivity, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("kanban_activity").upsert(toKanbanActivityRow(activity, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for kanban_activity: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

function toAgentRecommendationRow(recommendation: AgentRecommendation, userId = currentUserId) {
  return {
    ...toRemoteRow(recommendation, userId),
    agent_id: recommendation.agentId,
    agent_name: recommendation.agentName,
    title: recommendation.title,
    severity: recommendation.severity,
    status: recommendation.status,
    source: recommendation.source,
    action_type: recommendation.action?.type ?? null,
    created_at: recommendation.createdAt,
  };
}

function toStudyNoteRow(note: StudyNote, userId = currentUserId) {
  return {
    ...toRemoteRow(note, userId),
    title: note.title,
    kind: note.kind,
    pinned: note.pinned,
    tags: note.tags,
    folder_id: note.folderId ?? null,
    source_name: note.sourceName ?? null,
    updated_at: note.updatedAt,
  };
}

function toStudyFolderRow(folder: StudyFolder, userId = currentUserId) {
  return {
    ...toRemoteRow(folder, userId),
    name: folder.name,
    color: folder.color,
    parent_id: folder.parentId ?? null,
    exam_date: folder.examDate ?? null,
    objectives: folder.objectives ?? [],
    created_at: folder.createdAt,
  };
}

async function remoteUpsertStudyNote(note: StudyNote, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("study_notes").upsert(toStudyNoteRow(note, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for study_notes: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function remoteUpsertStudyFolder(folder: StudyFolder, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("study_folders").upsert(toStudyFolderRow(folder, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for study_folders: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

async function remoteUpsertAgentRecommendation(recommendation: AgentRecommendation, userId = currentUserId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("agent_recommendations").upsert(toAgentRecommendationRow(recommendation, userId));
  if (error) {
    setBackendStatus({ error: `Supabase save failed for agent_recommendations: ${error.message}` });
    throw error;
  }
  setBackendStatus({ label: "Supabase realtime", error: null });
}

export const goalCrud = {
  async add(goal: Goal) {
    if (isSupabaseConfigured) return remoteUpsertGoal(goal);
    return localGoalCrud.add(goal);
  },
  async update(id: string, patch: Partial<Omit<Goal, "id">>) {
    if (isSupabaseConfigured) {
      const goal = await getRemoteRecord<Goal>("goals", id);
      if (!goal) return;
      return remoteUpsertGoal({ ...goal, ...patch });
    }
    return localGoalCrud.update(id, patch);
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

export const kanbanCrud = {
  async add(card: KanbanCard) {
    if (isSupabaseConfigured) return remoteUpsertKanbanCard(card);
    return localKanbanCrud.add(card);
  },
  async update(id: string, patch: Partial<Omit<KanbanCard, "id">>) {
    if (isSupabaseConfigured) {
      const card = await getRemoteRecord<KanbanCard>("kanban_cards", id);
      if (!card) return;
      return remoteUpsertKanbanCard({ ...card, ...patch });
    }
    return localKanbanCrud.update(id, patch);
  },
  async move(id: string, columnId: KanbanColumnId, order: number) {
    if (isSupabaseConfigured) {
      const card = await getRemoteRecord<KanbanCard>("kanban_cards", id);
      if (!card) return;
      return remoteUpsertKanbanCard({ ...card, columnId, order });
    }
    return localKanbanCrud.move(id, columnId, order);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("kanban_cards", id);
    return localKanbanCrud.delete(id);
  },
};

export const kanbanActivityCrud = {
  async add(activity: KanbanActivity) {
    if (isSupabaseConfigured) return remoteUpsertKanbanActivity(activity);
    return localKanbanActivityCrud.add(activity);
  },
};

export const agentRecommendationCrud = {
  async add(recommendation: AgentRecommendation) {
    if (isSupabaseConfigured) return remoteUpsertAgentRecommendation(recommendation);
    return localAgentRecommendationCrud.add(recommendation);
  },
  async update(id: string, patch: Partial<Omit<AgentRecommendation, "id">>) {
    if (isSupabaseConfigured) {
      const recommendation = await getRemoteRecord<AgentRecommendation>("agent_recommendations", id);
      if (!recommendation) return;
      return remoteUpsertAgentRecommendation({ ...recommendation, ...patch });
    }
    return localAgentRecommendationCrud.update(id, patch);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("agent_recommendations", id);
    return localAgentRecommendationCrud.delete(id);
  },
};

export const studyNoteCrud = {
  async add(note: StudyNote) {
    if (isSupabaseConfigured) return remoteUpsertStudyNote(note);
    return localStudyNoteCrud.add(note);
  },
  async update(id: string, patch: Partial<Omit<StudyNote, "id">>) {
    if (isSupabaseConfigured) {
      const note = await getRemoteRecord<StudyNote>("study_notes", id);
      if (!note) return;
      return remoteUpsertStudyNote({ ...note, ...patch, updatedAt: new Date().toISOString() });
    }
    return localStudyNoteCrud.update(id, { ...patch, updatedAt: new Date().toISOString() });
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("study_notes", id);
    return localStudyNoteCrud.delete(id);
  },
};

export const studyFolderCrud = {
  async add(folder: StudyFolder) {
    if (isSupabaseConfigured) return remoteUpsertStudyFolder(folder);
    return localStudyFolderCrud.add(folder);
  },
  async update(id: string, patch: Partial<Omit<StudyFolder, "id">>) {
    if (isSupabaseConfigured) {
      const folder = await getRemoteRecord<StudyFolder>("study_folders", id);
      if (!folder) return;
      return remoteUpsertStudyFolder({ ...folder, ...patch });
    }
    return localStudyFolderCrud.update(id, patch);
  },
  async delete(id: string) {
    if (isSupabaseConfigured) return remoteDelete("study_folders", id);
    return localStudyFolderCrud.delete(id);
  },
};

export const taskProjectCrud = {
  async add(project: TaskProject) {
    if (isSupabaseConfigured) return remoteUpsertTaskProject(project);
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
      return remoteUpsertTaskProject({ ...project, currentDay: day });
    }
    return localTaskProjectCrud.setCurrentDay(projectId, day);
  },
  async updateDates(projectId: string, startDate: string, endDate: string, deadlineDays: number) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsertTaskProject({
        ...project,
        startDate,
        endDate,
        deadlineDays,
        currentDay: Math.min(project.currentDay, deadlineDays),
      });
    }
    return localTaskProjectCrud.updateDates(projectId, startDate, endDate, deadlineDays);
  },
  async addTask(projectId: string, day: number, task: ProjectTask) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsertTaskProject({
        ...project,
        tasksByDay: {
          ...(project.tasksByDay ?? {}),
          [day]: [...((project.tasksByDay ?? {})[day] ?? []), task],
        },
      });
    }
    return localTaskProjectCrud.addTask(projectId, day, task);
  },
  async updateTask(projectId: string, day: number, taskId: string, updater: (task: ProjectTask) => ProjectTask) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsertTaskProject({
        ...project,
        tasksByDay: {
          ...(project.tasksByDay ?? {}),
          [day]: ((project.tasksByDay ?? {})[day] ?? []).map((task) => (task.id === taskId ? updater(task) : task)),
        },
      });
    }
    return localTaskProjectCrud.updateTask(projectId, day, taskId, updater);
  },
  async deleteTask(projectId: string, day: number, taskId: string) {
    if (isSupabaseConfigured) {
      const project = await getRemoteRecord<TaskProject>("task_projects", projectId);
      if (!project) return;
      return remoteUpsertTaskProject({
        ...project,
        tasksByDay: {
          ...(project.tasksByDay ?? {}),
          [day]: ((project.tasksByDay ?? {})[day] ?? []).filter((task) => task.id !== taskId),
        },
      });
    }
    return localTaskProjectCrud.deleteTask(projectId, day, taskId);
  },
};

export function useDataBackendLabel() {
  const [status, setStatus] = useState(backendStatus);

  useEffect(() => {
    backendStatusListeners.add(setStatus);
    return () => {
      backendStatusListeners.delete(setStatus);
    };
  }, []);

  return useMemo(() => (status.error ? `${status.label} - ${status.error}` : status.label), [status]);
}
