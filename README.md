![](https://img.shields.io/badge/Foundry-v14-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/jesshmusic/fvtt-challenge-calculator/latest/module.zip)

# Dorman Lakely's 5e CR Calculator

A FoundryVTT module that automatically calculates accurate Challenge Ratings for D&D 5e NPCs based on Dungeon Master's Guide guidelines.

https://github.com/jesshmusic/fvtt-challenge-calculator/raw/master/media/cr-calculator-demo.mov

## Features

- **Automatic CR Calculation**: Click a button on any NPC sheet to calculate their CR
- **Detailed Breakdown Dialog**: View defensive and offensive CR calculations separately
- **DMG Method, 2024 Stats**: Follows the Dungeon Master's Guide CR procedure, measured against the stat baselines of the 2024 Monster Manual (dnd5e 5.x / 6.x)
- **Smart Analysis**:
  - Reads dnd5e activities: attack, save and damage activities, base weapon damage, versatile and finesse weapons, cantrip and upcast scaling
  - Parses Multiattack (including `[[/item ...]]` references), recharge and limited-use abilities, spells cast through Spellcasting, and legendary actions
  - Applies effective HP for physical resistances/immunities and effective AC for Magic Resistance
- **Modern UI**: Beautiful ApplicationV2 dialog with detailed calculation breakdown
- **TypeScript**: Built with TypeScript for reliability and maintainability

## Installation

### From Manifest URL

1. In Foundry VTT, go to "Add-on Modules"
2. Click "Install Module"
3. Paste this manifest URL: `https://github.com/jesshmusic/fvtt-challenge-calculator/releases/latest/download/module.json`

### Manual Installation

1. Download the latest release from [Releases](https://github.com/jesshmusic/fvtt-challenge-calculator/releases)
2. Extract to your `Data/modules` directory
3. Restart Foundry VTT
4. Enable "Dorman Lakely's 5e CR Calculator" in your world

## Usage

1. Open any NPC actor sheet in D&D 5e
2. Click the **"CR Calc"** button in the header
3. Review the detailed calculation breakdown in the dialog
4. Click **"Apply CR"** to update the actor's CR, or **"Cancel"** to close without changes

### What Gets Analyzed

The calculator follows the DMG "Creating a Monster" procedure on the CR ladder (0, 1/8, 1/4, 1/2, 1 ... 30):

**Defensive CR:** the CR whose expected hit points match the monster's effective HP, then one CR step per 4 points of effective AC above or below the expected AC. Resistance or immunity to bludgeoning, piercing or slashing damage raises effective HP by the DMG multipliers for the CR band; Magic Resistance counts as +2 AC.

**Offensive CR:** the CR whose expected damage per round matches the monster's three-round average DPR, then one CR step per 4 points of attack bonus (or save DC, for monsters that deal their damage through saves) above or below expected. DPR uses the best at-will routine (Multiattack or a single action), spends recharge/limited abilities once each when they beat it, and adds bonus-action, start/end-of-turn and legendary-action damage.

**Final CR:** the average of the two, rounded to the nearest CR.

The expected values per CR (`src/data/crBaselines.ts`) are medians of the 504 creatures in the 2024 Monster Manual, not the DMG 2014 table, whose hit points run two to three times higher than published stat blocks. On those 504 creatures the calculated CR matches the listed CR exactly about 54% of the time and is within 1 about 94% of the time (cross-validated).

## Requirements

- **FoundryVTT**: Version 14 or higher
- **D&D 5e System**: Required (this module only works with the dnd5e system)
- **GM Access**: Only Game Masters can see and use the CR Calc button

## Known Limitations

- Control effects without damage (paralysis, charm, banishment) and utility spells are not counted, so control-heavy casters can come out low
- Lair actions are not counted
- Multiattack text is parsed heuristically; unusual phrasing falls back to the best single action

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.

## License

This project is licensed under the MIT License.

## Credits

- **Original Author**: Jess Hendricks
- **CR Tables**: Based on official D&D 5e Dungeon Master's Guide
- **Monster Features List**: From DMG Chapter 9: Creating a Monster

## Support

- **Issues**: [GitHub Issues](https://github.com/jesshmusic/fvtt-challenge-calculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jesshmusic/fvtt-challenge-calculator/discussions)

---

_Note: This module is meant only for D&D 5e. It uses the official Challenge Rating guidelines from the Dungeon Master's Guide to calculate CR based on offensive and defensive statistics._
