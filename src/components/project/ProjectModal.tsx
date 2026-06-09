"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project, MethodType } from "@/types";

const AVAILABLE_METHODS: { id: MethodType; label: string }[] = [
  { id: "MOORA", label: "MOORA" },
  { id: "SAW", label: "SAW (Simple Additive Weighting)" },
  { id: "TOPSIS", label: "TOPSIS" },
  { id: "AHP", label: "AHP (Analytic Hierarchy Process - Bobot)" },
  { id: "WP", label: "WP (Weighted Product)" },
];

interface ProjectModalProps {
  project?: Project;
}

export function ProjectModal({ project }: ProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [methods, setMethods] = useState<MethodType[]>(project?.methods ?? ["MOORA"]);
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);

  function resetForm() {
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setMethods(project?.methods ?? ["MOORA"]);
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama proyek wajib diisi");
      return;
    }

    if (methods.length === 0) {
      toast.error("Minimal pilih 1 metode SPK");
      return;
    }

    if (project) {
      updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        methods,
      });
      toast.success("Proyek diperbarui");
    } else {
      createProject(name.trim(), description.trim(), methods);
      toast.success("Proyek baru dibuat");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {project ? (
          <Button variant="outline" size="sm" className="flex-1 rounded-md" onClick={resetForm}>
            <Pencil className="size-3.5 mr-1.5" />
            Edit
          </Button>
        ) : (
          <Button onClick={resetForm} className="rounded-md">
            <Plus className="size-4 mr-1.5" />
            Buat Proyek Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-md sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {project ? "Edit Proyek" : "Buat Proyek Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-muted-foreground">Nama proyek</Label>
            <Input
              id="project-name"
              value={name}
              className="rounded-md"
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Seleksi Beasiswa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-muted-foreground">Deskripsi</Label>
            <Textarea
              id="project-description"
              value={description}
              className="rounded-md min-h-[100px]"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ringkasan tujuan pengambilan keputusan"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-muted-foreground">Metode SPK yang Diaktifkan</Label>
            <div className="grid gap-2 border rounded-md p-4 bg-muted/20">
              {AVAILABLE_METHODS.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`method-${method.id}`} 
                    checked={methods.includes(method.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMethods([...methods, method.id]);
                      } else {
                        setMethods(methods.filter(m => m !== method.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={`method-${method.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {method.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} className="rounded-md">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
