"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import type { Alternative } from "@/types";
import { cn } from "@/lib/utils";

interface MethodResult {
  methodName: string;
  results: { alternativeId: string; rank: number }[];
}

interface ComparisonTabProps {
  alternatives: Alternative[];
  methodResults: MethodResult[];
}

function medalColor(rank: number) {
  if (rank === 1) return "text-yellow-600";
  if (rank === 2) return "text-slate-500";
  if (rank === 3) return "text-orange-600";
  return "text-muted-foreground";
}

export function ComparisonTab({ alternatives, methodResults }: ComparisonTabProps) {
  // Hitung rata-rata ranking untuk setiap alternatif
  const aggregated = alternatives.map(alt => {
    const ranks = methodResults.map(mr => mr.results.find(r => r.alternativeId === alt.id)?.rank || 0);
    const avgRank = ranks.reduce((sum, r) => sum + r, 0) / (ranks.length || 1);
    return {
      alternative: alt,
      ranks,
      avgRank
    };
  });

  // Urutkan berdasarkan rata-rata ranking (terbaik = angka terkecil)
  aggregated.sort((a, b) => a.avgRank - b.avgRank);

  return (
    <div className="space-y-6 mt-6">
      <Card className="rounded-md border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle>Tabel Komparasi Ranking Lintas Metode</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground min-w-44">Alternatif</TableHead>
                  {methodResults.map(mr => (
                    <TableHead key={mr.methodName} className="text-primary-foreground text-center">
                      Rank {mr.methodName}
                    </TableHead>
                  ))}
                  <TableHead className="text-primary-foreground text-center font-bold">Rata-rata Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregated.map((item) => (
                  <TableRow key={item.alternative.id}>
                    <TableCell className="font-medium">
                      {item.alternative.code} - {item.alternative.name}
                    </TableCell>
                    {item.ranks.map((rank, idx) => (
                      <TableCell key={idx} className="text-center">
                        <Badge variant={rank <= 3 ? "default" : "secondary"}>
                          {rank <= 3 && (
                            <Medal className={cn("size-3 mr-1", medalColor(rank))} />
                          )}
                          {rank}
                        </Badge>
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold text-lg text-primary">
                      {item.avgRank.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
