"use client";

import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Criteria, MOORAResult } from "@/types";

interface RadarChartProps {
  criteria: Criteria[];
  results: MOORAResult[];
}

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function RadarChart({ criteria, results }: RadarChartProps) {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(results.map((result) => [result.alternativeId, true]))
  );
  const config = Object.fromEntries(
    results.map((result, index) => [
      result.alternativeId,
      { label: result.alternativeCode, color: colors[index % colors.length] },
    ])
  ) satisfies ChartConfig;
  const data = criteria.map((criterion) => ({
    criterion: criterion.code,
    ...Object.fromEntries(
      results.map((result) => [
        result.alternativeId,
        result.weightedMatrix[criterion.id] ?? 0,
      ])
    ),
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {results.map((result) => (
          <Button
            key={result.alternativeId}
            size="sm"
            variant={visible[result.alternativeId] ? "default" : "outline"}
            onClick={() =>
              setVisible((current) => ({
                ...current,
                [result.alternativeId]: !current[result.alternativeId],
              }))
            }
          >
            {result.alternativeCode}
          </Button>
        ))}
      </div>
      <ChartContainer config={config} className="h-96 w-full">
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="criterion" />
          <ChartTooltip content={<ChartTooltipContent />} />
          {results.map((result, index) =>
            visible[result.alternativeId] ? (
              <Radar
                key={result.alternativeId}
                dataKey={result.alternativeId}
                name={result.alternativeCode}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.12}
              />
            ) : null
          )}
        </RechartsRadarChart>
      </ChartContainer>
    </div>
  );
}
