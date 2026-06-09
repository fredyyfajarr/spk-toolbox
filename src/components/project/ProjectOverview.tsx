"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Database,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectOverviewProps {
  projectId: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));

  if (!project) {
    return null;
  }

  const weightTotal = getWeightTotal(project.criteria);
  const requiredCells = project.criteria.length * project.alternatives.length;
  const filledCells = project.values.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-2 text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4" />
              Kriteria
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {project.criteria.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="size-4" />
              Alternatif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {project.alternatives.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calculator className="size-4" />
              Bobot
            </CardTitle>
          </CardHeader>
          <CardContent
            className={
              weightIsValid(weightTotal) ? "text-emerald-700" : "text-destructive"
            }
          >
            <span className="text-2xl font-semibold">
              {weightTotal.toFixed(3)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="size-4" />
              Input
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {filledCells}/{requiredCells || 0}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Proyek</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Dibuat: {formatDate(project.createdAt)}</p>
            <p>Update terakhir: {formatDate(project.updatedAt)}</p>
            <p>Snapshot tersimpan: {project.snapshots.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/project/${project.id}/criteria`}>
                Mulai dari Kriteria
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/project/${project.id}/result`}>Lihat Hasil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
