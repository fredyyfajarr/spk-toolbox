import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Project } from "@/types";

interface MethodResult {
  methodName: string;
  results: { alternativeId: string; rank: number }[];
}

export function exportProjectToPdf(project: Project, methodResults: MethodResult[]) {
  const doc = new jsPDF();
  const timestamp = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  // Header
  doc.setFontSize(16);
  doc.text(`Laporan Hasil SPK: ${project.name || "Tanpa Nama"}`, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Laporan Hasil Evaluasi - SPK Toolbox", 14, 24);
  doc.text(`Dicetak pada: ${timestamp}`, 14, 29);
  if (project.description) {
    doc.text(`Deskripsi: ${project.description}`, 14, 34);
  }

  // Menghitung komparasi
  const aggregated = project.alternatives.map(alt => {
    const ranks = methodResults.map(mr => mr.results.find(r => r.alternativeId === alt.id)?.rank || 0);
    const avgRank = ranks.reduce((sum, r) => sum + r, 0) / (ranks.length || 1);
    return { alternative: alt, ranks, avgRank };
  });
  aggregated.sort((a, b) => a.avgRank - b.avgRank);

  const best = aggregated[0];
  let startY = project.description ? 42 : 36;

  // Kesimpulan
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Kesimpulan", 14, startY);
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(
    best
      ? `Berdasarkan agregasi seluruh metode yang dipilih, alternatif terbaik adalah ${best.alternative.code} - ${best.alternative.name} dengan rata-rata peringkat ${best.avgRank.toFixed(2)}.`
      : "Data alternatif tidak cukup untuk menarik kesimpulan.",
    14,
    startY + 6,
    { maxWidth: 180 }
  );

  startY += 20;

  // Tabel Komparasi
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Ranking Komparasi Lintas Metode", 14, startY);

  const head = [
    ["Rank Avg", "Kode", "Nama Alternatif", ...methodResults.map((m) => `Rank ${m.methodName}`), "Avg Rank"],
  ];
  let rankNum = 1;
  const body = aggregated.map((item) => [
    rankNum++,
    item.alternative.code,
    item.alternative.name,
    ...item.ranks,
    item.avgRank.toFixed(2),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head,
    body,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${project.name || "spk-toolbox"}.pdf`);
}
