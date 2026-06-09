"use client";

import { Clock, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { useHistoryStore } from "@/store/useHistoryStore";

interface HistoryDrawerProps {
  projectId: string;
}

export function HistoryDrawer({ projectId }: HistoryDrawerProps) {
  const { snapshots, restoreSnapshot, deleteSnapshot } =
    useHistoryStore(projectId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Clock className="size-4" />
          Riwayat Snapshot
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Riwayat Snapshot</SheetTitle>
          <SheetDescription>
            Maksimal 20 snapshot terbaru tersimpan di browser ini.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-6 h-[calc(100vh-140px)] pr-3">
          <div className="space-y-4">
            {snapshots.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                Belum ada snapshot. Simpan snapshot dari halaman kalkulasi.
              </div>
            ) : (
              snapshots.map((snapshot) => (
                <div key={snapshot.id} className="rounded-md border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{snapshot.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(snapshot.timestamp)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {snapshot.results.length} hasil
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{snapshot.criteria.length} kriteria</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{snapshot.alternatives.length} alternatif</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "Restore snapshot ini dan timpa data aktif proyek?"
                          )
                        ) {
                          restoreSnapshot(snapshot.id);
                          toast.success("Snapshot berhasil direstore");
                        }
                      }}
                    >
                      <RotateCcw className="size-4" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Hapus snapshot ini?")) {
                          deleteSnapshot(snapshot.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
