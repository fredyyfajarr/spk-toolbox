"use client";

import { useProjectStore } from "./useProjectStore";

export function useAlternativeStore(projectId: string) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const setAlternatives = useProjectStore((state) => state.setAlternatives);
  const setValues = useProjectStore((state) => state.setValues);
  const updateValue = useProjectStore((state) => state.updateValue);

  return {
    alternatives: project?.alternatives ?? [],
    values: project?.values ?? [],
    setAlternatives: (
      alternatives: NonNullable<typeof project>["alternatives"]
    ) => setAlternatives(projectId, alternatives),
    setValues: (values: NonNullable<typeof project>["values"]) =>
      setValues(projectId, values),
    updateValue: (
      alternativeId: string,
      criteriaId: string,
      value: number | null
    ) => updateValue(projectId, alternativeId, criteriaId, value),
  };
}
