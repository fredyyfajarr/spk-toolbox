"use client";

import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Alternative, AlternativeValue, Criteria } from "@/types";

interface AlternativeTableProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
  onAlternativesChange: (alternatives: Alternative[]) => void;
  onValueChange: (
    alternativeId: string,
    criteriaId: string,
    value: number | null
  ) => void;
}

function makeAlternative(index: number): Alternative {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    code: `A${index + 1}`,
    name: `Alternatif ${index + 1}`,
  };
}

function getValue(
  values: AlternativeValue[],
  alternativeId: string,
  criteriaId: string
) {
  return values.find(
    (value) =>
      value.alternativeId === alternativeId && value.criteriaId === criteriaId
  )?.value;
}

export function AlternativeTable({
  criteria,
  alternatives,
  values,
  onAlternativesChange,
  onValueChange,
}: AlternativeTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16">No</TableHead>
              <TableHead className="w-24">Kode</TableHead>
              <TableHead className="min-w-52">
                Nama Alternatif
              </TableHead>
              {criteria.map((criterion) => (
                <TableHead
                  key={criterion.id}
                  className="min-w-40"
                >
                  <div>{criterion.name}</div>
                  <div className="mt-1 flex gap-1">
                    <Badge
                      variant="secondary"
                      className={
                        criterion.type === "benefit"
                          ? "bg-emerald-500/20 text-emerald-300 border-none"
                          : "bg-orange-500/20 text-orange-300 border-none"
                      }
                    >
                      {criterion.type}
                    </Badge>
                    <Badge variant="secondary" className="bg-muted">w={criterion.weight}</Badge>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-16 text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alternatives.map((alternative, index) => (
              <TableRow key={alternative.id} className="group transition-colors border-b border-border hover:bg-muted/30">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{alternative.code}</TableCell>
                <TableCell>
                  <Input
                    className="border-input bg-transparent"
                    value={alternative.name}
                    onChange={(event) =>
                      onAlternativesChange(
                        alternatives.map((item) =>
                          item.id === alternative.id
                            ? { ...item, name: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                </TableCell>
                {criteria.map((criterion) => {
                  const value = getValue(values, alternative.id, criterion.id);
                  const empty = value === undefined || Number.isNaN(value);

                  return (
                    <TableCell key={criterion.id}>
                      <Input
                        type="number"
                        min={0}
                        className={cn("bg-transparent border-input", empty && "border-destructive bg-destructive/10")}
                        value={value ?? ""}
                        onChange={(event) => {
                          const rawValue = event.target.value;
                          if (rawValue === "") {
                            onValueChange(alternative.id, criterion.id, null);
                            return;
                          }

                          const next = Number(rawValue);
                          onValueChange(
                            alternative.id,
                            criterion.id,
                            Number.isFinite(next) ? Math.max(0, next) : 0
                          );
                        }}
                      />
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-50 hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                    onClick={() =>
                      onAlternativesChange(
                        alternatives.filter((item) => item.id !== alternative.id)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        variant="outline"
        className="rounded-md border-dashed border-border w-full sm:w-auto"
        onClick={() =>
          onAlternativesChange([...alternatives, makeAlternative(alternatives.length)])
        }
      >
        <Plus className="size-4 mr-2" />
        Tambah Alternatif
      </Button>
    </div>
  );
}
