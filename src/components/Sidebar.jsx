import { countdownText } from "../utils/dates";

const navItems = [
  { id: "today", label: "Today 今日任务" },
  { id: "projects", label: "Projects 项目" },
  { id: "timeline", label: "Timeline 时间轴" },
  { id: "analytics", label: "Analytics 分析" },
  { id: "review", label: "Review 复盘" },
  { id: "settings", label: "Settings 设置" }
];

export default function Sidebar({
  projects,
  activeView,
  onViewChange,
  onAddProject,
  onSelectProject
}) {
  return (
    <aside className="surface hidden h-full flex-col gap-6 p-4 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-neutral-950">FocusFlow</div>
          <p className="mt-1 text-xs text-neutral-500">Project operating system</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
          FF
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`focus-ring shrink-0 rounded-md px-3 py-2 text-left text-sm transition ${
                active
                  ? "bg-neutral-950 font-medium text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="min-h-0 flex-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase text-neutral-400">Projects</h2>
          <button type="button" className="button-ghost px-2 py-1 text-xs" onClick={onAddProject}>
            新增
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {projects.length ? (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="focus-ring w-full rounded-md border border-neutral-100 bg-white px-3 py-3 text-left transition hover:border-neutral-300"
                onClick={() => onSelectProject(project.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
                    {project.name}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-950 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between gap-2 text-[11px] text-neutral-400">
                  <span>{project.status}</span>
                  <span>{countdownText(project.deadline)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-neutral-200 p-4 text-sm text-neutral-400">
              还没有项目。
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
