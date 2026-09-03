import { NextRequest, NextResponse } from 'next/server';
import { getRecentEntries } from '@/lib/database';
import { getSocietyIdFromRequest } from '@/lib/middleware';
import {
  getDailyEntryCounts,
  getEntryMethodStats,
  getEntryTrendsByHour,
  getMostFrequentVisitors,
  getPeakHours,
  getSummaryStats,
  getVisitorCategoryBreakdown,
} from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    const days = Number(request.nextUrl.searchParams.get('days') ?? '7');
    const entries = await getRecentEntries(societyId, days * 24);

    const [summary, trends, methods, categories, visitors, daily, peaks] = await Promise.all([
      getSummaryStats(entries),
      getEntryTrendsByHour(entries),
      getEntryMethodStats(entries),
      getVisitorCategoryBreakdown(entries),
      getMostFrequentVisitors(entries, 10),
      getDailyEntryCounts(entries),
      getPeakHours(entries),
    ]);

    return NextResponse.json(
      {
        success: true,
        summaryStats: summary,
        entryTrends: trends,
        entryMethodStats: methods,
        visitorCategories: categories,
        frequentVisitors: visitors,
        dailyEntries: daily,
        peakHours: peaks,
        societyId,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics failed',
      },
      { status: 500 }
    );
  }
}
