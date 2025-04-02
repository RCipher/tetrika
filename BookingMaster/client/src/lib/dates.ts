import { TimeSlot } from "@shared/schema";

// Map of month names in Russian
const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

// Map of day names in Russian
const DAYS_RU = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
  'Четверг', 'Пятница', 'Суббота'
];

// Map of day shortcodes to Russian day names
const DAY_SHORTCODE_TO_NAME: Record<string, string> = {
  'mon': 'Понедельник',
  'tue': 'Вторник',
  'wed': 'Среда',
  'thu': 'Четверг',
  'fri': 'Пятница',
  'sat': 'Суббота',
  'sun': 'Воскресенье'
};

// Format date as "DD месяца" (e.g., "27 ноября")
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_RU[date.getMonth()];
  return `${day} ${month}`;
}

// Get day name (e.g., "Понедельник")
export function getDayName(date: Date): string {
  return DAYS_RU[date.getDay()];
}

// Format week range as "DD месяца — DD месяца" (e.g., "27 ноября — 03 декабря")
export function formatWeekRangeText(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startDay = weekStart.getDate();
  const startMonth = MONTHS_RU[weekStart.getMonth()];
  
  const endDay = weekEnd.getDate();
  const endMonth = MONTHS_RU[weekEnd.getMonth()];
  
  return `${startDay} ${startMonth} — ${endDay < 10 ? '0' + endDay : endDay} ${endMonth}`;
}

// Parse date string "YYYY-MM-DD" to Date
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format time slot date and time for display
export function formatDateTimeRange(slot: TimeSlot): string {
  // Get day name from shortcode
  const dayName = DAY_SHORTCODE_TO_NAME[slot.dayOfWeek];
  
  // Parse date
  const date = parseDate(slot.date);
  const formattedDate = formatDate(date);
  
  return `${dayName}, ${formattedDate}, ${slot.startTime} - ${slot.endTime}`;
}
