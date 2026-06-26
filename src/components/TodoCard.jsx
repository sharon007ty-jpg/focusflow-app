const priorityStyles = {
  高: "bg-neutral-950 text-white",
  中: "bg-neutral-200 text-neutral-900",
  低: "border border-neutral-200 bg-white text-neutral-600"
};

const statusStyles = {
  未开始: "bg-neutral-100 text-neutral-500",
  进行中: "bg-blue-50 text-blue-700",
  已完成: "bg-emerald-50 text-emerald-700",
  卡住: "bg-rose-50 text-rose-700"
};

export default function TodoCard({
  todo,
  project,
  selected,
  onSelect,
  onToggleComplete,
  onDelete
}) {
  return (
    <article
      className={`rounded-lg border bg-white p-3 shadow-hairline transition hover:border-neutral-400 ${
        selected ? "border-neutral-950" : "border-neutral-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.status === "已完成"}
          onChange={() => onToggleComplete(todo.id)}
          className="h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-400"
          aria-label={`完成 ${todo.title}`}
        />

        <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
          <div
            className={`text-sm font-semibold leading-6 ${
              todo.status === "已完成"
                ? "text-neutral-400 line-through"
                : "text-neutral-950"
            }`}
          >
            {todo.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span>{project?.name || "未分配项目"}</span>
            <span>{todo.estimatedMinutes || 0}m 预计</span>
            <span>{todo.actualMinutes || 0}m 实际</span>
          </div>
        </button>

        <div className="hidden shrink-0 flex-wrap items-center gap-2 sm:flex">
          <span className={`rounded-md px-2 py-1 text-[11px] ${priorityStyles[todo.priority]}`}>
            {todo.priority}
          </span>
          <span className={`rounded-md px-2 py-1 text-[11px] ${statusStyles[todo.status]}`}>
            {todo.status}
          </span>
        </div>

        <button
          type="button"
          className="button-ghost shrink-0 px-2 py-1 text-xs"
          onClick={() => onDelete(todo.id)}
        >
          删除
        </button>
      </div>
    </article>
  );
}
