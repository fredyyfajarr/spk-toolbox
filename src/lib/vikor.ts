import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface VIKORResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number; // Nilai Q
  rank: number;
}

export function runVIKOR(
  alternatives: Alternative[],
  criteria: Criteria[],
  valuesArr: AlternativeValue[]
): { results: VIKORResult[] } {
  const values: Record<string, Record<string, number>> = {};
  valuesArr.forEach(v => {
    if (!values[v.alternativeId]) values[v.alternativeId] = {};
    values[v.alternativeId][v.criteriaId] = v.value;
  });

  // 1. Tentukan f* (best) dan f- (worst)
  const bounds: Record<string, { best: number; worst: number }> = {};
  criteria.forEach(c => {
    let best = c.type === "benefit" ? -Infinity : Infinity;
    let worst = c.type === "benefit" ? Infinity : -Infinity;
    
    alternatives.forEach(a => {
      const val = values[a.id]?.[c.id] ?? 0;
      if (c.type === "benefit") {
        if (val > best) best = val;
        if (val < worst) worst = val;
      } else {
        if (val < best) best = val;
        if (val > worst) worst = val;
      }
    });
    
    if (best === worst) worst = best - 1; // Hindari bagi nol
    bounds[c.id] = { best, worst };
  });

  // 2. Hitung S (Utility Measure) dan R (Regret Measure)
  let S_star = Infinity, S_minus = -Infinity;
  let R_star = Infinity, R_minus = -Infinity;

  const srValues: Record<string, { S: number; R: number }> = {};

  alternatives.forEach(alt => {
    let S = 0;
    let R = -Infinity;
    
    criteria.forEach(c => {
      const val = values[alt.id]?.[c.id] ?? 0;
      const { best, worst } = bounds[c.id];
      const dist = c.weight * (best - val) / (best - worst);
      
      S += dist;
      if (dist > R) R = dist;
    });

    srValues[alt.id] = { S, R };
    
    if (S < S_star) S_star = S;
    if (S > S_minus) S_minus = S;
    if (R < R_star) R_star = R;
    if (R > R_minus) R_minus = R;
  });

  // 3. Hitung Q (VIKOR Index)
  const v = 0.5; // Bobot kompromi (mayoritas / maximum group utility)
  
  if (S_minus === S_star) S_minus = S_star + 1;
  if (R_minus === R_star) R_minus = R_star + 1;

  const results: VIKORResult[] = alternatives.map(alt => {
    const { S, R } = srValues[alt.id];
    const Q = v * (S - S_star) / (S_minus - S_star) + (1 - v) * (R - R_star) / (R_minus - R_star);
    
    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score: Q,
      rank: 0
    };
  });

  // 4. Ranking (Nilai Q terkecil = terbaik)
  results.sort((a, b) => a.score - b.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
