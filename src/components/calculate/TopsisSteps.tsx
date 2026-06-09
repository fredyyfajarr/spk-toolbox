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
import { runTOPSIS } from "@/lib/topsis";
import { formatNumber } from "@/lib/utils";
import type { Alternative, AlternativeValue, Criteria } from "@/types";
import { MatrixStep } from "./MatrixStep";

interface TopsisStepsProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
}

export function TopsisSteps({ criteria, alternatives, values }: TopsisStepsProps) {
  const steps = runTOPSIS(alternatives, criteria, values);

  return (
    <Accordion
      type="multiple"
      defaultValue={["normalized", "weighted", "ideal", "score"]}
      className="space-y-4"
    >
      <AccordionItem value="normalized" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Normalisasi Matriks</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MatrixStep
            title=""
            criteria={criteria}
            alternatives={alternatives}
            matrix={steps.normalizedMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="weighted" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Matriks Normalisasi Terbobot</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MatrixStep
            title=""
            criteria={criteria}
            alternatives={alternatives}
            matrix={steps.weightedMatrix}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ideal" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Solusi Ideal Positif (A+) & Negatif (A-)</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Solusi Ideal</TableHead>
                  {criteria.map((c) => (
                    <TableHead key={c.id} className="text-primary-foreground">{c.code}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-green-600">Positif (A+)</TableCell>
                  {steps.idealPositive.map((val, idx) => (
                    <TableCell key={idx}>{formatNumber(val)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-red-600">Negatif (A-)</TableCell>
                  {steps.idealNegative.map((val, idx) => (
                    <TableCell key={idx}>{formatNumber(val)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="score" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Jarak Ideal & Kedekatan Relatif</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Alternatif</TableHead>
                  <TableHead className="text-primary-foreground">D+</TableHead>
                  <TableHead className="text-primary-foreground">D-</TableHead>
                  <TableHead className="text-primary-foreground">Skor (V)</TableHead>
                  <TableHead className="text-primary-foreground">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.results.map((result) => (
                  <TableRow key={result.alternativeId}>
                    <TableCell className="font-medium">
                      {result.alternativeCode} - {result.alternativeName}
                    </TableCell>
                    <TableCell>{formatNumber(result.dPlus)}</TableCell>
                    <TableCell>{formatNumber(result.dMinus)}</TableCell>
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
