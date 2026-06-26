import { useEffect, useRef, useState } from "react";
import AnalyticsPanel from "./components/AnalyticsPanel";
import DetailPanel from "./components/DetailPanel";
import Header from "./components/Header";
import ProjectModal from "./components/ProjectModal";
import Sidebar from "./components/Sidebar";
import TimelineSection from "./components/TimelineSection";
import TodoList from "./components/TodoList";
import TodoModal from "./components/TodoModal";
import { useFocusFlowStore } from "./hooks/useFocusFlowStore";
import { buildProjectStats } from "./utils/analytics";
import { countdownText } from "./utils/dates";

const mobileNavItems = [
  { id: "today", label: "今日" },
  { id: "projects", label: "项目" },
  { id: "timeline", label: "时间轴" },
  { id: "analytics", label: "分析" },
  { id: "review", label: "复盘" },
  { id: "settings", label: "设置" }
];

export default function App() {
  const store = useFocusFlowStore();
  const [activeView, setActiveView] = useState("today");
  const [timelineMode, setTimelineMode] = useState("day");
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [detail, setDetail] = useState({ mode: null, id: null });
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [appMessage, setAppMessage] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const selectedTodo =
    detail.mode === "todo" ? store.todos.find((todo) => todo.id === detail.id) : null;
  const selectedProject =
    detail.mode === "project"
      ? store.projects.find((project) => project.id === detail.id)
      : null;
  const filteredTodayTodos =
    selectedProjectFilter === "all"
      ? store.todayTodos
      : store.todayTodos.filter((todo) => todo.projectId === selectedProjectFilter);

  useEffect(() => {
    if (
      selectedProjectFilter !== "all" &&
      !store.projects.some((project) => project.id === selectedProjectFilter)
    ) {
      setSelectedProjectFilter("all");
    }
  }, [selectedProjectFilter, store.projects]);

  function notify(message) {
    setAppMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setAppMessage(""), 2600);
  }

  function openTodo(todoId) {
    setDetail({ mode: "todo", id: todoId });
  }

  function openProject(projectId, changeView = true) {
    if (changeView) setActiveView("projects");
    setDetail({ mode: "project", id: projectId });
  }

  function closeDetail() {
    setDetail({ mode: null, id: null });
  }

  function handleCreateTodo(form) {
    const todoId = store.createTodo(form);
    setActiveView("today");
    openTodo(todoId);
    setTodoModalOpen(false);
    notify("任务已创建。");
  }

  function handleCreateProject(form) {
    const projectId = store.createProject(form);
    setActiveView("projects");
    openProject(projectId, false);
    setProjectModalOpen(false);
    notify("项目已创建。");
  }

  function handleDeleteTodo(todoId) {
    const todo = store.todos.find((item) => item.id === todoId);
    const confirmed = window.confirm(`确定删除「${todo?.title || "这个任务"}」吗？`);
    if (!confirmed) return;
    store.deleteTodo(todoId);
    if (detail.mode === "todo" && detail.id === todoId) closeDetail();
    notify("任务已删除。");
  }

  function handleDeleteProject(projectId) {
    const project = store.projects.find((item) => item.id === projectId);
    const confirmed = window.confirm(
      `确定删除「${project?.name || "这个项目"}」吗？相关 Todo 会保留，但会变成未分配项目。`
    );
    if (!confirmed) return;
    store.deleteProject(projectId);
    if (detail.mode === "project" && detail.id === projectId) closeDetail();
    notify("项目已删除，相关任务已保留。");
  }

  function handleViewChange(view) {
    setActiveView(view);
    if (view !== "today") closeDetail();
    if (view === "timeline") setTimelineMode("project");
  }

  function handleSaveTodo(todoId, draft) {
    store.updateTodo(todoId, draft);
    notify("任务详情已保存。");
  }

  function handleSaveProject(projectId, draft) {
    store.updateProject(projectId, draft);
    notify("项目详情已保存。");
  }

  function handleSaveReview(dateKey, draft) {
    store.saveReview(dateKey, draft);
    notify("今日复盘已保存。");
  }

  async function handleInstallApp() {
    if (!installPrompt) {
      notify("当前打开方式暂时不能安装。请用本地服务器或上线地址打开。");
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    notify("安装流程已完成或已关闭。");
  }

  function renderMainContent() {
    if (activeView === "projects") {
      return (
        <ProjectsPage
          projects={store.projects}
          todos={store.todos}
          onAddProject={() => setProjectModalOpen(true)}
          onSelectProject={(projectId) => openProject(projectId, false)}
          onDeleteProject={handleDeleteProject}
        />
      );
    }

    if (activeView === "timeline") {
      return (
        <TimelineSection
          mode={timelineMode}
          todos={store.todayTodos}
          allTodos={store.todos}
          projects={store.projects}
          onModeChange={setTimelineMode}
          onSelectProject={(projectId) => openProject(projectId, false)}
        />
      );
    }

    if (activeView === "analytics") {
      return <AnalyticsPanel analytics={store.analytics} />;
    }

    if (activeView === "review") {
      return (
        <ReviewPage
          selectedDate={store.selectedDate}
          review={store.reviews[store.selectedDate]}
          analytics={store.analytics}
          onSave={handleSaveReview}
        />
      );
    }

    if (activeView === "settings") {
      return (
        <SettingsPage
          store={store}
          installAvailable={Boolean(installPrompt)}
          appMessage={appMessage}
          onInstallApp={handleInstallApp}
          onMessage={setAppMessage}
        />
      );
    }

    return (
      <>
        <TodoList
          todos={filteredTodayTodos}
          projects={store.projects}
          totalTodos={store.todayTodos.length}
          selectedTodoId={selectedTodo?.id}
          selectedProjectId={selectedProjectFilter}
          onSelectTodo={openTodo}
          onToggleComplete={store.toggleTodoComplete}
          onDeleteTodo={handleDeleteTodo}
          onProjectFilterChange={setSelectedProjectFilter}
          onAddTodo={() => setTodoModalOpen(true)}
        />

        <TimelineSection mode="day" todos={filteredTodayTodos} />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pb-32 pl-3 pr-3 pt-3 sm:p-4 lg:p-5">
      <div
        className={`mx-auto grid w-full min-w-0 max-w-[1680px] gap-4 ${
          detail.mode
            ? "lg:grid-cols-[280px_minmax(0,1fr)_420px]"
            : "lg:grid-cols-[280px_minmax(0,1fr)]"
        }`}
      >
        <Sidebar
          projects={store.projects}
          activeView={activeView}
          onViewChange={handleViewChange}
          onAddProject={() => setProjectModalOpen(true)}
          onSelectProject={(projectId) => openProject(projectId)}
        />

        <main className="w-full min-w-0 max-w-full space-y-4">
          <Header
            selectedDate={store.selectedDate}
            completionRate={store.analytics.completionRate}
            focusScore={store.analytics.focusScore}
            onDateChange={(dateKey) => {
              store.setSelectedDate(dateKey);
              closeDetail();
              setActiveView("today");
            }}
            onAddTodo={() => setTodoModalOpen(true)}
          />

          {renderMainContent()}
        </main>

        {detail.mode ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/25 p-3 backdrop-blur-sm lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <DetailPanel
              mode={detail.mode}
              todo={selectedTodo}
              project={selectedProject}
              projects={store.projects}
              todos={store.todos}
              onClose={closeDetail}
              onSaveTodo={handleSaveTodo}
              onDeleteTodo={handleDeleteTodo}
              onAddStep={store.addStep}
              onToggleStep={store.toggleStep}
              onUpdateStep={store.updateStep}
              onDeleteStep={store.deleteStep}
              onAddTimelineItem={store.addTimelineItem}
              onDeleteTimelineItem={store.deleteTimelineItem}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onAddMilestone={store.addMilestone}
              onToggleMilestone={store.toggleMilestone}
              onDeleteMilestone={store.deleteMilestone}
            />
          </div>
        ) : null}
      </div>

      {todoModalOpen ? (
        <TodoModal
          projects={store.projects}
          selectedDate={store.selectedDate}
          onClose={() => setTodoModalOpen(false)}
          onCreate={handleCreateTodo}
        />
      ) : null}

      {projectModalOpen ? (
        <ProjectModal onClose={() => setProjectModalOpen(false)} onCreate={handleCreateProject} />
      ) : null}

      <MobileNav activeView={activeView} onViewChange={handleViewChange} />
      <Toast message={appMessage} />
    </div>
  );
}

function MobileNav({ activeView, onViewChange }) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-3 gap-1 rounded-lg border border-neutral-200 bg-white/95 p-1 shadow-quiet backdrop-blur lg:hidden">
      {mobileNavItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`rounded-md px-2 py-2 text-xs font-medium transition ${
            activeView === item.id
              ? "bg-neutral-950 text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
          }`}
          onClick={() => onViewChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-[60] mx-auto max-w-sm rounded-lg border border-neutral-200 bg-neutral-950 px-4 py-3 text-center text-sm text-white shadow-quiet lg:bottom-5"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

function ProjectsPage({ projects, todos, onAddProject, onSelectProject, onDeleteProject }) {
  return (
    <section className="surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="panel-title">Projects 项目</h2>
          <p className="muted mt-1">点击项目后，在右侧编辑截止日期、进度和阶段节点。</p>
        </div>
        <button type="button" className="button-primary" onClick={onAddProject}>
          新增项目
        </button>
      </div>

      {projects.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => {
            const stats = buildProjectStats(project, todos);
            return (
              <article
                key={project.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-hairline transition hover:border-neutral-400"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-semibold text-neutral-950">{project.name}</h3>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                        {project.goal || "还没有写项目目标。"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-950"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-neutral-400">
                    <span>{stats.completedMilestones}/{stats.totalMilestones} 节点</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="mt-3 text-sm font-medium text-neutral-600">
                    {countdownText(project.deadline)}
                  </div>
                </button>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="button-ghost px-2 py-1 text-xs text-rose-700"
                    onClick={() => onDeleteProject(project.id)}
                  >
                    删除
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-sm font-medium text-neutral-800">还没有项目。</p>
          <p className="mt-1 text-sm text-neutral-500">先创建一个项目，再把 Todo 归进去。</p>
          <button type="button" className="button-primary mt-4" onClick={onAddProject}>
            新增项目
          </button>
        </div>
      )}
    </section>
  );
}

function ReviewPage({ selectedDate, review, analytics, onSave }) {
  const [draft, setDraft] = useState({
    summary: "",
    wins: "",
    blockers: "",
    tomorrow: analytics.tomorrowAdvice
  });

  useEffect(() => {
    setDraft({
      summary: review?.summary || "",
      wins: review?.wins || "",
      blockers: review?.blockers || "",
      tomorrow: review?.tomorrow || analytics.tomorrowAdvice
    });
  }, [review, analytics.tomorrowAdvice]);

  function patchDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <section className="surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="panel-title">Review 复盘</h2>
          <p className="muted mt-1">记录今天有效做法、偏差和明日安排。</p>
        </div>
        <button type="button" className="button-primary" onClick={() => onSave(selectedDate, draft)}>
          保存复盘
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ReviewMetric label="完成率" value={`${analytics.completionRate}%`} />
        <ReviewMetric label="任务完成" value={`${analytics.completedTodos}/${analytics.totalTodos}`} />
        <ReviewMetric label="Focus Score" value={analytics.focusScore} />
      </div>

      <div className="mt-5 grid gap-4">
        <label>
          <span className="label">今日总结</span>
          <textarea
            rows="4"
            className="field resize-none"
            value={draft.summary}
            onChange={(event) => patchDraft({ summary: event.target.value })}
          />
        </label>
        <label>
          <span className="label">有效做法</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.wins}
            onChange={(event) => patchDraft({ wins: event.target.value })}
          />
        </label>
        <label>
          <span className="label">卡点与偏差</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.blockers}
            onChange={(event) => patchDraft({ blockers: event.target.value })}
          />
        </label>
        <label>
          <span className="label">明日安排</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.tomorrow}
            onChange={(event) => patchDraft({ tomorrow: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}

function SettingsPage({ store, installAvailable, appMessage, onInstallApp, onMessage }) {
  const backupSize = Math.round(JSON.stringify(store.exportData()).length / 1024);
  const workspace = store.workspace || {};

  function exportBackup() {
    const snapshot = store.exportData();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `focusflow-backup-${store.selectedDate}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onMessage("备份文件已导出。");
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      store.importData(JSON.parse(text));
      onMessage("备份已导入，数据已经恢复。");
    } catch (error) {
      console.warn(error);
      onMessage("导入失败，请确认选择的是 FocusFlow 备份 JSON。");
    } finally {
      event.target.value = "";
    }
  }

  function resetData() {
    const confirmed = window.confirm("确定重置本地数据吗？这会清空当前浏览器里的 FocusFlow 数据。");
    if (!confirmed) return;
    store.resetData();
    onMessage("本地数据已重置。");
  }

  return (
    <section className="surface p-5">
      <div className="mb-5">
        <h2 className="panel-title">Settings 设置</h2>
        <p className="muted mt-1">管理安装、本地备份和数据恢复。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">APP 安装</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            当前版本已经具备 PWA 壳。通过本地服务器或上线地址打开时，可以安装到桌面或手机主屏。
          </p>
          <button type="button" className="button-primary mt-4" onClick={onInstallApp}>
            {installAvailable ? "安装 FocusFlow" : "检查安装入口"}
          </button>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">产品扩展口</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            当前是本地优先版本。登录、云同步、付费和 AI 分析先预留结构，不接真实服务。
          </p>
          <div className="mt-4 grid gap-2">
            <ExtensionRow label="账号登录" value={workspace.account?.status || "local-only"} />
            <ExtensionRow label="云同步" value={workspace.cloudSync?.status || "not-connected"} />
            <ExtensionRow label="付费计划" value={workspace.billing?.plan || "Local Preview"} />
            <ExtensionRow label="AI 分析" value={workspace.aiAnalysis?.status || "reserved"} />
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">本地数据</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SmallMetric label="项目" value={store.projects.length} />
            <SmallMetric label="任务" value={store.todos.length} />
            <SmallMetric label="备份大小" value={`${backupSize}KB`} />
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">备份与恢复</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            建议重要阶段导出一次备份。以后换电脑或清浏览器数据前，可以用备份恢复。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="button-primary" onClick={exportBackup}>
              导出备份
            </button>
            <label className="button-secondary cursor-pointer">
              导入备份
              <input type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">重置</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            重置只影响当前浏览器本地数据，不会删除导出的备份文件。
          </p>
          <button
            type="button"
            className="button-secondary mt-4 text-rose-700 hover:border-rose-200 hover:bg-rose-50"
            onClick={resetData}
          >
            重置本地数据
          </button>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">未来商业版</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            这些入口会在后续阶段接入真实账号、云数据库、订阅权限和 AI 服务。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="button-secondary cursor-not-allowed opacity-60" disabled>
              登录预留
            </button>
            <button type="button" className="button-secondary cursor-not-allowed opacity-60" disabled>
              同步预留
            </button>
            <button type="button" className="button-secondary cursor-not-allowed opacity-60" disabled>
              订阅预留
            </button>
            <button type="button" className="button-secondary cursor-not-allowed opacity-60" disabled>
              AI 预留
            </button>
          </div>
        </section>
      </div>

      {appMessage ? (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-600">
          {appMessage}
        </div>
      ) : null}
    </section>
  );
}

function ExtensionRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">
        {value}
      </span>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-3">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-neutral-950">{value}</div>
    </div>
  );
}

function ReviewMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-950">{value}</div>
    </div>
  );
}
