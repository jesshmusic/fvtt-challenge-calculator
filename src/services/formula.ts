/**
 * Expected-value evaluator for dnd5e roll formulas.
 *
 * Handles the subset of Foundry roll syntax that shows up in monster damage:
 * dice (`2d6`, `d8`, `(@item.level - 3)d10`), flat numbers, `+ - * /`,
 * parentheses, `floor/ceil/round/min/max`, flavor text (`[fire]`) and dice
 * modifiers (`kh`, `r1`, `min2`), which are ignored. Roll data references are
 * substituted from `rollData`; unknown references evaluate to 0.
 */

export interface FormulaRollData {
  /** Value of `@mod` (the activity's ability modifier). */
  mod?: number;
  /** Proficiency bonus, `@prof`. */
  prof?: number;
  /** Ability modifiers by key, for `@abilities.str.mod` etc. */
  abilities?: Record<string, number>;
  /** Spell or item level, `@item.level`. */
  itemLevel?: number;
}

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
};

function substitute(formula: string, data: FormulaRollData): string {
  return formula
    .replace(/\[[^\]]*\]/g, '')
    .replace(/@abilities\.(\w+)\.mod/g, (_m, key: string) => String(data.abilities?.[key] ?? 0))
    .replace(/@(?:item\.level|scaling)/g, String(data.itemLevel ?? 0))
    .replace(/@mod\b/g, String(data.mod ?? 0))
    .replace(/@prof\b/g, String(data.prof ?? 0))
    .replace(/@[\w.]+/g, '0');
}

/**
 * Average value of a roll formula. Returns 0 for empty or unparseable input.
 */
export function averageFormula(
  formula: string | null | undefined,
  data: FormulaRollData = {},
): number {
  if (!formula || typeof formula !== 'string') return 0;
  const src = substitute(formula, data).replace(/\s+/g, '').toLowerCase();
  let pos = 0;

  const peek = () => src[pos];
  const eat = (ch: string) => {
    if (src[pos] === ch) {
      pos++;
      return true;
    }
    return false;
  };

  const number = (): number | null => {
    const m = /^\d+(\.\d+)?/.exec(src.slice(pos));
    if (!m) return null;
    pos += m[0].length;
    return parseFloat(m[0]);
  };

  // Skip dice modifiers such as kh1, r1, min3, x, cs>3.
  const skipDiceModifiers = () => {
    const m = /^(?:[a-ce-z][a-z]*[<>=]?\d*)+/.exec(src.slice(pos));
    if (m) pos += m[0].length;
  };

  const dice = (count: number): number => {
    const faces = number();
    if (faces === null) return count;
    skipDiceModifiers();
    return (count * (faces + 1)) / 2;
  };

  let expr: () => number;

  const primary = (): number => {
    if (eat('(')) {
      const v = expr();
      eat(')');
      return v;
    }
    const fn = /^([a-z]+)\(/.exec(src.slice(pos));
    if (fn && FUNCTIONS[fn[1]]) {
      pos += fn[0].length;
      const args = [expr()];
      while (eat(',')) args.push(expr());
      eat(')');
      return FUNCTIONS[fn[1]](...args);
    }
    if (peek() === 'd') {
      pos++;
      return dice(1);
    }
    const n = number();
    if (n === null) throw new Error(`Unexpected token at ${pos} in "${src}"`);
    return n;
  };

  const factor = (): number => {
    if (eat('-')) return -factor();
    if (eat('+')) return factor();
    let v = primary();
    while (peek() === 'd') {
      pos++;
      v = dice(v);
    }
    return v;
  };

  const term = (): number => {
    let v = factor();
    for (;;) {
      if (eat('*')) v *= factor();
      else if (eat('/')) {
        const d = factor();
        v = d === 0 ? 0 : v / d;
      } else return v;
    }
  };

  expr = (): number => {
    let v = term();
    for (;;) {
      // A dangling trailing operator ("2d6 +") keeps what was parsed so far.
      if (eat('+')) v += pos < src.length ? term() : 0;
      else if (eat('-')) v -= pos < src.length ? term() : 0;
      else return v;
    }
  };

  try {
    const value = expr();
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}
