# Sublevel Uprising — Design Document

## 1. Overview

**Title:** Sublevel Uprising  
**Genre:** Metroidvania / Action-Exploration  
**Platform:** Web (Single Page Application)  
**Inspiration:** Super Metroid (SNES), Neuromancer (William Gibson)  
**Tone:** Serious cyberpunk — gritty, atmospheric, noir-inflected sci-fi

A 2D side-scrolling Metroidvania set in a dystopian corporate-controlled city in 2089. The player controls a female hacker who must infiltrate MegaCorp headquarters — both in the physical world and in cyberspace — to expose their secrets and take them down.

---

## 2. Tech Stack

| Layer                | Technology               |
| -------------------- | ------------------------ |
| Language             | TypeScript (strict mode) |
| Rendering            | PixiJS 8                 |
| State Management     | XState 5                 |
| Level Design         | Tiled (`.tmx` map files) |
| Build Tool           | Vite 8                   |
| Testing              | Vitest 4 + happy-dom     |
| Linting / Formatting | oxlint + oxfmt           |
| Package Manager      | npm                      |

**Target Resolution:** 1920×1080, fullscreen by default. Scales down proportionally on smaller screens.

---

## 3. Application Flow

The entire application is a single-page webapp. The top-level flow is managed by an XState state machine:

```
SplashScreen
  → LoadGame (select slot A / B / C)
    → [New Game] → OpeningCinematic → IntroMission → MainGame
    → [Continue] → MainGame (loaded from save)
  → MainGame
    → InGameMenu (Resume / Save / View Map / Exit Game)
    → VictoryScreen
  → CreditsPage
  → ExitScreen
```

### 3.1 Splash Screen

- Title: **"Sublevel Uprising"**
- Cyberpunk-styled logo with glitch/neon effects
- Options: **New Game**, **Continue**, **Credits**
- Initially silent (audio system will be added later)

### 3.2 Load / Save Slot Screen

- Three save slots: **A**, **B**, **C**
- Each slot displays: area name, play time, completion %, or "Empty"
- Selecting an empty slot starts a new game
- Selecting an occupied slot loads the saved state

### 3.3 Opening Cinematic

- Full-screen cinematic sequence
- **Upper area:** Story text typed out character-by-character in a terminal/monospace font
- **Lower area:** Accompanying visuals (still images, parallax layers, or simple animations)
- Player can press any key / click to skip and proceed directly to the Intro Mission

**Opening text (excerpt):**

> _March 6, 2089. Yesterday, I had no idea my world was going to turn upside down. I was high on the new echelon pills when I went in to the Manifold. I saw something down there that spooked me. It would have spooked anyone. ..._

The full cinematic script will be authored separately. The tone is Neuromancer-esque: first-person, hard-boiled, technologically immersive.

### 3.4 Victory Screen

- Still image with cyberpunk art reflecting the ending
- Stats displayed: **completion %**, **play time**, **items collected**, **abilities found**
- Visual variation based on stats (e.g., different art/text for 100% vs. speedrun vs. casual completion)
- Single attribution line at bottom

### 3.5 Credits Page

- Simple single-screen display (not scrolling)
- Single attribution with project info
- Returns to Splash Screen on dismiss

### 3.6 Exit Screen

- Confirmation / farewell screen when selecting "Exit Game" from the in-game menu

---

## 4. Game World

### 4.1 Dual-World Structure

The game world consists of two parallel spaces:

1. **IRL (Physical World):** The corporate megastructure, city underbelly, rooftops, server rooms, etc.
2. **Cyberspace (The Manifold):** A digital realm accessed by jacking in at Computer Terminals found in certain rooms. Separate map, distinct visual style, different enemy types.

Each world has its own map screen. Jack-in terminals are fixed locations — the player sits in a chair (Matrix-style) to enter cyberspace and returns to the same terminal when jacking out.

### 4.2 Areas / Zones

The full game consists of **5–7 themed areas** spread across both worlds:

| #   | Area (Working Name) | World      | Theme                                                      |
| --- | ------------------- | ---------- | ---------------------------------------------------------- |
| 1   | The Underworks      | IRL        | Sewer/maintenance tunnels beneath the city — intro area    |
| 2   | Neon District       | IRL        | Seedy city streets, markets, neon signs — hub area         |
| 3   | Corp Tower Lower    | IRL        | Corporate security floors, labs, offices                   |
| 4   | Corp Tower Upper    | IRL        | Executive suites, server rooms, rooftop                    |
| 5   | Shallow Net         | Cyberspace | Outer layer of the Manifold — data streams, firewall mazes |
| 6   | Deep Net            | Cyberspace | Core systems — hostile ICE, dangerous architecture         |
| 7   | The Nexus           | Cyberspace | Final zone — seat of corporate AI control                  |

Areas are connected via doors/transitions. Specific zone count and layout will be refined during level design.

### 4.3 Room / Screen Design

- Each area is composed of **discrete rooms** built in Tiled (`.tmx` format)
- Rooms are connected by **doors** (transitions) on a logical grid
- Room transitions use a **scroll/fade animation** (consistent with Super Metroid style)
- Rooms may contain: platforms, hazards, enemies, items, jack-in terminals, save stations, boss arenas
- The map screen shows visited rooms and door connections

### 4.4 Sequence-Breaking Design Philosophy

Maps are intentionally designed to support **sequence breaking** by skilled players:

- Some areas can be reached early through advanced movement tech (wall-jump chains, precise dashing)
- Novice players follow the intended progression by collecting abilities that make traversal easier
- No hard-locks — the game should always be completable regardless of the order abilities are acquired
- Speedrun-friendly: reward creative routing

---

## 5. Player Character

**Name:** ThreadVessel (her IRL name may be revealed on the victory screen for exceptional performance)  
**Description:** A female hacker operating in the city's underworld. Skilled in both physical infiltration and cyberspace navigation.

### 5.1 Movement

| Action              | Input                           | Notes                                                                                |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| Walk left / right   | ← / → Arrow Keys                | Base movement                                                                        |
| Run left / right    | Ctrl + ← / →                    | Faster movement                                                                      |
| Dash                | Ctrl + ← / → (sustained run)    | Requires **Dash Tech** acquisition. Triggers after running for a brief duration      |
| Jump                | Spacebar or ↑                   | Single jump (base). Variable height — short press = low jump, long press = full jump |
| Wall Jump           | Spacebar / ↑ while against wall | Base ability                                                                         |
| Double Jump         | Spacebar / ↑ mid-air            | Requires **Double Jump Tech**                                                        |
| Shinespark (Launch) | Activate while dashing          | Requires **Dash Tech**. Launch in a chosen direction at high speed                   |
| Duck                | ↓                               | Crouch                                                                               |
| Ball Mode           | ↓ ↓ (double-tap down quickly)   | Requires **Ball Tech**. Roll through small gaps                                      |

### 5.2 Combat

| Action            | Input      | Notes                           |
| ----------------- | ---------- | ------------------------------- |
| Fire weapon       | Left Shift | Fires currently selected weapon |
| Cycle weapon      | Tab        | Cycles through unlocked weapons |
| Aim straight up   | A          | Aim weapon straight up          |
| Aim diagonal up   | S          | Aim weapon diagonally upward    |
| Aim diagonal down | D          | Aim weapon diagonally downward  |
| Aim straight down | F          | Aim weapon straight down        |

### 5.3 Menus

| Action            | Input      | Notes            |
| ----------------- | ---------- | ---------------- |
| Open in-game menu | Escape     | Pauses gameplay  |
| Navigate menu     | Arrow Keys | Move selection   |
| Confirm           | Enter      | Select menu item |

**In-Game Menu Options:**

- Resume
- Save (write to current slot)
- View Map (full map display for current world — IRL or Cyberspace)
- Exit Game (return to Splash Screen)

---

## 6. Abilities & Progression

Abilities are discovered as collectible items within the game world. They gate exploration in the classic Metroidvania pattern.

### 6.1 Movement Techs (5–6 total)

| Tech         | Gating Use                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Wall Jump    | Reach higher areas by bouncing between walls (available from start for sequence-breaking potential) |
| Dash         | Run fast, break through certain barriers, activate launch pads                                      |
| Double Jump  | Reach platforms too far for a single jump                                                           |
| Ball Tech    | Roll through narrow passages and tunnels                                                            |
| Grapple Hook | Swing across gaps, latch onto special ceiling points                                                |
| Phase Shift  | Pass through certain walls/barriers (cyberspace-themed)                                             |

_Exact list to be finalized during level design._

### 6.2 Weapons (4–5 weapons beyond starter)

| Weapon       | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| Pulse Pistol | Starting weapon. Rapid fire, low damage. Infinite ammo.       |
| Scatter Shot | Shotgun spread. Consumes ammo.                                |
| Rail Beam    | Piercing long-range beam. Consumes ammo.                      |
| EMP Grenade  | Arc projectile, area damage, disables shields. Consumes ammo. |
| Void Lance   | Powerful charged shot. High ammo cost.                        |

_Weapons are cycled with Left Tab. Ammo is a shared resource (like Super Metroid's missile/super missile model, but unified into a single ammo pool with different consumption rates per weapon)._

### 6.3 Collectibles

| Item           | Effect                                                   |
| -------------- | -------------------------------------------------------- |
| Health Tank    | Increases max HP by one tank                             |
| Ammo Expansion | Increases max ammo capacity                              |
| Ability Pickup | Grants a new movement tech or weapon                     |
| Data Fragment  | Lore / world-building collectible (affects completion %) |

---

## 7. Enemies

### 7.1 Design Philosophy

- Each area introduces **2–3 new enemy types** tuned to that area's theme
- Enemy types: **crawlers** (ground), **flyers** (airborne), **turrets** (stationary), **drones** (patrol patterns)
- Enemies drop health and ammo pickups on defeat
- IRL and Cyberspace have distinct enemy designs (physical security vs. digital ICE constructs)

### 7.2 Intro Mission Enemies

| Enemy          | Behavior                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Crawler        | Moves along floors/walls. Low HP. Contact damage.                                                                                  |
| **Intro Boss** | Single-phase boss. Telegraphed attack patterns (charge, projectile, vulnerability window). Teaches the player combat fundamentals. |

### 7.3 Boss Design (General)

- Each major area has **one boss**
- Bosses have **multiple phases** (except the intro boss — single phase)
- Bosses gate progression: defeating them unlocks a key ability or opens a new area
- Boss rooms have a checkpoint (auto-save) at the door

---

## 8. Intro Mission

The Intro Mission is a focused, linear experience designed to:

1. **Teach movement:** Walking, running, jumping, wall-jumping
2. **Teach combat:** Shooting the Pulse Pistol at crawlers
3. **Build excitement:** Explore a small map (5–10 rooms), encounter the intro boss
4. **Create urgency:** After the boss is defeated, a **self-destruct timer** starts — the player must run back through the rooms to escape before the explosion

**Structure:**

```
Entry → Corridor (movement tutorial)
  → Vertical shaft (jump / wall-jump tutorial)
  → Crawler room (combat tutorial)
  → Optional side room (health tank collectible)
  → Boss antechamber (auto-save)
  → Boss arena (intro boss fight)
  → [Boss defeated] → Self-destruct activated
  → Escape sequence (timed, retrace route)
  → Extraction point → Cinematic transition to Main Game
```

---

## 9. Save System

- **Storage:** `localStorage`
- **Slots:** 3 (A, B, C)
- **Manual Save:** Via in-game menu → Save option
- **Auto-Save Checkpoints:**
  - Entering a new area / zone
  - Entering a boss room (door checkpoint)
  - Defeating a boss
  - Collecting an ability or weapon
  - Collecting ammo expansion or health tank
  - Reaching a save station (dedicated rooms in the map)

**Save Data Contents:**

- Current room and player position
- Current world (IRL / Cyberspace)
- Unlocked abilities and weapons
- Collected items (health tanks, ammo expansions, data fragments)
- Map exploration state (visited rooms)
- Current HP, ammo
- Play time
- Completion %

---

## 10. HUD

The HUD follows the classic Super Metroid layout, re-skinned for cyberpunk aesthetics:

```
┌─────────────────────────────────────────────────────────┐
│ [HEALTH ██████████░░] [AMMO: 045]  [WEAPON: Pulse Pistol] │
│                                              [MINIMAP]  │
│                                              [  ┌──┐ ]  │
│                                              [  │▪ │ ]  │
│                                              [  └──┘ ]  │
│                                                         │
│                    << GAME VIEWPORT >>                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Health:** Energy bar with tank segments. Cyberpunk color scheme (neon cyan / magenta).
- **Ammo:** Numeric display of current ammo / max ammo.
- **Weapon:** Currently selected weapon name/icon.
- **Minimap:** Top-right corner. Shows nearby rooms, current position, door connections.

All HUD elements use cyberpunk-appropriate colors (neon cyan, magenta, dark chrome backgrounds) and fonts (monospace / terminal style).

---

## 11. Map Screen

Accessible via the in-game menu ("View Map"):

- Full-screen room-grid map (like Super Metroid)
- Visited rooms are filled, unvisited rooms adjacent to visited ones are shown as outlines
- Icons for: save stations, boss rooms, item locations (once visited), jack-in terminals
- Separate maps for IRL and Cyberspace — toggle between them
- Player position indicator
- Zoom and pan controls (arrow keys or mouse)

---

## 12. Visual Style

### 12.1 Art Direction

- **Modern HD sprites** — high-resolution character and enemy art
- **Cyberpunk aesthetic:** Neon lighting (cyan, magenta, amber), dark environments, chrome and steel, holographic signage, rain, fog
- **Particle effects:** Sparks, muzzle flashes, explosions, data-stream particles in cyberspace
- **Cyberspace visual distinction:** Wireframe overlays, floating geometry, glitch effects, inverted color palettes, digital noise

### 12.2 Environments

- **IRL:** Grungy industrial, rainy cityscapes, sterile corporate interiors, flickering lights
- **Cyberspace:** Abstract digital geometry, data highways, neon grid floors, floating platforms, hostile programs visualized as geometric constructs

### 12.3 UI / Menus

- Terminal/hacker aesthetic for all menus
- Monospace fonts, scanline effects, CRT curvature optional
- Glitch transitions between screens
- Neon accent colors on dark backgrounds

---

## 13. Audio (Planned)

Audio will be implemented in a later phase. The architecture should account for:

- **Music:** Orchestral score with cyberpunk/synth elements. Per-area tracks. Boss themes.
- **Sound Effects:** Weapon fire, explosions, door transitions, enemy hits/deaths, UI interactions, footsteps, environmental ambience
- **Cyberspace audio:** Distinct soundscape — digital/glitchy versions of IRL sounds

Initial implementation ships **silent**. Audio hooks and an audio manager should be stubbed out in the architecture to make integration seamless later.

---

## 14. State Management (XState)

The game's state is managed through a hierarchy of XState state machines:

### 14.1 Top-Level App Machine

```
idle → splashScreen → slotSelect → [cinematic | mainGame]
mainGame → inGameMenu → [resume | save | viewMap | exitGame]
mainGame → victoryScreen → credits → splashScreen
```

### 14.2 Game World Machine

```
exploring → roomTransition → exploring
exploring → combat → exploring
exploring → bossEncounter → [victory | defeat]
exploring → jackIn → cyberspace.exploring
cyberspace.exploring → jackOut → exploring
```

### 14.3 Player Machine

```
idle → walking → running → dashing
idle → jumping → [doubleJumping | wallJumping | falling]
idle → ducking → ballMode
any → firing (parallel state)
any → takingDamage → [alive | dead]
```

### 14.4 Intro Mission Machine

```
start → exploration → bossEncounter → escapeSequence → complete
escapeSequence has: timer (parallel) counting down
```

---

## 15. Architecture Overview

```
src/
├── main.ts                  # Entry point — initializes PixiJS, XState, game loop
├── app/
│   ├── appMachine.ts        # Top-level XState app machine
│   ├── screens/
│   │   ├── SplashScreen.ts
│   │   ├── SlotSelect.ts
│   │   ├── Cinematic.ts
│   │   ├── VictoryScreen.ts
│   │   ├── CreditsScreen.ts
│   │   └── ExitScreen.ts
│   └── ui/
│       ├── HUD.ts
│       ├── Minimap.ts
│       ├── InGameMenu.ts
│       └── MapScreen.ts
├── game/
│   ├── gameMachine.ts       # Game world XState machine
│   ├── Game.ts              # Core game loop, scene management
│   ├── Camera.ts            # Viewport / camera follow
│   ├── Room.ts              # Room loading, rendering, collision
│   ├── RoomTransition.ts    # Scroll/fade transitions
│   └── physics/
│       ├── Physics.ts       # Simple 2D physics (gravity, collision)
│       └── CollisionMap.ts  # Tilemap collision data
├── player/
│   ├── playerMachine.ts     # Player XState machine
│   ├── Player.ts            # Player entity — rendering, animation
│   ├── PlayerController.ts  # Input → player actions
│   └── abilities/
│       ├── Dash.ts
│       ├── DoubleJump.ts
│       ├── BallMode.ts
│       ├── GrappleHook.ts
│       └── PhaseShift.ts
├── weapons/
│   ├── Weapon.ts            # Base weapon class
│   ├── PulsePistol.ts
│   ├── ScatterShot.ts
│   ├── RailBeam.ts
│   ├── EMPGrenade.ts
│   └── VoidLance.ts
├── enemies/
│   ├── Enemy.ts             # Base enemy class
│   ├── Crawler.ts
│   ├── Flyer.ts
│   ├── Turret.ts
│   ├── Drone.ts
│   └── bosses/
│       ├── Boss.ts          # Base boss class
│       └── IntroBoss.ts
├── items/
│   ├── HealthTank.ts
│   ├── AmmoExpansion.ts
│   ├── AbilityPickup.ts
│   └── DataFragment.ts
├── maps/
│   ├── MapManager.ts        # Loads/manages Tiled .tmx maps
│   ├── TiledLoader.ts       # Parses .tmx files into game data
│   └── tmx/                 # Tiled map files (committed to repo)
├── save/
│   ├── SaveManager.ts       # localStorage read/write, slot management
│   └── SaveData.ts          # Save data type definitions
├── input/
│   └── InputManager.ts      # Keyboard input abstraction
├── audio/
│   └── AudioManager.ts      # Stubbed audio manager (silent initially)
├── utils/
│   ├── constants.ts         # Game-wide constants (resolution, physics, timing)
│   └── types.ts             # Shared type definitions
└── assets/
    ├── sprites/             # Character, enemy, item sprite sheets
    ├── tilesets/            # Tileset images for Tiled maps
    ├── ui/                  # HUD elements, menu backgrounds
    └── cinematics/          # Cinematic images / frames
```

---

## 16. Development Phases

### Phase 1 — Foundation

- Project scaffolding (Vite, TS, PixiJS, XState) ✅
- Input manager (keyboard handling)
- Basic game loop (PixiJS ticker)
- App state machine (splash → slot select → game)
- Splash screen, slot select screen

### Phase 2 — Player & Physics

- Player entity with sprite rendering
- Physics system (gravity, ground collision, wall collision)
- Movement: walk, run, jump, wall-jump
- Camera follow
- Single test room loaded from Tiled `.tmx`

### Phase 3 — Combat & Enemies

- Pulse Pistol (basic weapon firing)
- Projectile system
- Crawler enemy (AI, collision, health, death)
- Player damage / health system
- HUD (health bar, ammo, weapon display)

### Phase 4 — Intro Mission

- Design and build intro mission rooms in Tiled (5–10 rooms)
- Room transitions (scroll/fade)
- Intro boss (single-phase)
- Escape sequence with countdown timer
- Auto-save at boss door checkpoint

### Phase 5 — Core Systems

- Save/load system (localStorage, 3 slots)
- In-game menu (Resume, Save, Map, Exit)
- Map screen (room grid, visited tracking)
- Minimap (HUD element)
- Ability pickup system
- Weapon cycling

### Phase 6 — Abilities & Weapons

- Implement all movement techs (Dash, Double Jump, Ball, Grapple Hook, Phase Shift)
- Implement all weapons (Scatter Shot, Rail Beam, EMP Grenade, Void Lance)
- Ability-gated door/barrier types

### Phase 7 — Main Game World

- Design and build 5–7 areas in Tiled
- IRL areas: Underworks, Neon District, Corp Tower Lower, Corp Tower Upper
- Cyberspace areas: Shallow Net, Deep Net, The Nexus
- Jack-in terminal mechanic
- Area bosses (multi-phase)
- Item placement and sequence-break route planning

### Phase 8 — Cinematics & Narrative

- Opening cinematic (typewriter text + visuals)
- Story beats between areas
- Data Fragment lore content
- Victory screen (art variations based on stats)
- Credits screen

### Phase 9 — Audio

- Integrate audio manager with game events
- Compose / source orchestral tracks per area
- Sound effects for weapons, enemies, UI, environment
- Cyberspace audio treatment

### Phase 10 — Polish & Release

- Particle effects (muzzle flash, explosions, sparks, data streams)
- Screen shake, hit-stop, juice
- Performance optimization
- Cross-browser testing
- Accessibility considerations (rebindable keys, colorblind options)
- Final balancing pass

---

## 17. Controls Reference (Quick Card)

| Key                | Action                                                             |
| ------------------ | ------------------------------------------------------------------ |
| ← / →              | Move left / right                                                  |
| Ctrl + ← / →       | Run (dash when tech acquired)                                      |
| Spacebar / ↑       | Jump / Wall-jump / Double-jump / Shinespark (variable jump height) |
| ↓                  | Duck                                                               |
| ↓ ↓ (quick)        | Ball Mode (when tech acquired)                                     |
| Left Shift         | Fire weapon                                                        |
| A                  | Aim straight up                                                    |
| S                  | Aim diagonally up                                                  |
| D                  | Aim diagonally down                                                |
| F                  | Aim straight down                                                  |
| Tab                | Cycle weapon                                                       |
| Escape             | In-game menu                                                       |
| Arrow Keys + Enter | Navigate menus                                                     |

---

## 18. Open Questions

- [x] Protagonist name — **ThreadVessel**
- [ ] Full opening cinematic script
- [ ] Exact number of rooms per area
- [ ] Ammo economy balancing (consumption rates, drop rates)
- [ ] Boss designs for main game areas
- [ ] Specific sequence-break routes to design for
- [ ] Cyberspace-specific mechanics (different physics? hacking minigames?)
- [ ] Tiled tileset art pipeline and sprite dimensions
- [ ] Victory screen art variations — how many tiers?
- [ ] Controller / gamepad support (future consideration?)
