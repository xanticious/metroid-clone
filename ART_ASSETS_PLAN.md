# Sublevel Uprising — Art Assets Plan

## Assumptions & Conventions

| Setting | Value | Notes |
|---|---|---|
| Tile size | 32×32 px | All Tiled maps use this grid |
| Player sprite | 48×80 px | ~1.5×2.5 tiles; readable at 1920×1080 |
| Small enemy sprite | 48×48 px | ~1.5×1.5 tiles |
| Medium enemy sprite | 64×64 px | ~2×2 tiles |
| Boss sprite | 128×128 px (phase varies) | Per-boss; see boss section |
| Spritesheet format | PNG, horizontal strip or grid | Power-of-2 dimensions preferred |
| Manifold ThreadVessel | Full visual redesign | Separate spritesheets — distinct neon/wireframe aesthetic, same animation states |
| Shooting | Composited arm overlay | One arm sheet covers all movement states: run+shoot, jump+shoot, etc. |
| Diagonal jump | Separate animations | Distinct lean-angle frames from straight-up jump |

---

## Shooting System Note

Shooting uses a **2-layer composite approach**. The body spritesheet plays whatever movement animation is active (run, jump, wall-slide, crouching, etc.), and a small arm/weapon overlay sprite is composited on top at a fixed anchor point. This means:

- `run + shoot` = running body frames + arm overlay → no extra art needed
- `jump + shoot` = jump body frames + arm overlay → no extra art needed
- `crouch + shoot` = crouch body frames + arm overlay → no extra art needed

This covers all shoot-while-moving and shoot-while-airborne states without a combinatorial explosion of frames.

---

## Phase 1–4 Prototype Essentials

Assets marked ✅ are required to ship the intro mission. Everything else can be colored-rectangle placeholders until the relevant phase.

---

## 1. Player Character — ThreadVessel (IRL)

All animations use **48×80 px** frames. Animations face right; engine mirrors horizontally for face-left.

### 1.1 Body Animations

`sprites/player/threadvessel_body.png`

| Animation | Frames | Phase | Notes |
|---|---|---|---|
| Idle | 6 | ✅ | Subtle breathing, hair/coat move |
| Walk | 8 | ✅ | Full gait cycle |
| Run | 8 | ✅ | Leaning forward, faster gait |
| Dash | 5 | Phase 6 | Startup (2) + motion-blur hold (3) |
| Jump rise (straight) | 3 | ✅ | Launch, mid-ascent, apex — used when jumping from standstill |
| Jump fall (straight) | 3 | ✅ | Apex-to-fall, falling, pre-land anticipation |
| Jump rise (diagonal) | 3 | ✅ | Body leans forward in direction of travel; ascending |
| Jump fall (diagonal) | 3 | ✅ | Same lean; descending |
| Land | 2 | ✅ | Impact + recover (plays once, non-looping) |
| Wall slide | 3 | ✅ | Contact, hold, push-off ready |
| Wall jump | 3 | ✅ | Push-off burst (plays once, then transitions to diagonal jump rise) |
| Double jump | 4 | Phase 6 | Mid-air burst/flip (plays once, then back to rise/fall) |
| Crouch | 2 | ✅ | Upright → crouch (hold on frame 2) |
| Crouch walk | 6 | Phase 5 | Walk while crouched |
| Ball roll | 6 | Phase 6 | Full rotation loop (Ball Tech) |
| Grapple launch | 3 | Phase 6 | Hook-throw arm swing |
| Grapple swing | 4 | Phase 6 | Body hangs + pendulum rock |
| Take damage | 4 | ✅ | Recoil flash, knock-back |
| Death | 10 | ✅ | Collapse sequence |

**Total body frames: ~90**  
Suggested sheet: 10 columns × 9 rows at 48×80 px → **480×720 px**

---

### 1.2 Arm / Weapon Overlay

`sprites/player/threadvessel_arm.png`

Composited on top of the body animation. Scale/anchor point defined in code. Covers 5 aim directions. Automatically handles run+shoot, jump+shoot, crouch+shoot, etc. — the overlay is engine-composited over whatever body state is active.

| Direction | Frames | Phase | Notes |
|---|---|---|---|
| Aim forward | 4 | ✅ | At-rest, shoot flash, recoil, return |
| Aim up | 4 | ✅ | Straight up |
| Aim diagonal up | 4 | ✅ | ~45° upward |
| Aim diagonal down | 4 | ✅ | ~45° downward (primary airborne option) |
| Aim down | 4 | ✅ | Straight down (used when airborne) |

**Total arm frames: 20**  
Suggested sheet: 5 columns × 4 rows at 32×40 px → **160×160 px**

---

## 2. Player Character — ThreadVessel (The Manifold / Cyberspace)

Full visual redesign. Same animation states as IRL, but completely different art:
- Neon wireframe body silhouette (cyan/magenta lines on transparent)
- Glitch-offset duplicate ghost on damage frames
- Data-stream particle trail on run and dash
- Should read as the same character but clearly digital/alien

`sprites/player/threadvessel_manifold_body.png`  
`sprites/player/threadvessel_manifold_arm.png`

**Phase: Phase 7** (needed when Cyberspace areas are built)

| Animation | Frames | Notes |
|---|---|---|
| Idle | 6 | Subtle data flicker, scanline pulse |
| Walk | 8 | Same gait, neon edge trail |
| Run | 8 | Motion streak effect on edges |
| Dash | 5 | Heavy glitch/smear frames |
| Jump rise (straight) | 3 | |
| Jump fall (straight) | 3 | |
| Jump rise (diagonal) | 3 | |
| Jump fall (diagonal) | 3 | |
| Land | 2 | Data-burst on impact |
| Wall slide | 3 | |
| Wall jump | 3 | |
| Double jump | 4 | Digital burst instead of physical flip |
| Phase Shift (pass through wall) | 6 | Exclusive to Manifold — dissolve/reform in 3 frames each |
| Crouch | 2 | |
| Crouch walk | 6 | |
| Ball roll | 6 | Rolling sphere of digital energy |
| Grapple launch | 3 | Energy tether instead of physical hook |
| Grapple swing | 4 | |
| Take damage | 4 | Glitch corruption effect |
| Death | 10 | Pixelate-and-scatter, not a physical collapse |

**Total Manifold body frames: ~96**  
**Arm overlay:** Same 5-direction / 4-frame layout as IRL arm sheet, redrawn in Manifold aesthetic.  
Suggested sheets: Same dimensions as IRL body/arm sheets.

---

## 3. Enemies

### 3.1 Crawler

First introduced: **Intro Mission — Crawler Room**  
Also present in: The Underworks

`sprites/enemies/crawler.png`  
**Sprite size:** 48×32 px (wide and low — ground-hugging creeper)

| Animation | Frames | Notes |
|---|---|---|
| Idle | 4 | Slight antenna twitch |
| Walk | 8 | Segmented leg scuttle |
| Attack | 5 | Lunge / bite |
| Take damage | 3 | Flash |
| Death | 8 | Collapse + dissolve |

**Total: 28 frames** — Sheet: 8×4 at 48×32 px → **384×128 px**

---

### 3.2 Flyer

First introduced: **The Underworks**  
Also present in: Neon District, Cyberspace areas (recolored)

`sprites/enemies/flyer.png`  
**Sprite size:** 48×48 px

| Animation | Frames | Notes |
|---|---|---|
| Fly idle | 6 | Wing-flap hover |
| Fly move | 6 | Faster wing cycle; body leans toward direction of travel |
| Attack dive | 6 | Wind-up, dive, pull-up |
| Take damage | 3 | Flash |
| Death | 8 | Spin fall + splat |

**Total: 29 frames** — Sheet: 8×4 at 48×48 px → **384×192 px**

---

### 3.3 Turret (Stationary)

First introduced: **Corp Tower Lower**  
Also present in: Corp Tower Upper

`sprites/enemies/turret.png`  
**Sprite size:** 48×48 px

| Animation | Frames | Notes |
|---|---|---|
| Idle (dormant) | 2 | Slow blink |
| Alert | 5 | Powers up; barrel tracks player |
| Shoot | 4 | Barrel flash + recoil cycle |
| Take damage | 3 | Flash |
| Death | 6 | Spark + explosion |

**Total: 20 frames** — Sheet: 5×4 at 48×48 px → **240×192 px**

---

### 3.4 Drone (Patrol)

First introduced: **Corp Tower Lower**  
Also present in: Corp Tower Upper, Shallow Net (recolored)

`sprites/enemies/drone.png`  
**Sprite size:** 64×48 px

| Animation | Frames | Notes |
|---|---|---|
| Fly | 6 | Thruster loop |
| Alert | 4 | Sensor sweep light |
| Attack charge | 4 | Wind-up for ram or beam |
| Attack | 4 | Ram / beam fire |
| Take damage | 3 | Flash |
| Death | 8 | Thruster failure, spin, explode |

**Total: 29 frames** — Sheet: 8×4 at 64×48 px → **512×192 px**

---

### 3.5 Manifold Shard (Cyberspace exclusive)

First introduced: **Shallow Net** — Phase 7

`sprites/enemies/manifold_shard.png`  
**Sprite size:** 32×32 px — fast-moving geometric fragment

| Animation | Frames | Notes |
|---|---|---|
| Idle spin | 4 | Rotating polygon |
| Move | 4 | Faster spin + motion smear |
| Attack | 4 | Acceleration burst toward player |
| Take damage | 3 | Crack / fragment |
| Death | 6 | Shatter into pixels |

**Total: 21 frames** — Sheet: 6×4 at 32×32 px → **192×128 px**

---

### 3.6 Manifold Sentinel (Cyberspace exclusive)

First introduced: **Deep Net** — Phase 7

`sprites/enemies/manifold_sentinel.png`  
**Sprite size:** 48×48 px — patrol ICE program

| Animation | Frames | Notes |
|---|---|---|
| Idle | 4 | Slow oscillation |
| Patrol | 6 | Hovering glide |
| Alert | 4 | Scan pulse |
| Attack | 6 | Beam charge + fire |
| Take damage | 3 | Corruption glitch |
| Death | 8 | Dissolve / decompile |

**Total: 31 frames** — Sheet: 8×4 at 48×48 px → **384×192 px**

---

### 3.7 Manifold Corruption (Cyberspace exclusive)

First introduced: **Deep Net** — Phase 7  
Area-denial blob; slow, absorbs shots

`sprites/enemies/manifold_corruption.png`  
**Sprite size:** 64×64 px

| Animation | Frames | Notes |
|---|---|---|
| Idle pulse | 6 | Pulsing blob shape |
| Move ooze | 6 | Sluggish flow |
| Attack | 5 | Spike-lunge |
| Take damage | 3 | Partial dissolve |
| Death | 8 | Full dissolve |

**Total: 28 frames** — Sheet: 8×4 at 64×64 px → **512×256 px**

---

## 4. Bosses

### 4.1 Intro Boss

Location: **Intro Mission — Boss Arena**  
Single phase. Teaches: dodge timing, vulnerability windows, basic shooting.

`sprites/bosses/intro_boss.png` — Phase ✅  
**Sprite size:** 128×128 px

| Animation | Frames | Notes |
|---|---|---|
| Idle | 6 | Menacing breathing / settle |
| Charge wind-up | 6 | Clear telegraph — lean back, then launch |
| Charge rush | 5 | Horizontal blur across arena |
| Charge recover | 4 | Overshoot stumble |
| Projectile wind-up | 5 | Aim/charge gesture |
| Projectile fire | 4 | Recoil + recovery |
| Stagger (vulnerability) | 4 | Stunned and open; player damage window |
| Take damage | 4 | Hit flash |
| Death | 14 | Multi-stage: stagger → explosion → collapse |

**Total: ~52 frames**  
Suggested sheet: 8×7 at 128×128 px → **1024×896 px**

---

### 4.2 Underworks Boss — Phase 7

`sprites/bosses/underworks_boss.png` — **128×128 px, 2 phases**

- Phase 1 (~40 frames): Aggressive crawler-type; charge + projectile attacks
- Phase 2 (~45 frames): Enraged — faster, new attack pattern, cracked carapace, exposed core

---

### 4.3 Neon District Boss — Phase 7

`sprites/bosses/neon_boss.png` — **160×160 px, 2 phases**

- Phase 1 (~45 frames): Human-scale cybernetically enhanced enforcer
- Phase 2 (~50 frames): Augments fully deployed — arm cannons, jump jets

---

### 4.4 Corp Tower Boss — Phase 7

`sprites/bosses/corp_boss.png` — **192×192 px, 3 phases**

- Phase 1 (~40 frames): Corporate security mech; methodical patterns
- Phase 2 (~50 frames): Mech damaged, more aggressive, erratic
- Phase 3 (~55 frames): Core exposed, final desperate state

---

### 4.5 Shallow Net Boss — Phase 7

`sprites/bosses/shallow_net_boss.png` — **128×128 px, 2 phases**

- Phase 1 (~40 frames): ICE guardian; sweeping beam and barrier attacks
- Phase 2 (~45 frames): Corrupted form; attacks become unpredictable

---

### 4.6 Deep Net Boss — Phase 7

`sprites/bosses/deep_net_boss.png` — **160×160 px, 3 phases**

Each phase is a distinct geometric form that must be attacked differently. ~45 frames per phase.

---

### 4.7 The Nexus Final Boss — Phase 7

`sprites/bosses/nexus_boss.png` — **256×256 px, 3 phases**

The corporate AI in its true form. Highly distinct visual per phase. ~60 frames per phase.

---

## 5. Weapons & Projectiles

All projectiles grouped on one atlas.

`sprites/weapons/projectiles.png` — **256×256 px atlas**

| Projectile | Frames | Size | Phase | Notes |
|---|---|---|---|---|
| Pulse Pistol bolt | 4 | 16×8 px | ✅ | Looping energy bolt |
| Scatter Shot pellet | 2 | 8×8 px | Phase 6 | Simple oval, fired in spread pattern |
| Rail Beam | 3 | 6×128 px | Phase 6 | Thin strip; stretch horizontally in code |
| EMP Grenade (arc) | 4 | 16×16 px | Phase 6 | Spinning in-flight |
| EMP Grenade (blast) | 8 | 48×48 px | Phase 6 | Area burst |
| Void Lance charge | 6 | 24×24 px | Phase 6 | Build-up glow on player muzzle before fire |
| Void Lance bolt | 5 | 40×14 px | Phase 6 | Heavy charged projectile |
| Generic enemy bolt | 4 | 12×12 px | ✅ | Reused for turrets, basic enemies |
| Intro Boss projectile | 5 | 24×24 px | ✅ | Visually distinct from generic bolt |

---

## 6. Items & Pickups

`sprites/items/items.png` — **256×128 px packed atlas**

| Item | Frames | Size | Phase | Notes |
|---|---|---|---|---|
| Health Tank | 4 | 24×24 px | ✅ | Glowing pulse loop |
| Ammo Expansion | 4 | 24×24 px | Phase 5 | |
| Ability Pickup | 6 | 32×32 px | Phase 5 | Brighter, rotating glow |
| Data Fragment | 4 | 16×16 px | Phase 7 | Small holographic chip |
| Health drop (small) | 2 | 12×12 px | ✅ | Crawler/enemy drops |
| Health drop (large) | 2 | 16×16 px | ✅ | Boss drops |
| Ammo drop | 2 | 12×12 px | Phase 3 | |

---

## 7. Environment & Tilesets

All tilesets use **32×32 px** tiles. A 512×512 px sheet holds 256 tiles. Plan for:
- ~80–120 terrain/structural tile variants per area
- ~40–60 decoration tiles (props, background detail)
- ~20–30 interactive tiles (doors, platforms, terminals, save stations)

### 7.1 Shared Tilesets

| File | Size | Phase | Contents |
|---|---|---|---|
| `tilesets/shared_irl.png` | 512×256 px | ✅ | Doors, transition frames, platforms, ladders, save station chair, jack-in terminal |
| `tilesets/shared_cyber.png` | 512×256 px | Phase 7 | Cyberspace doors, data pads, jack-out terminals |

### 7.2 Intro Mission / Underworks

`tilesets/underworks.png` — **512×512 px** — Phase ✅

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 80 | Dark concrete, rusted steel, dirt/rock floor, dripping pipes, cracked walls |
| Decoration | 40 | Puddles, hanging cables, graffiti, crates, old barrels |
| Interactive | 20 | Grates, pressure doors, ventilation shafts |

### 7.3 Neon District

`tilesets/neon_district.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 90 | Wet street tiles, building facades, fire escapes, chain-link |
| Decoration | 50 | Neon sign tiles, market stall canopies, rain puddles, vendor crates |
| Interactive | 20 | Alley doors, market entrances |

### 7.4 Corp Tower Lower

`tilesets/corp_lower.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 85 | Polished tile floors, concrete walls, drop ceilings, lab benches |
| Decoration | 45 | Security cameras, non-interactive terminals, vents, signage |
| Interactive | 25 | Keycard doors, security checkpoints, locked vents |

### 7.5 Corp Tower Upper

`tilesets/corp_upper.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 80 | Marble/glass flooring, server rack walls, rooftop gravel, skylights |
| Decoration | 45 | Executive furniture, server LEDs, city-view windows |
| Interactive | 20 | Executive vault doors, server access terminals |

### 7.6 Shallow Net

`tilesets/shallow_net.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 80 | Neon grid floors, data-stream channel walls, glowing blue edges |
| Decoration | 40 | Floating data packets, firewall barrier tiles, signal towers |
| Interactive | 20 | Firewall gates, data conduit entrances |

### 7.7 Deep Net

`tilesets/deep_net.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 85 | Fractured dark geometry, corrupted tiles, hostile architecture |
| Decoration | 45 | Glitch artifacts, broken data constructs, viral code tendrils |
| Interactive | 20 | ICE barriers, corrupted terminal fragments |

### 7.8 The Nexus

`tilesets/nexus.png` — **512×512 px** — Phase 7

| Category | Tile count | Examples |
|---|---|---|
| Terrain | 80 | Crystalline AI architecture, fractal platforms, energy conduits |
| Decoration | 40 | AI core fragments, data lattice scaffolding |
| Interactive | 20 | AI core access panels, final gate tiles |

---

## 8. Area-by-Area Asset Breakdown

### 8.1 Intro Mission (~6 rooms)

```
Room 1: Entry corridor          — movement tutorial (walk, run)
Room 2: Vertical shaft          — jump / wall-jump tutorial
Room 3: Crawler room            — combat tutorial (shoot)
Room 4: Side room (optional)    — health tank collectible
Room 5: Boss antechamber        — auto-save point
Room 6: Boss arena              — intro boss fight → self-destruct trigger
```

**Tilesets used:** `underworks.png`, `shared_irl.png`  
**Enemies:** Crawler  
**Boss:** Intro Boss  
**Items:** Health Tank  
**New UI:** Save station, boss health bar, escape countdown timer

---

### 8.2 Area 1 — The Underworks (~15–20 rooms)

The first full explorable area after the intro. Connects to the Neon District hub.

```
Room 1:   Entry — transition from Intro Mission extraction point
Room 2–6: Horizontal exploration corridors
Room 7–9: Vertical climbing shafts
Room 10–12: Flooded sub-sections (wade obstacles)
Room 13–14: Hidden alcoves (health tank, ammo expansion)
Room 15:  Miniboss room
Room 16:  Save station
Room 17:  Boss antechamber (auto-save)
Room 18:  Boss arena
Room 19:  Post-boss transition / ability pickup room
```

**Tilesets used:** `underworks.png`, `shared_irl.png`  
**New enemies:** Flyer  
**Boss:** Underworks Boss  
**New pickups:** Ammo Expansion, Ability Pickup (first movement tech)

---

### 8.3 Area 2 — Neon District (~15–20 rooms)

Hub area. Multiple branching paths. Access to Corp Tower and back to Underworks.

```
Room 1–5:  Street-level exterior traversal
Room 6–9:  Building interiors (shops, safehouses, hideouts)
Room 10–12: Rooftop parkour sections
Room 13–14: Underground passage toward Corp Tower
Room 15–16: Vendor / NPC rooms (safe zones)
Room 17:   Save station
Room 18:   Boss antechamber
Room 19:   Boss arena
Room 20:   Post-boss unlock room (new area gate opens)
```

**Tilesets used:** `neon_district.png`, `shared_irl.png`  
**Boss:** Neon District Boss  
**Backgrounds:** Neon District parallax set (3 files)

---

### 8.4 Area 3 — Corp Tower Lower (~15–20 rooms)

Security-themed. Turrets and Drones introduced.

```
Room 1–4:  Security checkpoint gauntlets
Room 5–8:  Lab/research wing
Room 9–11: Server farm maze
Room 12–13: Vertical elevator shafts
Room 14–15: Locked-off section (requires ability from Area 2)
Room 16:   Save station
Room 17:   Boss antechamber
Room 18:   Boss arena
Room 19:   Progression gate (elevator to upper tower)
```

**Tilesets used:** `corp_lower.png`, `shared_irl.png`  
**New enemies:** Turret, Drone  
**Boss:** Corp Tower Boss (Phase 1 + 2 of 3)

---

### 8.5 Area 4 — Corp Tower Upper (~12–15 rooms)

Smaller and intense. Leads to rooftop and the first jack-in terminal gateway to Cyberspace.

```
Room 1–4:  Executive suite traversal
Room 5–7:  Server room core
Room 8–10: Rooftop exterior section
Room 11:   Jack-in terminal room (transition to Shallow Net)
Room 12:   Save station
Room 13:   Boss antechamber
Room 14:   Boss arena (Corp Tower Boss Phase 3)
Room 15:   Post-boss unlock — Cyberspace gate permanently open
```

**Tilesets used:** `corp_upper.png`, `shared_irl.png`  
**Boss:** Corp Tower Boss (Phase 3)

---

### 8.6 Area 5 — Shallow Net (~12–15 rooms)

First Cyberspace area. ThreadVessel Manifold sprites required here.

```
Room 1:   Jack-in arrival room
Room 2–5: Data stream corridors
Room 6–8: Firewall puzzle sections
Room 9–11: Platform traversal above data voids
Room 12:  Save station
Room 13:  Boss antechamber
Room 14:  Boss arena
Room 15:  Jack-out return room + ability unlock
```

**Tilesets used:** `shallow_net.png`, `shared_cyber.png`  
**New sprites:** ThreadVessel Manifold body + arm  
**New enemies:** Manifold Shard  
**Boss:** Shallow Net Boss  
**Backgrounds:** Shallow Net parallax set (3 files)

---

### 8.7 Area 6 — Deep Net (~12–15 rooms)

Hostile, corrupted Cyberspace. All Manifold enemy types present.

```
Room 1–4:  Corrupted corridor traversal
Room 5–7:  Hostile data structures (navigation puzzle)
Room 8–10: ICE gauntlet rooms
Room 11:   Save station
Room 12:   Boss antechamber
Room 13:   Boss arena
Room 14:   Progression unlock toward Nexus
```

**Tilesets used:** `deep_net.png`, `shared_cyber.png`  
**New enemies:** Manifold Sentinel, Manifold Corruption  
**Boss:** Deep Net Boss  
**Backgrounds:** Deep Net parallax set (3 files)

---

### 8.8 Area 7 — The Nexus (~8–10 rooms)

Final zone. Linear and intense. No optional rooms.

```
Room 1–3:  Approach corridors — AI architecture
Room 4–5:  Core system access — high difficulty traversal
Room 6:    Save station (last chance)
Room 7:    Pre-boss buffer room
Room 8:    Final Boss arena (3 phases)
Room 9:    Ending sequence / extraction cinematic trigger
```

**Tilesets used:** `nexus.png`, `shared_cyber.png`  
**Boss:** Nexus Final Boss (all 3 phases)  
**Backgrounds:** Nexus parallax set (3 files)  
**Triggers:** Victory screen, credits

---

## 9. Backgrounds & Parallax Layers

Each area: 3 scrolling layers at different scroll speeds. All files: **1920×1080 px PNG**.

| File | Phase | Speed | Notes |
|---|---|---|---|
| `backgrounds/underworks_bg_far.png` | ✅ | 0.1× | Distant tunnel darkness, faint city silhouette above |
| `backgrounds/underworks_bg_mid.png` | ✅ | 0.3× | Rusted pipe clusters, dripping water streaks |
| `backgrounds/underworks_bg_near.png` | ✅ | 0.6× | Foreground cables, grilles, condensation |
| `backgrounds/neon_district_bg_far.png` | Phase 7 | 0.1× | Distant skyscrapers, rain haze |
| `backgrounds/neon_district_bg_mid.png` | Phase 7 | 0.3× | Neon sign glow, mid-ground buildings |
| `backgrounds/neon_district_bg_near.png` | Phase 7 | 0.6× | Foreground rain streaks, close signage |
| `backgrounds/corp_lower_bg_far.png` | Phase 7 | 0.1× | Corporate atrium view, distant floors |
| `backgrounds/corp_lower_bg_mid.png` | Phase 7 | 0.3× | Office cubicles behind glass |
| `backgrounds/corp_lower_bg_near.png` | Phase 7 | 0.6× | Foreground security panels |
| `backgrounds/corp_upper_bg_far.png` | Phase 7 | 0.1× | City panorama high-up |
| `backgrounds/corp_upper_bg_mid.png` | Phase 7 | 0.3× | Server rack arrays |
| `backgrounds/corp_upper_bg_near.png` | Phase 7 | 0.6× | Glass walls, foreground hardware |
| `backgrounds/shallow_net_bg_far.png` | Phase 7 | 0.1× | Infinite dark digital void |
| `backgrounds/shallow_net_bg_mid.png` | Phase 7 | 0.3× | Distant data streams, grid horizon |
| `backgrounds/shallow_net_bg_near.png` | Phase 7 | 0.6× | Floating data packets |
| `backgrounds/deep_net_bg_far.png` | Phase 7 | 0.1× | Corrupted data void |
| `backgrounds/deep_net_bg_mid.png` | Phase 7 | 0.3× | Fractal corruption structures |
| `backgrounds/deep_net_bg_near.png` | Phase 7 | 0.6× | Foreground corrupted geometry |
| `backgrounds/nexus_bg_far.png` | Phase 7 | 0.1× | AI core light emanation |
| `backgrounds/nexus_bg_mid.png` | Phase 7 | 0.3× | Crystalline scaffold mid-ground |
| `backgrounds/nexus_bg_near.png` | Phase 7 | 0.6× | Energy conduit foreground |

---

## 10. HUD Elements

| File | Size | Phase | Notes |
|---|---|---|---|
| `ui/hud_health_frame.png` | 300×36 px | ✅ | Chrome border, cyberpunk styling |
| `ui/hud_health_fill.png` | 276×20 px | ✅ | Neon cyan gradient |
| `ui/hud_health_tank.png` | 32×20 px | ✅ | Per-tank segment indicator |
| `ui/hud_ammo_frame.png` | 120×36 px | Phase 3 | Frame for ammo numeric display |
| `ui/hud_weapon_icons.png` | 192×32 px (6 × 32×32 icons) | Phase 3 | One icon per weapon, horizontal strip |
| `ui/hud_minimap_frame.png` | 160×120 px | Phase 5 | Chrome border + dark background |
| `ui/hud_minimap_tiles.png` | 80×8 px (10 × 8×8 tiles) | Phase 5 | Visited, unvisited, boss, save, item, current-pos variants |
| `ui/boss_health_frame.png` | 640×24 px | ✅ | Bottom-screen boss bar frame |
| `ui/boss_health_fill.png` | 620×12 px | ✅ | Magenta fill |

---

## 11. UI / Menus

| File | Size | Phase | Notes |
|---|---|---|---|
| `ui/logo.png` | 800×200 px | ✅ | "Sublevel Uprising" glitch neon logo |
| `ui/splash_bg.png` | 1920×1080 px | ✅ | Cyberpunk cityscape splash background |
| `ui/menu_panel.png` | 480×600 px | ✅ | Semi-transparent dark panel, chrome border |
| `ui/menu_cursor.png` | 24×24 px | ✅ | Neon bracket or arrow cursor |
| `ui/save_slot.png` | 400×100 px | ✅ | Single slot display frame |
| `ui/map_frame.png` | 1920×1080 px | Phase 5 | Full-screen map overlay chrome border |
| `ui/map_tiles.png` | 128×8 px (16 × 8×8 tiles) | Phase 5 | Room types: normal, boss, save, item, jack-in, current-pos, unvisited |
| `ui/escape_timer_frame.png` | 240×48 px | Phase 4 | Frame for countdown display in escape sequence |
| `ui/fade_overlay.png` | 1×1 px black | ✅ | Scale to screen for fade/transition effects |

---

## 12. Fonts

| Font | Usage | Phase |
|---|---|---|
| Monospace terminal (e.g. "Share Tech Mono" or "VT323" — OFL licensed) | All HUD numbers, menu text, cinematic typing | ✅ |

Load as WOFF2 web font. The typewriter effect in the opening cinematic is applied in code — no separate font needed.

---

## 13. Particle Effects

Particle systems are driven by code (PixiJS particles). These small sheets are the source textures:

| File | Frame size | Frames | Phase | Notes |
|---|---|---|---|---|
| `sprites/particles/dust.png` | 16×16 px | 4 | ✅ | Landing impact, dash start |
| `sprites/particles/muzzle_flash.png` | 24×24 px | 4 | ✅ | Plays at weapon barrel on fire |
| `sprites/particles/hit_flash.png` | 16×16 px | 3 | ✅ | On-hit indicator for any entity |
| `sprites/particles/spark.png` | 8×8 px | 4 | Phase 3 | Weapon impact on walls, electricity |
| `sprites/particles/explosion.png` | 32×32 px | 8 | Phase 3 | Enemy death, boss hits |
| `sprites/particles/data_stream.png` | 4×16 px | 4 | Phase 7 | Cyberspace ambient particle |
| `sprites/particles/glitch_fragment.png` | 8×8 px | 4 | Phase 7 | Manifold hit/death debris |

---

## 14. Cinematic Assets

Text is rendered in code; these supply the background visuals for the opening cinematic (bottom-half of screen) and the full-screen victory images.

| File | Size | Phase | Notes |
|---|---|---|---|
| `cinematics/opening_01.png` | 1920×540 px | Phase 8 | Scene 1 backdrop |
| `cinematics/opening_02.png` | 1920×540 px | Phase 8 | Scene 2 |
| `cinematics/opening_03.png` | 1920×540 px | Phase 8 | Scene 3 (add more as script requires) |
| `cinematics/victory_low.png` | 1920×1080 px | Phase 8 | Below 40% completion tier |
| `cinematics/victory_normal.png` | 1920×1080 px | Phase 8 | 40–80% completion tier |
| `cinematics/victory_full.png` | 1920×1080 px | Phase 8 | 100% completion |
| `cinematics/victory_speed.png` | 1920×1080 px | Phase 8 | Speedrun tier |

---

## 15. Recommended Folder Structure

```
assets/
  sprites/
    player/
      threadvessel_body.png           ← Phase 1 ✅
      threadvessel_arm.png            ← Phase 1 ✅
      threadvessel_manifold_body.png  ← Phase 7
      threadvessel_manifold_arm.png   ← Phase 7
    enemies/
      crawler.png                     ← Phase 1 ✅
      flyer.png                       ← Phase 2
      turret.png                      ← Phase 7 (Corp Tower)
      drone.png                       ← Phase 7 (Corp Tower)
      manifold_shard.png              ← Phase 7
      manifold_sentinel.png           ← Phase 7
      manifold_corruption.png         ← Phase 7
    bosses/
      intro_boss.png                  ← Phase 4 ✅
      underworks_boss.png             ← Phase 7
      neon_boss.png                   ← Phase 7
      corp_boss.png                   ← Phase 7
      shallow_net_boss.png            ← Phase 7
      deep_net_boss.png               ← Phase 7
      nexus_boss.png                  ← Phase 7
    weapons/
      projectiles.png                 ← Phase 3 ✅ (Pulse bolt + enemy bolt only initially)
    items/
      items.png                       ← Phase 4 ✅ (health tank + drops only initially)
    particles/
      dust.png                        ← Phase 1 ✅
      muzzle_flash.png                ← Phase 3 ✅
      hit_flash.png                   ← Phase 3 ✅
      spark.png                       ← Phase 3
      explosion.png                   ← Phase 3
      data_stream.png                 ← Phase 7
      glitch_fragment.png             ← Phase 7
  tilesets/
    shared_irl.png                    ← Phase 1 ✅
    underworks.png                    ← Phase 1 ✅
    shared_cyber.png                  ← Phase 7
    neon_district.png                 ← Phase 7
    corp_lower.png                    ← Phase 7
    corp_upper.png                    ← Phase 7
    shallow_net.png                   ← Phase 7
    deep_net.png                      ← Phase 7
    nexus.png                         ← Phase 7
  backgrounds/
    underworks_bg_far.png             ← Phase 1 ✅
    underworks_bg_mid.png             ← Phase 1 ✅
    underworks_bg_near.png            ← Phase 1 ✅
    [area]_bg_far.png                 ← Phase 7 (per area)
    [area]_bg_mid.png
    [area]_bg_near.png
  ui/
    logo.png                          ← Phase 1 ✅
    splash_bg.png                     ← Phase 1 ✅
    menu_panel.png                    ← Phase 1 ✅
    menu_cursor.png                   ← Phase 1 ✅
    save_slot.png                     ← Phase 1 ✅
    fade_overlay.png                  ← Phase 1 ✅
    boss_health_frame.png             ← Phase 4 ✅
    boss_health_fill.png              ← Phase 4 ✅
    escape_timer_frame.png            ← Phase 4 ✅
    hud_health_frame.png              ← Phase 3 ✅
    hud_health_fill.png               ← Phase 3 ✅
    hud_health_tank.png               ← Phase 3 ✅
    hud_ammo_frame.png                ← Phase 3
    hud_weapon_icons.png              ← Phase 3
    hud_minimap_frame.png             ← Phase 5
    hud_minimap_tiles.png             ← Phase 5
    map_frame.png                     ← Phase 5
    map_tiles.png                     ← Phase 5
  cinematics/
    opening_01.png                    ← Phase 8
    opening_02.png                    ← Phase 8
    opening_03.png                    ← Phase 8
    victory_low.png                   ← Phase 8
    victory_normal.png                ← Phase 8
    victory_full.png                  ← Phase 8
    victory_speed.png                 ← Phase 8
  fonts/
    terminal.woff2                    ← Phase 1 ✅
```

---

## 16. Summary Totals

| Category | Files | Approx total frames |
|---|---|---|
| ThreadVessel IRL body | 1 | ~90 |
| ThreadVessel IRL arm | 1 | 20 |
| ThreadVessel Manifold body | 1 | ~96 |
| ThreadVessel Manifold arm | 1 | 20 |
| IRL enemies (4 types) | 4 | ~106 |
| Manifold enemies (3 types) | 3 | ~80 |
| Bosses — Intro + 6 area bosses (multi-phase) | 7 files | ~620 |
| Projectiles | 1 atlas | ~46 |
| Items | 1 atlas | ~24 |
| Tilesets | 9 | ~2,000 tiles |
| Backgrounds | 21 | — |
| HUD elements | 9 | — |
| UI / menus | 9 | — |
| Particle sources | 7 | ~31 |
| Cinematic backgrounds | 7 | — |

**Prototype-critical total (Phases 1–4):** ~280 frames across 6 spritesheets + underworks/shared tilesets + 3 background layers + core UI elements.

---

## 17. Open Questions

- [ ] What art tool? (Aseprite strongly recommended for pixel art spritesheets)
- [ ] Are you drawing art yourself, commissioning it, or using AI-generated art?
- [ ] Confirm 48×80 px player size — mock up a placeholder rectangle in Tiled before committing
- [ ] What type is the Intro Boss? (humanoid, mechanical, creature?) Affects silhouette design
- [ ] Does ThreadVessel visually show the currently equipped weapon on her body (holster, arm cannon) or is it always the same silhouette regardless of weapon? Affects whether body sheet needs weapon variants
- [ ] Ball Mode — physical transformation (like Morph Ball) or just a tight-crouch roll? Affects ball sprite design significantly
- [ ] Controller / gamepad button icons needed in HUD? (Future consideration)
- [ ] Room counts — estimates above are rough; finalize during Tiled level design phase
