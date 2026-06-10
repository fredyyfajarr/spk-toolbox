import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface SMARTResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number;
  rank: number;
}

export function runSMART(
  alternatives: Alternative[],
  criteria: Criteria[],
  valuesArr: AlternativeValue[]
): { results: SMARTResult[] } {
  const values: Record<string, Record<string, number>> = {};
  valuesArr.forEach(v => {
    if (!values[v.alternativeId]) values[v.alternativeId] = {};
    values[v.alternativeId][v.criteriaId] = v.value;
  });
  
  // 1. Cari min dan max untuk setiap kriteria
  const bounds: Record<string, { min: number; max: number }> = {};
  
  criteria.forEach(c => {
    let min = Infinity;
    let max = -Infinity;
    alternatives.forEach(a => {
      const val = values[a.id]?.[c.id] ?? 0;
      if (val < min) min = val;
      if (val > max) max = val;
    });
    // Jika min == max, kita hindari pembagian nol
    if (min === max) {
      max = min + 1;
    }
    bounds[c.id] = { min, max };
  });

  // 2. Hitung utility & final score
  const results: SMARTResult[] = alternatives.map(alt => {
    let score = 0;
    
    criteria.forEach(c => {
      const val = values[alt.id]?.[c.id] ?? 0;
      const { min, max } = bounds[c.id];
      let utility = 0;
      
      if (c.type === "benefit") {
        utility = (val - min) / (max - min);
      } else {
        utility = (max - val) / (max - min);
      }
      
      score += utility * c.weight;
    });

    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score,
      rank: 0
    };
  });

  // 3. Ranking
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
