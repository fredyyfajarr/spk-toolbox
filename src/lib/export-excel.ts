import * as XLSX from "xlsx";
import type { Project } from "@/types";

interface MethodResult {
  methodName: string;
  results: { alternativeId: string; rank: number }[];
}

export function exportProjectToExcel(project: Project, methodResults: MethodResult[]) {
  const workbook = XLSX.utils.book_new();

  // 1. Data Alternatif
  const wsAlternatives = XLSX.utils.aoa_to_sheet([
    ["Kode", "Nama Alternatif"],
    ...project.alternatives.map((alt) => [alt.code, alt.name]),
  ]);
  XLSX.utils.book_append_sheet(workbook, wsAlternatives, "Alternatif");

  // 2. Data Kriteria
  const wsCriteria = XLSX.utils.aoa_to_sheet([
    ["Kode", "Nama Kriteria", "Tipe", "Bobot"],
    ...project.criteria.map((c) => [c.code, c.name, c.type, c.weight]),
  ]);
  XLSX.utils.book_append_sheet(workbook, wsCriteria, "Kriteria");

  // 3. Matriks Keputusan
  const headerMatrix = ["Alternatif", ...project.criteria.map((c) => c.code)];
  const dataMatrix = project.alternatives.map((alt) => {
    const row: (string | number)[] = [alt.code];
    project.criteria.forEach((c) => {
      const match = project.values.find(v => v.alternativeId === alt.id && v.criteriaId === c.id);
      row.push(match?.value ?? 0);
    });
    return row;
  });
  const wsMatrix = XLSX.utils.aoa_to_sheet([headerMatrix, ...dataMatrix]);
  XLSX.utils.book_append_sheet(workbook, wsMatrix, "Matriks Keputusan");

  // 4. Tabel Komparasi Hasil
  const aggregated = project.alternatives.map(alt => {
    const ranks = methodResults.map(mr => mr.results.find(r => r.alternativeId === alt.id)?.rank || 0);
    const avgRank = ranks.reduce((sum, r) => sum + r, 0) / (ranks.length || 1);
    return { alternative: alt, ranks, avgRank };
  });
  aggregated.sort((a, b) => a.avgRank - b.avgRank);

  const headerResult = [
    "Rank Rata-rata",
    "Kode Alternatif",
    "Nama Alternatif",
    ...methodResults.map((m) => `Rank ${m.methodName}`),
    "Skor Rata-rata"
  ];
  
  let currentRank = 1;
  const dataResult = aggregated.map((item) => {
    const row = [
      currentRank++,
      item.alternative.code,
      item.alternative.name,
      ...item.ranks,
      item.avgRank.toFixed(2)
    ];
    return row;
  });

  const wsResult = XLSX.utils.aoa_to_sheet([
    ["HASIL KOMPARASI METODE SPK"],
    [],
    headerResult,
    ...dataResult,
  ]);
  XLSX.utils.book_append_sheet(workbook, wsResult, "Hasil Komparasi");

  // Simpan
  XLSX.writeFile(workbook, `${project.name || "spk-toolbox"}.xlsx`);
}
