import TodoCard from "./TodoCard";

export default function TodoList({
  todos,
  projects,
  totalTodos,
  selectedTodoId,
  selectedProjectId,
  onSelectTodo,
  onToggleComplete,
  onDeleteTodo,
  onProjectFilterChange,
  onAddTodo
}) {
  const isFiltered = selectedProjectId && selectedProjectId !== "all";

  return (
    <section className="surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">Today Todo List</h2>
          <p className="muted mt-1">点击任务后，在右侧编辑计划、步骤和时间块。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {projects.length ? (
            <select
              className="field min-h-9 w-auto min-w-[9rem] py-1.5 text-xs"
              value={selectedProjectId}
              onChange={(event) => onProjectFilterChange(event.target.value)}
              aria-label="按项目筛选今日任务"
            >
              <option value="all">全部项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          ) : null}
          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">
            {todos.length}/{totalTodos} tasks
          </span>
        </div>
      </div>

      {todos.length ? (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              project={projects.find((project) => project.id === todo.projectId)}
              selected={todo.id === selectedTodoId}
              onSelect={() => onSelectTodo(todo.id)}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTodo}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-sm font-medium text-neutral-800">
            {isFiltered ? "这个项目今天还没有任务。" : "这一天还没有任务。"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {isFiltered ? "可以新建一个任务，或者切回全部项目查看。" : "新增一个任务，把项目推进放进今天。"}
          </p>
          <button type="button" className="button-primary mt-4" onClick={onAddTodo}>
            新增任务
          </button>
        </div>
      )}
    </section>
  );
}
