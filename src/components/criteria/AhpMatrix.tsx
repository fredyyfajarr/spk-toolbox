"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { runAHP } from "@/lib/ahp";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project } from "@/types";

interface AhpMatrixProps {
  project: Project;
}

const SCALE_OPTIONS = [
  { value: 9, label: "9 - Sangat Mutlak Lebih Penting (Kiri)" },
  { value: 7, label: "7 - Mutlak Lebih Penting (Kiri)" },
  { value: 5, label: "5 - Lebih Penting (Kiri)" },
  { value: 3, label: "3 - Sedikit Lebih Penting (Kiri)" },
  { value: 1, label: "1 - Sama Pentingnya" },
  { value: 1 / 3, label: "3 - Sedikit Lebih Penting (Kanan)" },
  { value: 1 / 5, label: "5 - Lebih Penting (Kanan)" },
  { value: 1 / 7, label: "7 - Mutlak Lebih Penting (Kanan)" },
  { value: 1 / 9, label: "9 - Sangat Mutlak Lebih Penting (Kanan)" },
];

export function AhpMatrix({ project }: AhpMatrixProps) {
  const setAhpMatrix = useProjectStore((state) => state.setAhpMatrix);
  const setCriteria = useProjectStore((state) => state.setCriteria);

  const criteria = project.criteria;
  const matrix = project.ahpMatrix ?? {};

  // Membentuk pasangan i < j
  const pairs = useMemo(() => {
    const p = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        p.push({ c1: criteria[i], c2: criteria[j] });
      }
    }
    return p;
  }, [criteria]);

  // Kalkulasi AHP secara real-time
  const ahpResult = useMemo(() => {
    return runAHP(criteria, matrix);
  }, [criteria, matrix]);

  const handleSelectChange = (c1Id: string, c2Id: string, val: string) => {
    const numVal = parseFloat(val);
    const newMatrix = structuredClone(matrix);
    if (!newMatrix[c1Id]) newMatrix[c1Id] = {};
    newMatrix[c1Id][c2Id] = numVal;
    
    // Simpan kebaikannya juga untuk kemudahan (walaupun lib/ahp bisa menanganinya)
    if (!newMatrix[c2Id]) newMatrix[c2Id] = {};
    newMatrix[c2Id][c1Id] = 1 / numVal;

    setAhpMatrix(project.id, newMatrix);
  };

  const applyWeights = () => {
    if (!ahpResult.isConsistent) {
      toast.error("Rasio Konsistensi (CR) melebihi 0.1. Perbaiki matriks perbandingan terlebih dahulu.");
      return;
    }

    const updatedCriteria = criteria.map((c) => ({
      ...c,
      weight: Number(ahpResult.weights[c.id].toFixed(4)) || 0,
    }));
    
    setCriteria(project.id, updatedCriteria);
    toast.success("Bobot kriteria berhasil diperbarui menggunakan AHP");
  };

  if (criteria.length < 2) return null;

  const crPercent = (ahpResult.consistencyRatio * 100).toFixed(2);

  return (
    <Card className="border-border">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          Kalkulator Bobot AHP
        </CardTitle>
        <CardDescription>
          Karena Anda memilih metode AHP, Anda dapat menghitung bobot kriteria secara ilmiah menggunakan matriks perbandingan berpasangan (Skala Saaty).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          {pairs.map(({ c1, c2 }) => {
            const val = matrix[c1.id]?.[c2.id] ?? 1;
            // Handle float precision issues for matching select values
            const closestOption = SCALE_OPTIONS.reduce((prev, curr) => 
              Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev
            );

            return (
              <div key={`${c1.id}-${c2.id}`} className="grid grid-cols-[1fr_2fr_1fr] items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="text-right text-sm font-medium">
                  {c1.name} <span className="text-muted-foreground text-xs">({c1.code})</span>
                </div>
                <Select
                  value={closestOption.value.toString()}
                  onValueChange={(v) => handleSelectChange(c1.id, c2.id, v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tingkat kepentingan" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCALE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-left text-sm font-medium">
                  {c2.name} <span className="text-muted-foreground text-xs">({c2.code})</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-md border border-border bg-muted/20 p-4 space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">Hasil Consistency Ratio (CR)</h4>
              <p className="text-xs text-muted-foreground">CR harus {'<='} 10% (0.1) agar matriks dianggap konsisten.</p>
            </div>
            <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-md border ${ahpResult.isConsistent ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {ahpResult.isConsistent ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              {crPercent}% ({ahpResult.consistencyRatio.toFixed(3)})
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={applyWeights} disabled={!ahpResult.isConsistent}>
              Terapkan Bobot ke Tabel Kriteria
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
