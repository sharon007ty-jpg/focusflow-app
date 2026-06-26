import { dailyEncouragement, formatDisplayDate } from "../utils/dates";

export default function Header({
  selectedDate,
  completionRate,
  focusScore,
  onDateChange,
  onAddTodo
}) {
  return (
    <header className="surface p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="muted">{formatDisplayDate(selectedDate)}</p>
          <h1 className="mt-2 whitespace-nowrap text-3xl font-semibold tracking-normal text-neutral-950 sm:text-4xl">
            今日推进
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            {dailyEncouragement(selectedDate)}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <input
            type="date"
            className="field col-span-2 min-h-11 w-full sm:w-auto sm:min-w-[11rem]"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            aria-label="选择日期"
          />
          <Metric label="当日完成率" value={`${completionRate}%`} />
          <Metric label="Focus Score" value={focusScore} />
          <button
            type="button"
            className="button-primary col-span-2 min-h-11 sm:col-span-1"
            onClick={onAddTodo}
          >
            新增任务
          </button>
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-neutral-950">{value}</div>
    </div>
  );
}
