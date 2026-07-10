import { format, parse } from "date-fns";

export function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const base = new Date(2000, 0, 1);
  const start = parse(startTime.slice(0, 5), "HH:mm", base);
  const end = parse(endTime.slice(0, 5), "HH:mm", base);
  let cur = start.getTime();
  const endMs = end.getTime();
  const step = durationMinutes * 60 * 1000;
  while (cur + step <= endMs) {
    slots.push(format(new Date(cur), "HH:mm"));
    cur += step;
  }
  return slots;
}