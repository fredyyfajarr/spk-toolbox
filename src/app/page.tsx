"use client";

import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectModal } from "@/components/project/ProjectModal";
import { useProjectStore } from "@/store/useProjectStore";

export default function Home() {
  const projects = useProjectStore((state) => state.projects);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 lg:px-8">
      <header className="flex flex-col justify-between gap-6 pb-10 md:flex-row md:items-end border-b border-border">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <span className="flex size-1.5 rounded-full bg-primary mr-2" />
            Sistem Penunjang Keputusan
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl text-foreground">
            MOORA Engine
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Platform analitik cepat untuk pengambilan keputusan multi-kriteria. Kelola proyek, kriteria, alternatif, dan hasil.
          </p>
        </div>
        <div className="shrink-0">
          <ProjectModal />
        </div>
      </header>

      {projects.length === 0 ? (
        <section className="mt-12 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <FolderOpen className="size-8 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Belum Ada Proyek</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Mulai dengan membuat proyek keputusan baru. Atur kriteria, bobot, dan alternatif dengan rapi.
          </p>
          <div className="mt-6">
            <ProjectModal />
          </div>
        </section>
      ) : (
        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      )}
    </main>
  );
}
