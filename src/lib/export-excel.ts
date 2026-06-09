import * as XLSX from "xlsx";
import { formatNumber } from "@/lib/utils";
import type { MOORASteps, Project } from "@/types";

function addSheet(
  workbook: XLSX.WorkBook,
  name: string,
  rows: (string | number)[][]
) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

export function exportProjectToExcel(project: Project, steps: MOORASteps) {
  const workbook = XLSX.utils.book_new();

  addSheet(workbook, "Data Asli", [
    ["Proyek", project.name],
    ["Deskripsi", project.description],
    [],
    ["No", "Kode", "Kriteria", "Tipe", "Bobot"],
    ...project.criteria.map((criterion, index) => [
      index + 1,
      criterion.code,
      criterion.name,
      criterion.type,
      criterion.weight,
    ]),
    [],
    ["Alternatif", ...project.criteria.map((criterion) => criterion.code)],
    ...project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.originalMatrix[rowIndex],
    ]),
  ]);

  addSheet(workbook, "Normalisasi", [
    ["Alternatif", ...project.criteria.map((criterion) => criterion.code)],
    ...project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.normalizedMatrix[rowIndex].map((value) =>
        Number(formatNumber(value).replace(",", "."))
      ),
    ]),
  ]);

  addSheet(workbook, "Matriks Terbobot", [
    ["Alternatif", ...project.criteria.map((criterion) => criterion.code)],
    ...project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.weightedMatrix[rowIndex].map((value) =>
        Number(formatNumber(value).replace(",", "."))
      ),
    ]),
  ]);

  addSheet(workbook, "Skor & Ranking", [
    ["Rank", "Kode", "Alternatif", "Benefit", "Cost", "Yi"],
    ...steps.results.map((result) => [
      result.rank,
      result.alternativeCode,
      result.alternativeName,
      result.benefitSum,
      result.costSum,
      result.yi,
    ]),
  ]);

  const best = steps.results[0];
  addSheet(workbook, "Ringkasan", [
    ["Rank", "Alternatif", "Skor Yi", "Rekomendasi"],
    ...steps.results.map((result) => [
      result.rank,
      `${result.alternativeCode} - ${result.alternativeName}`,
      result.yi,
      result.rank === 1 ? "Alternatif terbaik" : "",
    ]),
    [],
    [
      "Kesimpulan",
      best
        ? `Alternatif terbaik adalah ${best.alternativeCode} - ${best.alternativeName} dengan skor Yi ${best.yi}.`
        : "Belum ada hasil.",
    ],
  ]);

  XLSX.writeFile(workbook, `${project.name || "spk-toolbox"}.xlsx`);
}
