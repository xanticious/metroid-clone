# Getting Started with Tiled

A step-by-step guide for creating `.tmx` maps for Sublevel Uprising.

---

## Step 1 — Install Tiled

Download and install Tiled from [mapeditor.org](https://www.mapeditor.org/). The free version is fully functional. Accept all defaults during install.

---

## Step 2 — Decide on Tile and Room Sizes

Before opening Tiled, fix these two numbers — they affect everything downstream.

**Tile size:** Sublevel Uprising targets 1920×1080 with modern HD sprites (per the design doc). At that resolution, **32×32 px tiles** are the right choice — they're large enough to show fine detail in your cyberpunk art (neon signs, grungy pipes, circuit-board patterns) without pixelation, and give you comfortable room to work in Tiled. 16×16 is a nostalgic Super Metroid nod but requires very fine art at HD resolution. **Use 32×32.**

**Room size (in tiles):** The target resolution is 1920×1080. At 32×32 tiles:

- 1920 ÷ 32 = **60 tiles wide**
- 1080 ÷ 32 = **33.75** → round to **34 tiles tall**

So each standard room is **60 × 34 tiles** (1920×1088 px — one tile taller than the screen, which gives a little breathing room). Rooms can be multiples of this: a tall vertical shaft might be 30×68, a wide corridor 120×17, etc. Pick a size that fits the room's purpose.

---

## Step 3 — Create Your First Tileset

You need a tileset image before you can paint tiles. Start with the **Underworks** area (the intro area — sewer/maintenance tunnels beneath the city). For now, use a placeholder:

1. Create a simple PNG in Paint or any image editor: a 320×320 px grid of 32×32 colored squares. Suggested placeholder colors:
   - Dark grey — floor/wall
   - Black — empty/background
   - Brown — dirt/pipe
   - Dim cyan — any glow accent tile

   Or download a free 32×32 placeholder tileset (search "32x32 tileset CC0").

2. Save it to `src/assets/tilesets/` in the project.

3. In Tiled, go to **File → New → New Tileset...**
   - **Name:** `underworks`
   - **Type:** Based on Tileset Image
   - **Source:** browse to your PNG
   - **Tile width:** 32, **Tile height:** 32
   - **Spacing / Margin:** 0 (unless your image has padding between tiles)
   - Click **Save As...** → save to `src/assets/tilesets/underworks.tsx`

You'll eventually need one tileset per area. The design doc defines 7 areas — suggested tileset names: `underworks.tsx`, `neon_district.tsx`, `corp_tower_lower.tsx`, `corp_tower_upper.tsx`, `shallow_net.tsx`, `deep_net.tsx`, `nexus.tsx`. Cyberspace tilesets should use the wireframe/neon-grid visual style described in the design doc.

---

## Step 4 — Create Your First Map

Start with the intro mission's entry corridor (`intro_room_01`) — a horizontal corridor that teaches basic walking and running.

1. **File → New → New Map...**

2. Settings:
   - **Orientation:** Orthogonal
   - **Tile layer format:** CSV (human-readable, works great with PixiJS parsers)
   - **Tile render order:** Right Down
   - **Map size:** Fixed — Width: 60, Height: 34
   - **Tile size:** Width: 32, Height: 32
   - Click **OK**

3. **File → Save As...** → save to `src/assets/maps/tmx/` as `intro_room_01.tmx`

---

## Step 5 — Understand the Layer Setup

Tiled uses layers. For a Metroidvania room you need at least these layers (add them via the **Layers** panel, bottom-right):

| Layer        | Type         | Purpose                                                     |
| ------------ | ------------ | ----------------------------------------------------------- |
| `Background` | Tile Layer   | Non-interactive background visuals                          |
| `Tiles`      | Tile Layer   | Main solid terrain (floors, walls, ceilings)                |
| `Foreground` | Tile Layer   | Decorative tiles drawn in front of the player               |
| `Collision`  | Object Layer | Rectangles/polygons defining solid collision zones          |
| `Entities`   | Object Layer | Spawn points for enemies, items, doors, save stations, etc. |

To add a layer: click the **+** icon in the Layers panel → choose Tile Layer or Object Layer.

---

## Step 6 — Set Up the Collision Object Layer

The `Collision` layer is how the game knows where the floor and walls are. It contains rectangles, not tiles.

1. Select the `Collision` object layer.
2. In the **Properties** panel, add a custom property: **Name:** `type`, **Value:** `collision` — this lets the PixiJS loader identify it.
3. Use the **Rectangle tool (R)** to draw solid rectangles over your terrain tiles. Align them to tile boundaries (hold **Ctrl** to snap to grid).

> You don't need pixel-perfect shapes to start — axis-aligned rectangles work fine for most Metroidvania terrain.

---

## Step 7 — Set Up the Entities Object Layer

The `Entities` layer stores named spawn points. All entity types are drawn from the design doc:

1. Select the `Entities` layer.
2. Use the **Insert Point (I)** tool to place a point, then in Properties set the `type` property:

   **Player**
   - `player_spawn` — player start position (one per room)

   **Enemies** (intro mission uses these two)
   - `enemy_crawler` — Crawler: moves along floors/walls, low HP, contact damage
   - `enemy_intro_boss` — the intro boss spawn point (boss arena only)

   **Doors / Transitions**
   - `door_right`, `door_left`, `door_up`, `door_down` — room transitions. Add a custom `target` string property on each door with the destination room id (e.g. `intro_room_02`).

   **Items & Collectibles**
   - `health_tank` — increases max HP by one tank
   - `ammo_expansion` — increases max ammo capacity
   - `ability_pickup` — grants a movement tech or weapon (add a `ability` string property, e.g. `double_jump`)
   - `data_fragment` — lore collectible (affects completion %)

   **World**
   - `save_station` — triggers an auto-save
   - `jack_in_terminal` — entry point into Cyberspace (IRL rooms only)
   - `extraction_point` — end of intro mission escape sequence

3. Each entity point will be read by `TiledLoader.ts` to instantiate game objects.

---

## Step 8 — Paint Your First Room

1. Add your tileset: **Map → Add External Tileset...** → select your `.tsx` file.
2. Select the `Tiles` layer in the Layers panel.
3. In the **Tilesets** panel (bottom of screen), click a tile to select it. Drag to select a rectangle of tiles.
4. Use the **Stamp Brush (B)** to paint on the map canvas.

Key shortcuts:

| Key                 | Action                            |
| ------------------- | --------------------------------- |
| B                   | Stamp brush (paint)               |
| E                   | Eraser                            |
| F                   | Flood fill                        |
| Z / X               | Flip tile horizontally/vertically |
| Ctrl+Z              | Undo                              |
| Mouse wheel         | Zoom                              |
| Middle click + drag | Pan                               |

---

## Step 9 — Add Custom Properties to the Map

Select **Map → Map Properties** and add these custom properties so the loader knows what each room is:

| Property     | Type   | Example Value        | Notes                                                                                                             |
| ------------ | ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`         | string | `intro_room_01`      | Unique room identifier used for save data and door targeting                                                      |
| `area`       | string | `underworks`         | One of: `underworks`, `neon_district`, `corp_tower_lower`, `corp_tower_upper`, `shallow_net`, `deep_net`, `nexus` |
| `world`      | string | `irl`                | Either `irl` or `cyberspace` — determines which map screen this room appears on                                   |
| `musicTrack` | string | `underworks_ambient` | Audio stub for Phase 9 — set now so it's in the data                                                              |
| `isBossRoom` | bool   | `false`              | `true` triggers an auto-save checkpoint at the door (per design doc)                                              |
| `doorLeft`   | string | _(empty or room id)_ | Target room id for the left exit                                                                                  |
| `doorRight`  | string | `intro_room_02`      | Target room id for the right exit                                                                                 |
| `doorUp`     | string | _(empty or room id)_ | Target room id for the top exit                                                                                   |
| `doorDown`   | string | _(empty or room id)_ | Target room id for the bottom exit                                                                                |

---

## Step 10 — Understand the TMX File Format

After saving, open `intro_room_01.tmx` in a text editor. You'll see XML like this:

```xml
<map version="1.10" tiledversion="1.11.0" orientation="orthogonal"
     width="60" height="34" tilewidth="32" tileheight="32">
  <properties>
    <property name="id" value="intro_room_01"/>
    <property name="area" value="underworks"/>
    <property name="world" value="irl"/>
    <property name="musicTrack" value="underworks_ambient"/>
    <property name="isBossRoom" type="bool" value="false"/>
    <property name="doorRight" value="intro_room_02"/>
  </properties>
  <tileset firstgid="1" source="../../tilesets/underworks.tsx"/>
  <layer name="Background" width="60" height="34">
    <data encoding="csv">0,0,0,...</data>
  </layer>
  <layer name="Tiles" width="60" height="34">
    <data encoding="csv">1,1,1,...</data>
  </layer>
  <objectgroup name="Collision">
    <object id="1" x="0" y="1056" width="1920" height="32"/>  <!-- floor -->
  </objectgroup>
  <objectgroup name="Entities">
    <object id="2" type="player_spawn" x="64" y="992"/>
    <object id="3" type="door_right" x="1888" y="512">
      <properties>
        <property name="target" value="intro_room_02"/>
      </properties>
    </object>
    <object id="4" type="enemy_crawler" x="800" y="992"/>
  </objectgroup>
</map>
```

`TiledLoader.ts` will parse this XML and turn it into typed game objects. Note the pixel coordinates — at 32×32 tiles, the floor of a 34-tile-tall room sits at y = 33 × 32 = **1056 px**.

---

## Step 11 — Intro Mission Room List

The design doc specifies this exact intro mission structure. Map each room to a `.tmx` file:

| File                | Size (tiles) | Purpose                                           | Key entities                                            |
| ------------------- | ------------ | ------------------------------------------------- | ------------------------------------------------------- |
| `intro_room_01.tmx` | 60 × 34      | Entry corridor — teaches walking and running      | `player_spawn`, `door_right`                            |
| `intro_room_02.tmx` | 30 × 68      | Vertical shaft — teaches jumping and wall-jumping | `door_down` (from 01), `door_up` (to 03)                |
| `intro_room_03.tmx` | 60 × 34      | Crawler room — teaches shooting the Pulse Pistol  | 3–4× `enemy_crawler`, `door_left` (back), `door_right`  |
| `intro_room_04.tmx` | 30 × 34      | Optional side room — first collectible            | `health_tank`, `door_left` (back to 03)                 |
| `intro_room_05.tmx` | 60 × 34      | Boss antechamber — auto-save before boss          | `save_station`, `door_right` (`isBossRoom: true` on 06) |
| `intro_room_06.tmx` | 60 × 34      | Boss arena — intro boss fight                     | `enemy_intro_boss`, `extraction_point` (post-boss)      |

After the boss is defeated, the self-destruct escape sequence retraces rooms 06 → 05 → 03 → 02 → 01 back to the `extraction_point`. The escape timer is driven by the Intro Mission XState machine, not by Tiled — no special layer needed for the timer itself.

All files go in `src/assets/maps/tmx/`.

---

## Step 12 — Tips for Metroidvania Room Design

- **Doors:** Place `door_left` / `door_right` / `door_up` / `door_down` entity points at the edges of the room, centered on the opening. At 32×32 tiles, a standard door opening is **3 tiles (96 px) tall** — enough for the player to walk through comfortably.
- **Close off rooms:** Always add solid collision on all four edges — open edges cause the player to fall into the void.
- **Layer order:** Bottom to top — `Background`, `Tiles`, _(player rendered by engine)_, `Foreground`. The engine draws layers in this order.
- **Cyberpunk aesthetics:** Per the design doc, IRL rooms (Underworks, Corp Tower) should feel grungy industrial with flickering-light tiles and grime details in the `Background` layer. Cyberspace rooms (Shallow Net, Deep Net, Nexus) use wireframe geometry, neon-grid floors, and floating platforms — lean into the abstract digital geometry. Use the `Foreground` layer for holographic signage and neon overlay elements that appear in front of the player.
- **Sequence-break design:** The design doc explicitly requires sequence-break support. When placing platforms and walls, consider whether a skilled player using wall-jump chains could bypass a barrier that a normal player would need an ability for. This is intentional — don't block it.
- **IRL vs. Cyberspace:** Keep `world: irl` and `world: cyberspace` rooms in separate subfolders if it helps organization — e.g., `tmx/irl/` and `tmx/cyberspace/`. Both load through the same `TiledLoader.ts`.
- **Room previews:** Use **File → Export As Image** to get a PNG preview of each room — useful for planning the overall map layout.
- **Save frequently:** Tiled can occasionally crash on complex maps.

---

## Next Step: TiledLoader

Once you have a `.tmx` file, the next coding task is `src/maps/TiledLoader.ts`. It will parse the CSV tile data, object layers (collision, entities), and map properties, and return typed game objects for `Room.ts` to consume.
