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
import { runWP } from "@/lib/wp";
import { formatNumber } from "@/lib/utils";
import type { Alternative, AlternativeValue, Criteria } from "@/types";

interface WpStepsProps {
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
}

export function WpSteps({ criteria, alternatives, values }: WpStepsProps) {
  const steps = runWP(alternatives, criteria, values);

  return (
    <Accordion
      type="multiple"
      defaultValue={["weights", "vector-s", "vector-v"]}
      className="space-y-4"
    >
      <AccordionItem value="weights" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Perbaikan Bobot (Wj)</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Kriteria</TableHead>
                  <TableHead className="text-primary-foreground">Bobot Awal</TableHead>
                  <TableHead className="text-primary-foreground">Bobot Ternormalisasi</TableHead>
                  <TableHead className="text-primary-foreground">Pangkat (Benefit/Cost)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code} - {c.name}</TableCell>
                    <TableCell>{c.weight}</TableCell>
                    <TableCell>{formatNumber(steps.normalizedWeights[idx])}</TableCell>
                    <TableCell>{c.type === "benefit" ? "Positif (+)" : "Negatif (-)"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="vector-s" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Nilai Vektor S</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Alternatif</TableHead>
                  <TableHead className="text-primary-foreground">Vektor S</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt, idx) => (
                  <TableRow key={alt.id}>
                    <TableCell className="font-medium">
                      {alt.code} - {alt.name}
                    </TableCell>
                    <TableCell>{formatNumber(steps.vectorSValues[idx], 4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="vector-v" className="rounded-md border border-border bg-card px-6 py-2 shadow-sm transition-colors">
        <AccordionTrigger className="hover:no-underline text-lg font-medium">Nilai Preferensi Vektor V & Rank</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Alternatif</TableHead>
                  <TableHead className="text-primary-foreground">Vektor V</TableHead>
                  <TableHead className="text-primary-foreground">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.results.map((result) => (
                  <TableRow key={result.alternativeId}>
                    <TableCell className="font-medium">
                      {result.alternativeCode} - {result.alternativeName}
                    </TableCell>
                    <TableCell>{formatNumber(result.vectorV, 4)}</TableCell>
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
