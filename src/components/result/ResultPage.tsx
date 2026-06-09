"use client";

import { useCallback, useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMOORA } from "@/lib/moora";
import { runSAW } from "@/lib/saw";
import { runTOPSIS } from "@/lib/topsis";
import { runWP } from "@/lib/wp";
import { runSMART } from "@/lib/smart";
import { runWASPAS } from "@/lib/waspas";
import { runARAS } from "@/lib/aras";
import { runVIKOR } from "@/lib/vikor";
import { runEDAS } from "@/lib/edas";
import { runPROMETHEE } from "@/lib/promethee";
import { runELECTRE } from "@/lib/electre";
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

  const activeCriteria = previewCriteria ?? project?.criteria ?? [];
  const rankingMethods = (project?.methods && project.methods.length > 0 ? project.methods : ["MOORA"]).filter(m => m !== "AHP");

  // Hitung semua hasil metode
  const methodResults = useMemo(() => {
    if (!project) return [];
    const results = [];
    if (rankingMethods.includes("MOORA")) {
      results.push({ methodName: "MOORA", results: runMOORA(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("SAW")) {
      results.push({ methodName: "SAW", results: runSAW(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("TOPSIS")) {
      results.push({ methodName: "TOPSIS", results: runTOPSIS(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("WP")) {
      results.push({ methodName: "WP", results: runWP(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("SMART")) {
      results.push({ methodName: "SMART", results: runSMART(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("WASPAS")) {
      results.push({ methodName: "WASPAS", results: runWASPAS(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("ARAS")) {
      results.push({ methodName: "ARAS", results: runARAS(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("VIKOR")) {
      results.push({ methodName: "VIKOR", results: runVIKOR(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("EDAS")) {
      results.push({ methodName: "EDAS", results: runEDAS(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("PROMETHEE")) {
      results.push({ methodName: "PROMETHEE", results: runPROMETHEE(project.alternatives, activeCriteria, project.values).results });
    }
    if (rankingMethods.includes("ELECTRE")) {
      results.push({ methodName: "ELECTRE", results: runELECTRE(project.alternatives, activeCriteria, project.values).results });
    }
    return results;
  }, [project, activeCriteria, rankingMethods]);

  // Tetap ambil mooraSteps jika diperlukan untuk RadarChart
  const mooraSteps = useMemo(() => {
    if (!project) return null;
    return rankingMethods.includes("MOORA") 
      ? runMOORA(project.alternatives, activeCriteria, project.values)
      : null;
  }, [project, activeCriteria, rankingMethods]);

  if (!project) {
    return null;
  }

  const ready =
    activeCriteria.length >= 2 &&
    project.alternatives.length >= 2 &&
    weightIsValid(getWeightTotal(activeCriteria));

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
        <ExportButton project={{ ...project, criteria: activeCriteria }} methodResults={methodResults} />
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
          
          {rankingMethods.includes("MOORA") && mooraSteps && (
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

          {rankingMethods.includes("SMART") && (
            <TabsContent value="SMART" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runSMART(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="SMART"
                    scoreLabel="Skor Utilitas"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("WASPAS") && (
            <TabsContent value="WASPAS" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runWASPAS(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="WASPAS"
                    scoreLabel="Skor Q"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("ARAS") && (
            <TabsContent value="ARAS" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runARAS(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="ARAS"
                    scoreLabel="Derajat Utilitas (K)"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("VIKOR") && (
            <TabsContent value="VIKOR" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runVIKOR(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="VIKOR"
                    scoreLabel="Indeks Q (Terkecil = Terbaik)"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("EDAS") && (
            <TabsContent value="EDAS" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runEDAS(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="EDAS"
                    scoreLabel="Appraisal Score (AS)"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("PROMETHEE") && (
            <TabsContent value="PROMETHEE" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runPROMETHEE(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="PROMETHEE II"
                    scoreLabel="Net Flow (Φ)"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.includes("ELECTRE") && (
            <TabsContent value="ELECTRE" className="mt-0 focus-visible:outline-none">
              {(() => {
                const steps = runELECTRE(project.alternatives, activeCriteria, project.values);
                return (
                  <GenericResultTab 
                    methodName="ELECTRE"
                    scoreLabel="Net Concordance"
                    results={steps.results.map(r => ({ ...r, score: r.score }))}
                  />
                )
              })()}
            </TabsContent>
          )}

          {rankingMethods.length > 1 && (
            <TabsContent value="KOMPARASI" className="mt-0 focus-visible:outline-none">
              <ComparisonTab 
                alternatives={project.alternatives}
                methodResults={methodResults}
              />
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
