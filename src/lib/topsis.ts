import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface TOPSISResult {
  alternativeId: string;
  alternativeName: string;
  alternativeCode: string;
  dPlus: number;
  dMinus: number;
  score: number;
  rank: number;
}

export interface TOPSISSteps {
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  idealPositive: number[];
  idealNegative: number[];
  results: TOPSISResult[];
  criteriaOrder: string[];
  alternativeOrder: string[];
}

export function runTOPSIS(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): TOPSISSteps {
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

  // 2. Normalisasi Matriks R (Pembagi pembagi akar kuadrat jumlah kuadrat)
  const normalized: number[][] = [];
  const dividers: number[] = [];
  
  criteria.forEach((_, cIndex) => {
    let sumSq = 0;
    matrix.forEach(row => {
      sumSq += Math.pow(row[cIndex], 2);
    });
    dividers.push(Math.sqrt(sumSq));
  });

  matrix.forEach((row) => {
    const normRow: number[] = [];
    row.forEach((val, cIndex) => {
      const divider = dividers[cIndex];
      normRow.push(divider === 0 ? 0 : val / divider);
    });
    normalized.push(normRow);
  });

  // 3. Normalisasi Terbobot Y
  const weighted: number[][] = [];
  normalized.forEach((row) => {
    const wRow: number[] = [];
    row.forEach((val, cIndex) => {
      wRow.push(val * criteria[cIndex].weight);
    });
    weighted.push(wRow);
  });

  // 4. Matriks Solusi Ideal Positif (A+) dan Negatif (A-)
  const idealPositive: number[] = [];
  const idealNegative: number[] = [];
  
  criteria.forEach((crit, cIndex) => {
    const colValues = weighted.map(row => row[cIndex]);
    if (crit.type === "benefit") {
      idealPositive.push(Math.max(...colValues));
      idealNegative.push(Math.min(...colValues));
    } else {
      idealPositive.push(Math.min(...colValues));
      idealNegative.push(Math.max(...colValues));
    }
  });

  // 5. Jarak Solusi Ideal Positif (D+) dan Negatif (D-) serta Nilai Preferensi (V)
  let results: TOPSISResult[] = alternatives.map((alt, rIndex) => {
    const wRow = weighted[rIndex];
    let sumSqPlus = 0;
    let sumSqMinus = 0;

    criteria.forEach((_, cIndex) => {
      sumSqPlus += Math.pow(wRow[cIndex] - idealPositive[cIndex], 2);
      sumSqMinus += Math.pow(wRow[cIndex] - idealNegative[cIndex], 2);
    });

    const dPlus = Math.sqrt(sumSqPlus);
    const dMinus = Math.sqrt(sumSqMinus);
    
    // V = D- / (D- + D+)
    const score = (dMinus + dPlus) === 0 ? 0 : dMinus / (dMinus + dPlus);

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      alternativeCode: alt.code,
      dPlus,
      dMinus,
      score,
      rank: 0,
    };
  });

  // 6. Perankingan
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, idx) => {
    res.rank = idx + 1;
  });

  return {
    normalizedMatrix: normalized,
    weightedMatrix: weighted,
    idealPositive,
    idealNegative,
    results,
    criteriaOrder: criteria.map((c) => c.id),
    alternativeOrder: alternatives.map((a) => a.id),
  };
}
