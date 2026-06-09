import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MOORASteps, Project } from "@/types";
import { formatNumber } from "@/lib/utils";

export function exportProjectToPdf(project: Project, steps: MOORASteps) {
  const doc = new jsPDF({ orientation: "landscape" });
  const exportedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  doc.setFontSize(16);
  doc.text("SPK Toolbox", 14, 16);
  doc.setFontSize(11);
  doc.text("Metode MOORA (Multi-Objective Optimization by Ratio Analysis)", 14, 24);
  doc.text(`Nama Proyek: ${project.name}`, 14, 34);
  doc.text(`Tanggal Export: ${exportedAt}`, 14, 41);

  autoTable(doc, {
    startY: 50,
    head: [["No", "Kode", "Nama", "Tipe", "Bobot"]],
    body: project.criteria.map((criterion, index) => [
      index + 1,
      criterion.code,
      criterion.name,
      criterion.type,
      formatNumber(criterion.weight),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95] },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10
      : 90,
    head: [["Alternatif", ...project.criteria.map((criterion) => criterion.code)]],
    body: project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.originalMatrix[rowIndex].map((value) => formatNumber(value)),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95] },
  });

  doc.addPage();
  autoTable(doc, {
    startY: 16,
    head: [["Alternatif", ...project.criteria.map((criterion) => criterion.code)]],
    body: project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.normalizedMatrix[rowIndex].map((value) => formatNumber(value)),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95] },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 12,
    head: [["Alternatif", ...project.criteria.map((criterion) => criterion.code)]],
    body: project.alternatives.map((alternative, rowIndex) => [
      `${alternative.code} - ${alternative.name}`,
      ...steps.weightedMatrix[rowIndex].map((value) => formatNumber(value)),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95] },
  });

  doc.addPage();
  autoTable(doc, {
    startY: 16,
    head: [["Rank", "Alternatif", "Benefit", "Cost", "Yi"]],
    body: steps.results.map((result) => [
      result.rank,
      `${result.alternativeCode} - ${result.alternativeName}`,
      formatNumber(result.benefitSum),
      formatNumber(result.costSum),
      formatNumber(result.yi),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95] },
  });

  const best = steps.results[0];
  doc.setFontSize(12);
  doc.text("Kesimpulan", 14, (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14);
  doc.setFontSize(10);
  doc.text(
    best
      ? `Berdasarkan perhitungan MOORA, alternatif terbaik adalah ${best.alternativeCode} - ${best.alternativeName} dengan skor Yi tertinggi sebesar ${formatNumber(best.yi)}.`
      : "Belum ada hasil ranking.",
    14,
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22
  );

  doc.save(`${project.name || "spk-moora"}.pdf`);
}
