![](https://img.shields.io/badge/Foundry-v13-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/jesshmusic/fvtt-challenge-calculator/latest/module.zip)

# Dorman Lakely's 5e CR Calculator

A FoundryVTT module that automatically calculates accurate Challenge Ratings for D&D 5e NPCs based on Dungeon Master's Guide guidelines.

![CRCalc-2](https://github.com/jesshmusic/fvtt-challenge-calculator/assets/7180584/ab0e58fc-05f2-44c8-b0fd-9f21d9901bad)

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

## Development

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Watch for changes during development
npm run dev

# Lint and format
npm run lint
npm run format
```

### Project Structure

```
fvtt-challenge-calculator/
├── src/
│   ├── main.ts                      # Entry point, hooks
│   ├── services/
│   │   └── CRCalculatorService.ts   # Core CR calculation logic
│   ├── ui/
│   │   └── CRCalculatorDialog.ts    # ApplicationV2 results dialog
│   └── data/
│       └── crData.ts                # CR tables and monster features
├── templates/
│   └── cr-calculator-results.html   # Dialog template
├── styles/
│   └── module.css                   # Module styles
├── scripts/                         # Build output (generated)
│   └── main.js
└── languages/
    └── en.json                      # Translations
```

## Known Limitations

- Only works with default dnd5e NPC sheets
- Damage parsing may fail on unusual dice expressions (errors are reported to chat)
- Does not account for legendary actions or lair actions
- CR 0 creatures may not calculate accurately due to minimal stats

## Changelog

### 2.0.0 (2024-10-30)

**Major Update - TypeScript Rewrite**

- **BREAKING**: Now requires Foundry VTT v13 or higher
- Renamed to "Dorman Lakely's 5e CR Calculator"
- Complete rewrite in TypeScript
- Added ApplicationV2 dialog showing detailed calculation breakdown
- Improved UI with modern styling matching dnd5e2 sheets
- Better error handling and reporting
- Removed jQuery dependency
- Added comprehensive type safety
- Added separate display of defensive and offensive CR calculations
- Shows detected weapons, monster features, and all modifiers
- Allow review before applying calculated CR

### 1.5.0 and earlier

- Basic CR calculation with automatic application
- Simple notification-based results
- Support for Foundry v11-12

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint:fix && npm run format`
5. Submit a pull request

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
