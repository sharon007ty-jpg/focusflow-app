import { buildProjectStats } from "../utils/analytics";
import { countdownText } from "../utils/dates";

export default function TimelineSection({
  todos,
  projects = [],
  allTodos = [],
  mode = "day",
  onModeChange,
  onSelectProject
}) {
  return (
    <section className="surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="panel-title">Timeline 时间轴</h2>
          <p className="muted mt-1">
            {mode === "day" ? "把今天的任务放进时间块。" : "用项目节点倒推长期进程。"}
          </p>
        </div>
        {onModeChange ? (
          <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                mode === "day" ? "bg-white text-neutral-950 shadow-hairline" : "text-neutral-500"
              }`}
              onClick={() => onModeChange("day")}
            >
              今日时间块
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                mode === "project" ? "bg-white text-neutral-950 shadow-hairline" : "text-neutral-500"
              }`}
              onClick={() => onModeChange("project")}
            >
              项目时间轴
            </button>
          </div>
        ) : null}
      </div>

      {mode === "project" ? (
        <ProjectTimeline projects={projects} todos={allTodos} onSelectProject={onSelectProject} />
      ) : (
        <DayTimeline todos={todos} />
      )}
    </section>
  );
}

function DayTimeline({ todos }) {
  const items = todos
    .flatMap((todo) =>
      (todo.timeline || []).map((item) => ({
        ...item,
        todoTitle: todo.title,
        todoStatus: todo.status,
        completed: todo.status === "已完成"
      }))
    )
    .sort((a, b) => `${a.startTime}${a.endTime}`.localeCompare(`${b.startTime}${b.endTime}`));

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        还没有时间块。点击任务，在右侧详情里添加开始和结束时间。
      </div>
    );
  }

  return (
    <div className="relative space-y-3 before:absolute before:left-[4.75rem] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-neutral-200">
      {items.map((item) => (
        <div key={item.id} className="relative grid grid-cols-[4rem_1fr] gap-5">
          <div className="text-right text-xs font-medium text-neutral-500">
            <div>{item.startTime}</div>
            <div className="mt-1 text-neutral-400">{item.endTime}</div>
          </div>
          <div className="relative rounded-lg border border-neutral-200 bg-white p-3 shadow-hairline">
            <span
              className={`absolute -left-[1.62rem] top-4 h-2.5 w-2.5 rounded-full border-2 border-white ${
                item.completed ? "bg-emerald-500" : "bg-neutral-400"
              }`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-900">{item.todoTitle}</p>
              <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">
                {item.todoStatus}
              </span>
            </div>
            {item.note ? <p className="mt-1 text-xs text-neutral-500">{item.note}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectTimeline({ projects, todos, onSelectProject }) {
  if (!projects.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        还没有项目。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const stats = buildProjectStats(project, todos);
        const rate = project.progress || stats.milestoneRate;
        return (
          <button
            key={project.id}
            type="button"
            className="focus-ring w-full rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-hairline transition hover:border-neutral-400"
            onClick={() => onSelectProject?.(project.id)}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="font-semibold text-neutral-950">{project.name}</h3>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  下一节点：
                  {stats.nextMilestone ? stats.nextMilestone.title : "暂无节点"}
                </p>
              </div>
              <div className="text-sm font-medium text-neutral-600">
                {countdownText(project.deadline)}
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-neutral-950" style={{ width: `${rate}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-400">
              <span>{project.status}</span>
              <span>{rate}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
