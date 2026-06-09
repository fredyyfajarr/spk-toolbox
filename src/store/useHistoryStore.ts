"use client";

import { useProjectStore } from "./useProjectStore";

export function useHistoryStore(projectId: string) {
  const project = useProjectStore((state) => state.getProjectById(projectId));
  const createSnapshot = useProjectStore((state) => state.createSnapshot);
  const restoreSnapshot = useProjectStore((state) => state.restoreSnapshot);
  const deleteSnapshot = useProjectStore((state) => state.deleteSnapshot);

  return {
    snapshots: project?.snapshots ?? [],
    createSnapshot: (label?: string) => createSnapshot(projectId, label),
    restoreSnapshot: (snapshotId: string) =>
      restoreSnapshot(projectId, snapshotId),
    deleteSnapshot: (snapshotId: string) =>
      deleteSnapshot(projectId, snapshotId),
    getSnapshots: () => project?.snapshots ?? [],
  };
}
