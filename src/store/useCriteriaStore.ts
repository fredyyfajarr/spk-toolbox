"use client";

import { useProjectStore } from "./useProjectStore";

export function useCriteriaStore(projectId: string) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const setCriteria = useProjectStore((state) => state.setCriteria);

  return {
    criteria: project?.criteria ?? [],
    setCriteria: (criteria: NonNullable<typeof project>["criteria"]) =>
      setCriteria(projectId, criteria),
  };
}
