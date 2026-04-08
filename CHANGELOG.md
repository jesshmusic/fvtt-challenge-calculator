# Changelog

All notable changes to Dorman Lakely's 5e CR Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.1] - 2026-04-08

### Added

- Branded `dungeonmaster.guru` cross-promotion card in the CR Calculator dialog, using the DM Guru logo and brand palette. Styles live in `styles/module.css` scoped under `.cr-calculator`.

## [2.5.0] - 2026-04-06

### Added

- Foundry VTT v14 compatibility (`compatibility.verified` bumped to `14`). **Minimum Foundry version bumped to 14**. Earlier versions of this module remain available for v13 users from the GitHub releases page; this version is v14-only by design.
- dnd5e 5.x support: spell save DC lookup now reads `actor.system.attributes.spell.level` (the dnd5e 5.x location after data preparation), falling back to `system.details.spellLevel` (dnd5e 4.x) and finally to `system.details.cr`. Spellcasting NPCs no longer silently report a spell save DC of 0 on dnd5e 5.x.
- Render hook list now also tries `renderActorSheet5eNPC` for older dnd5e versions.

### Changed

- Defensive optional chaining around all dnd5e actor system reads (`abilities.*.mod`, `attributes.hp.max`, `attributes.ac.value`, `attributes.spellcasting`, `traits.di/dr/dv.value`). Calculations no longer crash if a field is missing on a partially-prepared actor; they fall back to safe defaults.
- AC reads now fall back through `attributes.ac.value` → `attributes.ac.flat` → `10` so the calculator works against unprepared compendium actors.
- Damage immunity / resistance / vulnerability counting handles both `Set` and `Array` shapes (dnd5e historically used both) and gracefully no-ops when the trait field is undefined.

## [2.4.3] - 2026-03-24

### Added

- Compatibility with Tidy 5e Sheets (including Quadrone layout)
- MutationObserver-based detection for custom NPC sheet modules
- DOM scan using `foundry.applications.instances` for reliable sheet discovery
- CSS support for dark-themed sheet headers

### Fixed

- CR Calc button not appearing on non-standard NPC sheets
- Button placement in sheets that hide `.window-title` elements

## [2.4.2] - 2025-11-06

### Fixed

- Fixed offensive CR calculations to properly include attack and damage bonuses
- Fixed multiattack DPR calculation to correctly multiply modifiers by number of attacks
- Fixed attack bonus display to include proficiency bonus
- Added support for Foundry VTT v13 ActivityCollection damage structure
- Added support for v13 structured damage format (number/denomination) in addition to formula strings
- Fixed ability modifier being applied to weapon base damage
- Added support for additional damage from weapon activities (e.g., poison, fire damage)
- Fixed damage calculation to include all damage parts from feat activities (e.g., Sneak Attack)

## [2.4.1] - 2025-10-31

### Fixed

- Fixed manifest URL placeholder preventing module updates

## [2.4.0] - 2025-10-31

### Added

- Public API exposure for external module integration
- Type exports in `src/types/api.ts` for API consumers
- `calculateCRForActor` method accessible to other modules

### Changed

- Scoped all CSS under `.cr-calculator` prefix for module isolation
- Improved module independence to prevent style conflicts

## [2.3.3] - 2025-10-31

### Fixed

- module compilation error
- workflow tweaks

## [2.3.2] - 2025-10-31

### Fixed

- workflow tweaks
- bump version
- more workflow issues
- workflow issues

## [2.3.1] - 2025-10-31

### Fixed

- more workflow issues
- workflow issues

## [2.3.0] - 2025-10-31

## [2.2.0] - 2025-10-31

### Added

- add comprehensive weighted monster features system
- add comprehensive Jest test suite for CR Calculator

### Fixed

- resolve TypeScript type errors with optional chaining

## [2.1.0] - 2025-10-30

### Added

- add auto-release workflow and release scripts for master branch
- add manual release workflow
- chore: update startup logs to match consistent format with colored version/build numbers, add auto-increment build system

### Changed

- bump version to 2.0.1

## [2.0.1] - 2025-10-30

### Added

- add auto-release workflow and release scripts for master branch
- add manual release workflow
- chore: update startup logs to match consistent format with colored version/build numbers, add auto-increment build system

## [2.0.0] - 2024-10-30

### Major Update - TypeScript Rewrite

**BREAKING CHANGES:**

- Now requires Foundry VTT v13 or higher (dropped support for v11-12)

### Added

- Complete TypeScript rewrite for better type safety and maintainability
- ApplicationV2 dialog showing detailed calculation breakdown
- Separate display of defensive and offensive CR calculations
- Visual breakdown showing:
  - HP, AC, immunities, resistances, vulnerabilities
  - Detected monster features with names
  - Damage per round, attack bonus, number of attacks
  - Detected weapons and attacks
  - Spell save DC for casters
- Modern UI styling matching dnd5e2 sheets
- Comprehensive build system with Vite
- ESLint and Prettier for code quality
- Option to review before applying calculated CR

### Changed

- Renamed module to "Dorman Lakely's 5e CR Calculator"
- CR calculation no longer auto-applies (shows dialog first)
- Improved error handling with detailed error messages
- Better damage parsing logic
- Updated to work with Foundry v13 NPC sheets

### Removed

- jQuery dependency (now uses vanilla JavaScript)
- Automatic CR application (now requires user confirmation)
- Support for Foundry VTT v11-12
- Empty lib.js file

### Fixed

- Better handling of edge cases in damage parsing
- Improved multiattack detection
- More accurate finesse weapon detection
- Fixed issues with spell save DC calculation

## [1.5.0] - 2023-XX-XX

### Added

- Basic CR calculation functionality
- Automatic application to actor
- Simple notification-based results

### Changed

- Support for Foundry VTT v11-12

## [1.0.2] - 2023-XX-XX

### Added

- Initial release
- Basic CR calculation based on DMG guidelines
- Button on NPC sheets
- Auto-updates actor CR field

---

[2.0.0]: https://github.com/jesshmusic/fvtt-challenge-calculator/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/jesshmusic/fvtt-challenge-calculator/compare/v1.0.2...v1.5.0
[1.0.2]: https://github.com/jesshmusic/fvtt-challenge-calculator/releases/tag/v1.0.2
