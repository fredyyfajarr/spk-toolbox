"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GenericResult } from "./GenericResultTab";

interface BarChartProps {
  results: GenericResult[];
  scoreLabel?: string;
}

export function BarChart({ results, scoreLabel = "Skor" }: BarChartProps) {
  const chartConfig = {
    score: {
      label: scoreLabel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const data = results.map((result) => ({
    label: `${result.alternativeCode} ${result.alternativeName}`,
    score: result.score,
    fill: result.rank === 1 ? "var(--chart-1)" : "color-mix(in oklch, var(--chart-1) 55%, transparent)",
  }));

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <RechartsBarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" dataKey="score" />
        <YAxis type="category" dataKey="label" width={140} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="score" radius={4} />
      </RechartsBarChart>
    </ChartContainer>
  );
}
