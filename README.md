# Sublevel Uprising

A 2D side-scrolling Metroidvania set in a dystopian corporate-controlled city in 2089. You play as **ThreadVessel**, a female hacker who must infiltrate MegaCorp headquarters — both in the physical world and in cyberspace — to expose their secrets and take them down.

Inspired by **Super Metroid** and the cyberpunk aesthetics of **Neuromancer**.

---

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

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Opens the game at `http://localhost:5173` with hot module reloading.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Development Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite dev server (hot reload)   |
| `npm run build`        | Type-check and build for production      |
| `npm run preview`      | Serve the production build locally       |
| `npm run test`         | Run tests once                           |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run lint`         | Lint with oxlint                         |
| `npm run format`       | Format code with oxfmt                   |
| `npm run format:check` | Check formatting without writing changes |
| `npm run validate`     | Run lint + tests                         |

---

## Controls

| Key            | Action                                      |
| -------------- | ------------------------------------------- |
| `← / →`        | Move left / right                           |
| `Ctrl + ← / →` | Run (Dash when tech acquired)               |
| `Space / ↑`    | Jump / Wall-jump / Double-jump / Shinespark |
| `↓`            | Duck                                        |
| `↓ ↓` (quick)  | Ball Mode (when tech acquired)              |
| `Left Shift`   | Fire weapon                                 |
| `A`            | Aim straight up                             |
| `S`            | Aim diagonally up                           |
| `D`            | Aim diagonally down                         |
| `F`            | Aim straight down                           |
| `Tab`          | Cycle weapon                                |
| `Escape`       | Open / close in-game menu                   |
| `Arrow Keys`   | Navigate menus                              |
| `Enter`        | Confirm menu selection                      |

---

## Game Overview

### Two Worlds

- **IRL (Physical World):** Corporate megastructure, city underbelly, server rooms — gritty and industrial.
- **Cyberspace (The Manifold):** A digital realm accessed by jacking in at Computer Terminals — abstract, glitchy, and dangerous.

### Areas

| #   | Area             | World      | Theme                                         |
| --- | ---------------- | ---------- | --------------------------------------------- |
| 1   | The Underworks   | IRL        | Sewer/maintenance tunnels — intro area        |
| 2   | Neon District    | IRL        | Seedy city streets, markets, neon signs — hub |
| 3   | Corp Tower Lower | IRL        | Security floors, labs, offices                |
| 4   | Corp Tower Upper | IRL        | Executive suites, server rooms, rooftop       |
| 5   | Shallow Net      | Cyberspace | Outer Manifold — data streams, firewall mazes |
| 6   | Deep Net         | Cyberspace | Core systems — hostile ICE                    |
| 7   | The Nexus        | Cyberspace | Final zone — corporate AI control             |

### Save System

The game auto-saves at key checkpoints (new area, boss rooms, ability pickups) and supports manual saves from the in-game menu. Three save slots (A, B, C) are stored in `localStorage`.

---

## Project Structure

```
src/
├── main.ts              # Entry point — PixiJS + XState initialization
├── core/                # Core engine (SceneManager)
├── input/               # Keyboard input abstraction (InputManager)
├── save/                # localStorage save system (SaveManager)
├── scenes/              # Application screens (Splash, GameScene, Cinematic, etc.)
└── state/               # Top-level XState app machine (gameMachine)
```

See [DESIGN_DOCUMENT.md](DESIGN_DOCUMENT.md) for the full design specification.

---

## License

This project is a personal/educational work in progress.
