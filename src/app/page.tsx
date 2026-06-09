"use client";

import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectModal } from "@/components/project/ProjectModal";
import { useProjectStore } from "@/store/useProjectStore";

export default function Home() {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="flex-1">
        <div className="container relative flex flex-col items-center justify-center py-20 text-center">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:bg-slate-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-30" />
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 shadow-sm backdrop-blur-sm transition-transform hover:scale-105">
            <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse" />
            12 Metode SPK dalam 1 Aplikasi
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 drop-shadow-sm pb-2 animate-in slide-in-from-bottom-3 duration-500">
            SPK Toolbox
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto font-medium animate-in slide-in-from-bottom-4 duration-700">
            Sistem Penunjang Keputusan terlengkap dan terelegan. Hitung, evaluasi, dan bandingkan secara instan dengan metode <span className="font-bold text-foreground">MOORA, SAW, TOPSIS, WP, AHP, SMART, WASPAS, ARAS, VIKOR, EDAS, PROMETHEE, hingga ELECTRE.</span>
          </p>
          <div className="mt-10 shrink-0 flex items-center justify-center animate-in slide-in-from-bottom-5 duration-1000">
            <ProjectModal />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          {projects.length === 0 ? (
            <section className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-border bg-card/50 backdrop-blur-sm p-8 text-center shadow-sm">
              <FolderOpen className="size-8 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">Belum Ada Proyek</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Mulai dengan membuat proyek keputusan baru di atas. Atur kriteria, bobot, dan alternatif Anda dengan mudah.
              </p>
            </section>
          ) : (
            <section>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Proyek Terbaru Anda</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
