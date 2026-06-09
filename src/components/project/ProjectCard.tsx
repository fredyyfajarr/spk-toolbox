"use client";

import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project } from "@/types";
import { ProjectModal } from "./ProjectModal";

interface ProjectCardProps {
  project: Project;
}

function projectDone(project: Project) {
  const requiredCells = project.criteria.length * project.alternatives.length;
  return (
    project.criteria.length >= 2 &&
    project.alternatives.length >= 2 &&
    requiredCells > 0 &&
    project.values.length >= requiredCells &&
    weightIsValid(getWeightTotal(project.criteria))
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const duplicateProject = useProjectStore((state) => state.duplicateProject);
  const done = projectDone(project);

  return (
    <Card className="flex flex-col justify-between rounded-md border border-border bg-card shadow-sm transition-colors hover:border-primary/50">
      <div>
        <CardHeader className="gap-2 pb-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2 text-lg font-medium leading-tight">
              {project.name}
            </CardTitle>
            <Badge 
              variant={done ? "default" : "secondary"} 
              className="rounded px-2 py-0.5 text-[10px] uppercase font-medium"
            >
              {done ? "Selesai" : "Draft"}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description || "Tanpa deskripsi"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded border bg-muted/50 p-3">
              <div className="text-xl font-semibold text-foreground">
                {project.criteria.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-0.5">Kriteria</div>
            </div>
            <div className="rounded border bg-muted/50 p-3">
              <div className="text-xl font-semibold text-foreground">
                {project.alternatives.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-0.5">Alternatif</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated: {formatDate(project.updatedAt)}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex gap-2 pt-0">
        <Button 
          asChild 
          className="flex-1 rounded-md"
        >
          <Link href={`/project/${project.id}/criteria`}>Buka</Link>
        </Button>
        <ProjectModal project={project} />
        <Button
          variant="outline"
          size="icon"
          className="rounded-md shrink-0"
          title="Duplikat"
          onClick={() => {
            duplicateProject(project.id);
            toast.success("Proyek diduplikasi");
          }}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-md shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          title="Hapus"
          onClick={() => {
            if (confirm(`Hapus proyek "${project.name}"?`)) {
              deleteProject(project.id);
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
