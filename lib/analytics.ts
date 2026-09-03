import { toDate, type Entry } from './types';

export async function getEntriesByDateRange(startDate: Date, endDate: Date): Promise<Entry[]> {
  const files = [] as Entry[];
  return files.filter((entry) => {
    const value = toDate(entry.entryTime);
    return value >= startDate && value <= endDate;
  });
}

export async function getEntryTrendsByHour(
  entries: Entry[]
): Promise<{ hour: number; count: number; label: string }[]> {
  const hourCounts = new Map<number, number>();

  for (let hour = 0; hour < 24; hour += 1) {
    hourCounts.set(hour, 0);
  }

  entries.forEach((entry) => {
    const date = toDate(entry.entryTime);
    const hour = date.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  });

  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({
      hour,
      count,
      label: `${hour.toString().padStart(2, '0')}:00`,
    }))
    .sort((a, b) => a.hour - b.hour);
}

export async function getPeakHours(entries: Entry[]): Promise<{ hour: string; count: number }[]> {
  const trends = await getEntryTrendsByHour(entries);
  return trends
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((entry) => ({
      hour: entry.label,
      count: entry.count,
    }));
}

export async function getMostFrequentVisitors(
  entries: Entry[],
  limit = 10
): Promise<
  {
    personId: string;
    personName: string;
    personCategory: string;
    visitCount: number;
  }[]
> {
  const visitorMap = new Map<
    string,
    {
      personId: string;
      personName: string;
      personCategory: string;
      count: number;
    }
  >();

  entries.forEach((entry) => {
    const key = entry.personId;
    const existing = visitorMap.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      visitorMap.set(key, {
        personId: entry.personId,
        personName: entry.personName,
        personCategory: entry.personCategory,
        count: 1,
      });
    }
  });

  return Array.from(visitorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((visitor) => ({
      personId: visitor.personId,
      personName: visitor.personName,
      personCategory: visitor.personCategory,
      visitCount: visitor.count,
    }));
}

export async function getEntryMethodStats(
  entries: Entry[]
): Promise<{ method: string; count: number; percentage: number }[]> {
  const methodMap = new Map<string, number>();

  entries.forEach((entry) => {
    const method = entry.verificationMethod || 'unknown';
    methodMap.set(method, (methodMap.get(method) ?? 0) + 1);
  });

  const total = entries.length || 1;
  return Array.from(methodMap.entries())
    .map(([method, count]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getVisitorCategoryBreakdown(
  entries: Entry[]
): Promise<{ category: string; count: number; percentage: number }[]> {
  const categoryMap = new Map<string, number>();

  entries.forEach((entry) => {
    const category = entry.personCategory || 'unknown';
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  });

  const total = entries.length || 1;
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category: category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getEntriesByFlat(
  entries: Entry[]
): Promise<{ flat: string; count: number }[]> {
  const flatMap = new Map<string, number>();

  entries.forEach((entry) => {
    if (!entry.associatedFlat) return;
    flatMap.set(entry.associatedFlat, (flatMap.get(entry.associatedFlat) ?? 0) + 1);
  });

  return Array.from(flatMap.entries())
    .map(([flat, count]) => ({ flat, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

export async function getSummaryStats(entries: Entry[]): Promise<{
  totalEntries: number;
  uniqueVisitors: number;
  averageEntriesPerDay: number;
  averageEntriesPerHour: number;
  timeGuardSavedHours: number;
  mostCommonCategory: string;
}> {
  const uniqueVisitors = new Set(entries.map((entry) => entry.personId)).size;

  const dates = new Set<string>();
  entries.forEach((entry) => {
    const date = toDate(entry.entryTime);
    dates.add(date.toDateString());
  });

  const daysCovered = Math.max(dates.size, 1);

  const categoryMap = new Map<string, number>();
  entries.forEach((entry) => {
    const category = entry.personCategory || 'unknown';
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  });

  const mostCommonCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

  const timePerEntrySavedMinutes = 2;
  const totalMinutesSaved = entries.length * timePerEntrySavedMinutes;
  const timeGuardSavedHours = totalMinutesSaved / 60;

  return {
    totalEntries: entries.length,
    uniqueVisitors,
    averageEntriesPerDay: Math.round(entries.length / daysCovered),
    averageEntriesPerHour: Math.round(entries.length / (daysCovered * 24)),
    timeGuardSavedHours: Math.round(timeGuardSavedHours * 10) / 10,
    mostCommonCategory,
  };
}

export async function getDailyEntryCounts(
  entries: Entry[]
): Promise<{ date: string; count: number }[]> {
  const dateMap = new Map<string, number>();

  entries.forEach((entry) => {
    const date = toDate(entry.entryTime);
    const dateKey = date.toISOString().split('T')[0];
    dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + 1);
  });

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
