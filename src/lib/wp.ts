import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface WPResult {
  alternativeId: string;
  alternativeName: string;
  alternativeCode: string;
  vectorS: number;
  vectorV: number;
  rank: number;
}

export interface WPSteps {
  normalizedWeights: number[];
  vectorSValues: number[];
  results: WPResult[];
  criteriaOrder: string[];
  alternativeOrder: string[];
}

export function runWP(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): WPSteps {
  // 1. Perbaikan Bobot (Normalisasi bobot sehingga total = 1)
  const totalWeight = criteria.reduce((sum, crit) => sum + crit.weight, 0);
  const normalizedWeights = criteria.map(crit => crit.weight / (totalWeight || 1));

  // 2. Menghitung Vektor S
  const vectorSValues: number[] = [];
  alternatives.forEach((alt) => {
    let sVal = 1;
    criteria.forEach((crit, cIndex) => {
      const val = values.find(
        (v) => v.alternativeId === alt.id && v.criteriaId === crit.id
      )?.value || 0;
      
      // Jika benefit, pangkat positif. Jika cost, pangkat negatif.
      const power = crit.type === "benefit" ? normalizedWeights[cIndex] : -normalizedWeights[cIndex];
      // Hindari 0 pangkat negatif dengan memberikan nilai minimal jika 0
      const safeVal = val === 0 ? 0.0001 : val; 
      sVal *= Math.pow(safeVal, power);
    });
    vectorSValues.push(sVal);
  });

  // 3. Menghitung Vektor V
  const totalS = vectorSValues.reduce((sum, val) => sum + val, 0);
  
  const results: WPResult[] = alternatives.map((alt, rIndex) => {
    const s = vectorSValues[rIndex];
    const v = totalS === 0 ? 0 : s / totalS;
    
    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      alternativeCode: alt.code,
      vectorS: s,
      vectorV: v,
      rank: 0,
    };
  });

  // 4. Perankingan
  results.sort((a, b) => b.vectorV - a.vectorV);
  results.forEach((res, idx) => {
    res.rank = idx + 1;
  });

  return {
    normalizedWeights,
    vectorSValues,
    results,
    criteriaOrder: criteria.map((c) => c.id),
    alternativeOrder: alternatives.map((a) => a.id),
  };
}
