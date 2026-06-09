"use client";

import { Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatNumber } from "@/lib/utils";
import type { GenericResult } from "./GenericResultTab";

interface RankingTableProps {
  results: GenericResult[];
  scoreLabel?: string;
}

function medalColor(rank: number) {
  if (rank === 1) return "text-yellow-600";
  if (rank === 2) return "text-slate-500";
  if (rank === 3) return "text-orange-600";
  return "text-muted-foreground";
}

export function RankingTable({ results, scoreLabel = "Skor" }: RankingTableProps) {
  const max = Math.max(...results.map((result) => result.score), 0);
  const min = Math.min(...results.map((result) => result.score), 0);
  const range = max - min || 1;

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground">Rank</TableHead>
            <TableHead className="text-primary-foreground">Kode</TableHead>
            <TableHead className="text-primary-foreground">Nama Alternatif</TableHead>
            <TableHead className="text-primary-foreground">{scoreLabel}</TableHead>
            <TableHead className="min-w-48 text-primary-foreground">Visual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => {
            const width = ((result.score - min) / range) * 100;
            return (
              <TableRow
                key={result.alternativeId}
                className={cn(result.rank === 1 && "bg-accent/20")}
              >
                <TableCell>
                  <Badge variant={result.rank <= 3 ? "default" : "secondary"}>
                    {result.rank <= 3 && (
                      <Medal className={cn("size-3", medalColor(result.rank))} />
                    )}
                    {result.rank}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{result.alternativeCode}</TableCell>
                <TableCell>{result.alternativeName}</TableCell>
                <TableCell className="font-mono">{formatNumber(result.score)}</TableCell>
                <TableCell>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.max(8, width)}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
