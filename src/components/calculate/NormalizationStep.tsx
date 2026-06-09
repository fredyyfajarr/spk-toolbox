"use client";

import { getColumnDenominators } from "@/lib/moora";
import { formatNumber } from "@/lib/utils";
import type { Alternative, Criteria } from "@/types";
import { MatrixStep } from "./MatrixStep";

interface NormalizationStepProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  originalMatrix: number[][];
  normalizedMatrix: number[][];
}

export function NormalizationStep({
  criteria,
  alternatives,
  originalMatrix,
  normalizedMatrix,
}: NormalizationStepProps) {
  const denominators = getColumnDenominators(originalMatrix);

  return (
    <MatrixStep
      title="Matriks Ternormalisasi"
      criteria={criteria}
      alternatives={alternatives}
      matrix={normalizedMatrix}
      headerMeta={denominators.map((value) => `sqrt(sum X^2)=${formatNumber(value, 3)}`)}
    />
  );
}
