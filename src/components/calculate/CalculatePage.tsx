"use client";

import Link from "next/link";
import { Camera, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";
import { MooraSteps } from "./MooraSteps";
import { SawSteps } from "./SawSteps";
import { TopsisSteps } from "./TopsisSteps";
import { WpSteps } from "./WpSteps";

interface CalculatePageProps {
  projectId: string;
}

export function CalculatePage({ projectId }: CalculatePageProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const createSnapshot = useProjectStore((state) => state.createSnapshot);

  if (!project) {
    return null;
  }

  const ready =
    project.criteria.length >= 2 &&
    project.alternatives.length >= 2 &&
    weightIsValid(getWeightTotal(project.criteria));

  const methods = project.methods && project.methods.length > 0 ? project.methods : ["MOORA"];
  // AHP is primarily for weighting, the "Calculation" steps are typically the ranking ones.
  // We don't need a dedicated Calculate tab for AHP ranking unless we do full pairwise AHP.
  // For now, filter out AHP from the calculation tabs.
  const rankingMethods = methods.filter(m => m !== "AHP");

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-4">
            <span className="flex size-1.5 rounded-full bg-primary mr-2" />
            Langkah 3
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kalkulasi SPK
          </h1>
          <p className="mt-2 text-muted-foreground">
            Perhitungan ditampilkan bertahap dari matriks awal sampai skor akhir untuk setiap metode.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-md transition-all"
            onClick={() => {
              createSnapshot(projectId);
              toast.success("Snapshot kalkulasi disimpan");
            }}
            disabled={!ready}
          >
            <Camera className="size-4 mr-2" />
            Simpan Snapshot
          </Button>
          <Button asChild disabled={!ready} className="rounded-md">
            <Link href={ready ? `/project/${projectId}/result` : "#"}>
              Lihat Hasil Akhir
              <Trophy className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
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
          </TabsList>
          
          {rankingMethods.includes("MOORA") && (
            <TabsContent value="MOORA" className="mt-0 focus-visible:outline-none">
               <MooraSteps criteria={project.criteria} alternatives={project.alternatives} values={project.values} />
            </TabsContent>
          )}
          {rankingMethods.includes("SAW") && (
            <TabsContent value="SAW" className="mt-0 focus-visible:outline-none">
               <SawSteps criteria={project.criteria} alternatives={project.alternatives} values={project.values} />
            </TabsContent>
          )}
          {rankingMethods.includes("TOPSIS") && (
            <TabsContent value="TOPSIS" className="mt-0 focus-visible:outline-none">
               <TopsisSteps criteria={project.criteria} alternatives={project.alternatives} values={project.values} />
            </TabsContent>
          )}
          {rankingMethods.includes("WP") && (
            <TabsContent value="WP" className="mt-0 focus-visible:outline-none">
               <WpSteps criteria={project.criteria} alternatives={project.alternatives} values={project.values} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
