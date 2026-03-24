![](https://img.shields.io/badge/Foundry-v13-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/jesshmusic/fvtt-challenge-calculator/latest/module.zip)

# Dorman Lakely's 5e CR Calculator

A FoundryVTT module that automatically calculates accurate Challenge Ratings for D&D 5e NPCs based on Dungeon Master's Guide guidelines.

https://github.com/jesshmusic/fvtt-challenge-calculator/raw/master/media/cr-calculator-demo.mov

## Features

- **Automatic CR Calculation**: Click a button on any NPC sheet to calculate their CR
- **Detailed Breakdown Dialog**: View defensive and offensive CR calculations separately
- **DMG-Accurate**: Uses official Challenge Rating tables from the Dungeon Master's Guide
- **Smart Analysis**:
  - Analyzes HP, AC, damage immunities, resistances, and vulnerabilities
  - Detects multiattack and calculates damage per round
  - Recognizes special monster features (Pack Tactics, Magic Resistance, etc.)
  - Handles finesse weapons and spellcasting
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

**Defensive CR:**

- Hit Points
- Armor Class
- Damage Immunities (×2 bonus each)
- Damage Resistances (×1 bonus each)
- Damage Vulnerabilities (-1 penalty each)
- Special monster features (from DMG list)

**Offensive CR:**

- Damage per round from all weapons/attacks
- Number of attacks (detects Multiattack)
- Attack bonus
- Spell save DC (for spellcasters)
- Number of feats (bonus scaling)
- Finesse weapon detection (uses DEX if higher than STR)

## Requirements

- **FoundryVTT**: Version 13 or higher
- **D&D 5e System**: Required (this module only works with the dnd5e system)
- **GM Access**: Only Game Masters can see and use the CR Calc button

## Known Limitations

- Damage parsing may fail on unusual dice expressions (errors are reported to chat)
- Does not account for legendary actions or lair actions
- CR 0 creatures may not calculate accurately due to minimal stats

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
