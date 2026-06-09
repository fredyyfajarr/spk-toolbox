"use client";

import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const steps = [
  { key: "criteria", label: "Kriteria" },
  { key: "alternatives", label: "Alternatif" },
  { key: "calculate", label: "Kalkulasi" },
  { key: "result", label: "Hasil" },
];

export function StepIndicator() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    steps.findIndex((step) => pathname.includes(`/${step.key}`)),
    0
  );

  return (
    <div className="border-b bg-card px-4 py-3 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 font-medium",
                index === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : index < activeIndex
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                    : "text-muted-foreground"
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full border text-xs">
                {index + 1}
              </span>
              {step.label}
            </div>
          ))}
        </div>
        <Progress value={((activeIndex + 1) / steps.length) * 100} />
      </div>
    </div>
  );
}
