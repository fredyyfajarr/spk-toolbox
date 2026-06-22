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
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Daftar Proyek
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Kelola semua proyek sistem penunjang keputusan Anda di sini.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-4">
          <ProjectModal />
        </div>
      </header>

      <div className="py-12">
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
  );
}
