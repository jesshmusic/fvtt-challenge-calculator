/**
 * Export NPCs from compendiums in the dataset format read by the offline CR
 * harness (tests/evaluation/harness.ts). Paste into the Foundry console (F12)
 * as a GM, or run as a script macro, after setting PACKS. Downloads
 * cr-dataset.json; evaluate it with
 *
 *   CR_EVAL_DATA=/path/to/cr-dataset.json npm run eval:cr
 *
 * Source data (actor.toObject()) is exported together with the few values
 * dnd5e derives at runtime (HP max, AC, proficiency, spell DC, attack labels
 * and save DCs per activity).
 */
(async () => {
  const PACKS = ['dnd-monster-manual.actors'];
  const rows = [];
  for (const id of PACKS) {
    const pack = game.packs.get(id);
    if (!pack) {
      ui.notifications.warn(`Pack ${id} not found`);
      continue;
    }
    for (const actor of await pack.getDocuments()) {
      if (actor.type !== 'npc') continue;
      const activities = {};
      for (const item of actor.items) {
        for (const activity of item.system.activities ?? []) {
          const label = activity.labels?.toHit;
          const toHit = label ? Number(String(label).replace(/[^\d+-]/g, '')) : undefined;
          const saveDC = activity.save?.dc?.value;
          if (Number.isFinite(toHit) || Number.isFinite(saveDC))
            activities[activity.id] = { toHit, saveDC };
        }
      }
      const { attributes, details } = actor.system;
      rows.push({
        name: actor.name,
        pack: id,
        listedCR: details.cr,
        prepared: {
          hpMax: attributes.hp.max,
          ac: attributes.ac.value,
          prof: attributes.prof,
          spellDC: attributes.spell?.dc,
          activities,
        },
        actor: actor.toObject(),
      });
    }
  }
  const save = foundry.utils.saveDataToFile ?? globalThis.saveDataToFile;
  save(JSON.stringify(rows), 'application/json', 'cr-dataset.json');
  ui.notifications.info(`Exported ${rows.length} NPCs`);
})();
