"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CriteriaTable } from "@/components/criteria/CriteriaTable";
import { AhpMatrix } from "@/components/criteria/AhpMatrix";
import { WeightValidator } from "@/components/criteria/WeightValidator";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

interface CriteriaPageProps {
  projectId: string;
}

export function CriteriaPage({ projectId }: CriteriaPageProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const setCriteria = useProjectStore((state) => state.setCriteria);

  if (!project) {
    return null;
  }

  const total = getWeightTotal(project.criteria);
  const valid = project.criteria.length >= 2 && weightIsValid(total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Setup Kriteria & Bobot
          </h1>
          <p className="mt-2 text-muted-foreground">
            Definisikan kriteria, tipe benefit/cost, dan bobot total 1.000.
          </p>
        </div>
        <Button asChild disabled={!valid}>
          <Link
            href={valid ? `/project/${projectId}/alternatives` : "#"}
            aria-disabled={!valid}
          >
            Lanjut ke Input Data
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {project.criteria.length < 2 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Minimal 2 kriteria</AlertTitle>
          <AlertDescription>
            Tambahkan minimal dua kriteria agar metode SPK bisa dibandingkan dengan benar.
          </AlertDescription>
        </Alert>
      )}

      <WeightValidator criteria={project.criteria} />
      {project.methods.includes("AHP") && <AhpMatrix project={project} />}
      <CriteriaTable
        criteria={project.criteria}
        onChange={(criteria) => setCriteria(projectId, criteria)}
      />
    </div>
  );
}
