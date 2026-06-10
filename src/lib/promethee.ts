import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface PROMETHEEResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number; // Net Flow (Phi)
  rank: number;
}

export function runPROMETHEE(
  alternatives: Alternative[],
  criteria: Criteria[],
  valuesArr: AlternativeValue[]
): { results: PROMETHEEResult[] } {
  const values: Record<string, Record<string, number>> = {};
  valuesArr.forEach(v => {
    if (!values[v.alternativeId]) values[v.alternativeId] = {};
    values[v.alternativeId][v.criteriaId] = v.value;
  });

  // 1. Fungsi Preferensi Tipe 1 (Usual Criterion)
  const getPreference = (diff: number, type: "benefit" | "cost") => {
    if (type === "benefit") {
      return diff > 0 ? 1 : 0;
    } else {
      return diff < 0 ? 1 : 0;
    }
  };

  // 2. Hitung Indeks Preferensi Multikriteria Pi(a, b)
  // Pi[a][b] = seberapa prefer a dibanding b
  const Pi: Record<string, Record<string, number>> = {};
  
  alternatives.forEach(a => {
    Pi[a.id] = {};
    alternatives.forEach(b => {
      if (a.id === b.id) {
        Pi[a.id][b.id] = 0;
        return;
      }
      
      let sumP = 0;
      criteria.forEach(c => {
        const valA = values[a.id]?.[c.id] ?? 0;
        const valB = values[b.id]?.[c.id] ?? 0;
        const diff = valA - valB;
        sumP += getPreference(diff, c.type) * c.weight;
      });
      // Karena total weight sudah 1, Pi(a,b) = sumP
      Pi[a.id][b.id] = sumP;
    });
  });

  // 3. Hitung Leaving Flow (Phi+) dan Entering Flow (Phi-)
  const n = alternatives.length;
  const divider = n - 1 > 0 ? n - 1 : 1;

  const results: PROMETHEEResult[] = alternatives.map(alt => {
    let sumLeaving = 0;
    let sumEntering = 0;
    
    alternatives.forEach(other => {
      if (alt.id !== other.id) {
        sumLeaving += Pi[alt.id][other.id];
        sumEntering += Pi[other.id][alt.id];
      }
    });

    const phiPlus = sumLeaving / divider;
    const phiMinus = sumEntering / divider;
    const netFlow = phiPlus - phiMinus;

    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score: netFlow,
      rank: 0
    };
  });

  // 4. Ranking (Net Flow terbesar = terbaik)
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
