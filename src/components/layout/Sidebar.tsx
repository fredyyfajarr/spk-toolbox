"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3, Calculator, CheckCircle2, Circle, Database, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, getWeightTotal, weightIsValid } from "@/lib/utils";
import type { Project } from "@/types";
import { HistoryDrawer } from "@/components/project/HistoryDrawer";

const navItems = [
  { key: "criteria", label: "Kriteria", icon: ListChecks },
  { key: "alternatives", label: "Alternatif", icon: Database },
  { key: "calculate", label: "Kalkulasi", icon: Calculator },
  { key: "result", label: "Hasil", icon: BarChart3 },
];

interface SidebarProps {
  project: Project;
}

function stepCompleted(project: Project, key: string): boolean {
  if (key === "criteria") {
    return project.criteria.length >= 2 && weightIsValid(getWeightTotal(project.criteria));
  }

  if (key === "alternatives") {
    const requiredCells = project.criteria.length * project.alternatives.length;
    return (
      project.alternatives.length >= 2 &&
      requiredCells > 0 &&
      project.values.length >= requiredCells
    );
  }

  if (key === "calculate" || key === "result") {
    return stepCompleted(project, "criteria") && stepCompleted(project, "alternatives");
  }

  return false;
}

export function Sidebar({ project }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r bg-card p-4 lg:min-h-screen lg:w-72">
      <Button asChild variant="ghost" className="mb-4 justify-start gap-2">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
      </Button>

      <div className="rounded-md bg-primary p-4 text-primary-foreground">
        <h2 className="line-clamp-2 text-base font-semibold">{project.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-primary-foreground/80">
          {project.description || "Tanpa deskripsi"}
        </p>
      </div>

      <Separator className="my-5" />

      <nav className="space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = pathname.includes(`/${item.key}`);
          const completed = stepCompleted(project, item.key);

          return (
            <Button
              key={item.key}
              asChild
              variant={active ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", active && "font-semibold")}
            >
              <Link href={`/project/${project.id}/${item.key}`}>
                <Icon className="size-4" />
                <span className="flex-1 text-left">
                  Step {index + 1} {item.label}
                </span>
                {completed ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="outline">{project.criteria.length} kriteria</Badge>
        <Badge variant="outline">{project.alternatives.length} alternatif</Badge>
      </div>

      <div className="mt-auto pt-6">
        <HistoryDrawer projectId={project.id} />
      </div>
    </aside>
  );
}
