export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function daysBetween(fromDate, toDate) {
  const start = parseDateOnly(getDateKey(fromDate));
  const end = parseDateOnly(getDateKey(toDate));
  if (!start || !end) return null;
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export function daysUntil(dateKey, from = new Date()) {
  const target = parseDateOnly(dateKey);
  if (!target) return null;
  return daysBetween(from, target);
}

export function countdownText(dateKey) {
  const days = daysUntil(dateKey);
  if (days === null) return "未设置截止日期";
  if (days > 0) return `剩余 ${days} 天`;
  if (days === 0) return "今天截止";
  return `已超期 ${Math.abs(days)} 天`;
}

export function formatDisplayDate(dateKey) {
  const date = parseDateOnly(dateKey) || new Date();
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

export function dailyEncouragement(dateKey) {
  const lines = [
    "把任务推进一点点，比把计划写得很漂亮更重要。",
    "今天只要抓住最关键的一步，系统就会继续往前走。",
    "先让任务进入时间块，再让注意力进入任务。",
    "卡住不是失败，是下一步需要被拆小。",
    "每一个勾选，都是项目往前移动的证据。",
    "今天不追求满分，只追求真实推进。"
  ];
  const seed = String(dateKey)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return lines[seed % lines.length];
}
