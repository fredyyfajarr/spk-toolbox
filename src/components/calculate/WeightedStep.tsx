"use client";

import type { Alternative, Criteria } from "@/types";
import { MatrixStep } from "./MatrixStep";

interface WeightedStepProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  weightedMatrix: number[][];
}

export function WeightedStep({
  criteria,
  alternatives,
  weightedMatrix,
}: WeightedStepProps) {
  return (
    <MatrixStep
      title="Matriks Terbobot"
      criteria={criteria}
      alternatives={alternatives}
      matrix={weightedMatrix}
    />
  );
}
