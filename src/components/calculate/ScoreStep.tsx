"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { MOORAResult } from "@/types";

interface ScoreStepProps {
  results: MOORAResult[];
}

export function ScoreStep({ results }: ScoreStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Skor Yi</h3>
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground">Alternatif</TableHead>
              <TableHead className="text-primary-foreground">Benefit</TableHead>
              <TableHead className="text-primary-foreground">Cost</TableHead>
              <TableHead className="text-primary-foreground">Yi</TableHead>
              <TableHead className="text-primary-foreground">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.alternativeId}>
                <TableCell className="font-medium">
                  {result.alternativeCode} - {result.alternativeName}
                </TableCell>
                <TableCell>{formatNumber(result.benefitSum)}</TableCell>
                <TableCell>{formatNumber(result.costSum)}</TableCell>
                <TableCell>{formatNumber(result.yi)}</TableCell>
                <TableCell>{result.rank}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
