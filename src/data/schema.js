import { getTodayKey } from "./seed";
import { createId } from "../utils/ids";

export const STORAGE_KEY = "focusflow.react.local.v2";
export const LEGACY_STORAGE_KEYS = ["focusflow.react.local.v1"];
export const DATA_VERSION = 2;

export function createWorkspace(input = {}) {
  return {
    id: input.id || "workspace-local",
    name: input.name || "FocusFlow Workspace",
    mode: input.mode || "local",
    account: {
      status: input.account?.status || "local-only",
      email: input.account?.email || "",
      userName: input.account?.userName || "本地用户"
    },
    cloudSync: {
      status: input.cloudSync?.status || "not-connected",
      provider: input.cloudSync?.provider || "",
      lastSyncedAt: input.cloudSync?.lastSyncedAt || ""
    },
    billing: {
      status: input.billing?.status || "not-connected",
      plan: input.billing?.plan || "Local Preview",
      renewalDate: input.billing?.renewalDate || ""
    },
    aiAnalysis: {
      status: input.aiAnalysis?.status || "reserved",
      provider: input.aiAnalysis?.provider || "",
      lastRunAt: input.aiAnalysis?.lastRunAt || ""
    }
  };
}

export function normalizeProject(project = {}) {
  const now = new Date().toISOString();
  return {
    id: project.id || createId("project"),
    name: cleanText(project.name) || "未命名项目",
    goal: project.goal || "",
    deadline: project.deadline || "",
    progress: clamp(Number(project.progress) || 0, 0, 100),
    color: project.color || "#111827",
    status: project.status || "进行中",
    milestones: Array.isArray(project.milestones)
      ? project.milestones.map(normalizeMilestone)
      : [],
    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || now
  };
}

export function normalizeTodo(todo = {}) {
  const now = new Date().toISOString();
  const id = todo.id || createId("todo");
  return {
    id,
    title: cleanText(todo.title) || "未命名任务",
    projectId: todo.projectId || "",
    priority: todo.priority || "中",
    status: todo.status || "未开始",
    estimatedMinutes: Number(todo.estimatedMinutes) || 0,
    actualMinutes: Number(todo.actualMinutes) || 0,
    date: todo.date || getTodayKey(),
    goal: todo.goal || "",
    steps: Array.isArray(todo.steps) ? todo.steps.map(normalizeStep) : [],
    timeline: Array.isArray(todo.timeline)
      ? todo.timeline.map((item) => normalizeTimelineItem(item, id))
      : [],
    blockers: todo.blockers || "",
    review: todo.review || "",
    completedAt: todo.completedAt || "",
    createdAt: todo.createdAt || now,
    updatedAt: todo.updatedAt || now
  };
}

export function normalizeStep(step = {}) {
  const now = new Date().toISOString();
  return {
    id: step.id || createId("step"),
    text: cleanText(step.text),
    completed: Boolean(step.completed),
    createdAt: step.createdAt || now,
    updatedAt: step.updatedAt || now
  };
}

export function normalizeTimelineItem(item = {}, todoId = "") {
  const now = new Date().toISOString();
  return {
    id: item.id || createId("timeline"),
    startTime: item.startTime || "",
    endTime: item.endTime || "",
    todoId: item.todoId || todoId,
    note: item.note || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now
  };
}

export function normalizeMilestone(milestone = {}) {
  const now = new Date().toISOString();
  return {
    id: milestone.id || createId("milestone"),
    title: cleanText(milestone.title) || "未命名节点",
    date: milestone.date || "",
    completed: Boolean(milestone.completed),
    createdAt: milestone.createdAt || now,
    updatedAt: milestone.updatedAt || now
  };
}

export function normalizeReview(review = {}, dateKey = getTodayKey()) {
  const now = new Date().toISOString();
  return {
    id: review.id || `review-${dateKey}`,
    date: review.date || dateKey,
    summary: review.summary || "",
    wins: review.wins || "",
    blockers: review.blockers || "",
    tomorrow: review.tomorrow || "",
    mood: review.mood || "",
    focusScore: Number(review.focusScore) || 0,
    createdAt: review.createdAt || now,
    updatedAt: review.updatedAt || now
  };
}

export function normalizeReviews(reviews = {}) {
  if (Array.isArray(reviews)) {
    return reviews.reduce((acc, review) => {
      const normalized = normalizeReview(review, review.date);
      acc[normalized.date] = normalized;
      return acc;
    }, {});
  }

  return Object.entries(reviews || {}).reduce((acc, [dateKey, review]) => {
    acc[dateKey] = normalizeReview(review, dateKey);
    return acc;
  }, {});
}

export function createInitialState({ projects = [], todos = [] } = {}) {
  return {
    version: DATA_VERSION,
    workspace: createWorkspace(),
    projects: projects.map(normalizeProject),
    todos: todos.map(normalizeTodo),
    selectedDate: getTodayKey(),
    reviews: {},
    updatedAt: new Date().toISOString()
  };
}

export function normalizeState(input, fallback = {}) {
  const source = input?.data || input || {};
  return {
    version: DATA_VERSION,
    workspace: createWorkspace(source.workspace),
    projects: Array.isArray(source.projects)
      ? source.projects.map(normalizeProject)
      : (fallback.projects || []).map(normalizeProject),
    todos: Array.isArray(source.todos)
      ? source.todos.map(normalizeTodo)
      : (fallback.todos || []).map(normalizeTodo),
    selectedDate: source.selectedDate || getTodayKey(),
    reviews: normalizeReviews(source.reviews),
    updatedAt: source.updatedAt || new Date().toISOString()
  };
}

export function stampTodo(todo, patch) {
  const next = typeof patch === "function" ? patch(todo) : patch;
  const completedAt =
    next.status === "已完成" && todo.status !== "已完成"
      ? new Date().toISOString()
      : next.status && next.status !== "已完成"
        ? ""
        : next.completedAt ?? todo.completedAt;

  return normalizeTodo({
    ...todo,
    ...next,
    estimatedMinutes: Number(next.estimatedMinutes ?? todo.estimatedMinutes) || 0,
    actualMinutes: Number(next.actualMinutes ?? todo.actualMinutes) || 0,
    completedAt,
    updatedAt: new Date().toISOString()
  });
}

export function stampProject(project, patch) {
  const next = typeof patch === "function" ? patch(project) : patch;
  return normalizeProject({
    ...project,
    ...next,
    updatedAt: new Date().toISOString()
  });
}

function cleanText(value) {
  return String(value || "").trim();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
