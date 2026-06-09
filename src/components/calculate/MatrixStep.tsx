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
import type { Alternative, Criteria } from "@/types";

interface MatrixStepProps {
  title: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  matrix: number[][];
  headerMeta?: string[];
}

export function MatrixStep({
  title,
  criteria,
  alternatives,
  matrix,
  headerMeta,
}: MatrixStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="min-w-44 text-primary-foreground">
                Alternatif
              </TableHead>
              {criteria.map((criterion, index) => (
                <TableHead
                  key={criterion.id}
                  className="min-w-36 text-primary-foreground"
                >
                  <div>{criterion.code}</div>
                  <div className="text-xs font-normal text-primary-foreground/80">
                    {criterion.type}, w={criterion.weight}
                  </div>
                  {headerMeta?.[index] && (
                    <div className="text-xs font-normal text-primary-foreground/80">
                      {headerMeta[index]}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alternatives.map((alternative, rowIndex) => (
              <TableRow key={alternative.id}>
                <TableCell className="font-medium">
                  {alternative.code} - {alternative.name}
                </TableCell>
                {criteria.map((criterion, columnIndex) => (
                  <TableCell key={criterion.id}>
                    {formatNumber(matrix[rowIndex]?.[columnIndex] ?? 0)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
