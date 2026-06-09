"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { runSAW } from "@/lib/saw";
import { formatNumber } from "@/lib/utils";
import type { Alternative, AlternativeValue, Criteria } from "@/types";
import { MatrixStep } from "./MatrixStep";

interface SawStepsProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
}

export function SawSteps({ criteria, alternatives, values }: SawStepsProps) {
  const steps = runSAW(alternatives, criteria, values);

  return (
    <Accordion
      type="multiple"
      defaultValue={["original", "normalization", "score"]}
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
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Normalisasi Matriks (Max/Min)</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MatrixStep
            title=""
            criteria={criteria}
            alternatives={alternatives}
            matrix={steps.normalizedMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="score" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Skor Akhir & Ranking</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Alternatif</TableHead>
                  <TableHead className="text-primary-foreground">Skor Preferensi (Vi)</TableHead>
                  <TableHead className="text-primary-foreground">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.results.map((result) => (
                  <TableRow key={result.alternativeId}>
                    <TableCell className="font-medium">
                      {result.alternativeCode} - {result.alternativeName}
                    </TableCell>
                    <TableCell>{formatNumber(result.score)}</TableCell>
                    <TableCell>{result.rank}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
