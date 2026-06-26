import { useState } from "react";
import { projectStatusOptions } from "../data/seed";

export default function ProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    goal: "",
    deadline: "",
    progress: 0,
    color: "#111827",
    status: "进行中"
  });

  function patchForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    onCreate({
      ...form,
      name: form.name.trim(),
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
            <p className="muted">New project</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-950">新增项目</h2>
          </div>
          <button type="button" className="button-ghost" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="space-y-4">
          <label>
            <span className="label">项目名称</span>
            <input
              className="field"
              value={form.name}
              autoFocus
              placeholder="例如：英语导游证"
              onChange={(event) => patchForm({ name: event.target.value })}
            />
          </label>

          <label>
            <span className="label">项目目标</span>
            <textarea
              rows="3"
              className="field resize-none"
              value={form.goal}
              placeholder="这个项目最终要完成什么？"
              onChange={(event) => patchForm({ goal: event.target.value })}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">截止日期</span>
              <input
                type="date"
                className="field"
                value={form.deadline}
                onChange={(event) => patchForm({ deadline: event.target.value })}
              />
            </label>

            <label>
              <span className="label">状态</span>
              <select
                className="field"
                value={form.status}
                onChange={(event) => patchForm({ status: event.target.value })}
              >
                {projectStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">项目进度</span>
              <input
                className="field"
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(event) => patchForm({ progress: Number(event.target.value) })}
              />
            </label>

            <label>
              <span className="label">颜色</span>
              <input
                className="field h-11 p-1"
                type="color"
                value={form.color}
                onChange={(event) => patchForm({ color: event.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="button-secondary" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="button-primary">
            创建项目
          </button>
        </div>
      </form>
    </div>
  );
}
