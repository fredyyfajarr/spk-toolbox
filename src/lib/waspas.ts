import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface WASPASResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number;
  rank: number;
}

export function runWASPAS(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: Record<string, Record<string, number>>
): { results: WASPASResult[] } {
  // 1. Cari min dan max
  const bounds: Record<string, { min: number; max: number }> = {};
  criteria.forEach(c => {
    let min = Infinity;
    let max = -Infinity;
    alternatives.forEach(a => {
      const val = values[a.id]?.[c.id] ?? 0;
      if (val < min) min = val;
      if (val > max) max = val;
    });
    if (min === 0 && max === 0) max = 1; // Hindari pembagian nol
    bounds[c.id] = { min, max };
  });

  // 2. Hitung WSM (Weighted Sum Model) dan WPM (Weighted Product Model)
  const results: WASPASResult[] = alternatives.map(alt => {
    let q1 = 0; // WSM
    let q2 = 1; // WPM
    
    criteria.forEach(c => {
      const val = values[alt.id]?.[c.id] ?? 0;
      const { min, max } = bounds[c.id];
      let norm = 0;
      
      if (c.type === "BENEFIT") {
        norm = max === 0 ? 0 : val / max;
      } else {
        norm = val === 0 ? 0 : min / val;
      }
      
      q1 += norm * c.weight;
      q2 *= Math.pow(norm, c.weight);
    });

    const lambda = 0.5; // Default lambda
    const score = lambda * q1 + (1 - lambda) * q2;

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
