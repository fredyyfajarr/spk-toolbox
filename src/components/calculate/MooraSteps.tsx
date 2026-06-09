"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { runMOORA } from "@/lib/moora";
import type { Alternative, AlternativeValue, Criteria } from "@/types";
import { MatrixStep } from "./MatrixStep";
import { NormalizationStep } from "./NormalizationStep";
import { ScoreStep } from "./ScoreStep";
import { WeightedStep } from "./WeightedStep";

interface MooraStepsProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
}

export function MooraSteps({ criteria, alternatives, values }: MooraStepsProps) {
  const steps = runMOORA(alternatives, criteria, values);

  return (
    <Accordion
      type="multiple"
      defaultValue={["original", "normalization", "weighted", "score"]}
      className="space-y-4"
    >
      <AccordionItem value="original" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Matriks Keputusan Awal</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MatrixStep
            title=""
            criteria={criteria}
            alternatives={alternatives}
            matrix={steps.originalMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="normalization" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Normalisasi Matriks</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <NormalizationStep
            criteria={criteria}
            alternatives={alternatives}
            originalMatrix={steps.originalMatrix}
            normalizedMatrix={steps.normalizedMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="weighted" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Matriks Terbobot</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <WeightedStep
            criteria={criteria}
            alternatives={alternatives}
            weightedMatrix={steps.weightedMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="score" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Skor Yi</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <ScoreStep results={steps.results} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
