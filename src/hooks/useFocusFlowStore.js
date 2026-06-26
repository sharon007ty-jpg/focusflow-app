import { useEffect, useMemo, useState } from "react";
import { createSeedTodos, getTodayKey, projectsSeed } from "../data/seed";
import {
  DATA_VERSION,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  createInitialState as createSchemaInitialState,
  normalizeMilestone,
  normalizeProject,
  normalizeReview,
  normalizeState,
  normalizeStep,
  normalizeTimelineItem,
  normalizeTodo,
  stampProject,
  stampTodo
} from "../data/schema";
import { buildAnalytics } from "../utils/analytics";
import { createId } from "../utils/ids";

function createInitialState() {
  const today = getTodayKey();
  return createSchemaInitialState({
    projects: projectsSeed,
    todos: createSeedTodos(today)
  });
}

function loadState() {
  if (typeof window === "undefined") return createInitialState();
  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!stored) return createInitialState();
    const parsed = JSON.parse(stored);
    return normalizeState(parsed, {
      projects: projectsSeed,
      todos: createSeedTodos(getTodayKey())
    });
  } catch (error) {
    console.warn("Unable to load FocusFlow data.", error);
    return createInitialState();
  }
}

function touchState(current, patch) {
  return {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
}

export function useFocusFlowStore() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to save FocusFlow data.", error);
    }
  }, [state]);

  const todayTodos = useMemo(
    () => state.todos.filter((todo) => todo.date === state.selectedDate),
    [state.todos, state.selectedDate]
  );

  const analytics = useMemo(
    () => buildAnalytics(state.todos, state.projects, state.selectedDate),
    [state.todos, state.projects, state.selectedDate]
  );

  function setSelectedDate(dateKey) {
    setState((current) => ({
      ...current,
      selectedDate: dateKey || getTodayKey(),
      updatedAt: new Date().toISOString()
    }));
  }

  function createTodo(form) {
    const now = new Date().toISOString();
    const todo = normalizeTodo({
      id: createId("todo"),
      title: form.title,
      projectId: form.projectId,
      priority: form.priority,
      status: "未开始",
      estimatedMinutes: form.estimatedMinutes,
      actualMinutes: 0,
      date: form.date || state.selectedDate,
      goal: form.goal,
      steps: [],
      timeline: [],
      blockers: "",
      review: "",
      createdAt: now,
      updatedAt: now
    });
    setState((current) => touchState(current, {
      todos: [todo, ...current.todos]
    }));
    return todo.id;
  }

  function updateTodo(todoId, patch) {
    setState((current) => touchState(current, {
      todos: current.todos.map((todo) => (todo.id === todoId ? stampTodo(todo, patch) : todo))
    }));
  }

  function deleteTodo(todoId) {
    setState((current) => touchState(current, {
      todos: current.todos.filter((todo) => todo.id !== todoId)
    }));
  }

  function toggleTodoComplete(todoId) {
    updateTodo(todoId, (todo) => {
      const completed = todo.status !== "已完成";
      return {
        status: completed ? "已完成" : "进行中",
        actualMinutes: completed ? todo.actualMinutes || todo.estimatedMinutes : todo.actualMinutes,
        steps: completed
          ? (todo.steps || []).map((step) => ({ ...step, completed: true }))
          : todo.steps
      };
    });
  }

  function addStep(todoId, text) {
    if (!text.trim()) return;
    updateTodo(todoId, (todo) => ({
      status: todo.status === "未开始" ? "进行中" : todo.status,
      steps: [
        ...(todo.steps || []),
        normalizeStep({
          id: createId("step"),
          text: text.trim(),
          completed: false
        })
      ]
    }));
  }

  function toggleStep(todoId, stepId) {
    updateTodo(todoId, (todo) => ({
      status: todo.status === "未开始" ? "进行中" : todo.status,
      steps: (todo.steps || []).map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    }));
  }

  function updateStep(todoId, stepId, text) {
    updateTodo(todoId, (todo) => ({
      steps: (todo.steps || []).map((step) =>
        step.id === stepId ? { ...step, text } : step
      )
    }));
  }

  function deleteStep(todoId, stepId) {
    updateTodo(todoId, (todo) => ({
      steps: (todo.steps || []).filter((step) => step.id !== stepId)
    }));
  }

  function addTimelineItem(todoId, item) {
    if (!item.startTime || !item.endTime) return;
    updateTodo(todoId, (todo) => ({
      status: todo.status === "未开始" ? "进行中" : todo.status,
      timeline: [
        ...(todo.timeline || []),
        normalizeTimelineItem({
          id: createId("timeline"),
          startTime: item.startTime,
          endTime: item.endTime,
          todoId,
          note: item.note?.trim() || ""
        }, todoId)
      ]
    }));
  }

  function deleteTimelineItem(todoId, timelineId) {
    updateTodo(todoId, (todo) => ({
      timeline: (todo.timeline || []).filter((item) => item.id !== timelineId)
    }));
  }

  function createProject(form) {
    const project = normalizeProject({
      id: createId("project"),
      name: form.name,
      goal: form.goal,
      deadline: form.deadline,
      progress: form.progress,
      color: form.color,
      status: form.status,
      milestones: form.deadline
        ? [
            {
              id: createId("milestone"),
              title: "完成最终目标",
              date: form.deadline,
              completed: false
            }
          ]
        : []
    });
    setState((current) => touchState(current, {
      projects: [...current.projects, project]
    }));
    return project.id;
  }

  function updateProject(projectId, patch) {
    setState((current) => touchState(current, {
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;
        return stampProject(project, patch);
      })
    }));
  }

  function deleteProject(projectId) {
    setState((current) => touchState(current, {
      projects: current.projects.filter((project) => project.id !== projectId),
      todos: current.todos.map((todo) =>
        todo.projectId === projectId ? { ...todo, projectId: "", updatedAt: new Date().toISOString() } : todo
      )
    }));
  }

  function addMilestone(projectId, milestone) {
    if (!milestone.title.trim()) return;
    updateProject(projectId, (project) => ({
      milestones: [
        ...(project.milestones || []),
        normalizeMilestone({
          id: createId("milestone"),
          title: milestone.title.trim(),
          date: milestone.date || "",
          completed: false
        })
      ]
    }));
  }

  function toggleMilestone(projectId, milestoneId) {
    updateProject(projectId, (project) => ({
      milestones: (project.milestones || []).map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, completed: !milestone.completed }
          : milestone
      )
    }));
  }

  function deleteMilestone(projectId, milestoneId) {
    updateProject(projectId, (project) => ({
      milestones: (project.milestones || []).filter((milestone) => milestone.id !== milestoneId)
    }));
  }

  function saveReview(dateKey, review) {
    setState((current) => {
      const analytics = buildAnalytics(current.todos, current.projects, dateKey);
      return touchState(current, {
        reviews: {
          ...current.reviews,
          [dateKey]: normalizeReview(
            {
              ...review,
              focusScore: analytics.focusScore,
              updatedAt: new Date().toISOString()
            },
            dateKey
          )
        }
      });
    });
  }

  function updateWorkspace(patch) {
    setState((current) => touchState(current, {
      workspace: {
        ...current.workspace,
        ...patch
      }
    }));
  }

  function exportData() {
    return {
      app: "FocusFlow",
      version: DATA_VERSION,
      exportedAt: new Date().toISOString(),
      data: state
    };
  }

  function importData(snapshot) {
    setState(
      normalizeState(snapshot, {
        projects: projectsSeed,
        todos: createSeedTodos(getTodayKey())
      })
    );
  }

  function resetData() {
    setState(createInitialState());
  }

  return {
    ...state,
    todayTodos,
    analytics,
    setSelectedDate,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    addStep,
    toggleStep,
    updateStep,
    deleteStep,
    addTimelineItem,
    deleteTimelineItem,
    createProject,
    updateProject,
    deleteProject,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    saveReview,
    updateWorkspace,
    exportData,
    importData,
    resetData
  };
}
