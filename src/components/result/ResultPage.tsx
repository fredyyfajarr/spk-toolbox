"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMOORA } from "@/lib/moora";
import { runSAW } from "@/lib/saw";
import { runTOPSIS } from "@/lib/topsis";
import { runWP } from "@/lib/wp";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";
import type { Criteria } from "@/types";
import { ExportButton } from "./ExportButton";
import { SensitivitySlider } from "./SensitivitySlider";
import { GenericResultTab } from "./GenericResultTab";
import { RadarChart } from "./RadarChart";
import { ComparisonTab } from "./ComparisonTab";

interface ResultPageProps {
  projectId: string;
}

export function ResultPage({ projectId }: ResultPageProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const [previewCriteria, setPreviewCriteria] = useState<Criteria[] | null>(null);
  
  const handlePreview = useCallback((criteria: Criteria[] | null) => {
    setPreviewCriteria(criteria);
  }, []);

  if (!project) {
    return null;
  }

  const activeCriteria = previewCriteria ?? project.criteria;
  const ready =
    activeCriteria.length >= 2 &&
    project.alternatives.length >= 2 &&
    weightIsValid(getWeightTotal(activeCriteria));

  // Ambil method yg aktif
  const methods = project.methods && project.methods.length > 0 ? project.methods : ["MOORA"];
  const rankingMethods = methods.filter(m => m !== "AHP");

  // Jalankan MOORA (karena ExportButton dan SensitivitySlider dan RadarChart sekarang dependen pada MOORA)
  // TODO: ExportButton/RadarChart bisa dibuat spesifik, namun untuk sekarang jadikan MOORA default fallback
  const mooraSteps = runMOORA(project.alternatives, activeCriteria, project.values);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-4">
            <span className="flex size-1.5 rounded-full bg-primary mr-2" />
            Langkah 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hasil & Ranking
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ranking final berdasarkan skor tertinggi untuk setiap metode SPK.
          </p>
        </div>
        <ExportButton project={{ ...project, criteria: activeCriteria }} steps={mooraSteps} />
      </div>

      {!ready && (
        <Alert variant="destructive" className="rounded-md shadow-sm">
          <AlertTitle className="font-semibold flex items-center">
            <span className="flex size-2 rounded-full bg-destructive mr-2" />
            Data belum siap
          </AlertTitle>
          <AlertDescription className="ml-4 opacity-90">
            Pastikan minimal 2 kriteria, minimal 2 alternatif, dan total bobot
            sama dengan 1.000 (100%).
          </AlertDescription>
        </Alert>
      )}

      {ready && rankingMethods.length > 0 && (
        <Tabs defaultValue={rankingMethods[0]} className="w-full">
          <TabsList className="flex flex-wrap h-auto mb-6 bg-transparent gap-2">
            {rankingMethods.map(m => (
              <TabsTrigger 
                key={m} 
                value={m}
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
              >
                Metode {m}
              </TabsTrigger>
            ))}
            {rankingMethods.length > 1 && (
              <TabsTrigger 
                value="KOMPARASI"
                className="rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground border font-semibold ml-2"
              >
                KOMPARASI LINTAS METODE
              </TabsTrigger>
            )}
          </TabsList>
          
          {rankingMethods.includes("MOORA") && (
            <TabsContent value="MOORA" className="mt-0 focus-visible:outline-none">
               <GenericResultTab 
                 methodName="MOORA"
                 scoreLabel="Skor Yi"
                 results={mooraSteps.results.map(r => ({ ...r, score: r.yi }))}
               />
               
               <Card className="rounded-md border-border bg-card shadow-sm mt-6">
                 <CardHeader className="border-b border-border bg-muted/30 pb-4">
                   <CardTitle>Radar Chart Matriks Terbobot (MOORA)</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6">
                   <RadarChart criteria={activeCriteria} results={mooraSteps.results} />
                 </CardContent>
               </Card>
            </TabsContent>
          )}
          
          {rankingMethods.includes("SAW") && (
            <TabsContent value="SAW" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runSAW(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="SAW"
                    scoreLabel="Skor Vi"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}
          
          {rankingMethods.includes("TOPSIS") && (
            <TabsContent value="TOPSIS" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runTOPSIS(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="TOPSIS"
                    scoreLabel="Kedekatan Relatif (V)"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}
          
          {rankingMethods.includes("WP") && (
            <TabsContent value="WP" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runWP(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="WP"
                    scoreLabel="Vektor V"
                    results={steps.results.map(r => ({ ...r, score: r.vectorV }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.length > 1 && (
            <TabsContent value="KOMPARASI" className="mt-0 focus-visible:outline-none">
              {(() => {
                const methodResults = [];
                if (rankingMethods.includes("MOORA")) {
                  methodResults.push({ methodName: "MOORA", results: mooraSteps.results });
                }
                if (rankingMethods.includes("SAW")) {
                  const saw = runSAW(project.alternatives, activeCriteria, project.values);
                  methodResults.push({ methodName: "SAW", results: saw.results });
                }
                if (rankingMethods.includes("TOPSIS")) {
                  const topsis = runTOPSIS(project.alternatives, activeCriteria, project.values);
                  methodResults.push({ methodName: "TOPSIS", results: topsis.results });
                }
                if (rankingMethods.includes("WP")) {
                  const wp = runWP(project.alternatives, activeCriteria, project.values);
                  methodResults.push({ methodName: "WP", results: wp.results });
                }

                return (
                  <ComparisonTab 
                    alternatives={project.alternatives}
                    methodResults={methodResults}
                  />
                );
              })()}
            </TabsContent>
          )}
        </Tabs>
      )}

      {ready && (
        <Card className="rounded-md border-border bg-card shadow-sm mt-8">
          <CardHeader className="border-b border-border bg-muted/30 pb-4">
            <CardTitle>Analisis Sensitivitas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SensitivitySlider
              criteria={project.criteria}
              onPreview={handlePreview}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
