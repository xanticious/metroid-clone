# Sublevel Uprising — Copilot Instructions

## Project Overview

Sublevel Uprising is a 2D Metroidvania / action-exploration game built as a single-page web application. The player controls a female hacker infiltrating a corporate megastructure across both the physical world and cyberspace. Inspired by Super Metroid and Neuromancer.

See `DESIGN_DOCUMENT.md` for the full game design specification.

## Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Language           | TypeScript (strict mode) |
| Rendering          | PixiJS 8                 |
| State Management   | XState 5                 |
| Level Design       | Tiled (`.tmx` map files) |
| Build Tool         | Vite 8                   |
| Testing            | Vitest 4 + happy-dom     |
| Linting/Formatting | oxlint + oxfmt           |
| Package Manager    | npm                      |

Target resolution: 1920×1080, fullscreen by default.

## Code Conventions

- **Use comments sparingly.** Code should be self-documenting through clear naming. Only add comments where the logic isn't self-evident.
- **DRY (Don't Repeat Yourself).** Extract shared logic into reusable functions or modules. Avoid copy-pasting code.
- **Clean code.** Keep functions small and focused. Use descriptive names for variables, functions, and classes. Prefer readability over cleverness.
- **No over-engineering.** Only build what's needed now. Don't add abstractions, configurability, or error handling for hypothetical future scenarios.
- **Strict TypeScript.** The project uses `strict: true`. Always provide proper types — avoid `any`.
- **ES modules.** The project uses ESM (`"type": "module"`). Use `import`/`export` syntax, not `require`.
- **Barrel exports.** Each module folder has an `index.ts` that re-exports its public API.

## Library Documentation

Before writing code that uses any library (PixiJS, XState, Vite, Vitest, etc.), use context7 to look up current documentation. Do not rely on memorized API knowledge — these libraries update frequently and APIs may have changed.

## Testing

- Tests use Vitest 4 with happy-dom environment.
- Test files live alongside source files with a `.test.ts` suffix.
- Run tests: `npm test` (single run) or `npm run test:watch` (watch mode).

## Linting & Formatting

- Lint: `npm run lint` (oxlint with type-aware rules)
- Format: `npm run format` (oxfmt)
- Validate: `npm run validate` (lint + test)

## Project Structure

```
src/
  main.ts          — Entry point
  types.ts         — Shared type definitions
  core/            — SceneManager, core game loop
  input/           — Keyboard input abstraction
  save/            — localStorage save/load, slot management
  scenes/          — Scene implementations (Splash, Game, Pause, etc.)
  state/           — XState state machines
```
