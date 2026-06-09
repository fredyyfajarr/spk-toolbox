"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectShellProps {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectShell({ projectId, children }: ProjectShellProps) {
  const project = useProjectStore((state) => state.getProjectById(projectId));

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-md border bg-card p-6 text-center">
          <h1 className="text-xl font-semibold">Proyek tidak ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Data proyek mungkin sudah dihapus dari localStorage browser.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block">
        <Sidebar project={project} />
      </div>
      <div className="min-w-0">
        <div className="block border-b bg-card p-3 lg:hidden">
          <Sidebar project={project} />
        </div>
        <StepIndicator />
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
