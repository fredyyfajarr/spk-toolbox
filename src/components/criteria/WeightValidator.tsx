"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import type { Criteria } from "@/types";

interface WeightValidatorProps {
  criteria: Criteria[];
}

export function WeightValidator({ criteria }: WeightValidatorProps) {
  const total = getWeightTotal(criteria);
  const valid = weightIsValid(total);

  return (
    <Alert
      className={
        valid
          ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950"
          : "border-red-200 bg-red-50 text-red-950 dark:bg-red-950"
      }
    >
      {valid ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
      <AlertTitle>Total bobot: {total.toFixed(3)}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {valid
            ? "Total bobot valid dan siap digunakan untuk kalkulasi."
            : "Total bobot harus sama dengan 1.000 dengan toleransi 0.001."}
        </p>
        <Progress value={Math.min(total, 1) * 100} />
      </AlertDescription>
    </Alert>
  );
}
