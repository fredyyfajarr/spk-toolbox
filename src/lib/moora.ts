import type {
  Alternative,
  AlternativeValue,
  Criteria,
  MOORAResult,
  MOORASteps,
} from "@/types";

const CALC_DECIMALS = 6;

export function round(value: number, decimals = CALC_DECIMALS) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function buildDecisionMatrix(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): number[][] {
  return alternatives.map((alternative) =>
    criteria.map((criterion) => {
      const match = values.find(
        (item) =>
          item.alternativeId === alternative.id &&
          item.criteriaId === criterion.id
      );

      return round(match?.value ?? 0);
    })
  );
}

export function normalizeMatrix(matrix: number[][]): number[][] {
  if (matrix.length === 0) {
    return [];
  }

  const columnCount = matrix[0]?.length ?? 0;
  const denominators = Array.from({ length: columnCount }, (_, columnIndex) => {
    const squareSum = matrix.reduce(
      (sum, row) => sum + (row[columnIndex] ?? 0) ** 2,
      0
    );
    return Math.sqrt(squareSum);
  });

  return matrix.map((row) =>
    row.map((value, columnIndex) => {
      const denominator = denominators[columnIndex] ?? 0;
      return denominator === 0 ? 0 : round(value / denominator);
    })
  );
}

export function applyWeights(
  normalizedMatrix: number[][],
  criteria: Criteria[]
): number[][] {
  return normalizedMatrix.map((row) =>
    row.map((value, columnIndex) =>
      round(value * (criteria[columnIndex]?.weight ?? 0))
    )
  );
}

export function calculateYi(
  weightedMatrix: number[][],
  criteria: Criteria[]
): number[] {
  return weightedMatrix.map((row) => {
    const benefitSum = row.reduce((sum, value, columnIndex) => {
      return criteria[columnIndex]?.type === "benefit" ? sum + value : sum;
    }, 0);
    const costSum = row.reduce((sum, value, columnIndex) => {
      return criteria[columnIndex]?.type === "cost" ? sum + value : sum;
    }, 0);

    return round(benefitSum - costSum);
  });
}

export function rankResults(
  yiScores: number[],
  alternatives: Alternative[]
): MOORAResult[] {
  return yiScores
    .map((yi, index) => ({
      alternativeId: alternatives[index]?.id ?? `alternative-${index + 1}`,
      alternativeName: alternatives[index]?.name ?? `Alternatif ${index + 1}`,
      alternativeCode: alternatives[index]?.code ?? `A${index + 1}`,
      normalizedMatrix: {},
      weightedMatrix: {},
      benefitSum: 0,
      costSum: 0,
      yi,
      rank: 0,
    }))
    .sort((a, b) => b.yi - a.yi)
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export function runMOORA(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): MOORASteps {
  const originalMatrix = buildDecisionMatrix(alternatives, criteria, values);
  const normalizedMatrix = normalizeMatrix(originalMatrix);
  const weightedMatrix = applyWeights(normalizedMatrix, criteria);
  const yiScores = calculateYi(weightedMatrix, criteria);

  const results = yiScores
    .map<MOORAResult>((yi, rowIndex) => {
      const normalizedRecord: Record<string, number> = {};
      const weightedRecord: Record<string, number> = {};
      let benefitSum = 0;
      let costSum = 0;

      criteria.forEach((criterion, columnIndex) => {
        const weightedValue = weightedMatrix[rowIndex]?.[columnIndex] ?? 0;
        normalizedRecord[criterion.id] =
          normalizedMatrix[rowIndex]?.[columnIndex] ?? 0;
        weightedRecord[criterion.id] = weightedValue;

        if (criterion.type === "benefit") {
          benefitSum += weightedValue;
        } else {
          costSum += weightedValue;
        }
      });

      const alternative = alternatives[rowIndex];

      return {
        alternativeId: alternative?.id ?? `alternative-${rowIndex + 1}`,
        alternativeName: alternative?.name ?? `Alternatif ${rowIndex + 1}`,
        alternativeCode: alternative?.code ?? `A${rowIndex + 1}`,
        normalizedMatrix: normalizedRecord,
        weightedMatrix: weightedRecord,
        benefitSum: round(benefitSum),
        costSum: round(costSum),
        yi,
        rank: 0,
      };
    })
    .sort((a, b) => b.yi - a.yi)
    .map((result, index) => ({ ...result, rank: index + 1 }));

  return {
    originalMatrix,
    normalizedMatrix,
    weightedMatrix,
    results,
    criteriaOrder: criteria.map((criterion) => criterion.id),
    alternativeOrder: alternatives.map((alternative) => alternative.id),
  };
}

export function getColumnDenominators(matrix: number[][]) {
  if (matrix.length === 0) {
    return [];
  }

  const columnCount = matrix[0]?.length ?? 0;
  return Array.from({ length: columnCount }, (_, columnIndex) =>
    round(
      Math.sqrt(
        matrix.reduce((sum, row) => sum + (row[columnIndex] ?? 0) ** 2, 0)
      )
    )
  );
}
