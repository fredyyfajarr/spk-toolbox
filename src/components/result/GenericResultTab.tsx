"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingTable } from "./RankingTable";
import { BarChart } from "./BarChart";

export interface GenericResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number;
  rank: number;
}

interface GenericResultTabProps {
  methodName: string;
  results: GenericResult[];
  scoreLabel?: string;
}

export function GenericResultTab({ methodName, results, scoreLabel = "Skor" }: GenericResultTabProps) {
  const best = results.find(r => r.rank === 1) || results[0];

  return (
    <div className="space-y-6 mt-6">
      {best && (
        <Card className="rounded-md border-border bg-card shadow-sm ring-1 ring-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-medium tracking-wide uppercase text-sm">
              Alternatif Terbaik ({methodName})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {best.alternativeCode} - {best.alternativeName}
            </p>
            <div className="mt-4 inline-flex items-center rounded-md border border-border bg-muted/50 px-4 py-2">
              <span className="text-sm text-muted-foreground mr-3">{scoreLabel} Tertinggi</span>
              <span className="text-lg font-bold text-primary">{best.score.toFixed(6)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-md border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle>Tabel Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RankingTable results={results} scoreLabel={scoreLabel} />
        </CardContent>
      </Card>

      <Card className="rounded-md border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle>Bar Chart {scoreLabel}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <BarChart results={results} scoreLabel={scoreLabel} />
        </CardContent>
      </Card>
    </div>
  );
}
