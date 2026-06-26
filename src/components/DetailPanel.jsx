import { useEffect, useMemo, useState } from "react";
import { priorityOptions, projectStatusOptions, statusOptions } from "../data/seed";
import { buildProjectStats } from "../utils/analytics";
import { countdownText } from "../utils/dates";

const blankTimeline = { startTime: "", endTime: "", note: "" };
const blankMilestone = { title: "", date: "" };

export default function DetailPanel({
  mode,
  todo,
  project,
  projects,
  todos,
  onClose,
  onSaveTodo,
  onDeleteTodo,
  onAddStep,
  onToggleStep,
  onUpdateStep,
  onDeleteStep,
  onAddTimelineItem,
  onDeleteTimelineItem,
  onSaveProject,
  onDeleteProject,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone
}) {
  if (mode === "project" && project) {
    return (
      <ProjectDetail
        project={project}
        todos={todos}
        onClose={onClose}
        onSaveProject={onSaveProject}
        onDeleteProject={onDeleteProject}
        onAddMilestone={onAddMilestone}
        onToggleMilestone={onToggleMilestone}
        onDeleteMilestone={onDeleteMilestone}
      />
    );
  }

  if (mode === "todo" && todo) {
    return (
      <TodoDetail
        todo={todo}
        projects={projects}
        onClose={onClose}
        onSaveTodo={onSaveTodo}
        onDeleteTodo={onDeleteTodo}
        onAddStep={onAddStep}
        onToggleStep={onToggleStep}
        onUpdateStep={onUpdateStep}
        onDeleteStep={onDeleteStep}
        onAddTimelineItem={onAddTimelineItem}
        onDeleteTimelineItem={onDeleteTimelineItem}
      />
    );
  }

  return null;
}

function TodoDetail({
  todo,
  projects,
  onClose,
  onSaveTodo,
  onDeleteTodo,
  onAddStep,
  onToggleStep,
  onUpdateStep,
  onDeleteStep,
  onAddTimelineItem,
  onDeleteTimelineItem
}) {
  const [draft, setDraft] = useState(todo);
  const [newStep, setNewStep] = useState("");
  const [timelineDraft, setTimelineDraft] = useState(blankTimeline);

  useEffect(() => {
    setDraft(todo);
    setNewStep("");
    setTimelineDraft(blankTimeline);
  }, [todo]);

  const timeline = useMemo(
    () =>
      [...(todo.timeline || [])].sort((a, b) =>
        `${a.startTime}${a.endTime}`.localeCompare(`${b.startTime}${b.endTime}`)
      ),
    [todo.timeline]
  );

  function patchDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveTodo() {
    onSaveTodo(todo.id, draft);
  }

  function addStep() {
    if (!newStep.trim()) return;
    onAddStep(todo.id, newStep);
    setNewStep("");
  }

  function addTimeline() {
    onAddTimelineItem(todo.id, timelineDraft);
    setTimelineDraft(blankTimeline);
  }

  return (
    <aside className="surface max-h-none p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="muted">Task detail</p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-950">任务详情</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" className="button-ghost" onClick={onClose}>
            关闭
          </button>
          <button type="button" className="button-primary" onClick={saveTodo}>
            保存
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <label>
          <span className="label">任务名称</span>
          <input
            className="field"
            value={draft.title}
            onChange={(event) => patchDraft({ title: event.target.value })}
          />
        </label>

        <label>
          <span className="label">今日目标</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.goal}
            onChange={(event) => patchDraft({ goal: event.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">所属项目</span>
            <select
              className="field"
              value={draft.projectId}
              onChange={(event) => patchDraft({ projectId: event.target.value })}
            >
              <option value="">未分配项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">状态</span>
            <select
              className="field"
              value={draft.status}
              onChange={(event) => patchDraft({ status: event.target.value })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label>
            <span className="label">优先级</span>
            <select
              className="field"
              value={draft.priority}
              onChange={(event) => patchDraft({ priority: event.target.value })}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">预计时间</span>
            <input
              className="field"
              type="number"
              min="0"
              value={draft.estimatedMinutes}
              onChange={(event) => patchDraft({ estimatedMinutes: Number(event.target.value) })}
            />
          </label>

          <label>
            <span className="label">实际时间</span>
            <input
              className="field"
              type="number"
              min="0"
              value={draft.actualMinutes}
              onChange={(event) => patchDraft({ actualMinutes: Number(event.target.value) })}
            />
          </label>
        </div>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">详细步骤</h3>
            <span className="text-xs text-neutral-400">{todo.steps?.length || 0}</span>
          </div>

          <div className="space-y-2">
            {(todo.steps || []).length ? (
              todo.steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 rounded-md bg-white p-2">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => onToggleStep(todo.id, step.id)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-400"
                  />
                  <input
                    className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${
                      step.completed ? "text-neutral-400 line-through" : "text-neutral-800"
                    }`}
                    value={step.text}
                    onChange={(event) => onUpdateStep(todo.id, step.id, event.target.value)}
                  />
                  <button
                    type="button"
                    className="button-ghost px-2 py-1 text-xs"
                    onClick={() => onDeleteStep(todo.id, step.id)}
                  >
                    删除
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-white p-3 text-sm text-neutral-400">
                还没有步骤。先拆出 3 个最小动作。
              </p>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="field"
              value={newStep}
              placeholder="新增步骤"
              onChange={(event) => setNewStep(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addStep();
              }}
            />
            <button type="button" className="button-secondary shrink-0" onClick={addStep}>
              添加
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">今日时间块</h3>
          <div className="space-y-2">
            {timeline.length ? (
              timeline.map((item) => (
                <div key={item.id} className="rounded-md bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-neutral-900">
                      {item.startTime} - {item.endTime}
                    </span>
                    <button
                      type="button"
                      className="button-ghost px-2 py-1 text-xs"
                      onClick={() => onDeleteTimelineItem(todo.id, item.id)}
                    >
                      删除
                    </button>
                  </div>
                  {item.note ? <p className="mt-1 text-xs text-neutral-500">{item.note}</p> : null}
                </div>
              ))
            ) : (
              <p className="rounded-md bg-white p-3 text-sm text-neutral-400">
                还没有时间块。
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              type="time"
              className="field"
              value={timelineDraft.startTime}
              onChange={(event) =>
                setTimelineDraft((current) => ({ ...current, startTime: event.target.value }))
              }
              aria-label="开始时间"
            />
            <input
              type="time"
              className="field"
              value={timelineDraft.endTime}
              onChange={(event) =>
                setTimelineDraft((current) => ({ ...current, endTime: event.target.value }))
              }
              aria-label="结束时间"
            />
            <input
              className="field col-span-2"
              value={timelineDraft.note}
              placeholder="时间块备注"
              onChange={(event) =>
                setTimelineDraft((current) => ({ ...current, note: event.target.value }))
              }
            />
            <button type="button" className="button-secondary col-span-2" onClick={addTimeline}>
              添加时间块
            </button>
          </div>
        </section>

        <label>
          <span className="label">卡点记录</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.blockers}
            onChange={(event) => patchDraft({ blockers: event.target.value })}
          />
        </label>

        <label>
          <span className="label">完成后复盘</span>
          <textarea
            rows="4"
            className="field resize-none"
            value={draft.review}
            onChange={(event) => patchDraft({ review: event.target.value })}
          />
        </label>

        <button
          type="button"
          className="button-secondary w-full text-rose-700 hover:border-rose-200 hover:bg-rose-50"
          onClick={() => onDeleteTodo(todo.id)}
        >
          删除这个任务
        </button>
      </div>
    </aside>
  );
}

function ProjectDetail({
  project,
  todos,
  onClose,
  onSaveProject,
  onDeleteProject,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone
}) {
  const [draft, setDraft] = useState(project);
  const [milestoneDraft, setMilestoneDraft] = useState(blankMilestone);
  const stats = buildProjectStats(project, todos);

  useEffect(() => {
    setDraft(project);
    setMilestoneDraft(blankMilestone);
  }, [project]);

  function patchDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveProject() {
    onSaveProject(project.id, draft);
  }

  function addMilestone() {
    onAddMilestone(project.id, milestoneDraft);
    setMilestoneDraft(blankMilestone);
  }

  return (
    <aside className="surface max-h-none p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="muted">Project detail</p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-950">项目编辑</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" className="button-ghost" onClick={onClose}>
            关闭
          </button>
          <button type="button" className="button-primary" onClick={saveProject}>
            保存
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <label>
          <span className="label">项目名称</span>
          <input
            className="field"
            value={draft.name}
            onChange={(event) => patchDraft({ name: event.target.value })}
          />
        </label>

        <label>
          <span className="label">项目目标</span>
          <textarea
            rows="3"
            className="field resize-none"
            value={draft.goal}
            onChange={(event) => patchDraft({ goal: event.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">截止日期</span>
            <input
              type="date"
              className="field"
              value={draft.deadline}
              onChange={(event) => patchDraft({ deadline: event.target.value })}
            />
          </label>

          <label>
            <span className="label">剩余时间</span>
            <input className="field" value={countdownText(draft.deadline)} readOnly />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">项目进度</span>
            <input
              type="number"
              min="0"
              max="100"
              className="field"
              value={draft.progress}
              onChange={(event) => patchDraft({ progress: Number(event.target.value) })}
            />
          </label>

          <label>
            <span className="label">状态</span>
            <select
              className="field"
              value={draft.status}
              onChange={(event) => patchDraft({ status: event.target.value })}
            >
              {projectStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span className="label">颜色</span>
          <input
            type="color"
            className="field h-11 p-1"
            value={draft.color}
            onChange={(event) => patchDraft({ color: event.target.value })}
          />
        </label>

        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">阶段节点</h3>
            <span className="text-xs text-neutral-400">
              {stats.completedMilestones}/{stats.totalMilestones}
            </span>
          </div>

          <div className="space-y-2">
            {stats.milestones.length ? (
              stats.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-2 rounded-md bg-white p-3">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => onToggleMilestone(project.id, milestone.id)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-400"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-medium ${
                        milestone.completed
                          ? "text-neutral-400 line-through"
                          : "text-neutral-900"
                      }`}
                    >
                      {milestone.title}
                    </div>
                    <div className="mt-1 text-xs text-neutral-400">
                      {milestone.date || "未设日期"} · {countdownText(milestone.date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button-ghost px-2 py-1 text-xs"
                    onClick={() => onDeleteMilestone(project.id, milestone.id)}
                  >
                    删除
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-white p-3 text-sm text-neutral-400">
                还没有阶段节点。
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              className="field"
              value={milestoneDraft.title}
              placeholder="新增节点"
              onChange={(event) =>
                setMilestoneDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
            <input
              className="field"
              type="date"
              value={milestoneDraft.date}
              onChange={(event) =>
                setMilestoneDraft((current) => ({ ...current, date: event.target.value }))
              }
            />
            <button type="button" className="button-secondary col-span-2" onClick={addMilestone}>
              添加节点
            </button>
          </div>
        </section>

        <button
          type="button"
          className="button-secondary w-full text-rose-700 hover:border-rose-200 hover:bg-rose-50"
          onClick={() => onDeleteProject(project.id)}
        >
          删除这个项目
        </button>
      </div>
    </aside>
  );
}
