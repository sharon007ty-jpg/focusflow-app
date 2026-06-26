import { getDateKey } from "../utils/dates";

export const statusOptions = ["未开始", "进行中", "已完成", "卡住"];
export const priorityOptions = ["高", "中", "低"];
export const projectStatusOptions = ["计划中", "进行中", "暂停", "完成"];

export const projectsSeed = [];

export function getTodayKey(date = new Date()) {
  return getDateKey(date);
}

export function createSeedTodos(date = getTodayKey()) {
  return [];
}
