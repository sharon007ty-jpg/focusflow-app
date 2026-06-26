export default function AnalyticsPanel({ analytics }) {
  return (
    <section className="surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="panel-title">Analytics 自动分析</h2>
          <p className="muted mt-1">基于当前任务、步骤和耗时实时生成。</p>
        </div>
        <span className="rounded-md bg-neutral-950 px-2.5 py-1 text-xs text-white">
          {analytics.focusScore}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="今日完成率" value={`${analytics.completionRate}%`} />
        <Stat
          label="任务完成"
          value={`${analytics.completedTodos}/${analytics.totalTodos}`}
        />
        <Stat
          label="步骤完成"
          value={`${analytics.completedSteps}/${analytics.totalSteps}`}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AnalysisBlock title="今天有推进的项目">
          {analytics.activeProjects.length ? (
            <div className="flex flex-wrap gap-2">
              {analytics.activeProjects.map((project) => (
                <span
                  key={project.id}
                  className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
                >
                  {project.name}
                </span>
              ))}
            </div>
          ) : (
            <EmptyText>还没有项目产生推进。</EmptyText>
          )}
        </AnalysisBlock>

        <AnalysisBlock title="卡住的任务">
          {analytics.blockedTodos.length ? (
            <ul className="space-y-2">
              {analytics.blockedTodos.map((todo) => (
                <li key={todo.id} className="text-sm text-neutral-700">
                  {todo.title}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyText>暂无卡点，推进状态稳定。</EmptyText>
          )}
        </AnalysisBlock>

        <AnalysisBlock title="超时任务">
          {analytics.overtimeTodos.length ? (
            <ul className="space-y-2">
              {analytics.overtimeTodos.map((todo) => (
                <li key={todo.id} className="text-sm text-neutral-700">
                  {todo.title}，超出 {todo.actualMinutes - todo.estimatedMinutes} 分钟
                </li>
              ))}
            </ul>
          ) : (
            <EmptyText>暂无超时任务。</EmptyText>
          )}
        </AnalysisBlock>

        <AnalysisBlock title="明日建议">
          <p className="text-sm leading-6 text-neutral-700">{analytics.tomorrowAdvice}</p>
        </AnalysisBlock>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-950">{value}</div>
    </div>
  );
}

function AnalysisBlock({ title, children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h3>
      {children}
    </div>
  );
}

function EmptyText({ children }) {
  return <p className="text-sm text-neutral-400">{children}</p>;
}
