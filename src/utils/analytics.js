export function getProjectById(projects, projectId) {
  return projects.find((project) => project.id === projectId);
}

export function getTodoStepStats(todo) {
  const steps = todo.steps || [];
  const completed = steps.filter((step) => step.completed).length;
  return {
    completed,
    total: steps.length,
    rate: steps.length ? Math.round((completed / steps.length) * 100) : 0
  };
}

export function buildTodoInsight(todo) {
  const stepStats = getTodoStepStats(todo);
  const estimated = Number(todo.estimatedMinutes) || 0;
  const actual = Number(todo.actualMinutes) || 0;
  const timeDelta = actual - estimated;
  const hasTimeline = (todo.timeline || []).length > 0;
  const hasBlocker = todo.status === "卡住" || Boolean(todo.blockers?.trim());
  const isOvertime = estimated > 0 && actual > estimated;

  let paceLabel = "按计划推进";
  if (todo.status === "已完成") paceLabel = "已完成闭环";
  if (isOvertime) paceLabel = "耗时超出预估";
  if (hasBlocker) paceLabel = "存在卡点";
  if (!hasTimeline) paceLabel = "缺少时间安排";

  const progressScore = Math.round(
    stepStats.rate * 0.55 +
      (todo.status === "已完成" ? 25 : todo.status === "进行中" ? 14 : 4) +
      (hasTimeline ? 12 : 0) +
      (hasBlocker ? 0 : 8)
  );

  return {
    stepStats,
    timeDelta,
    hasTimeline,
    hasBlocker,
    isOvertime,
    paceLabel,
    progressScore: Math.min(progressScore, 100),
    nextAction: createTodoNextAction(todo, stepStats, {
      hasBlocker,
      hasTimeline,
      isOvertime
    })
  };
}

export function buildAnalytics(todos, projects, todayKey) {
  const todayTodos = todos.filter((todo) => todo.date === todayKey);
  const totalTodos = todayTodos.length;
  const completedTodos = todayTodos.filter((todo) => todo.status === "已完成").length;
  const completionRate = totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const stepStats = todayTodos.reduce(
    (acc, todo) => {
      const stats = getTodoStepStats(todo);
      acc.completed += stats.completed;
      acc.total += stats.total;
      return acc;
    },
    { completed: 0, total: 0 }
  );
  const stepRate = stepStats.total
    ? Math.round((stepStats.completed / stepStats.total) * 100)
    : 0;

  const activeProjectIds = new Set(
    todayTodos
      .filter((todo) => {
        const stats = getTodoStepStats(todo);
        return (
          todo.status !== "未开始" ||
          stats.completed > 0 ||
          (todo.timeline || []).length > 0 ||
          todo.actualMinutes > 0
        );
      })
      .map((todo) => todo.projectId)
  );

  const activeProjects = projects.filter((project) => activeProjectIds.has(project.id));
  const blockedTodos = todayTodos.filter(
    (todo) => todo.status === "卡住" || Boolean(todo.blockers?.trim())
  );
  const overtimeTodos = todayTodos.filter(
    (todo) => Number(todo.actualMinutes) > Number(todo.estimatedMinutes)
  );
  const healthyTodos = todayTodos.filter((todo) => todo.status !== "卡住").length;
  const healthRate = totalTodos ? Math.round((healthyTodos / totalTodos) * 100) : 0;
  const focusScore = Math.round(completionRate * 0.45 + stepRate * 0.35 + healthRate * 0.2);

  const tomorrowAdvice = createTomorrowAdvice({
    totalTodos,
    completionRate,
    blockedTodos,
    overtimeTodos,
    activeProjects
  });

  return {
    todayTodos,
    totalTodos,
    completedTodos,
    completionRate,
    completedSteps: stepStats.completed,
    totalSteps: stepStats.total,
    stepRate,
    activeProjects,
    blockedTodos,
    overtimeTodos,
    focusScore,
    tomorrowAdvice
  };
}

export function getProjectMilestones(project) {
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  if (milestones.length) return milestones;
  if (!project.deadline) return [];
  return [
    {
      id: `${project.id}-deadline`,
      title: "完成最终目标",
      date: project.deadline,
      completed: project.status === "完成"
    }
  ];
}

export function buildProjectStats(project, todos) {
  const projectTodos = todos.filter((todo) => todo.projectId === project.id);
  const completedTodos = projectTodos.filter((todo) => todo.status === "已完成").length;
  const milestones = [...getProjectMilestones(project)].sort((a, b) =>
    String(a.date || "").localeCompare(String(b.date || ""))
  );
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;
  const nextMilestone =
    milestones.find((milestone) => !milestone.completed) || milestones[milestones.length - 1] || null;

  return {
    todos: projectTodos,
    completedTodos,
    totalTodos: projectTodos.length,
    milestones,
    completedMilestones,
    totalMilestones: milestones.length,
    milestoneRate: milestones.length
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0,
    nextMilestone
  };
}

function createTodoNextAction(todo, stepStats, { hasBlocker, hasTimeline, isOvertime }) {
  if (todo.status === "已完成") {
    return todo.review?.trim()
      ? "已完成。可以把复盘沉淀到项目经验库。"
      : "已完成。补一条复盘，记录有效做法和下次风险。";
  }

  if (hasBlocker) {
    return "先把卡点拆成一个可验证问题，再安排 20 分钟处理。";
  }

  if (!hasTimeline) {
    return "先补一个开始和结束时间，让任务进入今天的时间轴。";
  }

  if (!stepStats.total) {
    return "补 3 个足够小的步骤，降低启动阻力。";
  }

  if (isOvertime) {
    return "缩小任务范围，或把剩余动作拆到下一段时间。";
  }

  const nextStep = (todo.steps || []).find((step) => !step.completed);
  return nextStep ? `下一步：${nextStep.text}` : "检查结果是否可交付，再写完成复盘。";
}

function createTomorrowAdvice({
  totalTodos,
  completionRate,
  blockedTodos,
  overtimeTodos,
  activeProjects
}) {
  if (!totalTodos) {
    return "明天先放入 1 个最关键项目任务，再拆成 3 个可执行步骤，避免从空白开始。";
  }

  if (blockedTodos.length) {
    return `明天优先处理「${blockedTodos[0].title}」的卡点，先写出一个 20 分钟内可验证的小动作。`;
  }

  if (overtimeTodos.length) {
    return `明天给「${overtimeTodos[0].title}」预留缓冲，或把它拆成更小的阶段，降低估时偏差。`;
  }

  if (completionRate >= 80) {
    return "今天推进节奏很好。明天可以保留一个深度任务，再安排一个低负担维护任务。";
  }

  if (activeProjects.length > 3) {
    return "今天项目切换偏多。明天建议锁定 2 个项目，先完成最能产生进度的步骤。";
  }

  return "明天先处理高优先级任务，并把每个任务的第一步写到足够小，降低启动阻力。";
}
