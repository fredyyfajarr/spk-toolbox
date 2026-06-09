"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportProjectToExcel } from "@/lib/export-excel";
import { exportProjectToPdf } from "@/lib/export-pdf";
import type { Project } from "@/types";

interface MethodResult {
  methodName: string;
  results: { alternativeId: string; rank: number }[];
}

interface ExportButtonProps {
  project: Project;
  methodResults: MethodResult[];
}

export function ExportButton({ project, methodResults }: ExportButtonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => exportProjectToPdf(project, methodResults)}>
        <FileDown className="size-4" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={() => exportProjectToExcel(project, methodResults)}
      >
        <FileSpreadsheet className="size-4" />
        Export Excel
      </Button>
    </div>
  );
}
