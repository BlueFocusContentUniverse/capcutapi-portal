"use client";

import { FileText, Video } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/ui/chart-card";
import { NumberCard } from "@/components/ui/number-card";

interface WeeklyDataPoint {
  date: string;
  count: number;
  day: string;
}

interface CountData {
  total: number;
  weekly: WeeklyDataPoint[];
}

interface DraftsChartProps {
  data: CountData;
}

interface VideoTasksChartProps {
  data: CountData;
}

export function DraftsChart({ data }: DraftsChartProps) {
  const chartData = data.weekly.map((item) => ({
    name: item.day,
    count: item.count,
  }));

  return (
    <ChartCard title="最近7天草稿统计" description="每日新增草稿数量">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-md">
                    <p className="font-medium">{`${label}`}</p>
                    <p className="text-primary">
                      {`草稿数: ${payload[0].value}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            fill="#8884d8"
            name="草稿数"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-sm text-muted-foreground mt-2">
        最近7天总计: {data.weekly.reduce((sum, item) => sum + item.count, 0)}{" "}
        个草稿
      </div>
    </ChartCard>
  );
}

export function VideoTasksChart({ data }: VideoTasksChartProps) {
  const chartData = data.weekly.map((item) => ({
    name: item.day,
    count: item.count,
  }));

  return (
    <ChartCard title="最近7天任务统计" description="每日新增视频任务数量">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-md">
                    <p className="font-medium">{`${label}`}</p>
                    <p className="text-primary">
                      {`任务数: ${payload[0].value}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            fill="#ff7c7c"
            name="任务数"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-sm text-muted-foreground mt-2">
        最近7天总计: {data.weekly.reduce((sum, item) => sum + item.count, 0)}{" "}
        个任务
      </div>
    </ChartCard>
  );
}

interface DashboardOverviewProps {
  draftCounts: CountData;
  videoTaskCounts: CountData;
}

export function DashboardOverview({
  draftCounts,
  videoTaskCounts,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Total Count Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <NumberCard
          title="总草稿数"
          value={draftCounts.total}
          icon={FileText}
          description="累计创建的草稿总数"
        />
        <NumberCard
          title="总任务数"
          value={videoTaskCounts.total}
          icon={Video}
          description="累计创建的任务总数"
        />
      </div>

      {/* Weekly Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <DraftsChart data={draftCounts} />
        <VideoTasksChart data={videoTaskCounts} />
      </div>
    </div>
  );
}

// Legacy component for backward compatibility
interface DashboardChartsProps {
  draftCounts: CountData;
  videoTaskCounts: CountData;
}

export function DashboardCharts({
  draftCounts,
  videoTaskCounts,
}: DashboardChartsProps) {
  return (
    <DashboardOverview
      draftCounts={draftCounts}
      videoTaskCounts={videoTaskCounts}
    />
  );
}
