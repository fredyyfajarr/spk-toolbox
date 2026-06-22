import type { Alternative, AlternativeValue, Criteria, MOORAResult, MOORASteps } from "@/types";

function getGapWeight(gap: number): number {
  switch (gap) {
    case 0: return 5;
    case 1: return 4.5;
    case -1: return 4;
    case 2: return 3.5;
    case -2: return 3;
    case 3: return 2.5;
    case -3: return 2;
    case 4: return 1.5;
    case -4: return 1;
    default: 
      // If gap is beyond -4 or 4, return 1 as standard minimum
      return 1; 
  }
}

export function runProfileMatching(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: AlternativeValue[]
): MOORASteps {
  const criteriaOrder = criteria.map((c) => c.id);
  const alternativeOrder = alternatives.map((a) => a.id);

  const originalMatrix: number[][] = [];
  const normalizedMatrix: number[][] = [];
  const weightedMatrix: number[][] = [];
  const results: MOORAResult[] = [];

  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    const gapRow: number[] = [];
    const weightRow: number[] = [];
    
    let coreSum = 0;
    let coreCount = 0;
    let secSum = 0;
    let secCount = 0;

    for (let j = 0; j < criteria.length; j++) {
      const crit = criteria[j];
      const valObj = values.find(
        (v) => v.alternativeId === alt.id && v.criteriaId === crit.id
      );
      const val = valObj ? valObj.value : 0;
      
      const target = crit.targetValue ?? 5; // Asumsi target standar 5 jika belum diatur
      const gap = val - target;
      const weight = getGapWeight(gap);

      gapRow.push(gap);
      weightRow.push(weight);

      const isCore = crit.factorType !== "secondary"; // Default to core if undefined
      if (isCore) {
        coreSum += weight;
        coreCount++;
      } else {
        secSum += weight;
        secCount++;
      }
    }

    const ncf = coreCount > 0 ? coreSum / coreCount : 0;
    const nsf = secCount > 0 ? secSum / secCount : 0;
    
    // Asumsi standar bobot: 60% Core Factor, 40% Secondary Factor
    const totalScore = (ncf * 0.6) + (nsf * 0.4);

    originalMatrix.push(gapRow);
    normalizedMatrix.push(weightRow);
    weightedMatrix.push([ncf, nsf, totalScore]); 

    results.push({
      alternativeId: alt.id,
      alternativeName: alt.name,
      alternativeCode: alt.code,
      normalizedMatrix: {},
      weightedMatrix: {},
      benefitSum: ncf, // re-used for NCF
      costSum: nsf,    // re-used for NSF
      yi: totalScore,  // total score
      rank: 0,
    });
  }

  // Sort and assign rank
  const sorted = [...results].sort((a, b) => b.yi - a.yi);
  sorted.forEach((item, index) => {
    const originalItem = results.find((r) => r.alternativeId === item.alternativeId);
    if (originalItem) {
      originalItem.rank = index + 1;
    }
  });

  return {
    originalMatrix,
    normalizedMatrix,
    weightedMatrix,
    results,
    criteriaOrder,
    alternativeOrder,
  };
}
