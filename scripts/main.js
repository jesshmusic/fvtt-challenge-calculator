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
    damage_min: 0,
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
    damage_min: 0,
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
    damage_min: 0,
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
    save_dc: 18
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
    attack_bonus: 11,
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
    hit_points_min: 760,
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
    hit_points_min: 805,
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
class CRCalculatorService {
  static ID = "fvtt-challenge-calculator";
  static FLAGS = {
    TODOS: "cr-calc"
  };
  /**
   * Calculate CR for an actor and optionally update it
   * @param actor The actor document
   * @param updateActor Whether to update the actor's CR
   * @returns The calculation result
   */
  static async calculateCRForActor(actor, updateActor = true) {
    const data = {
      actor,
      items: Array.from(actor.items)
    };
    const defensiveResult = this.calculateDefensiveCR(actor, data);
    const offensiveResult = this.calculateOffensiveCR(actor, data);
    let rawCR = (offensiveResult.cr + defensiveResult.cr) / 2;
    if (rawCR > 0 && rawCR < 0.1875) {
      rawCR = 0.125;
    } else if (rawCR >= 0.1875 && rawCR < 0.5) {
      rawCR = 0.25;
    } else if (rawCR >= 0.5 && rawCR < 1) {
      rawCR = 0.5;
    } else if (rawCR >= 1 && rawCR < 1.5) {
      rawCR = 1;
    }
    const cRating = rawCR > 1 ? Math.round(rawCR) : rawCR;
    const finalCR = cRating >= 0 ? cRating : 0;
    if (updateActor) {
      await actor.update({
        system: {
          details: {
            cr: finalCR
          }
        }
      });
      ui.notifications?.info(
        `CR updated for ${actor.name} to ${finalCR}, Offensive CR: ${offensiveResult.cr}, Defensive CR: ${defensiveResult.cr}`,
        { permanent: false }
      );
    }
    return {
      actorName: actor.name,
      originalCR: actor.system.details.cr,
      calculatedCR: finalCR,
      defensiveCR: defensiveResult.cr,
      offensiveCR: offensiveResult.cr,
      defensiveBreakdown: defensiveResult.breakdown,
      offensiveBreakdown: offensiveResult.breakdown
    };
  }
  /**
   * Calculate offensive CR based on damage output and attack bonuses
   */
  static calculateOffensiveCR(actor, data) {
    let spellSaveDC = 0;
    if (actor.system.attributes.spellcasting && actor.system.attributes.spellcasting !== "") {
      const castingAbilityMod = actor.system.abilities[actor.system.attributes.spellcasting].mod;
      const spellLevelCR = challengeRatings.find(
        (crObj) => crObj.cr === actor.system.details.spellLevel
      );
      if (spellLevelCR) {
        spellSaveDC = 8 + castingAbilityMod + spellLevelCR.prof_bonus;
      }
    }
    const numFeats = data.items.filter((item) => item.type === "feat").length;
    const featsBonus = numFeats > 0 ? numFeats / 3 : 0;
    let damageBonus = actor.system.abilities.str.mod;
    let numAttacks = 1;
    let attackBonus = actor.system.abilities.str.mod;
    const damageCalc = this.calculateDamagePerRound(
      data,
      numAttacks,
      actor,
      attackBonus,
      damageBonus
    );
    numAttacks = damageCalc.numAttacks;
    attackBonus = damageCalc.attackBonus;
    const dpr = damageCalc.dpr;
    let attackBonusCR = 0;
    let spellCastingCR = 0;
    challengeRatings.forEach((chall) => {
      if (dpr >= chall.damage_min && dpr <= chall.damage_max) {
        const attBonusMod = (attackBonus + chall.prof_bonus - chall.attack_bonus) / 2;
        attackBonusCR = chall.cr + attBonusMod + featsBonus;
      }
      if (spellSaveDC === chall.save_dc && spellCastingCR === 0) {
        spellCastingCR = chall.cr + featsBonus;
      }
    });
    const detectedWeapons = data.items.filter(
      (item) => item.system.damage && item.system.damage.base && item.system.damage.base.formula
    ).map((item) => item.name);
    return {
      cr: Math.max(attackBonusCR, spellCastingCR),
      breakdown: {
        dpr,
        numAttacks,
        attackBonus,
        spellSaveDC,
        numFeats,
        detectedWeapons
      }
    };
  }
  /**
   * Calculate damage per round from actor's weapons and attacks
   */
  static calculateDamagePerRound(data, numAttacks, actor, attackBonus, damageBonus) {
    const multiAttackItem = data.items.find((item) => {
      if (item.name === "Multiattack") {
        const descValue = item.system.description?.value || item.system.description || "";
        const multiAttackDesc = descValue.replace("two", "2").replace("three", "3").replace("four", "4").replace("five", "5").replace("six", "6").replace("seven", "7").replace("eight", "8");
        const multiRegex = /^[^\d]*(\d+)/g;
        const result = multiRegex.exec(multiAttackDesc);
        if (result && result.length > 1 && result[1]) {
          numAttacks = parseInt(result[1]);
        }
        return true;
      }
      return false;
    });
    const isMulti = !!multiAttackItem;
    let damagesArray = [];
    const offensiveItems = data.items.filter(
      (item) => item.system.damage && item.system.damage.base && item.system.damage.base.formula
    );
    offensiveItems.forEach((item) => {
      try {
        const damages = [];
        if (item.system.damage.base && item.system.damage.base.formula) {
          damages.push([item.system.damage.base.formula, item.system.damage.base.types?.[0] || ""]);
        }
        if (item.system.damage.versatile && item.system.damage.versatile.formula) {
          damages.push([
            item.system.damage.versatile.formula,
            item.system.damage.versatile.types?.[0] || ""
          ]);
        }
        const hasFinesseProperty = item.system.properties instanceof Set ? item.system.properties.has("fin") : "fin" in (item.system.properties || {});
        const atkBonus = hasFinesseProperty && actor.system.abilities.dex.mod > actor.system.abilities.str.mod ? actor.system.abilities.dex.mod : attackBonus;
        attackBonus = atkBonus > attackBonus ? atkBonus : attackBonus;
        const dmgBonus = hasFinesseProperty && actor.system.abilities.dex.mod > actor.system.abilities.str.mod ? actor.system.abilities.dex.mod : damageBonus;
        damageBonus = dmgBonus > damageBonus ? dmgBonus : damageBonus;
        const isFeat = item.type === "feat";
        if (damages.length > 0) {
          let dprResult = 0;
          damages.forEach((dam) => {
            if (dam.length > 0) {
              const diceRegex = /(\d*)[dD](\d*)(([+*-](?:\d+|\@mod|\([a-zA-Z]*\)))*)(\[+-](\d*))?/gm;
              const dieStr = dam[0].replace(/\s/g, "").replace(/\[.*\]/g, "");
              const damageDice = diceRegex.exec(dieStr);
              const useDiceMod = dieStr.includes("@mod");
              if (damageDice && damageDice.length > 4) {
                const diceNum = damageDice[1] === "" ? 1 : parseInt(damageDice[1]);
                const diceValue = damageDice[2] === "" ? 1 : parseInt(damageDice[2]);
                const diceModifier = damageDice[4] && damageDice[4] !== "+@mod" ? parseInt(damageDice[4]) : 0;
                if (diceModifier + attackBonus > attackBonus) {
                  attackBonus = diceModifier + attackBonus;
                }
                const baseDam = isMulti && !isFeat ? diceNum * diceValue / 2 * numAttacks : diceNum * diceValue / 2;
                dprResult += baseDam + diceModifier;
                if (useDiceMod) {
                  dprResult += damageBonus;
                }
              }
            }
          });
          damagesArray.push(dprResult);
        }
      } catch (e) {
        console.error(e);
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content: `<h3 style="color: red;">Challenge Rating Calculator - ERROR</h3>
                <h4>Error calculating Item Damage for <strong>"${item.name}"</strong></h4>
                <p><code>${e}</code></p>
                <p>Please report errors <a href="https://github.com/jesshmusic/fvtt-challenge-calculator/issues">here</a> with a screenshot of this message. </p>`,
          whisper: [game.user?.id].filter(Boolean)
        });
        ui.notifications?.error(`Error calculating Item Damage for "${item.name}": ${e}`, {
          permanent: true
        });
      }
    });
    damagesArray = damagesArray.sort((a, b) => b - a);
    if (damagesArray.length > 2) {
      damagesArray = damagesArray.slice(0, 3);
    }
    const dpr = damagesArray.length > 0 ? damagesArray.reduce((a, b) => a + b) / damagesArray.length : 0;
    return { numAttacks, attackBonus, dpr };
  }
  /**
   * Calculate defensive CR based on HP, AC, and defensive abilities
   */
  static calculateDefensiveCR(actor, data) {
    const immunBonus = actor.system.traits.di.value.size * 2;
    const resistBonus = actor.system.traits.dr.value.size;
    const vulnPenalty = -1 * actor.system.traits.dv.value.size;
    const detectedMonsterFeatures = data.items.filter((item) => monsterFeatures[item.name]).map((item) => item.name);
    const monsterFeatureWeight = detectedMonsterFeatures.reduce(
      (total, featureName) => {
        const feature = monsterFeatures[featureName];
        if (feature && (feature.type === "defensive" || feature.type === "utility" || feature.type === "legendary")) {
          return total + feature.weight;
        }
        return total;
      },
      0
    );
    const monsterFeatureBonus = monsterFeatureWeight / 4;
    const ac = actor.system.attributes.ac.value;
    const hp = actor.system.attributes.hp.max;
    let defensiveCR = 0;
    challengeRatings.forEach((chall) => {
      if (hp >= chall.hit_points_min && hp <= chall.hit_points_max) {
        const attBonusMod = (ac - chall.armor_class) / 2;
        defensiveCR = chall.cr + attBonusMod + immunBonus + resistBonus + vulnPenalty + monsterFeatureBonus;
      }
    });
    return {
      cr: defensiveCR,
      breakdown: {
        hp,
        ac,
        immunities: actor.system.traits.di.value.size,
        resistances: actor.system.traits.dr.value.size,
        vulnerabilities: actor.system.traits.dv.value.size,
        monsterFeatures: detectedMonsterFeatures
      }
    };
  }
}
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
class CRCalculatorDialog extends HandlebarsApplicationMixin(ApplicationV2) {
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
        numFeats: result.offensiveBreakdown.numFeats,
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
const version = "2.3.3";
const packageInfo = {
  version
};
const buildNumber = 4;
const buildInfo = {
  buildNumber
};
const shouldShowCRButton = (actorObject) => {
  if (actorObject.type === "npc") {
    if ((!actorObject.flags || Object.keys(actorObject.flags).length === 0) && (game.user?.isGM || game.user?.isTheGM)) {
      return true;
    } else if ((!actorObject.flags.core?.sheetClass || actorObject.flags.core.sheetClass === "" || actorObject.flags.core.sheetClass === "dnd5e.ActorSheet5eNPC" || actorObject.flags.core.sheetClass === "dnd5e.ActorSheet5eNPC2") && game.user?.isGM) {
      return true;
    }
  }
  return false;
};
Hooks.once("init", async function() {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %cv" + packageInfo.version + " %c(build " + buildInfo.buildNumber + ")",
    "color: #d32f2f; font-weight: bold; font-size: 16px;",
    "color: #ff9800; font-weight: bold; font-size: 14px;",
    "color: #ffeb3b; font-weight: normal; font-size: 12px;"
  );
});
Hooks.once("ready", async function() {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %c✓ Ready!",
    "color: #d32f2f; font-weight: bold; font-size: 16px;",
    "color: #4caf50; font-weight: bold; font-size: 14px;"
  );
});
const hookNames = [
  "renderNPCActorSheet",
  // v13 ApplicationV2 name
  "renderdnd5e.NPCActorSheet",
  // With module prefix
  "renderActorSheet5eNPC2",
  // Legacy name
  "renderActorSheet"
  // v12 fallback
];
hookNames.forEach((hookName) => {
  Hooks.on(hookName, (app, html, data) => {
    const actor = app.document || app.object || app.actor;
    if (!actor) {
      return;
    }
    if (!shouldShowCRButton(actor)) {
      return;
    }
    const sheetElement = html instanceof HTMLElement ? html : html[0];
    if (!sheetElement) {
      return;
    }
    let headerDetails = sheetElement.querySelector(".window-header .header-elements");
    if (!headerDetails) {
      headerDetails = sheetElement.querySelector(".header-details.flexrow");
    }
    if (!headerDetails) {
      return;
    }
    if (headerDetails.querySelector(".cr-calc-button")) {
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
        console.error("CR Calculator: Error calculating CR", error);
        ui.notifications?.error(
          `Error calculating CR: ${error instanceof Error ? error.message : "Unknown error"}`,
          { permanent: true }
        );
      }
    });
    headerDetails.appendChild(button);
  });
});
//# sourceMappingURL=main.js.map
