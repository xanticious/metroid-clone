# Getting Started with Tiled

A step-by-step guide for creating `.tmx` maps for Sublevel Uprising.

---

## Step 1 — Install Tiled

Download and install Tiled from [mapeditor.org](https://www.mapeditor.org/). The free version is fully functional. Accept all defaults during install.

---

## Step 2 — Decide on Tile and Room Sizes

Before opening Tiled, fix these two numbers — they affect everything downstream.

**Tile size:** 16×16 px is traditional for Metroidvania games. 32×32 is easier to work with at 1080p. **Recommended: 16×16** (authentic feel, more visual detail per room).

**Room size (in tiles):** The target resolution is 1920×1080. At 16×16 tiles:

- 1920 ÷ 16 = **120 tiles wide**
- 1080 ÷ 16 = **67.5** → round to **68 tiles tall**

So each room is **120 × 68 tiles**, which fills the screen exactly at 1:1 scale. Rooms can be smaller (e.g., 60×34 for a corridor), but keep them multiples of the base room size for consistency.

---

## Step 3 — Create Your First Tileset

You need a tileset image before you can paint tiles. For now, use a placeholder:

1. Create a simple PNG (e.g., in Paint or any image editor) that is 160×160 px with a 10×10 grid of 16×16 colored squares — different colors for floor, wall, ceiling, background. Or download a free placeholder tileset (search "16x16 tileset CC0").

2. Save it to `src/assets/tilesets/` in the project.

3. In Tiled, go to **File → New → New Tileset...**
   - **Name:** e.g. `underworks`
   - **Type:** Based on Tileset Image
   - **Source:** browse to your PNG
   - **Tile width:** 16, **Tile height:** 16
   - **Spacing / Margin:** 0 (unless your image has padding between tiles)
   - Click **Save As...** → save to `src/assets/tilesets/underworks.tsx`

---

## Step 4 — Create Your First Map

1. **File → New → New Map...**

2. Settings:
   - **Orientation:** Orthogonal
   - **Tile layer format:** CSV (human-readable, works great with PixiJS parsers)
   - **Tile render order:** Right Down
   - **Map size:** Fixed — Width: 120, Height: 68
   - **Tile size:** Width: 16, Height: 16
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

The `Entities` layer stores named spawn points:

1. Select the `Entities` layer.
2. Use the **Insert Point (I)** tool to place a point, then in Properties set the `type` property:
   - `player_spawn` — player start position
   - `enemy_crawler` — crawler enemy spawn
   - `door_right`, `door_left`, `door_up`, `door_down` — room transitions
   - `health_tank` — health tank collectible
   - `save_station` — save station
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

| Property     | Type   | Example Value        |
| ------------ | ------ | -------------------- |
| `id`         | string | `intro_room_01`      |
| `area`       | string | `underworks`         |
| `world`      | string | `irl`                |
| `musicTrack` | string | `underworks_ambient` |
| `doorLeft`   | string | _(empty or room id)_ |
| `doorRight`  | string | `intro_room_02`      |

---

## Step 10 — Understand the TMX File Format

After saving, open `intro_room_01.tmx` in a text editor. You'll see XML like this:

```xml
<map version="1.10" tiledversion="1.11.0" orientation="orthogonal"
     width="120" height="68" tilewidth="16" tileheight="16">
  <tileset firstgid="1" source="../../tilesets/underworks.tsx"/>
  <layer name="Tiles" width="120" height="68">
    <data encoding="csv">
      0,0,1,1,1,...
    </data>
  </layer>
  <objectgroup name="Entities">
    <object id="1" type="player_spawn" x="160" y="832"/>
  </objectgroup>
</map>
```

`TiledLoader.ts` will parse this XML and turn it into typed game objects.

---

## Step 11 — Intro Mission Room List

Based on the design doc, the intro mission needs 5–10 rooms. Suggested naming:

```
intro_room_01.tmx   — Entry corridor (movement tutorial)
intro_room_02.tmx   — Vertical shaft (jump / wall-jump tutorial)
intro_room_03.tmx   — Crawler room (combat tutorial)
intro_room_04.tmx   — Optional side room (health tank)
intro_room_05.tmx   — Boss antechamber (auto-save checkpoint)
intro_room_06.tmx   — Boss arena
```

All files go in `src/assets/maps/tmx/`.

---

## Step 12 — Tips for Metroidvania Room Design

- **Doors:** Place `door_left` / `door_right` / `door_up` / `door_down` entity points at the edges of the room, centered on the opening.
- **Close off rooms:** Always add solid collision on all edges — open edges cause the player to fall into the void.
- **Layer order:** Bottom to top — `Background`, `Tiles`, _(player rendered by engine)_, `Foreground`. The engine draws layers in this order.
- **Room previews:** Use **File → Export As Image** to get a PNG preview of each room — useful for planning the overall map layout.
- **Save frequently:** Tiled can occasionally crash on complex maps.

---

## Next Step: TiledLoader

Once you have a `.tmx` file, the next coding task is `src/maps/TiledLoader.ts`. It will parse the CSV tile data, object layers (collision, entities), and map properties, and return typed game objects for `Room.ts` to consume.
