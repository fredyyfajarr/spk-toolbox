import type { Criteria } from "@/types";

export interface AHPResult {
  weights: Record<string, number>;
  consistencyRatio: number;
  consistencyIndex: number;
  lambdaMax: number;
  isConsistent: boolean;
}

// Random Index berdasarkan ordo matriks (n)
const RI = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

export function runAHP(
  criteria: Criteria[],
  matrixData: Record<string, Record<string, number>>
): AHPResult {
  const n = criteria.length;
  if (n === 0) {
    return { weights: {}, consistencyRatio: 0, consistencyIndex: 0, lambdaMax: 0, isConsistent: true };
  }

  const ids = criteria.map(c => c.id);
  
  // 1. Buat Matriks N x N dari input
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const id1 = ids[i];
        const id2 = ids[j];
        // Cek apakah ada input (misal id1 vs id2)
        if (matrixData[id1] && matrixData[id1][id2] !== undefined) {
          row.push(matrixData[id1][id2]);
        } else if (matrixData[id2] && matrixData[id2][id1] !== undefined) {
          row.push(1 / matrixData[id2][id1]);
        } else {
          row.push(1); // default
        }
      }
    }
    matrix.push(row);
  }

  // 2. Hitung jumlah tiap kolom
  const colSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  // 3. Normalisasi Matriks & Hitung Eigen Vector (Bobot)
  const weightsArr = new Array(n).fill(0);
  const normalizedMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      const normVal = colSums[j] === 0 ? 0 : matrix[i][j] / colSums[j];
      row.push(normVal);
      rowSum += normVal;
    }
    normalizedMatrix.push(row);
    weightsArr[i] = rowSum / n;
  }

  // 4. Hitung Lambda Max (Eigen Value maximum)
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += colSums[i] * weightsArr[i];
  }

  // 5. Hitung CI dan CR
  const consistencyIndex = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
  const riValue = n < RI.length ? RI[n] : 1.49;
  const consistencyRatio = riValue === 0 ? 0 : consistencyIndex / riValue;

  const weights: Record<string, number> = {};
  ids.forEach((id, idx) => {
    weights[id] = weightsArr[idx];
  });

  return {
    weights,
    consistencyIndex,
    consistencyRatio,
    lambdaMax,
    isConsistent: consistencyRatio <= 0.1,
  };
}
