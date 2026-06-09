import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface SAWResult {
  alternativeId: string;
  alternativeName: string;
  alternativeCode: string;
  normalizedMatrix: Record<string, number>;
  score: number;
  rank: number;
}

export interface SAWSteps {
  originalMatrix: number[][];
  normalizedMatrix: number[][];
  results: SAWResult[];
  criteriaOrder: string[];
  alternativeOrder: string[];
}

export function runSAW(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): SAWSteps {
  // 1. Matriks Keputusan X
  const matrix: number[][] = [];
  alternatives.forEach((alt) => {
    const row: number[] = [];
    criteria.forEach((crit) => {
      const val = values.find(
        (v) => v.alternativeId === alt.id && v.criteriaId === crit.id
      )?.value || 0;
      row.push(val);
    });
    matrix.push(row);
  });

  // 2. Normalisasi Matriks R
  const normalized: number[][] = [];
  
  // Mencari nilai max dan min per kriteria
  const maxValues: number[] = [];
  const minValues: number[] = [];
  
  criteria.forEach((_, cIndex) => {
    const colValues = matrix.map(row => row[cIndex]);
    maxValues.push(Math.max(...colValues));
    minValues.push(Math.min(...colValues));
  });

  matrix.forEach((row) => {
    const normRow: number[] = [];
    row.forEach((val, cIndex) => {
      const crit = criteria[cIndex];
      let normVal = 0;
      if (crit.type === "benefit") {
        normVal = maxValues[cIndex] === 0 ? 0 : val / maxValues[cIndex];
      } else {
        normVal = val === 0 ? 0 : minValues[cIndex] / val;
      }
      normRow.push(normVal);
    });
    normalized.push(normRow);
  });

  // 3. Menghitung Nilai Preferensi V
  let results: SAWResult[] = alternatives.map((alt, rIndex) => {
    const normRow = normalized[rIndex];
    let score = 0;
    const normalizedMatrix: Record<string, number> = {};
    
    criteria.forEach((crit, cIndex) => {
      const normVal = normRow[cIndex];
      normalizedMatrix[crit.id] = normVal;
      score += normVal * crit.weight;
    });

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      alternativeCode: alt.code,
      normalizedMatrix,
      score,
      rank: 0,
    };
  });

  // 4. Perankingan
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, idx) => {
    res.rank = idx + 1;
  });

  return {
    originalMatrix: matrix,
    normalizedMatrix: normalized,
    results,
    criteriaOrder: criteria.map((c) => c.id),
    alternativeOrder: alternatives.map((a) => a.id),
  };
}
