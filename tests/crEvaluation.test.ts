/**
 * Offline accuracy evaluation of the CR calculator.
 *
 * Always runs against the committed SRD 5.2 fixture (CC-BY-4.0 creatures from
 * the dnd5e `actors24` compendium, built by tools/build-srd-fixture.cjs) as a
 * regression guard. Most of those creatures also appear in the 2024 Monster
 * Manual that the baselines were derived from, so this is close to in-sample.
 *
 * For a full evaluation, export a dataset from Foundry with
 * tools/export-cr-dataset.js and run:
 *
 *   CR_EVAL_DATA=/path/a.json[,/path/b.json] npm run eval:cr
 *
 * Options: CR_EVAL_LOO=1 adds leave-one-out cross-validation;
 * CR_PRINT_BASELINES=1 prints the baseline rows derived from the dataset (the
 * source of src/data/crBaselines.ts).
 */
import { describe, expect, test } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { CR_BASELINES_2024 } from '../src/data/crBaselines';
import { computeCR, CR_LADDER } from '../src/services/crMath';
import {
  crossValidate,
  deriveBaselines,
  evaluate,
  extractSamples,
  formatBaselines,
  leaveOneOut,
} from './evaluation/calibrate';
import { computeMetrics, DatasetRow, formatMetrics, loadDataset } from './evaluation/harness';

const FIXTURE = path.join(__dirname, 'fixtures', 'srd-5.2-monsters.json.gz');

function loadFixture(): DatasetRow[] {
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(FIXTURE)).toString('utf8')).rows;
}

describe('CR accuracy on the SRD 5.2 fixture', () => {
  const samples = extractSamples(loadFixture());
  const metrics = evaluate(samples, CR_BASELINES_2024);

  test('reports metrics', () => {
    console.log(formatMetrics('SRD 5.2 fixture (2.6.0)', metrics));
    expect(samples.length).toBeGreaterThan(300);
  });

  test('stays accurate', () => {
    expect(metrics.within1Pct).toBeGreaterThanOrEqual(90);
    expect(metrics.exactPct).toBeGreaterThanOrEqual(45);
    expect(Math.abs(metrics.meanSigned)).toBeLessThanOrEqual(0.3);
    expect(metrics.mae).toBeLessThanOrEqual(0.6);
  });

  test('only produces ladder CRs, non-negative components and sane attack bonuses', () => {
    for (const s of samples) {
      const result = computeCR(s.def, s.off, CR_BASELINES_2024);
      expect(CR_LADDER).toContain(result.cr);
      expect(CR_LADDER).toContain(result.defensiveCR);
      expect(CR_LADDER).toContain(result.offensiveCR);
      expect(s.off.attackBonus === null || s.off.attackBonus <= 20).toBe(true);
    }
  });
});

const external = process.env.CR_EVAL_DATA;
(external ? describe : describe.skip)('CR accuracy on an exported dataset', () => {
  // describe.skip still runs this body to collect tests, so guard the load.
  const rows = external ? external.split(',').flatMap((p) => loadDataset(p.trim())) : [];
  const editions = rows.length
    ? Array.from(new Set(rows.map((r) => r.edition ?? 'all')))
    : ['none'];

  test.each(editions)('%s', (edition) => {
    const subset = rows.filter((r) => (r.edition ?? 'all') === edition);
    const samples = extractSamples(subset);
    const lines = [
      formatMetrics(`${edition} shipped baselines`, evaluate(samples, CR_BASELINES_2024)),
    ];
    const legacy = subset.filter((r) => r.legacy);
    if (legacy.length) {
      lines.push(
        formatMetrics(
          `${edition} v2.5.1 capture`,
          computeMetrics(legacy.map((r) => ({ listed: r.listedCR, calc: r.legacy!.calc }))),
        ),
      );
    }
    lines.push(formatMetrics(`${edition} 10-fold CV x5`, crossValidate(samples)));
    if (process.env.CR_EVAL_LOO)
      lines.push(formatMetrics(`${edition} leave-one-out`, leaveOneOut(samples)));
    if (process.env.CR_PRINT_BASELINES) lines.push(formatBaselines(deriveBaselines(samples)));
    console.log(lines.join('\n'));
    expect(samples.length).toBeGreaterThan(0);
  });
});
