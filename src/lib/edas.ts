import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface EDASResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number; // Appraisal Score (AS)
  rank: number;
}

export function runEDAS(
  alternatives: Alternative[],
  criteria: Criteria[],
  valuesArr: AlternativeValue[]
): { results: EDASResult[] } {
  const values: Record<string, Record<string, number>> = {};
  valuesArr.forEach(v => {
    if (!values[v.alternativeId]) values[v.alternativeId] = {};
    values[v.alternativeId][v.criteriaId] = v.value;
  });

  // 1. Average Solution (AV)
  const AV: Record<string, number> = {};
  criteria.forEach(c => {
    let sum = 0;
    alternatives.forEach(a => {
      sum += values[a.id]?.[c.id] ?? 0;
    });
    AV[c.id] = alternatives.length > 0 ? sum / alternatives.length : 1;
    if (AV[c.id] === 0) AV[c.id] = 0.0001; // Cegah bagi nol
  });

  // 2. Hitung SP (Sum of Positive Distance) dan SN (Sum of Negative Distance)
  const SP: Record<string, number> = {};
  const SN: Record<string, number> = {};
  
  let maxSP = -Infinity;
  let maxSN = -Infinity;

  alternatives.forEach(alt => {
    let spSum = 0;
    let snSum = 0;
    
    criteria.forEach(c => {
      const val = values[alt.id]?.[c.id] ?? 0;
      const avg = AV[c.id];
      
      let pda = 0, nda = 0;
      if (c.type === "benefit") {
        pda = Math.max(0, (val - avg) / avg);
        nda = Math.max(0, (avg - val) / avg);
      } else {
        pda = Math.max(0, (avg - val) / avg);
        nda = Math.max(0, (val - avg) / avg);
      }
      
      spSum += pda * c.weight;
      snSum += nda * c.weight;
    });

    SP[alt.id] = spSum;
    SN[alt.id] = snSum;
    
    if (spSum > maxSP) maxSP = spSum;
    if (snSum > maxSN) maxSN = snSum;
  });

  if (maxSP === 0) maxSP = 1;
  if (maxSN === 0) maxSN = 1;

  // 3. Normalisasi SP dan SN -> NSP dan NSN, lalu hitung AS
  const results: EDASResult[] = alternatives.map(alt => {
    const NSP = SP[alt.id] / maxSP;
    const NSN = 1 - (SN[alt.id] / maxSN);
    const AS = 0.5 * (NSP + NSN); // Menggunakan bobot seimbang 0.5
    
    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score: AS,
      rank: 0
    };
  });

  // 4. Ranking (Nilai AS terbesar = terbaik)
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
