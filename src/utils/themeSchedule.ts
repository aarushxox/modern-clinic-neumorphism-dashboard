export const AUTO_DAY_THEME = 'sky-blue' as const;
export const AUTO_NIGHT_THEME = 'midnight-clinical' as const;
export type ScheduledClinicTheme = typeof AUTO_DAY_THEME | typeof AUTO_NIGHT_THEME;

export const DEFAULT_DAY_START_HOUR = 7;
export const DEFAULT_NIGHT_START_HOUR = 19;

export function normalizeScheduleHour(hour: number | undefined, fallback: number): number {
  if (typeof hour !== 'number' || !Number.isFinite(hour)) {
    return fallback;
  }
  const rounded = Math.floor(hour);
  if (rounded < 0 || rounded > 23) {
    return fallback;
  }
  return rounded;
}

/**
 * Resolves the active clinic theme ('sky-blue' for day, 'midnight-clinical' for night)
 * based on the user's local system clock and configured day/night boundary hours.
 */
export function resolveScheduledTheme(
  now: Date = new Date(),
  dayStartHour: number = DEFAULT_DAY_START_HOUR,
  nightStartHour: number = DEFAULT_NIGHT_START_HOUR
): 'sky-blue' | 'midnight-clinical' {
  const dayStart = normalizeScheduleHour(dayStartHour, DEFAULT_DAY_START_HOUR);
  const nightStart = normalizeScheduleHour(nightStartHour, DEFAULT_NIGHT_START_HOUR);
  const currentHour = now.getHours();

  if (dayStart === nightStart) {
    return AUTO_DAY_THEME;
  }

  const isDaytime =
    dayStart < nightStart
      ? currentHour >= dayStart && currentHour < nightStart
      : currentHour >= dayStart || currentHour < nightStart;

  return isDaytime ? AUTO_DAY_THEME : AUTO_NIGHT_THEME;
}

export function formatScheduleHour(hour: number): string {
  const safeHour = normalizeScheduleHour(hour, 0);
  const period = safeHour >= 12 ? 'PM' : 'AM';
  const hour12 = safeHour % 12 === 0 ? 12 : safeHour % 12;
  return `${String(hour12).padStart(2, '0')}:00 ${period}`;
}

export function formatLocalClock(now: Date): string {
  return now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNextScheduledSwitch(
  now: Date,
  dayStartHour: number = DEFAULT_DAY_START_HOUR,
  nightStartHour: number = DEFAULT_NIGHT_START_HOUR
): {
  nextTheme: 'sky-blue' | 'midnight-clinical';
  nextHour: number;
  timeLabel: string;
} {
  const dayStart = normalizeScheduleHour(dayStartHour, DEFAULT_DAY_START_HOUR);
  const nightStart = normalizeScheduleHour(nightStartHour, DEFAULT_NIGHT_START_HOUR);
  const currentTheme = resolveScheduledTheme(now, dayStart, nightStart);

  if (currentTheme === AUTO_DAY_THEME) {
    return {
      nextTheme: AUTO_NIGHT_THEME,
      nextHour: nightStart,
      timeLabel: formatScheduleHour(nightStart),
    };
  }

  return {
    nextTheme: AUTO_DAY_THEME,
    nextHour: dayStart,
    timeLabel: formatScheduleHour(dayStart),
  };
}
