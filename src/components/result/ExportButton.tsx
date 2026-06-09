"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportProjectToExcel } from "@/lib/export-excel";
import { exportProjectToPdf } from "@/lib/export-pdf";
import type { MOORASteps, Project } from "@/types";

interface ExportButtonProps {
  project: Project;
  steps: MOORASteps;
}

export function ExportButton({ project, steps }: ExportButtonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => exportProjectToPdf(project, steps)}>
        <FileDown className="size-4" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={() => exportProjectToExcel(project, steps)}
      >
        <FileSpreadsheet className="size-4" />
        Export Excel
      </Button>
    </div>
  );
}
