"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getWeightTotal, weightIsValid } from "@/lib/utils";
import type { Criteria } from "@/types";

interface SensitivitySliderProps {
  criteria: Criteria[];
  onPreview: (criteria: Criteria[] | null) => void;
}

export function SensitivitySlider({ criteria, onPreview }: SensitivitySliderProps) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((criterion) => [criterion.id, criterion.weight]))
  );
  const adjustedCriteria = useMemo(
    () =>
      criteria.map((criterion) => ({
        ...criterion,
        weight: weights[criterion.id] ?? criterion.weight,
      })),
    [criteria, weights]
  );
  const total = getWeightTotal(adjustedCriteria);
  const valid = weightIsValid(total);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onPreview(valid ? adjustedCriteria : null);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [adjustedCriteria, onPreview, valid]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="font-semibold">Sensitivitas Bobot</h3>
          <p className="text-sm text-muted-foreground">
            Ranking hanya diperbarui saat total bobot valid.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const original = Object.fromEntries(
              criteria.map((criterion) => [criterion.id, criterion.weight])
            );
            setWeights(original);
            onPreview(null);
          }}
        >
          <RotateCcw className="size-4" />
          Reset ke Bobot Asli
        </Button>
      </div>
      {!valid && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-950">
          <AlertTitle>Total bobot belum valid: {total.toFixed(3)}</AlertTitle>
          <AlertDescription>
            Sesuaikan slider sampai total bobot kembali 1.000.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-2 rounded-md border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <Label>
                {criterion.code} - {criterion.name}
              </Label>
              <span className="font-mono text-sm">
                {(weights[criterion.id] ?? criterion.weight).toFixed(2)}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[weights[criterion.id] ?? criterion.weight]}
              onValueChange={([value]) =>
                setWeights((current) => ({ ...current, [criterion.id]: value }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
