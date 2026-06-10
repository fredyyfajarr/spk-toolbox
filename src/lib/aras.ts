import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface ARASResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number; // Ini adalah nilai Ki (Utility degree)
  rank: number;
}

export function runARAS(
  alternatives: Alternative[],
  criteria: Criteria[],
  valuesArr: AlternativeValue[]
): { results: ARASResult[] } {
  const values: Record<string, Record<string, number>> = {};
  valuesArr.forEach(v => {
    if (!values[v.alternativeId]) values[v.alternativeId] = {};
    values[v.alternativeId][v.criteriaId] = v.value;
  });

  // 1. Tentukan A0 (Alternatif Optimal)
  const a0: Record<string, number> = {};
  criteria.forEach(c => {
    let optimal = c.type === "benefit" ? -Infinity : Infinity;
    alternatives.forEach(a => {
      const val = values[a.id]?.[c.id] ?? 0;
      if (c.type === "benefit" && val > optimal) optimal = val;
      if (c.type === "cost" && val < optimal) optimal = val;
    });
    a0[c.id] = optimal;
  });

  // 2. Gabungkan A0 ke array nilai untuk normalisasi
  const allValues = [
    { isA0: true, id: "A0", vals: a0 },
    ...alternatives.map(a => ({ isA0: false, id: a.id, vals: values[a.id] || {} }))
  ];

  // 3. Normalisasi
  const normSums: Record<string, number> = {};
  criteria.forEach(c => {
    let sum = 0;
    allValues.forEach(item => {
      const v = item.vals[c.id] ?? 0;
      if (c.type === "benefit") {
        sum += v;
      } else {
        sum += v === 0 ? 0 : 1 / v;
      }
    });
    normSums[c.id] = sum === 0 ? 1 : sum;
  });

  const normalized: Record<string, Record<string, number>> = {};
  allValues.forEach(item => {
    normalized[item.id] = {};
    criteria.forEach(c => {
      const v = item.vals[c.id] ?? 0;
      if (c.type === "benefit") {
        normalized[item.id][c.id] = v / normSums[c.id];
      } else {
        normalized[item.id][c.id] = v === 0 ? 0 : (1 / v) / normSums[c.id];
      }
    });
  });

  // 4. Hitung S (Optimality Function)
  const S: Record<string, number> = {};
  allValues.forEach(item => {
    let sumS = 0;
    criteria.forEach(c => {
      sumS += normalized[item.id][c.id] * c.weight;
    });
    S[item.id] = sumS;
  });

  const S0 = S["A0"] || 1; // Cegah pembagian 0

  // 5. Hitung K (Utility Degree) dan Ranking
  const results: ARASResult[] = alternatives.map(alt => {
    const Ki = S[alt.id] / S0;
    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score: Ki,
      rank: 0
    };
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
