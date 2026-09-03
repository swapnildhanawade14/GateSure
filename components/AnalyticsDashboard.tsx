'use client';

import { useEffect, useState } from 'react';
import { getRecentEntries } from '@/lib/database';
import {
  getDailyEntryCounts,
  getEntryMethodStats,
  getEntryTrendsByHour,
  getMostFrequentVisitors,
  getPeakHours,
  getSummaryStats,
  getVisitorCategoryBreakdown,
} from '@/lib/analytics';
import type { Entry } from '@/lib/types';
import SummaryCards from './analytics/SummaryCards';
import EntryTrendChart from './analytics/EntryTrendChart';
import EntryMethodChart from './analytics/EntryMethodChart';
import VisitorCategoryChart from './analytics/VisitorCategoryChart';
import DailyEntriesChart from './analytics/DailyEntriesChart';
import MostFrequentVisitors from './analytics/MostFrequentVisitors';
import PeakHoursCard from './analytics/PeakHoursCard';

interface AnalyticsData {
  summaryStats: Awaited<ReturnType<typeof getSummaryStats>>;
  entryTrends: Awaited<ReturnType<typeof getEntryTrendsByHour>>;
  entryMethodStats: Awaited<ReturnType<typeof getEntryMethodStats>>;
  visitorCategories: Awaited<ReturnType<typeof getVisitorCategoryBreakdown>>;
  frequentVisitors: Awaited<ReturnType<typeof getMostFrequentVisitors>>;
  dailyEntries: Awaited<ReturnType<typeof getDailyEntryCounts>>;
  peakHours: Awaited<ReturnType<typeof getPeakHours>>;
}

interface AnalyticsDashboardProps {
  societyId: string;
}

export default function AnalyticsDashboard({ societyId }: AnalyticsDashboardProps) {
  const [, setEntries] = useState<Entry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('7days');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const daysToFetch = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
        const recentEntries = await getRecentEntries(societyId, daysToFetch * 24);
        setEntries(recentEntries);

        const [summary, trends, methods, categories, visitors, daily, peaks] = await Promise.all([
          getSummaryStats(recentEntries),
          getEntryTrendsByHour(recentEntries),
          getEntryMethodStats(recentEntries),
          getVisitorCategoryBreakdown(recentEntries),
          getMostFrequentVisitors(recentEntries, 10),
          getDailyEntryCounts(recentEntries),
          getPeakHours(recentEntries),
        ]);

        setAnalyticsData({
          summaryStats: summary,
          entryTrends: trends,
          entryMethodStats: methods,
          visitorCategories: categories,
          frequentVisitors: visitors,
          dailyEntries: daily,
          peakHours: peaks,
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, [dateRange, societyId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Security & Entry Analytics</h1>
          <p className="text-slate-600">Complete visibility into who is entering your society</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(['7days', '30days', '90days'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                dateRange === range ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        <SummaryCards stats={analyticsData.summaryStats} />
        <PeakHoursCard peakHours={analyticsData.peakHours} />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg shadow-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Entry Trends by Hour</h2>
            <EntryTrendChart data={analyticsData.entryTrends} />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg shadow-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Entry Method Used</h2>
            <EntryMethodChart data={analyticsData.entryMethodStats} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg shadow-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Visitor Breakdown by Category</h2>
            <VisitorCategoryChart data={analyticsData.visitorCategories} />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg shadow-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Daily Entry Counts</h2>
            <DailyEntriesChart data={analyticsData.dailyEntries} />
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-lg shadow-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Most Frequent Visitors</h2>
          <MostFrequentVisitors visitors={analyticsData.frequentVisitors} />
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            📊 Print / Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
