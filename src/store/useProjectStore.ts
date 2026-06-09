"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { runMOORA } from "@/lib/moora";
import type {
  Alternative,
  AlternativeValue,
  Criteria,
  MethodType,
  Project,
  ProjectSnapshot,
} from "@/types";
import { sampleProject } from "./sample-data";

function makeId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function now() {
  return new Date().toISOString();
}

function resequence<T extends { code: string }>(items: T[], prefix: string) {
  return items.map((item, index) => ({ ...item, code: `${prefix}${index + 1}` }));
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  createProject: (name: string, description: string, methods: MethodType[]) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  setActiveProject: (id: string) => void;
  getActiveProject: () => Project | null;
  getProjectById: (id: string) => Project | null;
  setCriteria: (projectId: string, criteria: Criteria[]) => void;
  setAlternatives: (projectId: string, alternatives: Alternative[]) => void;
  setValues: (projectId: string, values: AlternativeValue[]) => void;
  updateValue: (
    projectId: string,
    alternativeId: string,
    criteriaId: string,
    value: number | null
  ) => void;
  createSnapshot: (projectId: string, label?: string) => void;
  restoreSnapshot: (projectId: string, snapshotId: string) => void;
  deleteSnapshot: (projectId: string, snapshotId: string) => void;
  getSnapshots: (projectId: string) => ProjectSnapshot[];
  setAhpMatrix: (projectId: string, matrix: Record<string, Record<string, number>>) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [sampleProject],
      activeProjectId: sampleProject.id,
      createProject: (name, description, methods) => {
        const timestamp = now();
        const project: Project = {
          id: makeId("project"),
          name,
          description,
          createdAt: timestamp,
          updatedAt: timestamp,
          criteria: [],
          alternatives: [],
          values: [],
          snapshots: [],
          methods: methods.length > 0 ? methods : ["MOORA"],
        };

        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id,
        }));

        return project;
      },
      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...data, updatedAt: now() }
              : project
          ),
        }));
      },
      deleteProject: (id) => {
        set((state) => {
          const projects = state.projects.filter((project) => project.id !== id);
          return {
            projects,
            activeProjectId:
              state.activeProjectId === id
                ? projects[0]?.id ?? null
                : state.activeProjectId,
          };
        });
      },
      duplicateProject: (id) => {
        const source = get().projects.find((project) => project.id === id);
        if (!source) {
          return null;
        }

        const timestamp = now();
        const copy: Project = {
          ...structuredClone(source),
          id: makeId("project"),
          name: `${source.name} - Salinan`,
          createdAt: timestamp,
          updatedAt: timestamp,
          snapshots: [],
          methods: structuredClone(source.methods) ?? ["MOORA"],
          ahpMatrix: source.ahpMatrix ? structuredClone(source.ahpMatrix) : undefined,
        };

        set((state) => ({
          projects: [copy, ...state.projects],
          activeProjectId: copy.id,
        }));

        return copy;
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      getActiveProject: () => {
        const state = get();
        return (
          state.projects.find(
            (project) => project.id === state.activeProjectId
          ) ?? null
        );
      },
      getProjectById: (id) =>
        get().projects.find((project) => project.id === id) ?? null,
      setCriteria: (projectId, criteria) => {
        const normalizedCriteria = resequence(criteria, "C");
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  criteria: normalizedCriteria,
                  values: project.values.filter((value) =>
                    normalizedCriteria.some(
                      (criterion) => criterion.id === value.criteriaId
                    )
                  ),
                  updatedAt: now(),
                }
              : project
          ),
        }));
      },
      setAlternatives: (projectId, alternatives) => {
        const normalizedAlternatives = resequence(alternatives, "A");
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  alternatives: normalizedAlternatives,
                  values: project.values.filter((value) =>
                    normalizedAlternatives.some(
                      (alternative) => alternative.id === value.alternativeId
                    )
                  ),
                  updatedAt: now(),
                }
              : project
          ),
        }));
      },
      setValues: (projectId, values) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, values, updatedAt: now() }
              : project
          ),
        }));
      },
      updateValue: (projectId, alternativeId, criteriaId, value) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }

            if (value === null) {
              return {
                ...project,
                values: project.values.filter(
                  (item) =>
                    !(
                      item.alternativeId === alternativeId &&
                      item.criteriaId === criteriaId
                    )
                ),
                updatedAt: now(),
              };
            }

            const existing = project.values.some(
              (item) =>
                item.alternativeId === alternativeId &&
                item.criteriaId === criteriaId
            );
            const values = existing
              ? project.values.map((item) =>
                  item.alternativeId === alternativeId &&
                  item.criteriaId === criteriaId
                    ? { ...item, value }
                    : item
                )
              : [...project.values, { alternativeId, criteriaId, value }];

            return { ...project, values, updatedAt: now() };
          }),
        }));
      },
      createSnapshot: (projectId, label) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }

            const timestamp = now();
            const results = runMOORA(
              project.alternatives,
              project.criteria,
              project.values
            ).results;
            const snapshot: ProjectSnapshot = {
              id: makeId("snapshot"),
              label:
                label?.trim() ||
                `Snapshot ${project.snapshots.length + 1} - ${new Date(
                  timestamp
                ).toLocaleString("id-ID")}`,
              timestamp,
              criteria: structuredClone(project.criteria),
              alternatives: structuredClone(project.alternatives),
              values: structuredClone(project.values),
              results,
            };

            return {
              ...project,
              snapshots: [snapshot, ...project.snapshots].slice(0, 20),
              updatedAt: timestamp,
            };
          }),
        }));
      },
      restoreSnapshot: (projectId, snapshotId) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }

            const snapshot = project.snapshots.find(
              (item) => item.id === snapshotId
            );
            if (!snapshot) {
              return project;
            }

            return {
              ...project,
              criteria: structuredClone(snapshot.criteria),
              alternatives: structuredClone(snapshot.alternatives),
              values: structuredClone(snapshot.values),
              updatedAt: now(),
            };
          }),
        }));
      },
      deleteSnapshot: (projectId, snapshotId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  snapshots: project.snapshots.filter(
                    (snapshot) => snapshot.id !== snapshotId
                  ),
                  updatedAt: now(),
                }
              : project
          ),
        }));
      },
      getSnapshots: (projectId) =>
        get().projects.find((project) => project.id === projectId)
          ?.snapshots ?? [],
      setAhpMatrix: (projectId, matrix) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, ahpMatrix: matrix, updatedAt: now() }
              : project
          ),
        }));
      },
      loadFromStorage: () => undefined,
      saveToStorage: () => undefined,
    }),
    {
      name: "spk-moora-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
