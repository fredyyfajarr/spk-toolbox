import type { Alternative, AlternativeValue, Criteria } from "@/types";

export interface ELECTREResult {
  alternativeId: string;
  alternativeCode: string;
  alternativeName: string;
  score: number; // Net Concordance Dominance
  rank: number;
}

export function runELECTRE(
  alternatives: Alternative[],
  criteria: Criteria[],
  values: Record<string, Record<string, number>>
): { results: ELECTREResult[] } {
  // 1. Normalisasi Matriks (seperti TOPSIS)
  const denominators: Record<string, number> = {};
  criteria.forEach(c => {
    let sumSq = 0;
    alternatives.forEach(a => {
      const val = values[a.id]?.[c.id] ?? 0;
      sumSq += val * val;
    });
    denominators[c.id] = Math.sqrt(sumSq) || 1;
  });

  const vMatrix: Record<string, Record<string, number>> = {};
  alternatives.forEach(a => {
    vMatrix[a.id] = {};
    criteria.forEach(c => {
      const val = values[a.id]?.[c.id] ?? 0;
      vMatrix[a.id][c.id] = (val / denominators[c.id]) * c.weight;
    });
  });

  // 2. Tentukan Concordance & Discordance Index
  // C_kl = Jumlah bobot kriteria dimana a_k >= a_l (jika benefit), a_k <= a_l (jika cost)
  // D_kl = Max deviasi discordance / Max deviasi total
  
  const C: Record<string, Record<string, number>> = {};
  const D: Record<string, Record<string, number>> = {};

  alternatives.forEach(k => {
    C[k.id] = {};
    D[k.id] = {};
    alternatives.forEach(l => {
      if (k.id === l.id) {
        C[k.id][l.id] = 0;
        D[k.id][l.id] = 0;
        return;
      }

      let concordanceSum = 0;
      let maxDiscordanceDiff = 0;
      let maxTotalDiff = 0;

      criteria.forEach(c => {
        const vk = vMatrix[k.id][c.id];
        const vl = vMatrix[l.id][c.id];
        const diff = Math.abs(vk - vl);
        
        if (diff > maxTotalDiff) maxTotalDiff = diff;

        let isConcordance = false;
        if (c.type === "BENEFIT") {
          isConcordance = vk >= vl;
        } else {
          isConcordance = vk <= vl;
        }

        if (isConcordance) {
          concordanceSum += c.weight;
        } else {
          // Discordance set
          if (diff > maxDiscordanceDiff) maxDiscordanceDiff = diff;
        }
      });

      C[k.id][l.id] = concordanceSum;
      D[k.id][l.id] = maxTotalDiff === 0 ? 0 : maxDiscordanceDiff / maxTotalDiff;
    });
  });

  // 3. Hitung Net Concordance & Net Discordance
  const results: ELECTREResult[] = alternatives.map(alt => {
    let cNet = 0;
    let dNet = 0;
    
    alternatives.forEach(other => {
      if (alt.id !== other.id) {
        cNet += C[alt.id][other.id] - C[other.id][alt.id];
        dNet += D[alt.id][other.id] - D[other.id][alt.id];
      }
    });

    // Score yang disederhanakan: C_net - D_net
    // Alternatif yang mendominasi akan memiliki C_net tinggi dan D_net rendah.
    const score = cNet - dNet;

    return {
      alternativeId: alt.id,
      alternativeCode: alt.code,
      alternativeName: alt.name,
      score,
      rank: 0
    };
  });

  // 4. Ranking (Score terbesar = terbaik)
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { results };
}
