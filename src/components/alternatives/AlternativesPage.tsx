"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlternativeTable } from "@/components/alternatives/AlternativeTable";
import { ImportModal } from "@/components/alternatives/ImportModal";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

interface AlternativesPageProps {
  projectId: string;
}

export function AlternativesPage({ projectId }: AlternativesPageProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const setAlternatives = useProjectStore((state) => state.setAlternatives);
  const setValues = useProjectStore((state) => state.setValues);
  const updateValue = useProjectStore((state) => state.updateValue);

  if (!project) {
    return null;
  }

  const requiredCells = project.criteria.length * project.alternatives.length;
  const emptyCells = Math.max(requiredCells - project.values.length, 0);
  const criteriaReady =
    project.criteria.length >= 2 && weightIsValid(getWeightTotal(project.criteria));
  const ready =
    criteriaReady && project.alternatives.length >= 2 && requiredCells > 0 && emptyCells === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Input Data Alternatif
          </h1>
          <p className="mt-2 text-muted-foreground">
            Isi nilai setiap alternatif terhadap semua kriteria.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportModal
            criteria={project.criteria}
            onImport={(alternatives, values) => {
              setAlternatives(projectId, alternatives);
              setValues(projectId, values);
            }}
          />
          <Button asChild disabled={!ready}>
            <Link
              href={ready ? `/project/${projectId}/calculate` : "#"}
              aria-disabled={!ready}
            >
              Lanjut Kalkulasi
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {!criteriaReady && (
        <Alert className="border-red-200 bg-red-50 text-red-950">
          <AlertCircle className="size-4" />
          <AlertTitle>Kriteria belum valid</AlertTitle>
          <AlertDescription>
            Lengkapi minimal 2 kriteria dan pastikan total bobot sama dengan
            1.000.
          </AlertDescription>
        </Alert>
      )}

      {emptyCells > 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>{emptyCells} sel belum diisi</AlertTitle>
          <AlertDescription>
            Sel kosong ditandai merah. Semua nilai harus angka positif.
          </AlertDescription>
        </Alert>
      )}

      <AlternativeTable
        criteria={project.criteria}
        alternatives={project.alternatives}
        values={project.values}
        onAlternativesChange={(alternatives) => setAlternatives(projectId, alternatives)}
        onValueChange={(alternativeId, criteriaId, value) =>
          updateValue(projectId, alternativeId, criteriaId, value)
        }
      />
    </div>
  );
}
