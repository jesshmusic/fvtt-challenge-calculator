# Changelog

All notable changes to Dorman Lakely's 5e CR Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
