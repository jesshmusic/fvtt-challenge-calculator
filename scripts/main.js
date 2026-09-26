const CR_BASELINES_2024 = [
  { cr: 0, hp: 3, ac: 12, attackBonus: 3, saveDC: 11, dpr: 1.3 },
  { cr: 0.125, hp: 8, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 5 },
  { cr: 0.25, hp: 13, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 6.5 },
  { cr: 0.5, hp: 20, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 7.3 },
  { cr: 1, hp: 27, ac: 13, attackBonus: 4, saveDC: 11, dpr: 10.5 },
  { cr: 2, hp: 45, ac: 13, attackBonus: 5, saveDC: 12, dpr: 16.5 },
  { cr: 3, hp: 65, ac: 14, attackBonus: 5, saveDC: 12, dpr: 23.5 },
  { cr: 4, hp: 78, ac: 15, attackBonus: 5, saveDC: 13, dpr: 28 },
  { cr: 5, hp: 98.8, ac: 15, attackBonus: 7, saveDC: 14, dpr: 34 },
  { cr: 6, hp: 113, ac: 16, attackBonus: 7, saveDC: 14.8, dpr: 41 },
  { cr: 7, hp: 126.5, ac: 16.4, attackBonus: 7, saveDC: 14.8, dpr: 44.8 },
  { cr: 8, hp: 136, ac: 16.4, attackBonus: 7, saveDC: 15, dpr: 54 },
  { cr: 9, hp: 161.5, ac: 17.9, attackBonus: 9, saveDC: 16.1, dpr: 54.7 },
  { cr: 10, hp: 161.5, ac: 17.9, attackBonus: 9, saveDC: 16.1, dpr: 57.3 },
  { cr: 11, hp: 190, ac: 17.9, attackBonus: 9.3, saveDC: 16.1, dpr: 74.3 },
  { cr: 12, hp: 190, ac: 18, attackBonus: 9.3, saveDC: 16.5, dpr: 86 },
  { cr: 13, hp: 195, ac: 18, attackBonus: 10, saveDC: 17.5, dpr: 94.5 },
  { cr: 14, hp: 195, ac: 18.7, attackBonus: 11, saveDC: 17.5, dpr: 121.5 },
  { cr: 15, hp: 209.5, ac: 18.7, attackBonus: 11.5, saveDC: 18, dpr: 124.2 },
  { cr: 16, hp: 247.2, ac: 19, attackBonus: 12, saveDC: 19, dpr: 124.2 },
  { cr: 17, hp: 247.2, ac: 20, attackBonus: 13, saveDC: 19.4, dpr: 129.5 },
  { cr: 18, hp: 247.2, ac: 20, attackBonus: 13, saveDC: 19.4, dpr: 129.5 },
  { cr: 19, hp: 327.5, ac: 20.5, attackBonus: 14, saveDC: 20.2, dpr: 140.5 },
  { cr: 20, hp: 332.5, ac: 20.5, attackBonus: 14, saveDC: 21, dpr: 140.5 },
  { cr: 21, hp: 333, ac: 21.6, attackBonus: 15, saveDC: 22, dpr: 149 },
  { cr: 22, hp: 402, ac: 21.6, attackBonus: 15, saveDC: 23, dpr: 162.5 },
  { cr: 23, hp: 468, ac: 22, attackBonus: 16, saveDC: 23, dpr: 174.3 },
  { cr: 24, hp: 481, ac: 22, attackBonus: 17, saveDC: 23, dpr: 174.7 },
  { cr: 25, hp: 546, ac: 22, attackBonus: 17, saveDC: 23, dpr: 177.8 },
  { cr: 26, hp: 576.2, ac: 23, attackBonus: 17.4, saveDC: 23, dpr: 183.1 },
  { cr: 27, hp: 606.4, ac: 24, attackBonus: 17.8, saveDC: 23, dpr: 188.3 },
  { cr: 28, hp: 636.6, ac: 25, attackBonus: 18.2, saveDC: 23, dpr: 193.5 },
  { cr: 29, hp: 666.8, ac: 26, attackBonus: 18.6, saveDC: 23, dpr: 198.8 },
  { cr: 30, hp: 697, ac: 27, attackBonus: 19, saveDC: 23, dpr: 204 }
];
const FUNCTIONS = {
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  abs: Math.abs
};
function substitute(formula, data) {
  return formula.replace(/\[[^\]]*\]/g, "").replace(/@abilities\.(\w+)\.mod/g, (_m, key) => String(data.abilities?.[key] ?? 0)).replace(/@(?:item\.level|scaling)/g, String(data.itemLevel ?? 0)).replace(/@mod\b/g, String(data.mod ?? 0)).replace(/@prof\b/g, String(data.prof ?? 0)).replace(/@[\w.]+/g, "0");
}
function averageFormula(formula, data = {}) {
  if (!formula || typeof formula !== "string") return 0;
  const src = substitute(formula, data).replace(/\s+/g, "").toLowerCase();
  let pos = 0;
  const peek = () => src[pos];
  const eat = (ch) => {
    if (src[pos] === ch) {
      pos++;
      return true;
    }
    return false;
  };
  const number = () => {
    const m = /^\d+(\.\d+)?/.exec(src.slice(pos));
    if (!m) return null;
    pos += m[0].length;
    return parseFloat(m[0]);
  };
  const skipDiceModifiers = () => {
    const m = /^(?:[a-ce-z][a-z]*[<>=]?\d*)+/.exec(src.slice(pos));
    if (m) pos += m[0].length;
  };
  const dice = (count) => {
    const faces = number();
    if (faces === null) return count;
    skipDiceModifiers();
    return count * (faces + 1) / 2;
  };
  let expr;
  const primary = () => {
    if (eat("(")) {
      const v = expr();
      eat(")");
      return v;
    }
    const fn = /^([a-z]+)\(/.exec(src.slice(pos));
    if (fn && FUNCTIONS[fn[1]]) {
      pos += fn[0].length;
      const args = [expr()];
      while (eat(",")) args.push(expr());
      eat(")");
      return FUNCTIONS[fn[1]](...args);
    }
    if (peek() === "d") {
      pos++;
      return dice(1);
    }
    const n = number();
    if (n === null) throw new Error(`Unexpected token at ${pos} in "${src}"`);
    return n;
  };
  const factor = () => {
    if (eat("-")) return -factor();
    if (eat("+")) return factor();
    let v = primary();
    while (peek() === "d") {
      pos++;
      v = dice(v);
    }
    return v;
  };
  const term = () => {
    let v = factor();
    for (; ; ) {
      if (eat("*")) v *= factor();
      else if (eat("/")) {
        const d = factor();
        v = d === 0 ? 0 : v / d;
      } else return v;
    }
  };
  expr = () => {
    let v = term();
    for (; ; ) {
      if (eat("+")) v += pos < src.length ? term() : 0;
      else if (eat("-")) v -= pos < src.length ? term() : 0;
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
const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const PHYSICAL = ["bludgeoning", "piercing", "slashing"];
const DAMAGING_ACTIVITIES = /* @__PURE__ */ new Set(["attack", "save", "damage"]);
const NUMBER_WORDS = {
  a: 1,
  an: 1,
  one: 1,
  once: 1,
  two: 2,
  twice: 2,
  three: 3,
  thrice: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};
function listOf(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.contents)) return raw.contents;
  if (typeof raw.values === "function" && !(raw instanceof Set)) return Array.from(raw.values());
  if (raw instanceof Set) return Array.from(raw);
  if (typeof raw === "object") return Object.values(raw);
  return [];
}
function setMembers(value) {
  if (!value) return [];
  if (value instanceof Set || Array.isArray(value)) return Array.from(value).map(String);
  return [];
}
function toNumber(value) {
  if (value === null || value === void 0 || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/\s+/g, ""));
  return Number.isFinite(n) ? n : null;
}
function itemId(item) {
  return item?.id ?? item?._id ?? "";
}
function activityId(activity) {
  return activity?.id ?? activity?._id ?? "";
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}
function descriptionOf(item) {
  const d = item?.system?.description;
  return typeof d === "string" ? d : d?.value ?? "";
}
function abilityMods(actor) {
  const mods = {};
  for (const key of ABILITIES) {
    const ability = actor?.system?.abilities?.[key];
    mods[key] = toNumber(ability?.mod) ?? (ability?.value != null ? Math.floor((ability.value - 10) / 2) : 0);
  }
  return mods;
}
function proficiencyBonus(actor) {
  const prof = toNumber(actor?.system?.attributes?.prof);
  if (prof !== null && prof > 0) return prof;
  const cr = toNumber(actor?.system?.details?.cr) ?? 0;
  return Math.max(2, Math.floor((Math.max(cr, 1) - 1) / 4) + 2);
}
function extractDefense(actor) {
  const sys = actor?.system ?? {};
  const traits = sys.traits ?? {};
  const immunities = setMembers(traits.di?.value);
  const resistances = setMembers(traits.dr?.value);
  const vulnerabilities = setMembers(traits.dv?.value);
  const items = listOf(actor?.items);
  return {
    hp: toNumber(sys.attributes?.hp?.max) ?? 0,
    ac: toNumber(sys.attributes?.ac?.value) ?? toNumber(sys.attributes?.ac?.flat) ?? 10,
    immunities,
    resistances,
    vulnerabilities,
    magicResistance: items.some((i) => /^magic resistance\b/i.test(i?.name ?? ""))
  };
}
function makeCtx(actor) {
  const spellAbility = actor?.system?.attributes?.spellcasting || "int";
  return {
    actor,
    items: listOf(actor?.items),
    mods: abilityMods(actor),
    prof: proficiencyBonus(actor),
    spellAbility
  };
}
function hasProperty(item, prop) {
  const props = item?.system?.properties;
  if (!props) return false;
  if (props instanceof Set || Array.isArray(props)) return Array.from(props).includes(prop);
  return !!props[prop];
}
function attackAbility(activity, item, ctx) {
  const explicit = activity?.attack?.ability;
  if (explicit && ABILITIES.includes(explicit)) return explicit;
  if (explicit === "spellcasting") return ctx.spellAbility;
  if (explicit === "none") return null;
  const classification = activity?.attack?.type?.classification;
  if (classification === "spell" || item?.type === "spell") return ctx.spellAbility;
  const weaponType = item?.system?.type?.value ?? "";
  if (item?.type === "weapon" && (weaponType === "natural" || hasProperty(item, "fin"))) {
    return ctx.mods.dex > ctx.mods.str ? "dex" : "str";
  }
  const rangeType = activity?.attack?.type?.value || (/R$/.test(weaponType) ? "ranged" : "melee");
  return rangeType === "ranged" ? "dex" : "str";
}
function saveAbility(activity, ctx) {
  const calc = activity?.save?.dc?.calculation;
  if (calc === "spellcasting") return ctx.spellAbility;
  if (calc && ABILITIES.includes(calc)) return calc;
  return null;
}
function spellScaling(item, castLevel, ctx) {
  if (item?.type !== "spell") return 0;
  const level = toNumber(item.system?.level) ?? 0;
  if (level === 0) {
    const sys = ctx.actor?.system ?? {};
    const cr = toNumber(sys.details?.cr) ?? 0;
    const casterLevel = item.system?.method === "innate" ? cr : toNumber(sys.details?.level) || toNumber(sys.attributes?.spell?.level) || toNumber(sys.details?.spellLevel) || cr;
    return Math.floor((casterLevel + 1) / 6);
  }
  return castLevel !== null && castLevel > level ? castLevel - level : 0;
}
function partAverage(part, increase, data) {
  if (!part) return 0;
  const mode = part.scaling?.mode;
  const steps = mode === "whole" ? increase : mode === "half" ? Math.floor(increase / 2) : 0;
  let total;
  if (part.custom?.enabled) {
    total = averageFormula(part.custom.formula, data);
  } else if (!(part.number && part.denomination) && typeof part.formula === "string" && !part.bonus) {
    total = averageFormula(part.formula, data);
  } else {
    const number = (toNumber(part.number) ?? 0) + (toNumber(part.scaling?.number) ?? 1) * steps;
    const faces = toNumber(part.denomination) ?? 0;
    total = number > 0 && faces > 0 ? number * (faces + 1) / 2 : 0;
    total += averageFormula(part.bonus, data);
  }
  if (steps && part.scaling?.formula) total += averageFormula(part.scaling.formula, data) * steps;
  return total;
}
function evaluateActivity(activity, item, ctx, castLevel = null) {
  const type = activity?.type;
  const increase = spellScaling(item, castLevel, ctx);
  const itemLevel = castLevel ?? toNumber(item?.system?.level) ?? 0;
  const parts = listOf(activity?.damage?.parts);
  let damage = 0;
  let toHit = null;
  let saveDC = null;
  if (type === "attack") {
    const ability = attackAbility(activity, item, ctx);
    const mod = ability ? ctx.mods[ability] : 0;
    const data = { mod, prof: ctx.prof, abilities: ctx.mods, itemLevel };
    const isWeapon = item?.type === "weapon";
    const magical = isWeapon ? toNumber(item.system?.magicalBonus) ?? 0 : 0;
    const baseDamage = (base) => {
      if (!base) return 0;
      const avg = partAverage(base, 0, data);
      if (avg === 0) return 0;
      const rolled = base.custom?.enabled ? /d/i.test(base.custom.formula ?? "") : !!(base.number && base.denomination);
      const hasMod = /@mod/.test(
        base.custom?.enabled ? base.custom.formula ?? "" : base.bonus ?? ""
      );
      return avg + (isWeapon && rolled && !hasMod ? mod + magical : 0);
    };
    let hasBase = false;
    for (const part of parts) {
      if (part?.base) {
        hasBase = true;
        const versatile = hasProperty(item, "ver") ? baseDamage(item.system?.damage?.versatile) : 0;
        damage += Math.max(baseDamage(part), versatile);
      } else {
        damage += partAverage(part, increase, data);
      }
    }
    if (!hasBase && activity?.damage?.includeBase && isWeapon) {
      const dmg = item.system?.damage;
      const versatile = hasProperty(item, "ver") ? baseDamage(dmg?.versatile) : 0;
      damage += Math.max(baseDamage(dmg?.base), versatile);
    }
    const label = activity?.labels?.toHit ?? null;
    const parsed = label !== null ? toNumber(String(label).replace(/[^\d+-]/g, "")) : null;
    if (parsed !== null) toHit = parsed;
    else if (activity?.attack?.flat) toHit = averageFormula(activity.attack.bonus, data);
    else toHit = mod + ctx.prof + averageFormula(activity?.attack?.bonus, data) + magical;
  } else {
    const ability = type === "save" ? saveAbility(activity, ctx) : null;
    const data = {
      mod: ability ? ctx.mods[ability] : 0,
      prof: ctx.prof,
      abilities: ctx.mods,
      itemLevel
    };
    for (const part of parts) damage += partAverage(part, increase, data);
    if (type === "save") {
      const dc = activity?.save?.dc ?? {};
      saveDC = toNumber(dc.value);
      if (saveDC === null) {
        if (dc.calculation === "spellcasting") {
          saveDC = toNumber(ctx.actor?.system?.attributes?.spell?.dc) ?? 8 + ctx.prof + ctx.mods[ctx.spellAbility];
        } else if (dc.calculation && ABILITIES.includes(dc.calculation)) {
          saveDC = 8 + ctx.prof + ctx.mods[dc.calculation];
        } else {
          saveDC = toNumber(averageFormula(dc.formula, data)) || null;
        }
      }
    }
  }
  return { damage: Math.max(0, damage), toHit, saveDC };
}
function activationKind(activity, item) {
  const type = activity?.activation?.type || item?.system?.activation?.type || "";
  if (type === "action" || type === "bonus" || type === "legendary" || type === "reaction") {
    return type;
  }
  if (type === "turnStart" || type === "turnEnd") return "aura";
  return "other";
}
function hasLimitedUses(doc) {
  const uses = doc?.uses ?? doc?.system?.uses;
  const max = toNumber(uses?.max);
  return max !== null && max > 0;
}
function consumesLimitedResource(activity) {
  return listOf(activity?.consumption?.targets).some(
    (t) => t?.type === "itemUses" || t?.type === "activityUses" || t?.type === "material"
  );
}
function cachedSpellFor(activity, item, ctx) {
  const key = `.Item.${itemId(item)}.Activity.${activityId(activity)}`;
  const byFlag = ctx.items.find(
    (i) => i?.type === "spell" && (i.flags?.dnd5e?.cachedFor ?? "") === key
  );
  if (byFlag) return byFlag;
  const uuid = activity?.spell?.uuid ?? "";
  if (!uuid) return null;
  return ctx.items.find(
    (i) => i?.type === "spell" && (i._stats?.compendiumSource === uuid || i.flags?.core?.sourceId === uuid)
  ) ?? null;
}
function isOncePerRound(item) {
  return /can'?t (?:take|use) this (?:action|legendary action) again/i.test(
    stripHtml(descriptionOf(item))
  );
}
function optionsForItem(item, ctx) {
  if (item?.type === "spell" && item.flags?.dnd5e?.cachedFor) return [];
  return allOptionsForItem(item, ctx);
}
function allOptionsForItem(item, ctx) {
  const options = [];
  const itemLimited = hasLimitedUses(item) || item?.type === "spell" && (toNumber(item.system?.level) ?? 0) > 0 && !["atwill", "innate"].includes(item.system?.method ?? item.system?.preparation?.mode ?? "");
  for (const activity of listOf(item?.system?.activities ?? item?.activities)) {
    let evaluated = null;
    let kind = "damage";
    let spell = null;
    if (DAMAGING_ACTIVITIES.has(activity?.type)) {
      evaluated = evaluateActivity(activity, item, ctx);
      kind = activity.type;
    } else if (activity?.type === "cast") {
      spell = cachedSpellFor(activity, item, ctx);
      if (!spell) continue;
      const castLevel = toNumber(activity.spell?.level);
      for (const spellActivity of listOf(spell.system?.activities ?? spell.activities)) {
        if (!DAMAGING_ACTIVITIES.has(spellActivity?.type)) continue;
        const e = evaluateActivity(spellActivity, spell, ctx, castLevel);
        if (!evaluated || e.damage > evaluated.damage) {
          evaluated = e;
          kind = spellActivity.type;
        }
      }
    }
    if (!evaluated || evaluated.damage <= 0) continue;
    const activation = activationKind(activity, item);
    options.push({
      itemId: itemId(item),
      itemName: item?.name ?? "",
      activation,
      cost: Math.max(1, toNumber(activity?.activation?.value) ?? 1),
      damage: evaluated.damage,
      kind,
      toHit: evaluated.toHit,
      saveDC: evaluated.saveDC,
      limited: itemLimited || hasLimitedUses(activity) || consumesLimitedResource(activity),
      oncePerRound: activation === "legendary" && isOncePerRound(item),
      ...spell ? { spellId: itemId(spell), spellName: spell.name ?? "" } : {}
    });
  }
  if (options.length === 0 && item?.type === "weapon" && !item?.system?.activities) {
    const base = item.system?.damage?.base;
    const fakeActivity = { type: "attack", damage: { includeBase: true, parts: [] }, attack: {} };
    const e = base ? evaluateActivity(fakeActivity, item, ctx) : null;
    if (e && e.damage > 0) {
      options.push({
        itemId: itemId(item),
        itemName: item.name ?? "",
        activation: "action",
        cost: 1,
        damage: e.damage,
        kind: "attack",
        toHit: e.toHit,
        saveDC: null,
        limited: false,
        oncePerRound: false
      });
    }
  }
  return options;
}
function bestPerSlot(options) {
  const groups = /* @__PURE__ */ new Map();
  for (const option of options) {
    const key = `${option.activation}|${option.limited}|${option.spellId ? "spell" : "item"}`;
    groups.set(key, [...groups.get(key) ?? [], option]);
  }
  const best = /* @__PURE__ */ new Map();
  for (const [key, group] of groups) {
    const top = bestOf(group);
    const pick = group.length >= 3 && !top.spellId ? { ...top, damage: group.reduce((s, o) => s + o.damage, 0) / group.length } : top;
    const slot = key.slice(0, key.lastIndexOf("|"));
    const current = best.get(slot);
    if (!current || pick.damage > current.damage) best.set(slot, pick);
  }
  return Array.from(best.values());
}
function parseRoutine(html, ctx, optionsByItem, bestAttack) {
  if (!html) return null;
  const items = ctx.items;
  const byId = new Map(items.map((i) => [itemId(i), i]));
  const tokens = [];
  const ref = (item) => {
    if (!item) return " ";
    tokens.push(itemId(item));
    return ` §${tokens.length - 1}§ `;
  };
  const findByName = (name) => {
    const n = name.trim().toLowerCase();
    return items.find((i) => (i?.name ?? "").toLowerCase() === n) ?? null;
  };
  let text = html.replace(/\[\[lookup[^\]]*\]\]/gi, "the creature").replace(
    /\[\[\/item\s+([^\]]+)\]\](?:\{([^}]*)\})?/gi,
    (_m, target, label) => {
      const t = target.trim();
      const idMatch = /^\.([A-Za-z0-9]+)/.exec(t);
      const item = idMatch ? byId.get(idMatch[1]) : findByName(t);
      return ref(item ?? (label ? findByName(label) : null));
    }
  ).replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, (_m, label) => ref(findByName(label)));
  text = stripHtml(text).toLowerCase();
  const named = items.filter((i) => optionsByItem.has(itemId(i)) && (i?.name ?? "").length > 2).sort((a, b) => b.name.length - a.name.length);
  for (const item of named) {
    const escaped = item.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\b${escaped}(?:e?s)?\\b`, "g"), () => ref(item));
  }
  text = text.replace(/\s+/g, " ");
  if (/as many .* as it has heads/.test(text)) {
    const heads = items.map((i) => /\b(\w+) heads\b/i.exec(stripHtml(descriptionOf(i)))?.[1]?.toLowerCase()).find((w) => w && NUMBER_WORDS[w]);
    if (heads)
      text = text.replace(/as many (§\d+§) attacks? as it has heads/, `${heads} $1 attacks`);
  }
  text = text.replace(/[^.]*\breplace[^.]*\./g, " ");
  const countOf = (word) => {
    if (!word) return null;
    if (/^\d+$/.test(word)) return parseInt(word, 10);
    return NUMBER_WORDS[word] ?? null;
  };
  const dmgOf = (token) => optionsByItem.get(tokens[parseInt(token, 10)]) ?? null;
  const evaluate = (clause) => {
    const routine = { damage: 0, count: 0, used: [] };
    const add = (n, option) => {
      if (!option) return;
      routine.damage += n * option.damage;
      routine.count += option.kind === "attack" ? n : 0;
      routine.used.push(option);
    };
    let rest = clause;
    rest = rest.replace(
      /\b(\w+) (?:other )?attacks?,? using ((?:§\d+§|[^.§])*?) in any combination/g,
      (_m, word, group) => {
        const n = countOf(word) ?? 1;
        const options = Array.from(group.matchAll(/§(\d+)§/g)).map((m) => dmgOf(m[1])).filter(Boolean);
        const best2 = options.sort((a, b) => b.damage - a.damage)[0] ?? bestAttack;
        add(n, best2);
        return " ";
      }
    );
    const re = /(?:\b(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|twice|thrice)\b(?: \w+){0,3}? )?§(\d+)§((?: (?:or|and\/or) §\d+§)*)(?: (\w+) times\b| (twice|thrice)\b)?/g;
    let matched = false;
    for (const m of rest.matchAll(re)) {
      matched = true;
      const n = countOf(m[4] ?? m[5]) ?? countOf(m[1]) ?? 1;
      const group = [m[2], ...Array.from((m[3] ?? "").matchAll(/§(\d+)§/g)).map((g) => g[1])];
      const options = group.map(dmgOf).filter(Boolean);
      add(n, options.sort((a, b) => b.damage - a.damage)[0] ?? null);
    }
    if (!matched) {
      const generic = /\bmakes (\d+|one|two|three|four|five|six|seven|eight|nine|ten) (?:\w+ )?attacks?/.exec(
        rest
      );
      if (generic) add(countOf(generic[1]) ?? 1, bestAttack);
    }
    return routine;
  };
  const alternatives = text.split(
    /,? or (?=it |makes |the creature |(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten) )|;/
  );
  let best = null;
  for (const alt of alternatives) {
    const r = evaluate(alt);
    if (!best || r.damage > best.damage) best = r;
  }
  return best && best.damage > 0 ? best : null;
}
function bestOf(options) {
  return options.reduce((a, b) => !a || b.damage > a.damage ? b : a, null);
}
function threeRoundAverage(atWill, limited) {
  const best = [...limited].sort((a, b) => b - a);
  let total = 0;
  for (let round = 0; round < 3; round++) total += Math.max(atWill, best[round] ?? 0);
  return total / 3;
}
function distinctLimited(options) {
  const best = /* @__PURE__ */ new Map();
  for (const o of options) {
    if (!o.limited) continue;
    const key = o.spellId ?? o.itemId;
    const current = best.get(key);
    if (!current || o.damage > current.damage) best.set(key, o);
  }
  return Array.from(best.values()).sort((a, b) => b.damage - a.damage);
}
function extractOffense(actor) {
  const ctx = makeCtx(actor);
  const all = [];
  const everyOption = [];
  const optionsByItem = /* @__PURE__ */ new Map();
  for (const item of ctx.items) {
    const itemOptions = optionsForItem(item, ctx);
    const options = bestPerSlot(itemOptions);
    all.push(...options);
    everyOption.push(...itemOptions);
    const castCount = listOf(item?.system?.activities ?? item?.activities).filter(
      (a) => a?.type === "cast"
    ).length;
    for (const o of itemOptions) {
      if (!o.spellId) continue;
      const current = optionsByItem.get(o.spellId);
      if (!current || o.damage > current.damage) optionsByItem.set(o.spellId, o);
    }
    if (castCount > 1) continue;
    const ref = bestOf(options.filter((o) => o.activation !== "legendary")) ?? bestOf(options);
    if (ref) optionsByItem.set(itemId(item), ref);
  }
  const actions = all.filter((o) => o.activation === "action");
  const atWillActions = actions.filter((o) => !o.limited);
  const bestAttack = bestOf(atWillActions.filter((o) => o.kind === "attack"));
  const multiattackItem = ctx.items.find((i) => /^multiattack\b/i.test(i?.name ?? ""));
  const multi = multiattackItem ? parseRoutine(descriptionOf(multiattackItem), ctx, optionsByItem, bestAttack) : null;
  const single = bestOf(atWillActions);
  let routine = single ? { damage: single.damage, count: 1, used: [single] } : { damage: 0, count: 1, used: [] };
  if (multi && multi.damage >= routine.damage) routine = multi;
  const limitedActions = distinctLimited(
    everyOption.filter((o) => o.activation === "action")
  ).slice(0, 3);
  const limitedAction = limitedActions[0] ?? null;
  const actionDpr = threeRoundAverage(
    routine.damage,
    limitedActions.map((o) => o.damage)
  );
  const bonus = all.filter((o) => o.activation === "bonus");
  const bonusDpr = threeRoundAverage(
    bestOf(bonus.filter((o) => !o.limited))?.damage ?? 0,
    distinctLimited(everyOption.filter((o) => o.activation === "bonus")).map((o) => o.damage)
  );
  const auraDpr = bestOf(all.filter((o) => o.activation === "aura" && !o.limited))?.damage ?? 0;
  const sys = actor?.system ?? {};
  const legendaryActions = Math.max(
    0,
    toNumber(sys.resources?.legact?.max) ?? toNumber(sys.resources?.legact?.value) ?? 0
  );
  const legendaryOptions = all.filter(
    (o) => o.activation === "legendary" && !o.limited
  );
  for (const item of ctx.items) {
    const acts = listOf(item?.system?.activities ?? item?.activities);
    const legendary = acts.some((a) => a?.activation?.type === "legendary");
    if (!legendary || legendaryOptions.some((o) => o.itemId === itemId(item))) continue;
    const r = parseRoutine(descriptionOf(item), ctx, optionsByItem, null);
    if (!r) continue;
    const act = acts.find((a) => a?.activation?.type === "legendary");
    legendaryOptions.push({
      itemId: itemId(item),
      itemName: item.name ?? "",
      activation: "legendary",
      cost: Math.max(1, toNumber(act?.activation?.value) ?? 1),
      damage: r.damage,
      kind: r.used[0]?.kind ?? "attack",
      toHit: r.used[0]?.toHit ?? null,
      saveDC: r.used[0]?.saveDC ?? null,
      limited: false,
      oncePerRound: isOncePerRound(item)
    });
  }
  let budget = legendaryActions;
  let legendaryDpr = 0;
  const byEfficiency = [...legendaryOptions].sort((a, b) => b.damage / b.cost - a.damage / a.cost);
  const legendaryUsed = [];
  for (const option of byEfficiency) {
    while (budget >= option.cost) {
      legendaryDpr += option.damage;
      budget -= option.cost;
      legendaryUsed.push(option);
      if (option.oncePerRound) break;
    }
  }
  const used = routine.used;
  const attackDamage = used.filter((o) => o.kind === "attack").reduce((s, o) => s + o.damage, 0);
  const saveDamage = used.filter((o) => o.kind !== "attack").reduce((s, o) => s + o.damage, 0);
  const toHits = used.map((o) => o.toHit).filter((v) => v !== null);
  const dcs = [...used, ...limitedAction ? [limitedAction] : []].map((o) => o.saveDC).filter((v) => v !== null);
  const sources = Array.from(
    new Set(
      [...used, ...limitedAction ? [limitedAction] : [], ...legendaryUsed].map((o) => o.itemName)
    )
  );
  return {
    dpr: actionDpr + bonusDpr + auraDpr + legendaryDpr,
    components: {
      routine: routine.damage,
      limited: limitedAction?.damage ?? 0,
      bonus: bonusDpr,
      aura: auraDpr,
      legendary: legendaryDpr
    },
    options: all,
    numAttacks: Math.max(1, routine.count),
    attackBonus: toHits.length ? Math.max(...toHits) : null,
    saveDC: dcs.length ? Math.max(...dcs) : null,
    usesSaveDC: saveDamage > attackDamage,
    sources,
    legendaryActions
  };
}
const CR_LADDER = [
  0,
  0.125,
  0.25,
  0.5,
  ...Array.from({ length: 30 }, (_, i) => i + 1)
];
const MAX_CR_INDEX = CR_LADDER.length - 1;
const POINTS_PER_CR_STEP = 4;
const MAGIC_RESISTANCE_AC = 2;
const EFFECTIVE_HP_MULTIPLIERS = [
  [4, 2, 2],
  [10, 1.5, 2],
  [16, 1.25, 1.5],
  [Infinity, 1, 1.25]
];
function clampIndex(index) {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(MAX_CR_INDEX, index));
}
function indexToCR(index) {
  return CR_LADDER[Math.round(clampIndex(index))];
}
function indexToValue(index) {
  return interpolate(CR_LADDER, index);
}
function snapCR(value) {
  let best = CR_LADDER[0];
  for (const cr of CR_LADDER) if (Math.abs(cr - value) <= Math.abs(best - value)) best = cr;
  return best;
}
function averageCR(defIndex, offIndex) {
  return snapCR((indexToValue(clampIndex(defIndex)) + indexToValue(clampIndex(offIndex))) / 2);
}
function interpolate(table, index) {
  const x = clampIndex(index);
  const i = Math.floor(x);
  if (i >= table.length - 1) return table[table.length - 1];
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}
function invert(table, value) {
  const n = table.length;
  if (!(value > table[0])) return 0;
  for (let j = 0; j < n - 1; j++) {
    if (value < table[j + 1]) {
      const span = table[j + 1] - table[j];
      return span > 0 ? j + (value - table[j]) / span : j;
    }
  }
  const slope = table[n - 1] - table[n - 2];
  return slope > 0 ? n - 1 + (value - table[n - 1]) / slope : n - 1;
}
function effectiveHPMultiplier(def, cr) {
  const row = EFFECTIVE_HP_MULTIPLIERS.find(([max]) => cr <= max);
  if (def.immunities.some((t) => PHYSICAL.includes(t))) {
    return { multiplier: row[2], reason: "immune" };
  }
  if (def.resistances.some((t) => PHYSICAL.includes(t))) {
    return { multiplier: row[1], reason: "resistant" };
  }
  return { multiplier: 1, reason: null };
}
function effectiveAC(def) {
  return def.ac + (def.magicResistance ? MAGIC_RESISTANCE_AC : 0);
}
function column(baselines, key) {
  return baselines.map((b) => b[key]);
}
function offensiveIndex(off, baselines) {
  const dprIndex = invert(column(baselines, "dpr"), off.dpr);
  let difference = 0;
  if (off.usesSaveDC && off.saveDC !== null) {
    difference = off.saveDC - interpolate(column(baselines, "saveDC"), dprIndex);
  } else if (off.attackBonus !== null) {
    difference = off.attackBonus - interpolate(column(baselines, "attackBonus"), dprIndex);
  } else if (off.saveDC !== null) {
    difference = off.saveDC - interpolate(column(baselines, "saveDC"), dprIndex);
  }
  if (off.dpr <= 0) difference = Math.min(0, difference);
  return { index: dprIndex + difference / POINTS_PER_CR_STEP, dprIndex, difference };
}
function defensiveIndex(def, baselines, crEstimate) {
  const hpMultiplier = crEstimate === null ? { multiplier: 1, reason: null } : effectiveHPMultiplier(def, crEstimate);
  const effectiveHP = def.hp * hpMultiplier.multiplier;
  const ac = effectiveAC(def);
  const hpIndex = invert(column(baselines, "hp"), effectiveHP);
  const acDifference = ac - interpolate(column(baselines, "ac"), hpIndex);
  return {
    index: def.hp > 0 ? hpIndex + acDifference / POINTS_PER_CR_STEP : 0,
    hpIndex,
    effectiveHP,
    effectiveAC: ac,
    hpMultiplier
  };
}
function computeCR(def, off, baselines) {
  const offensive = offensiveIndex(off, baselines);
  const offIndex = clampIndex(offensive.index);
  let estimate = null;
  let defensive = defensiveIndex(def, baselines, estimate);
  let cr = averageCR(defensive.index, offIndex);
  for (let pass = 0; pass < 4 && cr !== estimate; pass++) {
    estimate = cr;
    defensive = defensiveIndex(def, baselines, estimate);
    cr = averageCR(defensive.index, offIndex);
  }
  const defIndex = clampIndex(defensive.index);
  return {
    cr,
    defensive,
    offensive,
    defensiveIndex: defIndex,
    offensiveIndex: offIndex,
    defensiveCR: indexToCR(defIndex),
    offensiveCR: indexToCR(offIndex)
  };
}
class CRCalculatorService {
  static ID = "fvtt-challenge-calculator";
  static FLAGS = {
    TODOS: "cr-calc"
  };
  /** Expected stats per CR used by the calculation. */
  static baselines = CR_BASELINES_2024;
  /**
   * Calculate CR for an actor and optionally update it
   * @param actor The actor document
   * @param updateActor Whether to update the actor's CR
   * @returns The calculation result
   */
  static async calculateCRForActor(actor, updateActor = true) {
    const result = this.evaluate(actor);
    if (updateActor) {
      await actor.update({
        system: {
          details: {
            cr: result.calculatedCR
          }
        }
      });
      ui.notifications?.info(
        `CR updated for ${actor.name} to ${result.calculatedCR}, Offensive CR: ${result.offensiveCR}, Defensive CR: ${result.defensiveCR}`,
        { permanent: false }
      );
    }
    return result;
  }
  /**
   * Run the calculation without touching the actor.
   */
  static evaluate(actor) {
    const defense = extractDefense(actor);
    const offense = extractOffense(actor);
    const computation = computeCR(defense, offense, this.baselines);
    const spellAbility = actor.system?.attributes?.spellcasting;
    const spellDC = spellAbility ? Number(actor.system?.attributes?.spell?.dc) || 8 + proficiencyBonus(actor) + (abilityMods(actor)[spellAbility] ?? 0) : 0;
    return {
      actorName: actor.name,
      originalCR: actor.system?.details?.cr,
      calculatedCR: computation.cr,
      defensiveCR: computation.defensiveCR,
      offensiveCR: computation.offensiveCR,
      defensiveBreakdown: {
        hp: defense.hp,
        ac: defense.ac,
        immunities: defense.immunities.length,
        resistances: defense.resistances.length,
        vulnerabilities: defense.vulnerabilities.length,
        monsterFeatures: this.describeDefensiveTraits(defense.magicResistance, computation),
        effectiveHP: Math.round(computation.defensive.effectiveHP),
        effectiveAC: computation.defensive.effectiveAC
      },
      offensiveBreakdown: {
        dpr: offense.dpr,
        numAttacks: offense.numAttacks,
        attackBonus: offense.attackBonus ?? 0,
        spellSaveDC: offense.saveDC ?? spellDC,
        numFeats: listOf(actor.items).filter((item) => item?.type === "feat").length,
        detectedWeapons: Array.from(new Set(offense.options.map((o) => o.itemName))),
        usesSaveDC: offense.usesSaveDC,
        legendaryActions: offense.legendaryActions
      }
    };
  }
  static describeDefensiveTraits(magicResistance, computation) {
    const traits = [];
    const { multiplier, reason } = computation.defensive.hpMultiplier;
    if (reason && multiplier !== 1) {
      const what = reason === "immune" ? "Immune" : "Resistant";
      traits.push(`${what} to bludgeoning/piercing/slashing (×${multiplier} HP)`);
    }
    if (magicResistance) traits.push(`Magic Resistance (+${MAGIC_RESISTANCE_AC} AC)`);
    return traits;
  }
}
const { ApplicationV2: ApplicationV2$1, HandlebarsApplicationMixin } = foundry.applications.api;
class CRCalculatorDialog extends HandlebarsApplicationMixin(ApplicationV2$1) {
  result;
  actor;
  constructor(result, actor) {
    super({});
    this.result = result;
    this.actor = actor;
  }
  static DEFAULT_OPTIONS = {
    id: "cr-calculator-dialog",
    classes: ["cr-calculator", "dnd5e2", "sheet"],
    tag: "div",
    window: {
      title: "CR Calculator Results",
      icon: "fas fa-calculator",
      resizable: true
    },
    position: {
      width: 600,
      height: "auto"
    },
    actions: {
      apply: CRCalculatorDialog.onApplyCR,
      close: CRCalculatorDialog.onClose
    }
  };
  static PARTS = {
    form: {
      template: "modules/fvtt-challenge-calculator/templates/cr-calculator-results.html"
    }
  };
  /**
   * Prepare context data for the Handlebars template
   */
  async _prepareContext(_options) {
    const result = this.result;
    const crChanged = result.originalCR !== result.calculatedCR;
    const crIncrease = result.calculatedCR > result.originalCR;
    return {
      actorName: result.actorName,
      originalCR: this.formatCR(result.originalCR),
      calculatedCR: this.formatCR(result.calculatedCR),
      crChanged,
      crIncrease,
      defensiveCR: this.formatCR(result.defensiveCR),
      offensiveCR: this.formatCR(result.offensiveCR),
      defensive: {
        hp: result.defensiveBreakdown.hp,
        ac: result.defensiveBreakdown.ac,
        effectiveHP: result.defensiveBreakdown.effectiveHP,
        effectiveAC: result.defensiveBreakdown.effectiveAC,
        hasEffectiveHP: result.defensiveBreakdown.effectiveHP !== result.defensiveBreakdown.hp,
        hasEffectiveAC: result.defensiveBreakdown.effectiveAC !== result.defensiveBreakdown.ac,
        immunities: result.defensiveBreakdown.immunities,
        resistances: result.defensiveBreakdown.resistances,
        vulnerabilities: result.defensiveBreakdown.vulnerabilities,
        monsterFeatures: result.defensiveBreakdown.monsterFeatures,
        hasFeatures: result.defensiveBreakdown.monsterFeatures.length > 0
      },
      offensive: {
        dpr: Math.round(result.offensiveBreakdown.dpr * 10) / 10,
        numAttacks: result.offensiveBreakdown.numAttacks,
        attackBonus: this.formatBonus(result.offensiveBreakdown.attackBonus),
        spellSaveDC: result.offensiveBreakdown.spellSaveDC || null,
        hasSpells: result.offensiveBreakdown.spellSaveDC > 0,
        usesSaveDC: result.offensiveBreakdown.usesSaveDC,
        legendaryActions: result.offensiveBreakdown.legendaryActions,
        detectedWeapons: result.offensiveBreakdown.detectedWeapons,
        hasWeapons: result.offensiveBreakdown.detectedWeapons.length > 0
      }
    };
  }
  /**
   * Format CR value for display (handles fractional CRs)
   */
  formatCR(cr) {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return cr.toString();
  }
  /**
   * Format bonus with + or - sign
   */
  formatBonus(bonus) {
    return bonus >= 0 ? `+${bonus}` : bonus.toString();
  }
  /**
   * Apply the calculated CR to the actor
   */
  static async onApplyCR(_event, _target) {
    await this.actor.update({
      system: {
        details: {
          cr: this.result.calculatedCR
        }
      }
    });
    ui.notifications?.info(
      `CR updated for ${this.result.actorName} to ${this.result.calculatedCR}`,
      { permanent: false }
    );
    this.close();
  }
  /**
   * Close the dialog without applying
   */
  static async onClose(_event, _target) {
    this.close();
  }
}
const shouldShowCRButton = (actorObject) => {
  return actorObject?.type === "npc" && !!(game.user?.isGM || game.user?.isTheGM);
};
const isDocumentSheet = (app) => {
  const DocumentSheetV2 = foundry.applications?.api?.DocumentSheetV2;
  const DocumentSheetV1 = foundry.appv1?.api?.DocumentSheet;
  return typeof DocumentSheetV2 === "function" && app instanceof DocumentSheetV2 || typeof DocumentSheetV1 === "function" && app instanceof DocumentSheetV1;
};
function getSheetActor(app) {
  if (!app || app instanceof CRCalculatorDialog) return null;
  if (!isDocumentSheet(app)) return null;
  const doc = app.document;
  if (doc?.documentName !== "Actor") return null;
  return shouldShowCRButton(doc) ? doc : null;
}
const challengeRatings = [
  {
    cr: 0,
    xp: 10,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 1,
    hit_points_max: 6,
    attack_bonus: 3,
    damage_min: 0,
    damage_max: 1,
    save_dc: 13
  },
  {
    cr: 0.125,
    xp: 25,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 7,
    hit_points_max: 35,
    attack_bonus: 3,
    damage_min: 2,
    damage_max: 3,
    save_dc: 13
  },
  {
    cr: 0.25,
    xp: 50,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 36,
    hit_points_max: 49,
    attack_bonus: 3,
    damage_min: 4,
    damage_max: 5,
    save_dc: 13
  },
  {
    cr: 0.5,
    xp: 100,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 50,
    hit_points_max: 70,
    attack_bonus: 3,
    damage_min: 6,
    damage_max: 8,
    save_dc: 13
  },
  {
    cr: 1,
    xp: 200,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 71,
    hit_points_max: 85,
    attack_bonus: 3,
    damage_min: 9,
    damage_max: 14,
    save_dc: 13
  },
  {
    cr: 2,
    xp: 450,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 86,
    hit_points_max: 100,
    attack_bonus: 3,
    damage_min: 15,
    damage_max: 20,
    save_dc: 13
  },
  {
    cr: 3,
    xp: 700,
    prof_bonus: 2,
    armor_class: 13,
    hit_points_min: 101,
    hit_points_max: 115,
    attack_bonus: 4,
    damage_min: 21,
    damage_max: 26,
    save_dc: 13
  },
  {
    cr: 4,
    xp: 1100,
    prof_bonus: 2,
    armor_class: 14,
    hit_points_min: 116,
    hit_points_max: 130,
    attack_bonus: 5,
    damage_min: 27,
    damage_max: 32,
    save_dc: 14
  },
  {
    cr: 5,
    xp: 1800,
    prof_bonus: 3,
    armor_class: 15,
    hit_points_min: 131,
    hit_points_max: 145,
    attack_bonus: 6,
    damage_min: 33,
    damage_max: 38,
    save_dc: 15
  },
  {
    cr: 6,
    xp: 2300,
    prof_bonus: 3,
    armor_class: 15,
    hit_points_min: 146,
    hit_points_max: 160,
    attack_bonus: 6,
    damage_min: 39,
    damage_max: 44,
    save_dc: 15
  },
  {
    cr: 7,
    xp: 2900,
    prof_bonus: 3,
    armor_class: 15,
    hit_points_min: 161,
    hit_points_max: 175,
    attack_bonus: 6,
    damage_min: 45,
    damage_max: 50,
    save_dc: 15
  },
  {
    cr: 8,
    xp: 3900,
    prof_bonus: 3,
    armor_class: 16,
    hit_points_min: 176,
    hit_points_max: 190,
    attack_bonus: 7,
    damage_min: 51,
    damage_max: 56,
    save_dc: 16
  },
  {
    cr: 9,
    xp: 5e3,
    prof_bonus: 4,
    armor_class: 16,
    hit_points_min: 191,
    hit_points_max: 205,
    attack_bonus: 7,
    damage_min: 57,
    damage_max: 62,
    save_dc: 16
  },
  {
    cr: 10,
    xp: 5900,
    prof_bonus: 4,
    armor_class: 17,
    hit_points_min: 206,
    hit_points_max: 220,
    attack_bonus: 7,
    damage_min: 63,
    damage_max: 68,
    save_dc: 16
  },
  {
    cr: 11,
    xp: 7200,
    prof_bonus: 4,
    armor_class: 17,
    hit_points_min: 221,
    hit_points_max: 235,
    attack_bonus: 8,
    damage_min: 69,
    damage_max: 74,
    save_dc: 17
  },
  {
    cr: 12,
    xp: 8400,
    prof_bonus: 4,
    armor_class: 17,
    hit_points_min: 236,
    hit_points_max: 250,
    attack_bonus: 8,
    damage_min: 75,
    damage_max: 80,
    save_dc: 17
  },
  {
    cr: 13,
    xp: 1e4,
    prof_bonus: 5,
    armor_class: 18,
    hit_points_min: 251,
    hit_points_max: 265,
    attack_bonus: 8,
    damage_min: 81,
    damage_max: 86,
    save_dc: 18
  },
  {
    cr: 14,
    xp: 11500,
    prof_bonus: 5,
    armor_class: 18,
    hit_points_min: 266,
    hit_points_max: 280,
    attack_bonus: 8,
    damage_min: 87,
    damage_max: 92,
    save_dc: 18
  },
  {
    cr: 15,
    xp: 13e3,
    prof_bonus: 5,
    armor_class: 18,
    hit_points_min: 281,
    hit_points_max: 295,
    attack_bonus: 8,
    damage_min: 93,
    damage_max: 98,
    save_dc: 18
  },
  {
    cr: 16,
    xp: 15e3,
    prof_bonus: 5,
    armor_class: 18,
    hit_points_min: 296,
    hit_points_max: 310,
    attack_bonus: 9,
    damage_min: 99,
    damage_max: 104,
    save_dc: 18
  },
  {
    cr: 17,
    xp: 18e3,
    prof_bonus: 6,
    armor_class: 19,
    hit_points_min: 311,
    hit_points_max: 325,
    attack_bonus: 10,
    damage_min: 105,
    damage_max: 110,
    save_dc: 19
  },
  {
    cr: 18,
    xp: 2e4,
    prof_bonus: 6,
    armor_class: 19,
    hit_points_min: 326,
    hit_points_max: 340,
    attack_bonus: 10,
    damage_min: 111,
    damage_max: 116,
    save_dc: 19
  },
  {
    cr: 19,
    xp: 22e3,
    prof_bonus: 6,
    armor_class: 19,
    hit_points_min: 341,
    hit_points_max: 355,
    attack_bonus: 10,
    damage_min: 117,
    damage_max: 122,
    save_dc: 19
  },
  {
    cr: 20,
    xp: 25e3,
    prof_bonus: 6,
    armor_class: 19,
    hit_points_min: 356,
    hit_points_max: 400,
    attack_bonus: 10,
    damage_min: 123,
    damage_max: 140,
    save_dc: 19
  },
  {
    cr: 21,
    xp: 33e3,
    prof_bonus: 7,
    armor_class: 19,
    hit_points_min: 401,
    hit_points_max: 445,
    attack_bonus: 11,
    damage_min: 141,
    damage_max: 158,
    save_dc: 20
  },
  {
    cr: 22,
    xp: 41e3,
    prof_bonus: 7,
    armor_class: 19,
    hit_points_min: 446,
    hit_points_max: 490,
    attack_bonus: 11,
    damage_min: 159,
    damage_max: 176,
    save_dc: 20
  },
  {
    cr: 23,
    xp: 5e4,
    prof_bonus: 7,
    armor_class: 19,
    hit_points_min: 491,
    hit_points_max: 535,
    attack_bonus: 11,
    damage_min: 177,
    damage_max: 194,
    save_dc: 20
  },
  {
    cr: 24,
    xp: 62e3,
    prof_bonus: 7,
    armor_class: 19,
    hit_points_min: 536,
    hit_points_max: 580,
    attack_bonus: 12,
    damage_min: 195,
    damage_max: 212,
    save_dc: 21
  },
  {
    cr: 25,
    xp: 75e3,
    prof_bonus: 8,
    armor_class: 19,
    hit_points_min: 581,
    hit_points_max: 625,
    attack_bonus: 12,
    damage_min: 213,
    damage_max: 230,
    save_dc: 21
  },
  {
    cr: 26,
    xp: 9e4,
    prof_bonus: 8,
    armor_class: 19,
    hit_points_min: 626,
    hit_points_max: 670,
    attack_bonus: 12,
    damage_min: 231,
    damage_max: 248,
    save_dc: 21
  },
  {
    cr: 27,
    xp: 105e3,
    prof_bonus: 8,
    armor_class: 19,
    hit_points_min: 671,
    hit_points_max: 715,
    attack_bonus: 13,
    damage_min: 249,
    damage_max: 266,
    save_dc: 22
  },
  {
    cr: 28,
    xp: 12e4,
    prof_bonus: 8,
    armor_class: 19,
    hit_points_min: 716,
    hit_points_max: 760,
    attack_bonus: 13,
    damage_min: 267,
    damage_max: 284,
    save_dc: 22
  },
  {
    cr: 29,
    xp: 135e3,
    prof_bonus: 9,
    armor_class: 19,
    hit_points_min: 761,
    hit_points_max: 805,
    attack_bonus: 13,
    damage_min: 285,
    damage_max: 302,
    save_dc: 22
  },
  {
    cr: 30,
    xp: 155e3,
    prof_bonus: 9,
    armor_class: 19,
    hit_points_min: 806,
    hit_points_max: 850,
    attack_bonus: 14,
    damage_min: 303,
    damage_max: 320,
    save_dc: 23
  }
];
const monsterFeatures = {
  // ===== LEGENDARY / MAJOR DEFENSIVE FEATURES (3-4 weight) =====
  "Legendary Resistance": {
    name: "Legendary Resistance",
    weight: 3,
    type: "legendary",
    description: "3/day: +10 HP (CR 1-4), +20 HP (CR 5-10), +30 HP (CR 11+)"
  },
  "Damage Transfer": {
    name: "Damage Transfer",
    weight: 3,
    type: "defensive",
    description: "Transfers damage to another creature, effectively ~2/3 normal HP"
  },
  Possession: {
    name: "Possession",
    weight: 4,
    type: "defensive",
    description: "Can possess other creatures, extremely difficult to kill"
  },
  Rejuvenation: {
    name: "Rejuvenation",
    weight: 4,
    type: "defensive",
    description: "Returns to life after being destroyed unless special condition met"
  },
  // ===== STRONG DEFENSIVE FEATURES (2 weight) =====
  "Magic Resistance": {
    name: "Magic Resistance",
    weight: 2,
    type: "defensive",
    description: "Advantage on saves vs spells, effective +2 AC"
  },
  Regeneration: {
    name: "Regeneration",
    weight: 2,
    type: "defensive",
    description: "Regains HP each round, effective +3x HP per round healed"
  },
  "Superior Invisibility": {
    name: "Superior Invisibility",
    weight: 2,
    type: "defensive",
    description: "Attacks have disadvantage, effective +2 AC"
  },
  Avoidance: {
    name: "Avoidance",
    weight: 2,
    type: "defensive",
    description: "Takes half damage from effects that allow saves"
  },
  Incorporeal: {
    name: "Incorporeal Movement",
    weight: 2,
    type: "defensive",
    description: "Can move through creatures and objects, resistant to nonmagical damage"
  },
  "Reflective Carapace": {
    name: "Reflective Carapace",
    weight: 2,
    type: "defensive",
    description: "Reflects ranged spell attacks back at caster"
  },
  "Spell Turning": {
    name: "Spell Turning",
    weight: 2,
    type: "defensive",
    description: "Has advantage on saves and reflects spells"
  },
  // ===== MODERATE DEFENSIVE FEATURES (1 weight) =====
  "Undead Fortitude": {
    name: "Undead Fortitude",
    weight: 1,
    type: "defensive",
    description: "Can survive lethal damage with successful save"
  },
  Parry: {
    name: "Parry",
    weight: 1,
    type: "defensive",
    description: "Reaction to increase AC against one attack"
  },
  "Shield Block": {
    name: "Shield Block",
    weight: 1,
    type: "defensive",
    description: "Reaction to add AC bonus"
  },
  Evasion: {
    name: "Evasion",
    weight: 1,
    type: "defensive",
    description: "Takes no damage on successful Dex save instead of half"
  },
  "Defensive Duelist": {
    name: "Defensive Duelist",
    weight: 1,
    type: "defensive",
    description: "Add proficiency bonus to AC as reaction"
  },
  "Damage Absorption": {
    name: "Damage Absorption",
    weight: 1,
    type: "defensive",
    description: "Heals from specific damage type instead of taking damage"
  },
  "Reactive Armor": {
    name: "Reactive Armor",
    weight: 1,
    type: "defensive",
    description: "Retaliates when hit"
  },
  // ===== OFFENSIVE FEATURES (1-2 weight) =====
  "Pack Tactics": {
    name: "Pack Tactics",
    weight: 1,
    type: "offensive",
    description: "Advantage on attacks when ally is near, effective +1 attack bonus"
  },
  "Blood Frenzy": {
    name: "Blood Frenzy",
    weight: 1,
    type: "offensive",
    description: "Advantage on attacks against wounded creatures"
  },
  "Martial Advantage": {
    name: "Martial Advantage",
    weight: 1,
    type: "offensive",
    description: "Extra damage once per turn when ally is nearby"
  },
  Pounce: {
    name: "Pounce",
    weight: 1,
    type: "offensive",
    description: "Knock prone and bonus attack after charge"
  },
  Charge: {
    name: "Charge",
    weight: 1,
    type: "offensive",
    description: "Extra damage when moving before attack"
  },
  Flyby: {
    name: "Flyby",
    weight: 1,
    type: "offensive",
    description: "Doesn't provoke opportunity attacks when flying"
  },
  Ambusher: {
    name: "Ambusher",
    weight: 1,
    type: "offensive",
    description: "Advantage on first round, surprise bonus"
  },
  Assassinate: {
    name: "Assassinate",
    weight: 2,
    type: "offensive",
    description: "Automatic critical on surprised creatures"
  },
  Rampage: {
    name: "Rampage",
    weight: 1,
    type: "offensive",
    description: "Bonus action attack after reducing creature to 0 HP"
  },
  Reckless: {
    name: "Reckless",
    weight: 1,
    type: "offensive",
    description: "Advantage on attacks but attacks against have advantage"
  },
  "Death Burst": {
    name: "Death Burst",
    weight: 1,
    type: "offensive",
    description: "Damages nearby creatures on death"
  },
  // ===== UTILITY / MOBILITY FEATURES (0-1 weight) =====
  "Nimble Escape": {
    name: "Nimble Escape",
    weight: 1,
    type: "utility",
    description: "Can Disengage or Hide as bonus action"
  },
  "Shadow Stealth": {
    name: "Shadow Stealth",
    weight: 1,
    type: "utility",
    description: "Can hide in dim light or darkness as bonus action"
  },
  Aggressive: {
    name: "Aggressive",
    weight: 1,
    type: "utility",
    description: "Bonus action to move toward enemy"
  },
  "Keen Senses": {
    name: "Keen Senses",
    weight: 0,
    type: "utility",
    description: "Advantage on Perception checks"
  },
  "Spider Climb": {
    name: "Spider Climb",
    weight: 0,
    type: "utility",
    description: "Can climb difficult surfaces without checks"
  },
  "Web Sense": {
    name: "Web Sense",
    weight: 0,
    type: "utility",
    description: "Knows location of creatures in contact with web"
  },
  "Web Walker": {
    name: "Web Walker",
    weight: 0,
    type: "utility",
    description: "Ignores movement restrictions from webbing"
  },
  Amphibious: {
    name: "Amphibious",
    weight: 0,
    type: "utility",
    description: "Can breathe air and water"
  },
  Tunneler: {
    name: "Tunneler",
    weight: 0,
    type: "utility",
    description: "Can burrow through solid rock"
  },
  "False Appearance": {
    name: "False Appearance",
    weight: 0,
    type: "utility",
    description: "Indistinguishable from normal object when motionless"
  },
  // ===== SITUATIONAL / CONDITIONAL FEATURES (0-1 weight) =====
  "Frightful Presence": {
    name: "Frightful Presence",
    weight: 1,
    type: "utility",
    description: "Can frighten nearby creatures"
  },
  "Horrifying Visage": {
    name: "Horrifying Visage",
    weight: 1,
    type: "utility",
    description: "Can frighten and age creatures that see it"
  },
  Stench: {
    name: "Stench",
    weight: 1,
    type: "utility",
    description: "Nearby creatures must save or be poisoned"
  },
  "Sunlight Sensitivity": {
    name: "Sunlight Sensitivity",
    weight: -1,
    type: "utility",
    description: "Disadvantage in sunlight (negative weight)"
  },
  "Light Sensitivity": {
    name: "Light Sensitivity",
    weight: -1,
    type: "utility",
    description: "Disadvantage in bright light (negative weight)"
  },
  Web: {
    name: "Web",
    weight: 1,
    type: "utility",
    description: "Can restrain creatures with webbing"
  },
  "Hold Breath": {
    name: "Hold Breath",
    weight: 0,
    type: "utility",
    description: "Can hold breath for extended period"
  },
  "Turn Resistance": {
    name: "Turn Resistance",
    weight: 1,
    type: "defensive",
    description: "Advantage on saves against Turn Undead"
  },
  "Turn Immunity": {
    name: "Turn Immunity",
    weight: 1,
    type: "defensive",
    description: "Immune to Turn Undead"
  },
  // ===== SPECIAL WEAPON / ABILITY FEATURES (1 weight) =====
  "Angelic Weapons": {
    name: "Angelic Weapons",
    weight: 1,
    type: "offensive",
    description: "Weapons are magical and deal extra radiant damage"
  },
  "Heated Body": {
    name: "Heated Body",
    weight: 1,
    type: "defensive",
    description: "Damages creatures that touch or hit it"
  },
  "Heated Weapons": {
    name: "Heated Weapons",
    weight: 1,
    type: "offensive",
    description: "Weapons deal extra fire damage"
  },
  Constrict: {
    name: "Constrict",
    weight: 1,
    type: "offensive",
    description: "Grapples and crushes grappled creatures"
  },
  Swallow: {
    name: "Swallow",
    weight: 1,
    type: "offensive",
    description: "Can swallow grappled creatures whole"
  },
  Engulf: {
    name: "Engulf",
    weight: 1,
    type: "offensive",
    description: "Can engulf multiple creatures"
  },
  "Breath Weapon": {
    name: "Breath Weapon",
    weight: 2,
    type: "offensive",
    description: "Powerful area attack (recharge 5-6)"
  },
  Petrification: {
    name: "Petrifying Gaze",
    weight: 2,
    type: "offensive",
    description: "Can turn creatures to stone"
  },
  Enlarge: {
    name: "Enlarge",
    weight: 1,
    type: "utility",
    description: "Can magically increase size and power"
  },
  Relentless: {
    name: "Relentless",
    weight: 1,
    type: "defensive",
    description: "Can survive lethal damage once per rest"
  },
  "Magic Weapons": {
    name: "Magic Weapons",
    weight: 0,
    type: "offensive",
    description: "Weapons count as magical for overcoming resistance (doesn't affect CR)"
  }
};
const { ApplicationV2 } = foundry.applications.api;
const DialogV2 = foundry.applications.api.DialogV2;
class PatreonLink extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "cr-calculator-patreon-link",
    classes: [],
    tag: "div",
    window: {
      title: "Support on Patreon",
      icon: "fab fa-patreon"
    },
    position: { width: 1, height: 1 }
  };
  async _renderHTML() {
    return document.createElement("div");
  }
  _replaceHTML(result, content) {
    content.replaceChildren(result);
  }
  async _onFirstRender(_context, _options) {
    this.element?.style?.setProperty("display", "none");
    await DialogV2.prompt({
      window: { title: "Support on Patreon" },
      content: "<p>Open the Patreon page in a new tab.</p>",
      ok: {
        label: '<i class="fab fa-patreon"></i> Visit Patreon',
        callback: () => {
          window.open("https://www.patreon.com/c/DormanLakely", "_blank", "noopener,noreferrer");
        }
      }
    });
    this.close();
  }
}
class DmGuruLink extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "cr-calculator-dmguru-link",
    classes: [],
    tag: "div",
    window: {
      title: "Dungeon Master Guru",
      icon: "fas fa-dragon"
    },
    position: { width: 1, height: 1 }
  };
  async _renderHTML() {
    return document.createElement("div");
  }
  _replaceHTML(result, content) {
    content.replaceChildren(result);
  }
  async _onFirstRender(_context, _options) {
    this.element?.style?.setProperty("display", "none");
    await DialogV2.prompt({
      window: { title: "Dungeon Master Guru" },
      content: "<p>Open the Dungeon Master Guru site in a new tab.</p>",
      ok: {
        label: '<i class="fas fa-dragon"></i> Visit Dungeon Master Guru',
        callback: () => {
          window.open("https://dungeonmaster.guru", "_blank", "noopener,noreferrer");
        }
      }
    });
    this.close();
  }
}
const version = "2.6.0";
const packageInfo = {
  version
};
const buildNumber = 22;
const buildInfo = {
  buildNumber
};
const MODULE_ID = "fvtt-challenge-calculator";
Hooks.once("init", async function() {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %cv" + packageInfo.version + " %c(build " + buildInfo.buildNumber + ")",
    "color: #d32f2f; font-weight: bold; font-size: 16px;",
    "color: #ff9800; font-weight: bold; font-size: 14px;",
    "color: #ffeb3b; font-weight: normal; font-size: 12px;"
  );
  game.settings.registerMenu(MODULE_ID, "patreonLink", {
    name: "Support on Patreon",
    label: "Visit Patreon",
    hint: "Support the development of this module on Patreon! Your contributions help fund new features and updates.",
    icon: "fab fa-patreon",
    type: PatreonLink,
    restricted: true
  });
  game.settings.registerMenu(MODULE_ID, "dmGuruLink", {
    name: "Dungeon Master Guru",
    label: "Visit Dungeon Master Guru",
    hint: "SRD rules and DM tools. Free resources for Dungeon Masters at dungeonmaster.guru.",
    icon: "fas fa-dragon",
    type: DmGuruLink,
    restricted: true
  });
});
Hooks.once("ready", async function() {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %c✓ Ready!",
    "color: #d32f2f; font-weight: bold; font-size: 16px;",
    "color: #4caf50; font-weight: bold; font-size: 14px;"
  );
  const module = game.modules?.get("fvtt-challenge-calculator");
  if (module) {
    module.api = {
      /**
       * Calculate CR for an actor
       * @param {Actor} actor - The actor to calculate CR for
       * @param {boolean} updateActor - Whether to update the actor's CR field
       * @returns {Promise<CRCalculationResult>} The calculation result
       */
      calculateCRForActor: CRCalculatorService.calculateCRForActor.bind(CRCalculatorService),
      /**
       * Expected stats per CR (2024 Monster Manual) used by the calculation
       * @type {CRBaseline[]}
       */
      crBaselines: CR_BASELINES_2024,
      /**
       * Array of challenge rating data from DMG (2014 reference table)
       * @type {ChallengeRating[]}
       */
      challengeRatings,
      /**
       * Dictionary of monster features with CR weights (deprecated: not used by the calculation)
       * @type {Record<string, MonsterFeature>}
       */
      monsterFeatures,
      /**
       * Get monster feature names as an array
       * @returns {string[]} Array of feature names
       */
      monsterFeatureNames: Object.keys(monsterFeatures)
    };
    console.log(
      "%c⚔️ CR Calculator API %cexposed for external modules",
      "color: #d32f2f; font-weight: bold; font-size: 14px;",
      "color: #2196f3; font-weight: normal; font-size: 12px;"
    );
  }
});
const hookNames = [
  "renderNPCActorSheet",
  // dnd5e 5.x ApplicationV2 NPC sheet
  "renderdnd5e.NPCActorSheet",
  // namespaced variant
  "renderActorSheet5eNPC2",
  // dnd5e 4.x ApplicationV2 NPC sheet
  "renderActorSheet5eNPC",
  // dnd5e ≤3.x legacy sheet
  "renderActorSheet",
  // generic Foundry fallback
  "renderTidy5eNpcSheet",
  // Tidy 5e Classic NPC sheet
  "renderTidy5eNpcSheetQuadrone"
  // Tidy 5e Quadrone NPC sheet
];
function injectCRButton(actor, sheetElement) {
  if (sheetElement.querySelector(".cr-calc-button")) {
    return;
  }
  const windowHeader = sheetElement.querySelector(".window-header");
  if (!windowHeader) return;
  let headerDetails = null;
  let insertMode = "append";
  headerDetails = windowHeader.querySelector(".header-elements");
  if (!headerDetails) {
    const closeBtn = windowHeader.querySelector('button[data-action="close"], .close');
    if (closeBtn) {
      headerDetails = closeBtn;
      insertMode = "before";
    }
  }
  if (!headerDetails) {
    headerDetails = windowHeader;
  }
  if (!headerDetails) {
    headerDetails = sheetElement.querySelector(".header-details.flexrow");
  }
  if (!headerDetails) {
    return;
  }
  const tooltip = game.i18n?.localize("CR-CALC.button-calc") || "Calculate CR";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cr-calc-button";
  button.title = tooltip;
  button.innerHTML = '<i class="fas fa-calculator"></i>&nbsp; CR Calc';
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const result = await CRCalculatorService.calculateCRForActor(actor, false);
      const dialog = new CRCalculatorDialog(result, actor);
      dialog.render(true);
    } catch (error) {
      console.error("Dorman Lakely's CR Calculator | Error calculating CR", error);
      ui.notifications?.error(
        `Error calculating CR: ${error instanceof Error ? error.message : "Unknown error"}`,
        { permanent: true }
      );
    }
  });
  if (insertMode === "before") {
    headerDetails.parentElement?.insertBefore(button, headerDetails);
  } else {
    headerDetails.appendChild(button);
  }
}
function getSheetElement(app, html) {
  let el = html instanceof HTMLElement ? html : html?.[0] || null;
  if (!el?.querySelector?.(".window-header")) {
    const appEl = app.element;
    if (appEl instanceof HTMLElement) {
      el = appEl;
    }
  }
  if (!el?.querySelector?.(".window-header") && el) {
    const windowEl = el.closest(".application") || el.closest(".app");
    if (windowEl instanceof HTMLElement) {
      el = windowEl;
    }
  }
  if (!el?.querySelector?.(".window-header") && app.id) {
    const byId = document.getElementById(`app-${app.id}`) || document.getElementById(app.id) || document.querySelector(`[data-appid="${app.id}"]`);
    if (byId instanceof HTMLElement) {
      el = byId;
    }
  }
  if (!el?.querySelector?.(".window-header")) {
    const actor = app.document || app.object || app.actor;
    if (actor?.name) {
      const allWindows = document.querySelectorAll(".application .window-header .window-title");
      for (const title of allWindows) {
        if (title.textContent?.includes(actor.name)) {
          const windowEl = title.closest(".application");
          if (windowEl instanceof HTMLElement) {
            el = windowEl;
            break;
          }
        }
      }
    }
  }
  return el || null;
}
hookNames.forEach((hookName) => {
  Hooks.on(hookName, (app, html, data) => {
    const actor = getSheetActor(app);
    if (!actor) return;
    const sheetElement = getSheetElement(app, html);
    if (!sheetElement) return;
    injectCRButton(actor, sheetElement);
  });
});
function scanForNPCSheets() {
  const instances = foundry.applications?.instances;
  if (!instances) return;
  for (const app of instances.values()) {
    const actor = getSheetActor(app);
    if (!actor) continue;
    const el = app.element;
    if (!(el instanceof HTMLElement)) continue;
    if (el.querySelector(".cr-calc-button")) continue;
    injectCRButton(actor, el);
  }
  if (ui.windows) {
    for (const app of Object.values(ui.windows)) {
      const actor = getSheetActor(app);
      if (!actor) continue;
      const el = app.element instanceof HTMLElement ? app.element : app.element?.[0];
      if (!(el instanceof HTMLElement)) continue;
      if (el.querySelector(".cr-calc-button")) continue;
      injectCRButton(actor, el);
    }
  }
}
Hooks.once("ready", () => {
  new MutationObserver(() => {
    clearTimeout(window.__crCalcScanTimeout);
    window.__crCalcScanTimeout = setTimeout(scanForNPCSheets, 100);
  }).observe(document.body, { childList: true, subtree: true });
});
//# sourceMappingURL=main.js.map
