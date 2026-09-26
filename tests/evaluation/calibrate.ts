/**
 * Derives the per-CR baseline table from a dataset of official monsters and
 * cross-validates the whole procedure (derive on the training folds, predict
 * the held-out fold), so the reported accuracy is out-of-sample.
 *
 * Baseline for each stat at each CR:
 *   1. median of the monsters listed at that CR (pooled with the neighbouring
 *      CRs when fewer than 3 monsters sit at it),
 *   2. made non-decreasing across CRs (weighted isotonic regression),
 *   3. linearly interpolated over CRs with no monsters.
 */

import {
  extractDefense,
  extractOffense,
  DefenseInputs,
  OffenseInputs,
} from '../../src/services/crExtraction';
import {
  CR_LADDER,
  CRBaseline,
  computeCR,
  crToIndex,
  effectiveAC,
  effectiveHPMultiplier,
} from '../../src/services/crMath';
import { buildMockActor, computeMetrics, DatasetRow, Metrics } from './harness';

export interface Sample {
  name: string;
  listedCR: number;
  def: DefenseInputs;
  off: OffenseInputs;
}

export function extractSamples(rows: DatasetRow[]): Sample[] {
  return rows
    .filter((r) => typeof r.listedCR === 'number' && CR_LADDER.includes(r.listedCR))
    .map((r) => {
      const actor = buildMockActor(r);
      return {
        name: r.name,
        listedCR: r.listedCR,
        def: extractDefense(actor),
        off: extractOffense(actor),
      };
    });
}

const median = (values: number[]): number => {
  const a = [...values].sort((x, y) => x - y);
  const n = a.length;
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
};

/** Weighted pool-adjacent-violators: the closest non-decreasing sequence. */
function isotonic(values: number[], weights: number[]): number[] {
  const blocks = values.map((v, i) => ({ v, w: weights[i], n: 1 }));
  for (let i = 0; i < blocks.length - 1; ) {
    if (blocks[i].v > blocks[i + 1].v) {
      const a = blocks[i];
      const b = blocks[i + 1];
      blocks.splice(i, 2, { v: (a.v * a.w + b.v * b.w) / (a.w + b.w), w: a.w + b.w, n: a.n + b.n });
      if (i > 0) i--;
    } else i++;
  }
  return blocks.flatMap((b) => Array(b.n).fill(b.v));
}

function monotoneColumn(samples: Array<[number, number | null]>, minCount = 3): number[] {
  const size = CR_LADDER.length;
  const byIndex: number[][] = Array.from({ length: size }, () => []);
  for (const [i, v] of samples) if (v !== null && Number.isFinite(v)) byIndex[i].push(v);

  const points: Array<{ i: number; v: number; w: number }> = [];
  for (let i = 0; i < size; i++) {
    if (!byIndex[i].length) continue;
    const pool =
      byIndex[i].length >= minCount
        ? byIndex[i]
        : [...(byIndex[i - 1] ?? []), ...byIndex[i], ...(byIndex[i + 1] ?? [])];
    points.push({ i, v: median(pool), w: byIndex[i].length });
  }
  const fitted = isotonic(
    points.map((p) => p.v),
    points.map((p) => p.w),
  );
  points.forEach((p, k) => (p.v = fitted[k]));

  const out: number[] = [];
  for (let i = 0; i < size; i++) {
    const lo = [...points].reverse().find((p) => p.i <= i);
    const hi = points.find((p) => p.i >= i);
    if (lo && hi)
      out.push(lo.i === hi.i ? lo.v : lo.v + ((hi.v - lo.v) * (i - lo.i)) / (hi.i - lo.i));
    else if (hi) out.push(hi.v);
    else {
      // Past the last populated CR: continue the trend of the last few points.
      const a = points[Math.max(0, points.length - 4)];
      const b = points[points.length - 1];
      const slope = b.i > a.i ? (b.v - a.v) / (b.i - a.i) : 0;
      out.push(b.v + slope * (i - b.i));
    }
  }
  return out;
}

export function deriveBaselines(samples: Sample[]): CRBaseline[] {
  const col = (f: (s: Sample) => number | null) =>
    monotoneColumn(samples.map((s) => [crToIndex(s.listedCR), f(s)]));
  const hp = col((s) => s.def.hp * effectiveHPMultiplier(s.def, s.listedCR).multiplier);
  const ac = col((s) => effectiveAC(s.def));
  const attackBonus = col((s) => s.off.attackBonus);
  const saveDC = col((s) => s.off.saveDC);
  const dpr = col((s) => s.off.dpr);
  return CR_LADDER.map((cr, i) => ({
    cr,
    hp: hp[i],
    ac: ac[i],
    attackBonus: attackBonus[i],
    saveDC: saveDC[i],
    dpr: dpr[i],
  }));
}

export function evaluate(samples: Sample[], baselines: CRBaseline[]): Metrics {
  return computeMetrics(
    samples.map((s) => ({ listed: s.listedCR, calc: computeCR(s.def, s.off, baselines).cr })),
  );
}

/** Repeated k-fold cross-validation of the derive-then-predict procedure. */
export function crossValidate(samples: Sample[], k = 10, repeats = 5, seed = 1234): Metrics {
  const pairs: Array<{ listed: number; calc: number }> = [];
  for (let rep = 0; rep < repeats; rep++) {
    let state = seed + rep;
    const random = () => (state = (state * 16807) % 2147483647) / 2147483647;
    const order = samples
      .map((s, i) => [random(), i] as [number, number])
      .sort((a, b) => a[0] - b[0])
      .map(([, i]) => i);
    for (let fold = 0; fold < k; fold++) {
      const train = order.filter((_, j) => j % k !== fold).map((i) => samples[i]);
      const baselines = deriveBaselines(train);
      for (const i of order.filter((_, j) => j % k === fold)) {
        const s = samples[i];
        pairs.push({ listed: s.listedCR, calc: computeCR(s.def, s.off, baselines).cr });
      }
    }
  }
  // Percentages and means are over all repeats; counts are per repeat so they
  // compare directly with a single pass over the dataset.
  const metrics = computeMetrics(pairs);
  return { ...metrics, n: samples.length, off3Plus: metrics.off3Plus / repeats };
}

export function leaveOneOut(samples: Sample[]): Metrics {
  return computeMetrics(
    samples.map((s, i) => {
      const baselines = deriveBaselines(samples.filter((_, j) => j !== i));
      return { listed: s.listedCR, calc: computeCR(s.def, s.off, baselines).cr };
    }),
  );
}

/** TypeScript source for src/data/crBaselines.ts rows. */
export function formatBaselines(baselines: CRBaseline[]): string {
  const r = (v: number) => Math.round(v * 10) / 10;
  return baselines
    .map(
      (b) =>
        `  { cr: ${b.cr}, hp: ${r(b.hp)}, ac: ${r(b.ac)}, attackBonus: ${r(b.attackBonus)}, ` +
        `saveDC: ${r(b.saveDC)}, dpr: ${r(b.dpr)} },`,
    )
    .join('\n');
}
