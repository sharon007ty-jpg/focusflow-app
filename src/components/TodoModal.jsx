import { useState } from "react";
import { priorityOptions } from "../data/seed";

export default function TodoModal({ projects, selectedDate, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    projectId: projects[0]?.id || "",
    priority: "中",
    estimatedMinutes: 45,
    date: selectedDate,
    goal: ""
  });

  function patchForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onCreate({
      ...form,
      title: form.title.trim(),
      goal: form.goal.trim()
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/25 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-quiet"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="muted">New task</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-950">新增任务</h2>
          </div>
          <button type="button" className="button-ghost" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="space-y-4">
          <label>
            <span className="label">任务标题</span>
            <input
              className="field"
              value={form.title}
              autoFocus
              onChange={(event) => patchForm({ title: event.target.value })}
              placeholder="例如：完成导游词第一版"
            />
          </label>

          <label>
            <span className="label">今日目标</span>
            <textarea
              rows="3"
              className="field resize-none"
              value={form.goal}
              onChange={(event) => patchForm({ goal: event.target.value })}
              placeholder="写清楚今天做到什么程度才算推进。"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">日期</span>
              <input
                type="date"
                className="field"
                value={form.date}
                onChange={(event) => patchForm({ date: event.target.value })}
              />
            </label>

            <label>
              <span className="label">所属项目</span>
              <select
                className="field"
                value={form.projectId}
                onChange={(event) => patchForm({ projectId: event.target.value })}
              >
                <option value="">未分配项目</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">优先级</span>
              <select
                className="field"
                value={form.priority}
                onChange={(event) => patchForm({ priority: event.target.value })}
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
                value={form.estimatedMinutes}
                onChange={(event) => patchForm({ estimatedMinutes: Number(event.target.value) })}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="button-secondary" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="button-primary">
            创建任务
          </button>
        </div>
      </form>
    </div>
  );
}
