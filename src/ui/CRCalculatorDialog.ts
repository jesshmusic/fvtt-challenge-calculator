import { CRCalculationResult } from '../services/CRCalculatorService.js';

const { ApplicationV2, HandlebarsApplicationMixin } = (foundry as any).applications.api;

/**
 * Dialog displaying detailed CR calculation results using ApplicationV2
 */
export class CRCalculatorDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  private result: CRCalculationResult;
  private actor: any;

  constructor(result: CRCalculationResult, actor: any) {
    super({});
    this.result = result;
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    id: 'cr-calculator-dialog',
    classes: ['cr-calculator', 'dnd5e2', 'sheet'],
    tag: 'div',
    window: {
      title: 'CR Calculator Results',
      icon: 'fas fa-calculator',
      resizable: true,
    },
    position: {
      width: 600,
      height: 'auto' as const,
    },
    actions: {
      apply: CRCalculatorDialog.onApplyCR,
      close: CRCalculatorDialog.onClose,
    },
  };

  static PARTS = {
    form: {
      template: 'modules/fvtt-challenge-calculator/templates/cr-calculator-results.html',
    },
  };

  /**
   * Prepare context data for the Handlebars template
   */
  async _prepareContext(_options: any): Promise<any> {
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
        hasFeatures: result.defensiveBreakdown.monsterFeatures.length > 0,
      },
      offensive: {
        dpr: Math.round(result.offensiveBreakdown.dpr * 10) / 10,
        numAttacks: result.offensiveBreakdown.numAttacks,
        attackBonus: this.formatBonus(result.offensiveBreakdown.attackBonus),
        spellSaveDC: result.offensiveBreakdown.spellSaveDC || null,
        hasSpells: result.offensiveBreakdown.spellSaveDC > 0,
        numFeats: result.offensiveBreakdown.numFeats,
        detectedWeapons: result.offensiveBreakdown.detectedWeapons,
        hasWeapons: result.offensiveBreakdown.detectedWeapons.length > 0,
      },
    };
  }

  /**
   * Format CR value for display (handles fractional CRs)
   */
  private formatCR(cr: number): string {
    if (cr === 0.125) return '1/8';
    if (cr === 0.25) return '1/4';
    if (cr === 0.5) return '1/2';
    return cr.toString();
  }

  /**
   * Format bonus with + or - sign
   */
  private formatBonus(bonus: number): string {
    return bonus >= 0 ? `+${bonus}` : bonus.toString();
  }

  /**
   * Apply the calculated CR to the actor
   */
  static async onApplyCR(
    this: CRCalculatorDialog,
    _event: Event,
    _target: HTMLElement,
  ): Promise<void> {
    await this.actor.update({
      system: {
        details: {
          cr: this.result.calculatedCR,
        },
      },
    });

    ui.notifications?.info(
      `CR updated for ${this.result.actorName} to ${this.result.calculatedCR}`,
      { permanent: false },
    );

    this.close();
  }

  /**
   * Close the dialog without applying
   */
  static async onClose(this: CRCalculatorDialog, _event: Event, _target: HTMLElement): Promise<void> {
    this.close();
  }
}
